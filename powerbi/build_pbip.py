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

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "..", "backend", "ipl_data.db")
DATA = os.path.join(HERE, "data")

BASE_THEME = "CY24SU10"

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

    teams = pd.read_sql_query("SELECT team_name AS team, team_name_short AS short_name, image_url AS logo FROM teams", con)
    teams = teams[teams["team"].isin(team_matches["team"])].drop_duplicates("team")
    seasons = pd.DataFrame({"season": sorted(matches["season"].unique())})

    out = {
        "matches": matches, "deliveries": deliveries, "team_matches": team_matches,
        "teams": teams, "seasons": seasons, "champions": champions,
    }
    for name, df in out.items():
        df.to_csv(os.path.join(DATA, f"{name}.csv"), index=False, encoding="utf-8")
        print(f"  {name}.csv  {len(df):>7} rows")
    return out


# ---------------------------------------------------------------------------
# 2. Semantic model (model.bim)
# ---------------------------------------------------------------------------

M_TYPES = {"int64": "Int64.Type", "double": "type number", "string": "type text", "dateTime": "type date"}


def csv_table(name, file, columns, hidden=(), sort_by=None):
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
]


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
        csv_table("Teams", "teams.csv", [("team", "string"), ("short_name", "string"), ("logo", "string")]),
        csv_table("Champions", "champions.csv", [
            ("season", "int64"), ("champion", "string"), ("runner_up", "string"), ("final_venue", "string"),
        ]),
        {
            "name": "Metrics",
            "columns": [{"name": "Dummy", "dataType": "string", "sourceColumn": "Dummy", "isHidden": True}],
            "partitions": [{"name": "Metrics", "mode": "import", "source": {
                "type": "m", "expression": ["let", "    Source = #table(type table [Dummy = text], {})", "in", "    Source"]}}],
            "measures": [
                {"name": n, "expression": e, "formatString": f} for n, e, f in MEASURES
            ],
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
                ["DataFolder", "Seasons", "Matches", "Deliveries", "TeamMatches", "Teams", "Champions", "Metrics"])}],
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
        vc["dropShadow"] = [{"properties": {"show": lit("true")}}]
        vc["border"] = [{"properties": {"show": lit("false")}}]
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


def text_box(x, y, w, h, text, size="20pt", color="#252423", bold=True):
    config = {
        "name": stable_id("textbox", x, y, text),
        "layouts": [{"id": 0, "position": {"x": x, "y": y, "z": 0, "width": w, "height": h}}],
        "singleVisual": {
            "visualType": "textbox", "drillFilterOtherVisuals": True,
            "objects": {"general": [{"properties": {"paragraphs": [{"textRuns": [{
                "value": text, "textStyle": {"fontWeight": "bold" if bold else "normal", "fontSize": size, "color": color}
            }]}]}}]},
        },
    }
    return {"x": x, "y": y, "z": 0, "width": w, "height": h, "config": json.dumps(config), "filters": "[]"}


def season_slicer(x, y, w, h):
    v = Visual("slicer", x, y, w, h).col("Values", "Seasons", "season", "Season")
    v.objects = {"data": [{"properties": {"mode": lit("'Dropdown'")}}],
                 "general": [{"properties": {"orientation": lit("0D")}}]}
    return v


def card(x, y, w, h, measure):
    v = Visual("card", x, y, w, h).mea("Values", measure)
    v.objects = {"labels": [{"properties": {"fontSize": lit("24D")}}]}
    return v


def page(name, display, visuals, header):
    containers = [text_box(16, 8, 900, 44, header)]
    containers += [v.to_container((i + 1) * 1000, name) for i, v in enumerate(visuals)]
    return {
        "name": name, "displayName": display, "displayOption": 1, "width": 1280, "height": 720,
        "config": json.dumps({"objects": {"background": [{"properties": {"color": {"solid": {"color": lit("'#F3F2F1'")}},
                                                                          "transparency": lit("0D")}}]}}),
        "filters": "[]", "visualContainers": containers,
    }


def build_report():
    kpis = ["Matches", "Total Runs", "Wickets", "Run Rate", "Sixes", "Fours", "Avg 1st Innings", "Highest Total"]
    overview = [season_slicer(1040, 4, 224, 68)]
    overview += [card(16 + i * 156, 80, 148, 96, m) for i, m in enumerate(kpis)]
    overview += [
        Visual("lineChart", 16, 188, 620, 256, "Runs per match by season")
        .col("Category", "Seasons", "season", "Season").mea("Y", "Runs per Match").sort("Column", "Seasons", "season", desc=False),
        Visual("clusteredColumnChart", 644, 188, 620, 256, "Sixes per match by season")
        .col("Category", "Seasons", "season", "Season").mea("Y", "Sixes per Match").sort("Column", "Seasons", "season", desc=False),
        Visual("clusteredBarChart", 16, 456, 620, 252, "Team win %")
        .col("Category", "Teams", "team", "Team").mea("Y", "Win %").sort("Measure", "Metrics", "Win %"),
        Visual("clusteredBarChart", 644, 456, 620, 252, "How batters got out")
        .col("Category", "Deliveries", "wicket_kind", "Dismissal").mea("Y", "Wickets").sort("Measure", "Metrics", "Wickets"),
    ]

    players = [season_slicer(1040, 4, 224, 68)]
    players += [
        Visual("clusteredBarChart", 16, 80, 620, 300, "Top 10 run scorers")
        .col("Category", "Deliveries", "batter", "Batter").mea("Y", "Top 10 Runs", "Runs").sort("Measure", "Metrics", "Top 10 Runs"),
        Visual("clusteredBarChart", 644, 80, 620, 300, "Top 10 wicket takers (run outs not credited)")
        .col("Category", "Deliveries", "bowler", "Bowler").mea("Y", "Top 10 Wickets", "Wickets").sort("Measure", "Metrics", "Top 10 Wickets"),
        Visual("tableEx", 16, 392, 620, 316, "Batting")
        .col("Values", "Deliveries", "batter", "Batter").mea("Values", "Top 10 Bat Matches", "Matches")
        .mea("Values", "Top 10 Runs", "Runs").mea("Values", "Top 10 Strike Rate", "Strike rate")
        .mea("Values", "Top 10 Fours", "4s").mea("Values", "Top 10 Sixes", "6s")
        .sort("Measure", "Metrics", "Top 10 Runs"),
        Visual("tableEx", 644, 392, 620, 316, "Bowling")
        .col("Values", "Deliveries", "bowler", "Bowler").mea("Values", "Top 10 Bowl Matches", "Matches")
        .mea("Values", "Top 10 Wickets", "Wickets").mea("Values", "Top 10 Economy", "Economy")
        .mea("Values", "Top 10 Dots", "Dot balls")
        .sort("Measure", "Metrics", "Top 10 Wickets"),
    ]

    teams = [season_slicer(1040, 4, 224, 68)]
    teams += [
        Visual("tableEx", 16, 80, 500, 360, "Points table")
        .col("Values", "Teams", "team", "Team").mea("Values", "Played").mea("Values", "Won").mea("Values", "Lost")
        .mea("Values", "Tie / NR").mea("Values", "Win %").sort("Measure", "Metrics", "Win %"),
        Visual("clusteredColumnChart", 524, 80, 740, 210, "Average runs per over (per innings)")
        .col("Category", "Deliveries", "over", "Over").mea("Y", "Avg Runs per Over").sort("Column", "Deliveries", "over", desc=False),
        Visual("tableEx", 524, 298, 400, 142, "Match phases")
        .col("Values", "Deliveries", "phase", "Phase").mea("Values", "Run Rate").mea("Values", "Wickets per Innings")
        .sort("Column", "Deliveries", "phase", desc=False),
        Visual("multiRowCard", 932, 298, 332, 142, "Toss & chasing")
        .mea("Values", "Toss Winner Won %", "Toss winner won").mea("Values", "Chose to Field %", "Chose to field")
        .mea("Values", "Chasing Win %", "Chasing team won"),
        Visual("tableEx", 16, 452, 500, 256, "Champions")
        .col("Values", "Champions", "season", "Season").col("Values", "Champions", "champion", "Champion")
        .col("Values", "Champions", "runner_up", "Runner-up")
        .sort("Column", "Champions", "season"),
        Visual("tableEx", 524, 452, 740, 256, "Venues")
        .col("Values", "Matches", "venue", "Venue").col("Values", "Matches", "city", "City").mea("Values", "Matches")
        .mea("Values", "Avg 1st Innings").sort("Measure", "Metrics", "Matches"),
    ]

    return {
        "config": json.dumps({"version": "5.43", "activeSectionIndex": 0, "defaultDrillFilterOtherVisuals": True,
                              "themeCollection": {"baseTheme": {"name": BASE_THEME, "version": "5.61", "type": 2}},
                              "settings": {"useStylableVisualContainerHeader": True}}),
        "layoutOptimization": 0,
        "resourcePackages": [{"resourcePackage": {
            "name": "SharedResources", "type": 2, "disabled": False,
            "items": [{"type": 202, "path": f"BaseThemes/{BASE_THEME}.json", "name": BASE_THEME}],
        }}],
        "sections": [
            page("Overview", "Overview", overview, "IPL Report · Overview"),
            page("Players", "Players", players, "IPL Report · Players"),
            page("TeamsVenues", "Teams & Venues", teams, "IPL Report · Teams, Phases & Venues"),
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
    write(".gitignore", "data/\n**/.pbi/localSettings.json\n**/.pbi/cache.abf\n")
    print("Done. Open powerbi/IPL.pbip in Power BI Desktop.")


if __name__ == "__main__":
    main()
