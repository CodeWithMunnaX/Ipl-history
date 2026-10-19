"""
Builds the IPL Power BI project (PBIP) from backend/ipl_data.db.

    backend/.venv/Scripts/python powerbi/build_pbip.py

Writes:
  powerbi/data/*.csv          - tables exported from SQLite (super overs excluded)
  powerbi/IPL.pbip            - open this in Power BI Desktop
  powerbi/IPL.SemanticModel/  - tables, relationships, DAX measures
  powerbi/IPL.Report/         - report pages and visuals

After opening, click Refresh once to load the CSVs. The DataFolder parameter
(Transform data > Edit parameters) holds the absolute path to powerbi/data.
"""
import hashlib
import json
import os
import shutil
import sqlite3
import subprocess

import pandas as pd

import images

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "..", "backend", "ipl_data.db")
DATA = os.path.join(HERE, "data")

BASE_THEME = "CY24SU10"
CUSTOM_THEME = "IPLTheme"

def stable_id(*parts) -> str:
    """Deterministic ids keep rebuilds byte-identical, so Power BI and git see no spurious changes."""
    return hashlib.md5("|".join(map(str, parts)).encode()).hexdigest()[:20]


NON_BOWLER_WICKETS = ("run out", "retired hurt", "retired out", "obstructing the field")


# ---------------------------------------------------------------------------
# 1. Export data
# ---------------------------------------------------------------------------

def export_data():
    os.makedirs(DATA, exist_ok=True)
    con = sqlite3.connect(DB)

    matches = pd.read_sql_query("SELECT * FROM matches", con)
    matches["match_date"] = pd.to_datetime(matches["match_date"], format="%d-%m-%Y").dt.strftime("%Y-%m-%d")
    matches = matches.drop(columns=["season"]).rename(columns={"season_id": "season"})
    # Some abandoned matches have deliveries but no row in "matches"; add them as no-result
    # so every delivery belongs to a match (otherwise slicers show "(Blank)")
    orphans = pd.read_sql_query("""
        SELECT match_id, MIN(season_id) AS season,
               MIN(CASE WHEN innings = 1 THEN team_batting END) AS team1,
               MIN(CASE WHEN innings = 1 THEN team_bowling END) AS team2
        FROM ball_by_ball
        WHERE match_id NOT IN (SELECT match_id FROM matches)
        GROUP BY match_id""", con)
    if len(orphans):
        print(f"  adding {len(orphans)} abandoned match(es) missing from matches: {list(orphans.match_id)}")
        orphans["result"] = "no result"
        matches = pd.concat([matches, orphans], ignore_index=True)
    matches["chasing_team_won"] =matches["win_by_wickets"].notna().astype(int)
    matches["toss_winner_won"] = ((matches["toss_winner"] == matches["match_winner"]) & (matches["result"] == "win")).astype(int)
    matches["has_result"] = (matches["result"] == "win").astype(int)
    matches = matches[[
        "match_id", "season", "match_date", "city", "venue", "team1", "team2", "toss_winner",
        "toss_decision", "match_winner", "win_by_runs", "win_by_wickets", "result", "stage",
        "chasing_team_won", "toss_winner_won", "has_result",
    ]]

    # The "stage" column is only filled in recent seasons: each season's last match is the final
    order = matches.assign(d=pd.to_datetime(matches["match_date"])).dropna(subset=["d"]).sort_values(["season", "d", "match_id"])
    finals = order.groupby("season").tail(1)
    champions = pd.DataFrame({
        "season": finals["season"],
        "champion": finals["match_winner"],
        "runner_up": [r.team2 if r.match_winner == r.team1 else r.team1 for r in finals.itertuples()],
        "final_venue": finals["venue"],
    })

    team_rows = []
    for r in matches.itertuples():
        for team, opp in ((r.team1, r.team2), (r.team2, r.team1)):
            team_rows.append({
                "match_id": r.match_id, "team": team, "opponent": opp,
                "won": int(r.match_winner == team),
                "lost": int(r.result == "win" and r.match_winner != team),
                "no_result_or_tie": int(r.result != "win"),
            })
    team_matches = pd.DataFrame(team_rows)

    d = pd.read_sql_query("SELECT * FROM ball_by_ball WHERE is_super_over = 0", con)
    legal = (d["is_wide_ball"] == 0) & (d["is_no_ball"] == 0)
    over = d["over_number"] + 1
    deliveries = pd.DataFrame({
        "match_id": d["match_id"],
        "innings": d["innings"],
        "over": over,
        "phase": pd.cut(over, [0, 6, 15, 20], labels=["1 Powerplay (1-6)", "2 Middle (7-15)", "3 Death (16-20)"]).astype(str),
        "batter": d["batter"],
        "bowler": d["bowler"],
        "batting_team": d["team_batting"],
        "bowling_team": d["team_bowling"],
        "batter_runs": d["batter_runs"],
        "extras": d["extras"],
        "total_runs": d["total_runs"],
        "bowler_runs": d["total_runs"] - d["leg_bye_runs"] - d["bye_runs"] - d["penalty_runs"],
        "is_legal": legal.astype(int),
        "ball_faced": (d["is_wide_ball"] == 0).astype(int),
        "is_four": (d["batter_runs"] == 4).astype(int),
        "is_six": (d["batter_runs"] == 6).astype(int),
        "is_dot": (legal & (d["total_runs"] == 0)).astype(int),
        "is_wicket": d["is_wicket"].astype(int),
        "bowler_wicket": ((d["is_wicket"] == 1) & ~d["wicket_kind"].isin(NON_BOWLER_WICKETS)).astype(int),
        "wicket_kind": d["wicket_kind"],
        "player_out": d["player_out"],
    })

    print("  fetching team logos ...")
    teams = pd.read_sql_query("SELECT team_name AS team, team_name_short AS short_name, image_url AS logo FROM teams", con)
    teams = teams[teams["team"].isin(team_matches["team"])].drop_duplicates("team")
    teams["logo"] = [images.team_logo(t.team, t.short_name, t.logo) for t in teams.itertuples()]
    logo_of = dict(zip(teams["team"], teams["logo"]))
    champions["champion_logo"] = champions["champion"].map(logo_of)
    seasons = pd.DataFrame({"season": sorted(matches["season"].unique())})
    players = build_players(con, deliveries, matches)

    out = {
        "matches": matches, "deliveries": deliveries, "team_matches": team_matches,
        "teams": teams, "seasons": seasons, "champions": champions, "players": players,
    }
    for name, df in out.items():
        df.to_csv(os.path.join(DATA, f"{name}.csv"), index=False, encoding="utf-8")
        print(f"  {name}.csv  {len(df):>7} rows")
    return out


def build_players(con, deliveries, matches):
    """One row per batter/bowler with an embedded photo (see images.py)."""
    season_of = matches.set_index("match_id")["season"]
    d = deliveries.assign(season=deliveries["match_id"].map(season_of))
    # Real photos are looked up for anyone who can appear in a top-10 list
    featured = set()
    for who, value in (("batter", "batter_runs"), ("bowler", "bowler_wicket")):
        featured |= set(d.groupby(who)[value].sum().nlargest(10).index)
        per_season = d.groupby(["season", who])[value].sum().reset_index()
        featured |= set(per_season.sort_values(value, ascending=False).groupby("season").head(10)[who])

    db = pd.read_sql_query("SELECT player_name, player_full_name, player_image FROM players", con)
    db = db.drop_duplicates("player_name").set_index("player_name")
    names = sorted(set(d["batter"]) | set(d["bowler"]))
    print(f"  fetching photos for {len(featured)} featured players ...")
    rows, sources = [], {}
    for n in names:
        full = db["player_full_name"].get(n) if n in db.index else None
        stored = db["player_image"].get(n) if n in db.index else None
        photo, src = images.player_photo(n, full if isinstance(full, str) else n,
                                         stored if isinstance(stored, str) else None, n in featured)
        sources[src] = sources.get(src, 0) + 1
        rows.append({"player": n, "full_name": full if isinstance(full, str) else n, "photo": photo, "photo_source": src})
    print("  photo sources:", sources)
    return pd.DataFrame(rows)


# ---------------------------------------------------------------------------
# 2. Semantic model (model.bim)
# ---------------------------------------------------------------------------

M_TYPES = {"int64": "Int64.Type", "double": "type number", "string": "type text", "dateTime": "type date"}


def csv_table(name, file, columns, hidden=(), sort_by=None, images_cols=()):
    """columns: list of (name, dataType)."""
    typed = ", ".join(f'{{"{c}", {M_TYPES[t]}}}' for c, t in columns)
    m = [
        "let",
        f'    Source = Csv.Document(File.Contents(DataFolder & "\\{file}"), [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),',
        "    Promoted = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),",
        f"    Typed = Table.TransformColumnTypes(Promoted, {{{typed}}})",
        "in",
        "    Typed",
    ]
    cols = []
    for c, t in columns:
        col = {"name": c, "dataType": t, "sourceColumn": c, "summarizeBy": "none"}
        if t == "dateTime":
            col["formatString"] = "dd mmm yyyy"
        if c in hidden:
            col["isHidden"] = True
        if c in images_cols:
            col["dataCategory"] = "ImageUrl"
        if sort_by and c in sort_by:
            col["sortByColumn"] = sort_by[c]
        cols.append(col)
    return {
        "name": name,
        "columns": cols,
        "partitions": [{"name": name, "mode": "import", "source": {"type": "m", "expression": m}}],
    }


MEASURES = [
    # name, expression, format
    ("Matches", "DISTINCTCOUNT(Matches[match_id])", "#,0"),
    ("Total Runs", "SUM(Deliveries[total_runs])", "#,0"),
    ("Wickets", "SUM(Deliveries[is_wicket])", "#,0"),
    ("Sixes", "SUM(Deliveries[is_six])", "#,0"),
    ("Fours", "SUM(Deliveries[is_four])", "#,0"),
    ("Extras", "SUM(Deliveries[extras])", "#,0"),
    ("Legal Balls", "SUM(Deliveries[is_legal])", "#,0"),
    ("Run Rate", "DIVIDE([Total Runs] * 6, [Legal Balls])", "0.00"),
    ("Innings", "COUNTROWS(SUMMARIZE(Deliveries, Deliveries[match_id], Deliveries[innings]))", "#,0"),
    ("Runs per Match", "DIVIDE([Total Runs], [Matches])", "0.0"),
    ("Sixes per Match", "DIVIDE([Sixes], [Matches])", "0.0"),
    ("Avg Runs per Over", "DIVIDE([Total Runs], [Innings])", "0.00"),
    ("Wickets per Innings", "DIVIDE([Wickets], [Innings])", "0.00"),
    ("Highest Total",
     "MAXX(SUMMARIZE(Deliveries, Deliveries[match_id], Deliveries[innings]), CALCULATE(SUM(Deliveries[total_runs])))", "#,0"),
    ("Avg 1st Innings",
     "AVERAGEX(FILTER(SUMMARIZE(Deliveries, Deliveries[match_id], Deliveries[innings]), Deliveries[innings] = 1), "
     "CALCULATE(SUM(Deliveries[total_runs])))", "0.0"),
    # Batting
    ("Batter Runs", "SUM(Deliveries[batter_runs])", "#,0"),
    ("Balls Faced", "SUM(Deliveries[ball_faced])", "#,0"),
    ("Strike Rate", "DIVIDE([Batter Runs] * 100, [Balls Faced])", "0.0"),
    ("Batter Rank", "IF(HASONEVALUE(Deliveries[batter]), RANKX(ALLSELECTED(Deliveries[batter]), [Batter Runs], , DESC, Dense))", "0"),
    ("Top 10 Runs", "IF([Batter Rank] <= 10, [Batter Runs])", "#,0"),
    ("Top 10 Strike Rate", "IF([Batter Rank] <= 10, [Strike Rate])", "0.0"),
    ("Top 10 Fours", "IF([Batter Rank] <= 10, [Fours])", "#,0"),
    ("Top 10 Sixes", "IF([Batter Rank] <= 10, [Sixes])", "#,0"),
    ("Top 10 Bat Matches", "IF([Batter Rank] <= 10, DISTINCTCOUNT(Deliveries[match_id]))", "#,0"),
    # Bowling
    ("Bowler Wickets", "SUM(Deliveries[bowler_wicket])", "#,0"),
    ("Runs Conceded", "SUM(Deliveries[bowler_runs])", "#,0"),
    ("Economy", "DIVIDE([Runs Conceded] * 6, [Legal Balls])", "0.00"),
    ("Dot Balls", "SUM(Deliveries[is_dot])", "#,0"),
    ("Bowler Rank",
     "IF(HASONEVALUE(Deliveries[bowler]), RANKX(ALLSELECTED(Deliveries[bowler]), [Bowler Wickets] * 1000 - [Economy], , DESC, Dense))", "0"),
    ("Top 10 Wickets", "IF([Bowler Rank] <= 10, [Bowler Wickets])", "#,0"),
    ("Top 10 Economy", "IF([Bowler Rank] <= 10, [Economy])", "0.00"),
    ("Top 10 Dots", "IF([Bowler Rank] <= 10, [Dot Balls])", "#,0"),
    ("Top 10 Bowl Matches", "IF([Bowler Rank] <= 10, DISTINCTCOUNT(Deliveries[match_id]))", "#,0"),
    # Teams
    ("Played", "COUNTROWS(TeamMatches)", "#,0"),
    ("Won", "SUM(TeamMatches[won])", "#,0"),
    ("Lost", "SUM(TeamMatches[lost])", "#,0"),
    ("Tie / NR", "SUM(TeamMatches[no_result_or_tie])", "#,0"),
    ("Win %", "DIVIDE([Won], [Played])", "0.0%"),
    ("Titles", "COUNTROWS(Champions)", "0"),
    # Toss & chasing
    ("Matches with Result", "SUM(Matches[has_result])", "#,0"),
    ("Toss Winner Won %", "DIVIDE(SUM(Matches[toss_winner_won]), [Matches with Result])", "0.0%"),
    ("Chose to Field %",
     "DIVIDE(CALCULATE(COUNTROWS(Matches), Matches[toss_decision] = \"field\"), COUNTROWS(Matches))", "0.0%"),
    ("Chasing Win %", "DIVIDE(SUM(Matches[chasing_team_won]), [Matches with Result])", "0.0%"),
    ("Team Titles", "CALCULATE(COUNTROWS(Champions), TREATAS(VALUES(Teams[team]), Champions[champion]))", "0"),
    # Photos (dataCategory ImageUrl so visuals render them)
    ("Batter Photo",
     "IF([Batter Rank] <= 10, LOOKUPVALUE(Players[photo], Players[player], SELECTEDVALUE(Deliveries[batter])))", None, "ImageUrl"),
    ("Bowler Photo",
     "IF([Bowler Rank] <= 10, LOOKUPVALUE(Players[photo], Players[player], SELECTEDVALUE(Deliveries[bowler])))", None, "ImageUrl"),
    ("Orange Cap Photo",
     "IF([Batter Rank] = 1, LOOKUPVALUE(Players[photo], Players[player], SELECTEDVALUE(Deliveries[batter])))", None, "ImageUrl"),
    ("Orange Cap Runs", "IF([Batter Rank] = 1, [Batter Runs])", "#,0"),
    ("Orange Cap SR", "IF([Batter Rank] = 1, [Strike Rate])", "0.0"),
    ("Purple Cap Photo",
     "IF([Bowler Rank] = 1, LOOKUPVALUE(Players[photo], Players[player], SELECTEDVALUE(Deliveries[bowler])))", None, "ImageUrl"),
    ("Purple Cap Wickets", "IF([Bowler Rank] = 1, [Bowler Wickets])", "#,0"),
    ("Purple Cap Economy", "IF([Bowler Rank] = 1, [Economy])", "0.00"),
]


def measure_def(m):
    name, expr, fmt = m[:3]
    out = {"name": name, "expression": expr}
    if fmt:
        out["formatString"] = fmt
    if len(m) > 3:
        out["dataCategory"] = m[3]
    return out


def build_model():
    tables = [
        csv_table("Seasons", "seasons.csv", [("season", "int64")]),
        csv_table("Matches", "matches.csv", [
            ("match_id", "int64"), ("season", "int64"), ("match_date", "dateTime"), ("city", "string"),
            ("venue", "string"), ("team1", "string"), ("team2", "string"), ("toss_winner", "string"),
            ("toss_decision", "string"), ("match_winner", "string"), ("win_by_runs", "double"),
            ("win_by_wickets", "double"), ("result", "string"), ("stage", "string"),
            ("chasing_team_won", "int64"), ("toss_winner_won", "int64"), ("has_result", "int64"),
        ], hidden=("chasing_team_won", "toss_winner_won", "has_result")),
        csv_table("Deliveries", "deliveries.csv", [
            ("match_id", "int64"), ("innings", "int64"), ("over", "int64"), ("phase", "string"),
            ("batter", "string"), ("bowler", "string"), ("batting_team", "string"), ("bowling_team", "string"),
            ("batter_runs", "int64"), ("extras", "int64"), ("total_runs", "int64"), ("bowler_runs", "int64"),
            ("is_legal", "int64"), ("ball_faced", "int64"), ("is_four", "int64"), ("is_six", "int64"),
            ("is_dot", "int64"), ("is_wicket", "int64"), ("bowler_wicket", "int64"),
            ("wicket_kind", "string"), ("player_out", "string"),
        ], hidden=("is_legal", "ball_faced", "is_four", "is_six", "is_dot", "bowler_wicket", "bowler_runs")),
        csv_table("TeamMatches", "team_matches.csv", [
            ("match_id", "int64"), ("team", "string"), ("opponent", "string"),
            ("won", "int64"), ("lost", "int64"), ("no_result_or_tie", "int64"),
        ]),
        csv_table("Teams", "teams.csv", [("team", "string"), ("short_name", "string"), ("logo", "string")],
                  images_cols=("logo",)),
        csv_table("Champions", "champions.csv", [
            ("season", "int64"), ("champion", "string"), ("runner_up", "string"), ("final_venue", "string"),
            ("champion_logo", "string"),
        ], images_cols=("champion_logo",)),
        csv_table("Players", "players.csv", [
            ("player", "string"), ("full_name", "string"), ("photo", "string"), ("photo_source", "string"),
        ], hidden=("photo_source",), images_cols=("photo",)),
        {
            "name": "Metrics",
            "columns": [{"name": "Dummy", "dataType": "string", "sourceColumn": "Dummy", "isHidden": True}],
            "partitions": [{"name": "Metrics", "mode": "import", "source": {
                "type": "m", "expression": ["let", "    Source = #table(type table [Dummy = text], {})", "in", "    Source"]}}],
            "measures": [measure_def(m) for m in MEASURES],
        },
    ]
    rel = lambda ft, fc, tt, tc: {"name": stable_id(ft, fc, tt, tc), "fromTable": ft, "fromColumn": fc, "toTable": tt, "toColumn": tc}
    return {
        "compatibilityLevel": 1567,
        "model": {
            "culture": "en-US",
            "dataAccessOptions": {"legacyRedirects": True, "returnErrorValuesAsNull": True},
            "defaultPowerBIDataSourceVersion": "powerBI_V3",
            "sourceQueryCulture": "en-US",
            "tables": tables,
            "relationships": [
                rel("Matches", "season", "Seasons", "season"),
                rel("Champions", "season", "Seasons", "season"),
                rel("Deliveries", "match_id", "Matches", "match_id"),
                rel("TeamMatches", "match_id", "Matches", "match_id"),
                rel("TeamMatches", "team", "Teams", "team"),
            ],
            "expressions": [{
                "name": "DataFolder",
                "kind": "m",
                "expression": f'"{DATA}" meta [IsParameterQuery = true, Type = "Text", IsParameterQueryRequired = true]',
            }],
            "annotations": [{"name": "PBI_QueryOrder", "value": json.dumps(
                ["DataFolder", "Seasons", "Matches", "Deliveries", "TeamMatches", "Teams", "Champions", "Players", "Metrics"])}],
        },
    }


# ---------------------------------------------------------------------------
# 3. Report (report.json, PBIR-Legacy)
# ---------------------------------------------------------------------------

def lit(v):
    return {"expr": {"Literal": {"Value": v}}}


class Visual:
    """Small helper that writes one visualContainer."""

    def __init__(self, vtype, x, y, w, h, title=None):
        self.vtype, self.pos, self.title = vtype, (x, y, w, h), title
        self.froms, self.selects, self.projections, self.order = {}, [], {}, []
        self.objects = {}
        self.names = {}
        if vtype == "tableEx":
            # Totals of "Top 10" measures would sum every player, so hide them
            self.objects["total"] = [{"properties": {"totals": lit("false")}}]

    def _src(self, entity):
        if entity not in self.froms:
            self.froms[entity] = f"t{len(self.froms)}"
        return self.froms[entity]

    def _field(self, kind, entity, prop):
        return {kind: {"Expression": {"SourceRef": {"Source": self._src(entity)}}, "Property": prop}}

    def add(self, role, kind, entity, prop, label=None):
        ref = f"{entity}.{prop}"
        if label:
            self.names[ref] = label
        if not any(s["Name"] == ref for s in self.selects):
            self.selects.append({**self._field(kind, entity, prop), "Name": ref})
        self.projections.setdefault(role, []).append({"queryRef": ref})
        return self

    col = lambda self, role, entity, prop, label=None: self.add(role, "Column", entity, prop, label)
    mea = lambda self, role, prop, label=None: self.add(role, "Measure", "Metrics", prop, label)

    def sort(self, kind, entity, prop, desc=True):
        self.order.append({"Direction": 2 if desc else 1, "Expression": self._field(kind, entity, prop)})
        return self

    def to_container(self, z, page_name):
        x, y, w, h = self.pos
        name = stable_id(page_name, self.vtype, *self.pos, self.title)
        vc = {}
        if self.title:
            vc["title"] = [{"properties": {"show": lit("true"), "text": lit(f"'{self.title}'"),
                                           "fontSize": lit("12D")}}]
        single = {
            "visualType": self.vtype,
            "projections": self.projections,
            "prototypeQuery": {
                "Version": 2,
                "From": [{"Name": a, "Entity": e, "Type": 0} for e, a in self.froms.items()],
                "Select": self.selects,
                **({"OrderBy": self.order} if self.order else {}),
            },
            "drillFilterOtherVisuals": True,
            **({"columnProperties": {k: {"displayName": v} for k, v in self.names.items()}} if self.names else {}),
            "objects": self.objects,
            "vcObjects": vc,
        }
        config = {"name": name, "layouts": [{"id": 0, "position": {"x": x, "y": y, "z": z, "width": w, "height": h}}],
                  "singleVisual": single}
        return {"x": x, "y": y, "z": z, "width": w, "height": h, "config": json.dumps(config), "filters": "[]"}


AUTHOR = "CodeWithMunnaX"
# Shown as clickable links in every page header. Add more as "Label": "https://..."
# (e.g. "Portfolio", "LinkedIn", "Instagram", "YouTube"); empty values are skipped.
SOCIAL_LINKS = {
    "Portfolio": "https://codewithmunnax.com",
    "GitHub": "https://github.com/CodeWithMunnaX",
    "LinkedIn": "https://www.linkedin.com/in/munna-kumar-93234b241",
    "YouTube": "https://www.youtube.com/@CodeWithMunnaX",
    "Instagram": "https://www.instagram.com/codewithmunnax",
}

NAVY = "#0B1E4D"
ORANGE = "#F97316"
PURPLE = "#7C3AED"
CANVAS = "#EEF2F7"

THEME = {
    "name": "IPL Theme",
    "dataColors": ["#1D4ED8", "#F97316", "#10B981", "#7C3AED", "#EAB308", "#EC4899", "#0EA5E9", "#EF4444"],
    "background": "#FFFFFF",
    "foreground": "#0F172A",
    "tableAccent": NAVY,
    "textClasses": {
        "callout": {"fontSize": 24, "fontFace": "Segoe UI Semibold", "color": NAVY},
        "title": {"fontSize": 12, "fontFace": "Segoe UI Semibold", "color": NAVY},
        "header": {"fontSize": 11, "fontFace": "Segoe UI Semibold", "color": NAVY},
        "label": {"fontSize": 10, "fontFace": "Segoe UI", "color": "#475569"},
    },
    "visualStyles": {
        "*": {"*": {
            "background": [{"show": True, "color": {"solid": {"color": "#FFFFFF"}}, "transparency": 0}],
            "border": [{"show": True, "color": {"solid": {"color": "#E2E8F0"}}, "radius": 12}],
            "dropShadow": [{"show": False}],
            "title": [{"show": True, "fontColor": {"solid": {"color": NAVY}}, "fontSize": 12, "bold": True}],
            "padding": [{"top": 10, "bottom": 10, "left": 12, "right": 12}],
        }},
        "page": {"*": {"background": [{"color": {"solid": {"color": CANVAS}}, "transparency": 0}]}},
        "card": {"*": {
            "labels": [{"color": {"solid": {"color": NAVY}}, "fontSize": 22}],
            "categoryLabels": [{"color": {"solid": {"color": "#64748B"}}, "fontSize": 10}],
        }},
        "tableEx": {"*": {
            "columnHeaders": [{"fontColor": {"solid": {"color": "#FFFFFF"}}, "backColor": {"solid": {"color": NAVY}},
                               "bold": True, "fontSize": 11}],
            "values": [{"fontColorPrimary": {"solid": {"color": "#0F172A"}}, "backColorPrimary": {"solid": {"color": "#FFFFFF"}},
                        "fontColorSecondary": {"solid": {"color": "#0F172A"}}, "backColorSecondary": {"solid": {"color": "#F8FAFC"}},
                        "fontSize": 11}],
            "grid": [{"gridHorizontal": True, "gridHorizontalColor": {"solid": {"color": "#E2E8F0"}},
                      "gridVertical": False, "rowPadding": 4}],
        }},
        "slicer": {"*": {"header": [{"fontColor": {"solid": {"color": NAVY}}, "bold": True}]}},
    },
}


def text_box(x, y, w, h, runs, background=None, z=0, name=""):
    """runs: list of (text, size, color, bold) rendered as one paragraph per item."""
    vc = {"border": [{"properties": {"show": lit("false")}}],
          "padding": [{"properties": {"top": lit("6D"), "bottom": lit("4D"), "left": lit("16D"), "right": lit("8D")}}]}
    if background:
        vc["background"] = [{"properties": {"show": lit("true"), "color": {"solid": {"color": lit(f"'{background}'")}},
                                            "transparency": lit("0D")}}]
    config = {
        "name": stable_id("textbox", name, x, y, *[t for t, *_ in runs]),
        "layouts": [{"id": 0, "position": {"x": x, "y": y, "z": z, "width": w, "height": h}}],
        "singleVisual": {
            "visualType": "textbox", "drillFilterOtherVisuals": True,
            "objects": {"general": [{"properties": {"paragraphs": [
                {"textRuns": [{"value": t, "textStyle": {"fontWeight": "bold" if b else "normal",
                                                         "fontSize": size, "color": color}}]}
                for t, size, color, b in runs
            ]}}]},
            "vcObjects": vc,
        },
    }
    return {"x": x, "y": y, "z": z, "width": w, "height": h, "config": json.dumps(config), "filters": "[]"}


def credit_box(x, y, w, h, name):
    """'Made by' line plus a row of hyperlinks, right-aligned in the header."""
    links = [(label, url) for label, url in SOCIAL_LINKS.items() if url]
    link_runs = []
    for i, (label, url) in enumerate(links):
        if i:
            link_runs.append({"value": "  ·  ", "textStyle": {"fontSize": "10pt", "color": "#94A3B8"}})
        link_runs.append({"value": label, "url": url,
                          "textStyle": {"fontSize": "10pt", "color": "#1D4ED8", "fontWeight": "bold",
                                        "textDecoration": "underline"}})
    paragraphs = [
        {"horizontalTextAlignment": "right", "textRuns": [
            {"value": "Made by ", "textStyle": {"fontSize": "10pt", "color": "#64748B"}},
            {"value": AUTHOR, "textStyle": {"fontSize": "12pt", "color": NAVY, "fontWeight": "bold"}},
        ]},
        {"horizontalTextAlignment": "right", "textRuns": link_runs or [{"value": " ", "textStyle": {}}]},
    ]
    config = {
        "name": stable_id("credits", name),
        "layouts": [{"id": 0, "position": {"x": x, "y": y, "z": 1, "width": w, "height": h}}],
        "singleVisual": {
            "visualType": "textbox", "drillFilterOtherVisuals": True,
            "objects": {"general": [{"properties": {"paragraphs": paragraphs}}]},
            "vcObjects": {"border": [{"properties": {"show": lit("false")}}],
                          "padding": [{"properties": {"top": lit("4D"), "bottom": lit("2D"),
                                                      "left": lit("8D"), "right": lit("12D")}}],
                          "background": [{"properties": {"show": lit("true"),
                                                         "color": {"solid": {"color": lit("'#FFFFFF'")}},
                                                         "transparency": lit("0D")}}]},
        },
    }
    return {"x": x, "y": y, "z": 1, "width": w, "height": h, "config": json.dumps(config), "filters": "[]"}


def season_slicer(x=1054, y=8, w=210, h=62):
    v = Visual("slicer", x, y, w, h).col("Values", "Seasons", "season", "Season")
    v.objects = {"data": [{"properties": {"mode": lit("'Dropdown'")}}],
                 "general": [{"properties": {"orientation": lit("0D")}}]}
    return v


def card(x, y, w, h, measure, label=None):
    return Visual("card", x, y, w, h).mea("Values", measure, label)


def photo_table(x, y, w, h, title, image_h):
    v = Visual("tableEx", x, y, w, h, title)
    v.objects["grid"] = [{"properties": {"imageHeight": lit(f"{image_h}D")}}]
    return v


def page(name, display, visuals, subtitle):
    containers = [
        text_box(0, 0, 1280, 76, [
            ("IPL ANALYTICS", "18pt", "#FFFFFF", True),
            (subtitle, "10pt", "#CBD5E1", False),
        ], background=NAVY, name=name),
        credit_box(612, 10, 430, 58, name),
    ]
    containers += [v.to_container((i + 1) * 1000, name) for i, v in enumerate(visuals)]
    return {
        "name": name, "displayName": display, "displayOption": 1, "width": 1280, "height": 720,
        "config": json.dumps({"objects": {"background": [{"properties": {
            "color": {"solid": {"color": lit(f"'{CANVAS}'")}}, "transparency": lit("0D")}}]}}),
        "filters": "[]", "visualContainers": containers,
    }


def build_report():
    kpis = [("Matches", None), ("Total Runs", None), ("Wickets", None), ("Run Rate", None),
            ("Sixes", None), ("Fours", None), ("Avg 1st Innings", "Avg 1st innings"), ("Highest Total", "Highest total")]
    overview = [season_slicer()]
    overview += [card(16 + i * 157, 88, 149, 84, m, label) for i, (m, label) in enumerate(kpis)]
    overview += [
        photo_table(16, 184, 304, 252, "🟠 Orange Cap · most runs", 112)
        .mea("Values", "Orange Cap Photo", "Photo").col("Values", "Deliveries", "batter", "Batter")
        .mea("Values", "Orange Cap Runs", "Runs").mea("Values", "Orange Cap SR", "SR")
        .sort("Measure", "Metrics", "Orange Cap Runs"),
        photo_table(328, 184, 304, 252, "🟣 Purple Cap · most wickets", 112)
        .mea("Values", "Purple Cap Photo", "Photo").col("Values", "Deliveries", "bowler", "Bowler")
        .mea("Values", "Purple Cap Wickets", "Wkts").mea("Values", "Purple Cap Economy", "Econ")
        .sort("Measure", "Metrics", "Purple Cap Wickets"),
        Visual("lineChart", 640, 184, 624, 252, "Runs per match by season")
        .col("Category", "Seasons", "season", "Season").mea("Y", "Runs per Match", "Runs per match")
        .sort("Column", "Seasons", "season", desc=False),
        photo_table(16, 448, 620, 260, "Team standings", 28)
        .col("Values", "Teams", "logo", "Logo").col("Values", "Teams", "team", "Team").mea("Values", "Played")
        .mea("Values", "Won").mea("Values", "Win %").mea("Values", "Team Titles", "Titles")
        .sort("Measure", "Metrics", "Win %"),
        Visual("clusteredColumnChart", 644, 448, 620, 260, "Sixes per match by season")
        .col("Category", "Seasons", "season", "Season").mea("Y", "Sixes per Match", "Sixes per match")
        .sort("Column", "Seasons", "season", desc=False),
    ]

    players = [season_slicer()]
    players += [
        photo_table(16, 88, 620, 620, "🏏 Top 10 batters", 46)
        .mea("Values", "Batter Photo", "Photo").col("Values", "Deliveries", "batter", "Batter")
        .mea("Values", "Top 10 Bat Matches", "Mat").mea("Values", "Top 10 Runs", "Runs")
        .mea("Values", "Top 10 Strike Rate", "SR").mea("Values", "Top 10 Fours", "4s").mea("Values", "Top 10 Sixes", "6s")
        .sort("Measure", "Metrics", "Top 10 Runs"),
        photo_table(644, 88, 620, 620, "🎯 Top 10 bowlers · run outs not credited", 46)
        .mea("Values", "Bowler Photo", "Photo").col("Values", "Deliveries", "bowler", "Bowler")
        .mea("Values", "Top 10 Bowl Matches", "Mat").mea("Values", "Top 10 Wickets", "Wkts")
        .mea("Values", "Top 10 Economy", "Econ").mea("Values", "Top 10 Dots", "Dots")
        .sort("Measure", "Metrics", "Top 10 Wickets"),
    ]

    teams = [season_slicer()]
    teams += [
        photo_table(16, 88, 620, 400, "Points table", 30)
        .col("Values", "Teams", "logo", "Logo").col("Values", "Teams", "team", "Team").mea("Values", "Played", "P")
        .mea("Values", "Won", "W").mea("Values", "Lost", "L").mea("Values", "Tie / NR", "T/NR").mea("Values", "Win %")
        .sort("Measure", "Metrics", "Win %"),
        photo_table(644, 88, 620, 400, "🏆 Champions", 30)
        .col("Values", "Champions", "season", "Season").col("Values", "Champions", "champion_logo", "Logo")
        .col("Values", "Champions", "champion", "Champion").col("Values", "Champions", "runner_up", "Runner-up")
        .sort("Column", "Champions", "season"),
        Visual("clusteredBarChart", 16, 500, 620, 208, "Titles won")
        .col("Category", "Champions", "champion", "Team").mea("Y", "Titles").sort("Measure", "Metrics", "Titles"),
        Visual("clusteredBarChart", 644, 500, 620, 208, "Win %")
        .col("Category", "Teams", "team", "Team").mea("Y", "Win %").sort("Measure", "Metrics", "Win %"),
    ]

    insights = [season_slicer()]
    insights += [
        Visual("clusteredColumnChart", 16, 88, 820, 260, "Average runs per over (per innings)")
        .col("Category", "Deliveries", "over", "Over").mea("Y", "Avg Runs per Over", "Avg runs")
        .sort("Column", "Deliveries", "over", desc=False),
        Visual("tableEx", 844, 88, 420, 260, "Match phases")
        .col("Values", "Deliveries", "phase", "Phase").mea("Values", "Run Rate", "Run rate")
        .mea("Values", "Wickets per Innings", "Wkts / inns").sort("Column", "Deliveries", "phase", desc=False),
        Visual("tableEx", 16, 360, 820, 348, "Venues")
        .col("Values", "Matches", "venue", "Venue").col("Values", "Matches", "city", "City").mea("Values", "Matches")
        .mea("Values", "Avg 1st Innings", "Avg 1st inns").sort("Measure", "Metrics", "Matches"),
        card(844, 360, 136, 140, "Toss Winner Won %", "Toss → won"),
        card(986, 360, 136, 140, "Chose to Field %", "Fielded first"),
        card(1128, 360, 136, 140, "Chasing Win %", "Chasers won"),
        Visual("clusteredBarChart", 844, 508, 420, 200, "How batters got out")
        .col("Category", "Deliveries", "wicket_kind", "Dismissal").mea("Y", "Wickets").sort("Measure", "Metrics", "Wickets"),
    ]

    return {
        "config": json.dumps({"version": "5.43", "activeSectionIndex": 0, "defaultDrillFilterOtherVisuals": True,
                              "themeCollection": {
                                  "baseTheme": {"name": BASE_THEME, "version": "5.61", "type": 2},
                                  "customTheme": {"name": CUSTOM_THEME, "version": "5.61", "type": 1},
                              },
                              "settings": {"useStylableVisualContainerHeader": True}}),
        "layoutOptimization": 0,
        "resourcePackages": [
            {"resourcePackage": {"name": "SharedResources", "type": 2, "disabled": False,
                                 "items": [{"type": 202, "path": f"BaseThemes/{BASE_THEME}.json", "name": BASE_THEME}]}},
            {"resourcePackage": {"name": "RegisteredResources", "type": 1, "disabled": False,
                                 "items": [{"type": 202, "path": f"{CUSTOM_THEME}.json", "name": CUSTOM_THEME}]}},
        ],
        "sections": [
            page("Overview", "Overview", overview, "Overview · 2008–2025 · use the Season filter on every page"),
            page("Players", "Players", players, "Players · top 10 batters and bowlers for the selected season"),
            page("Teams", "Teams", teams, "Teams · standings, champions and titles"),
            page("Insights", "Match Insights", insights, "Match insights · overs, phases, venues, toss and dismissals"),
        ],
    }


# ---------------------------------------------------------------------------

def write(path, obj):
    path = os.path.join(HERE, path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(obj if isinstance(obj, str) else json.dumps(obj, indent=2))


def copy_base_theme():
    """Copy the base theme from the installed Power BI Desktop (Store or MSI install)."""
    dest = os.path.join(HERE, "IPL.Report", "StaticResources", "SharedResources", "BaseThemes", f"{BASE_THEME}.json")
    if os.path.exists(dest):
        return
    roots = [os.path.join(os.environ.get("ProgramFiles", r"C:\Program Files"), "Microsoft Power BI Desktop")]
    # Store install: WindowsApps can't be listed, so ask Windows where the package lives
    try:
        out = subprocess.run(
            ["powershell", "-NoProfile", "-Command",
             "(Get-AppxPackage Microsoft.MicrosoftPowerBIDesktop).InstallLocation"],
            capture_output=True, text=True, timeout=60,
        ).stdout
        roots += [line.strip() for line in out.splitlines() if line.strip()]
    except (OSError, subprocess.SubprocessError):
        pass
    for root in roots:
        src = os.path.join(root, "bin", "WebView2Resources", "minerva", "sharedresources", "BaseThemes", f"{BASE_THEME}.json")
        if os.path.exists(src):
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            shutil.copyfile(src, dest)
            return
    raise SystemExit(f"Base theme {BASE_THEME}.json not found - is Power BI Desktop installed?")


def main():
    print("Exporting data ...")
    export_data()
    print("Writing PBIP ...")
    # Power BI rewrites the project in its own layout on save (e.g. report/definition/*),
    # so start from clean folders to avoid mixing old and new formats
    for d in ("IPL.Report", "IPL.SemanticModel"):
        shutil.rmtree(os.path.join(HERE, d), ignore_errors=True)
    write("IPL.pbip", {"version": "1.0", "artifacts": [{"report": {"path": "IPL.Report"}}], "settings": {"enableAutoRecovery": True}})
    write("IPL.SemanticModel/definition.pbism", {"version": "1.0", "settings": {}})
    write("IPL.SemanticModel/model.bim", build_model())
    write("IPL.Report/definition.pbir", {"version": "1.0", "datasetReference": {"byPath": {"path": "../IPL.SemanticModel"}, "byConnection": None}})
    write("IPL.Report/report.json", build_report())
    copy_base_theme()
    write(f"IPL.Report/StaticResources/RegisteredResources/{CUSTOM_THEME}.json", THEME)
    write(".gitignore", "data/\n**/.pbi/localSettings.json\n**/.pbi/cache.abf\n")
    print("Done. Open powerbi/IPL.pbip in Power BI Desktop.")


if __name__ == "__main__":
    main()
