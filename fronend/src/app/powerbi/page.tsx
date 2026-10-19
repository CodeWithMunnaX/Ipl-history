"use client"

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  ReferenceLine,
} from "recharts";
import AppSidebar from "@/components/AppSidebar";
import { useGetPowerBIReportQuery } from "@/lib/services/iplApi";

// Chart palette (validated reference palette, light mode)
const C = {
  blue: "#2a78d6",
  blueMuted: "#b7d3f6",
  orange: "#eb6834",
  aqua: "#1baf7a",
  violet: "#6250d6",
  grid: "#e7e6e3",
  axis: "#8a8984",
  ink: "#0b0b0b",
  ink2: "#52514e",
  accent: "#f2c811", // Power BI yellow, chrome only
};

const fmt = (n?: number | null) => (n == null ? "–" : Number(n).toLocaleString("en-IN"));
const pct = (a: number, b: number) => (b ? Math.round((a * 1000) / b) / 10 : 0);

const axisProps = {
  tick: { fill: C.axis, fontSize: 12 },
  axisLine: false,
  tickLine: false,
} as const;

function Tile({ title, subtitle, children, className = "" }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`bg-white rounded-md border border-[#e1dfdd] shadow-[0_1.6px_3.6px_rgba(0,0,0,0.08)] p-4 flex flex-col min-w-0 ${className}`}>
      <header className="mb-3">
        <h3 className="text-[15px] font-semibold text-[#252423]">{title}</h3>
        {subtitle && <p className="text-xs text-[#605e5c] mt-0.5">{subtitle}</p>}
      </header>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-white rounded-md border border-[#e1dfdd] shadow-[0_1.6px_3.6px_rgba(0,0,0,0.08)] p-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: C.accent }} />
      <div className="text-[28px] leading-tight font-semibold text-[#252423] tabular-nums">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-[#605e5c] mt-1">{label}</div>
      {hint && <div className="text-[11px] text-[#8a8886] mt-0.5">{hint}</div>}
    </div>
  );
}

function ChartTooltip({ active, payload, label, unit = "", nameKey }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-white border border-[#e1dfdd] rounded shadow-md px-3 py-2 text-xs">
      <div className="font-semibold text-[#252423] mb-0.5">{nameKey ? row[nameKey] : label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="text-[#605e5c]">
          {p.name}: <span className="font-semibold text-[#252423] tabular-nums">{fmt(p.value)}{unit}</span>
        </div>
      ))}
    </div>
  );
}

function Meter({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const p = pct(value, total);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#252423]">{label}</span>
        <span className="font-semibold tabular-nums text-[#252423]">{p}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#edebe9] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
      </div>
      <div className="text-[11px] text-[#8a8886] mt-1">{fmt(value)} of {fmt(total)} matches</div>
    </div>
  );
}

function DataTable({ columns, rows }: {
  columns: { key: string; label: string; num?: boolean; render?: (r: any) => React.ReactNode }[];
  rows: any[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e1dfdd]">
            {columns.map((c) => (
              <th key={c.key} className={`py-2 px-2 font-semibold text-[#605e5c] text-xs uppercase tracking-wide whitespace-nowrap ${c.num ? "text-right" : "text-left"}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[#f3f2f1] hover:bg-[#f3f2f1]">
              {columns.map((c) => (
                <td key={c.key} className={`py-2 px-2 whitespace-nowrap ${c.num ? "text-right tabular-nums" : "text-left"} text-[#252423]`}>
                  {c.render ? c.render(r) : c.num ? fmt(r[c.key]) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PowerBIPage() {
  const [season, setSeason] = useState<number | undefined>(undefined);
  const { data, isFetching, isError, refetch } = useGetPowerBIReportQuery(season);

  const titles = useMemo(() => {
    const counts: Record<string, number> = {};
    (data?.champions || []).forEach((c: any) => { counts[c.champion] = (counts[c.champion] || 0) + 1; });
    return Object.entries(counts)
      .map(([team, count]) => ({ team, count }))
      .sort((a, b) => b.count - a.count);
  }, [data?.champions]);

  const k = data?.kpi;

  // Round the runs-per-match axis to tens so ticks read 260, 280, ...
  const rpmDomain = useMemo(() => {
    const v = (data?.season_trend || []).map((r: any) => r.runs_per_match);
    if (!v.length) return [0, 100];
    return [Math.floor(Math.min(...v) / 20) * 20 - 20, Math.ceil(Math.max(...v) / 20) * 20];
  }, [data?.season_trend]);
  const scope = season ? `Season ${season}` : "All seasons (2008–2025)";

  return (
    <AppSidebar>
      <div className="bg-[#f3f2f1] rounded-lg overflow-hidden border border-[#e1dfdd] min-h-screen">
        {/* Report header */}
        <div className="bg-[#252423] text-white px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-[3px] h-7" aria-hidden>
              <span className="w-1.5 h-3 rounded-sm" style={{ background: C.accent }} />
              <span className="w-1.5 h-5 rounded-sm" style={{ background: C.accent }} />
              <span className="w-1.5 h-7 rounded-sm" style={{ background: C.accent }} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold leading-tight">IPL Power BI Report</h2>
              <p className="text-xs text-[#c8c6c4]">{scope} · ball-by-ball data, super overs excluded</p>
            </div>
          </div>
          {data && isFetching && <span className="text-xs text-[#c8c6c4]">Refreshing…</span>}
        </div>

        {/* Season slicer */}
        <div className="bg-white border-b border-[#e1dfdd] px-4 sm:px-6 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[#605e5c] mb-2">Season</div>
          <div className="flex flex-wrap gap-1.5">
            {[undefined, ...((data?.seasons as number[]) || [])].map((s) => {
              const active = s === season;
              return (
                <button
                  key={s ?? "all"}
                  onClick={() => setSeason(s)}
                  className={`px-3 py-1 rounded text-sm border transition-colors ${
                    active
                      ? "bg-[#252423] text-white border-[#252423]"
                      : "bg-white text-[#252423] border-[#c8c6c4] hover:bg-[#f3f2f1]"
                  }`}
                >
                  {s ?? "All"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-4">
          {isError && (
            <div className="bg-white border border-[#e1dfdd] rounded-md p-6 text-center">
              <p className="text-[#252423] font-semibold">Report load nahi hua</p>
              <p className="text-sm text-[#605e5c] mt-1">Backend chal raha hai na? (port 8000)</p>
              <button onClick={() => refetch()} className="mt-3 px-4 py-1.5 rounded bg-[#252423] text-white text-sm">Retry</button>
            </div>
          )}

          {!data && !isError && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-md border border-[#e1dfdd] animate-pulse" />
              ))}
            </div>
          )}

          {data && (
            <>
              {/* KPIs */}
              <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
                <Kpi label="Matches" value={fmt(k.matches)} hint={`${k.teams} teams · ${k.venues} venues`} />
                <Kpi label="Total runs" value={fmt(k.runs)} hint={`${fmt(k.extras)} extras`} />
                <Kpi label="Wickets" value={fmt(k.wickets)} />
                <Kpi label="Run rate" value={k.run_rate?.toFixed(2)} hint="runs per over" />
                <Kpi label="Sixes" value={fmt(k.sixes)} />
                <Kpi label="Fours" value={fmt(k.fours)} />
                <Kpi label="Avg 1st innings" value={fmt(k.avg_first_innings)} />
                <Kpi label="Highest total" value={fmt(k.highest_total)} />
              </div>

              {/* Season trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Tile title="Runs per match by season" subtitle={season ? `Season ${season} highlighted` : "Scoring has climbed sharply since 2023"}>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <LineChart data={data.season_trend} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                        <CartesianGrid stroke={C.grid} vertical={false} />
                        <XAxis dataKey="season" {...axisProps} />
                        <YAxis {...axisProps} domain={rpmDomain} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: C.axis, strokeDasharray: "3 3" }} />
                        {season && <ReferenceLine x={season} stroke={C.accent} strokeWidth={2} />}
                        <Line
                          type="monotone"
                          dataKey="runs_per_match"
                          name="Runs per match"
                          stroke={C.blue}
                          strokeWidth={2}
                          dot={{ r: 4, fill: C.blue, stroke: "#fff", strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Tile>

                <Tile title="Sixes per match by season" subtitle="Average sixes hit in a match">
                  <div className="h-64">
                    <ResponsiveContainer>
                      <BarChart data={data.season_trend} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid stroke={C.grid} vertical={false} />
                        <XAxis dataKey="season" {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f2f1" }} />
                        <Bar dataKey="sixes_per_match" name="Sixes per match" radius={[4, 4, 0, 0]}>
                          {data.season_trend.map((r: any) => (
                            <Cell key={r.season} fill={!season || r.season === season ? C.blue : C.blueMuted} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Tile>
              </div>

              {/* Players */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Tile title="Top 10 run scorers" subtitle={scope}>
                  <div className="h-80">
                    <ResponsiveContainer>
                      <BarChart data={data.top_batsmen} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="player" width={110} {...axisProps} tick={{ fill: C.ink2, fontSize: 12 }} />
                        <Tooltip content={<ChartTooltip nameKey="player" />} cursor={{ fill: "#f3f2f1" }} />
                        <Bar dataKey="runs" name="Runs" fill={C.blue} radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
                          <LabelList dataKey="runs" position="right" fill={C.ink2} fontSize={12} formatter={(v: any) => fmt(v)} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <DataTable
                    rows={data.top_batsmen}
                    columns={[
                      { key: "player", label: "Batter" },
                      { key: "innings", label: "Mat", num: true },
                      { key: "runs", label: "Runs", num: true },
                      { key: "strike_rate", label: "SR", num: true },
                      { key: "fours", label: "4s", num: true },
                      { key: "sixes", label: "6s", num: true },
                    ]}
                  />
                </Tile>

                <Tile title="Top 10 wicket takers" subtitle={`${scope} · run outs not credited to bowler`}>
                  <div className="h-80">
                    <ResponsiveContainer>
                      <BarChart data={data.top_bowlers} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="player" width={110} {...axisProps} tick={{ fill: C.ink2, fontSize: 12 }} />
                        <Tooltip content={<ChartTooltip nameKey="player" />} cursor={{ fill: "#f3f2f1" }} />
                        <Bar dataKey="wickets" name="Wickets" fill={C.violet} radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
                          <LabelList dataKey="wickets" position="right" fill={C.ink2} fontSize={12} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <DataTable
                    rows={data.top_bowlers}
                    columns={[
                      { key: "player", label: "Bowler" },
                      { key: "innings", label: "Mat", num: true },
                      { key: "wickets", label: "Wkts", num: true },
                      { key: "economy", label: "Econ", num: true, render: (r) => r.economy?.toFixed(2) },
                      { key: "dots", label: "Dots", num: true },
                    ]}
                  />
                </Tile>
              </div>

              {/* Teams */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <Tile title="Team win %" subtitle={scope} className="xl:col-span-3">
                  <div style={{ height: Math.max(220, data.team_table.length * 30) }}>
                    <ResponsiveContainer>
                      <BarChart data={data.team_table} layout="vertical" margin={{ top: 0, right: 48, left: 8, bottom: 0 }}>
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis type="category" dataKey="team" width={170} {...axisProps} tick={{ fill: C.ink2, fontSize: 12 }} />
                        <Tooltip content={<ChartTooltip nameKey="team" unit="%" />} cursor={{ fill: "#f3f2f1" }} />
                        <ReferenceLine x={50} stroke={C.axis} strokeDasharray="3 3" />
                        <Bar dataKey="win_pct" name="Win %" fill={C.aqua} radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
                          <LabelList dataKey="win_pct" position="right" fill={C.ink2} fontSize={12} formatter={(v: any) => `${v}%`} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Tile>

                <Tile title="Points table" subtitle="Played · won · lost · tie / no result" className="xl:col-span-2">
                  <DataTable
                    rows={data.team_table}
                    columns={[
                      { key: "team", label: "Team" },
                      { key: "played", label: "P", num: true },
                      { key: "won", label: "W", num: true },
                      { key: "lost", label: "L", num: true },
                      { key: "no_result_or_tie", label: "T/NR", num: true },
                    ]}
                  />
                </Tile>
              </div>

              {/* Match phases */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Tile title="Average runs per over" subtitle="Per innings · yellow lines mark powerplay and death overs" className="lg:col-span-2">
                  <div className="h-64">
                    <ResponsiveContainer>
                      <BarChart data={data.overs} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid stroke={C.grid} vertical={false} />
                        <XAxis dataKey="over" {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip content={<ChartTooltip />} labelFormatter={(l) => `Over ${l}`} cursor={{ fill: "#f3f2f1" }} />
                        <ReferenceLine x={6.5} stroke={C.accent} strokeWidth={2} />
                        <ReferenceLine x={15.5} stroke={C.accent} strokeWidth={2} />
                        <Bar dataKey="avg_runs" name="Avg runs" fill={C.blue} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Tile>

                <Tile title="Phase summary" subtitle="Run rate and wickets per innings">
                  <div className="space-y-3">
                    {data.phases.map((ph: any) => (
                      <div key={ph.phase} className="rounded border border-[#edebe9] p-3">
                        <div className="text-sm font-semibold text-[#252423]">{ph.phase}</div>
                        <div className="flex gap-6 mt-1">
                          <div>
                            <div className="text-2xl font-semibold tabular-nums text-[#252423]">{ph.run_rate.toFixed(2)}</div>
                            <div className="text-[11px] uppercase tracking-wide text-[#605e5c]">Run rate</div>
                          </div>
                          <div>
                            <div className="text-2xl font-semibold tabular-nums text-[#252423]">{ph.wickets_per_innings.toFixed(2)}</div>
                            <div className="text-[11px] uppercase tracking-wide text-[#605e5c]">Wkts / inns</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Tile>
              </div>

              {/* Toss, dismissals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Tile title="Toss & chasing" subtitle={`${fmt(data.toss.decided)} matches with a result`}>
                  <div className="space-y-5 pt-1">
                    <Meter label="Toss winner won the match" value={data.toss.toss_winner_won} total={data.toss.decided} color={C.blue} />
                    <Meter label="Toss winner chose to field" value={data.toss.chose_field} total={data.toss.decided} color={C.orange} />
                    <Meter label="Matches won by chasing team" value={data.toss.won_chasing} total={data.toss.decided} color={C.aqua} />
                  </div>
                </Tile>

                <Tile title="How batters got out" subtitle={scope}>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <BarChart data={data.wicket_types} layout="vertical" margin={{ top: 0, right: 56, left: 8, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="kind" width={130} {...axisProps} tick={{ fill: C.ink2, fontSize: 12 }} />
                        <Tooltip content={<ChartTooltip nameKey="kind" />} cursor={{ fill: "#f3f2f1" }} />
                        <Bar dataKey="count" name="Dismissals" fill={C.orange} radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false}>
                          <LabelList dataKey="count" position="right" fill={C.ink2} fontSize={12} formatter={(v: any) => fmt(v)} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Tile>
              </div>

              {/* Champions & venues */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Tile title="Champions" subtitle="Every IPL final, 2008–2025">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {titles.map((t) => (
                      <span key={t.team} className="inline-flex items-center gap-1.5 rounded-full border border-[#e1dfdd] px-3 py-1 text-xs text-[#252423]">
                        🏆 {t.team} <span className="font-semibold tabular-nums">×{t.count}</span>
                      </span>
                    ))}
                  </div>
                  <DataTable
                    rows={[...data.champions].reverse()}
                    columns={[
                      { key: "season", label: "Season", render: (r) => (
                        <span className={r.season === season ? "font-semibold underline decoration-[#f2c811] decoration-2" : ""}>{r.season}</span>
                      ) },
                      { key: "champion", label: "Champion", render: (r) => <span className="font-semibold">{r.champion}</span> },
                      { key: "runner_up", label: "Runner-up" },
                    ]}
                  />
                </Tile>

                <Tile title="Top venues" subtitle={`${scope} · by matches hosted`}>
                  <DataTable
                    rows={data.venues}
                    columns={[
                      { key: "venue", label: "Venue", render: (r) => (
                        <div className="max-w-[260px] truncate" title={r.venue}>{r.venue}<span className="text-[#8a8886]"> · {r.city}</span></div>
                      ) },
                      { key: "matches", label: "Matches", num: true },
                      { key: "avg_first_innings", label: "Avg 1st inns", num: true },
                    ]}
                  />
                </Tile>
              </div>
            </>
          )}
        </div>
      </div>
    </AppSidebar>
  );
}
