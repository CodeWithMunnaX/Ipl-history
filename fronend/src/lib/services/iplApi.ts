"use client"

import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

// Create base query with retry logic
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api", // Use env variable or fallback to proxy
  timeout: 30000, // 30 second timeout
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Add retry logic for failed requests
const baseQueryWithRetry = retry(baseQuery, {
  maxRetries: 3,
});

export const iplApi = createApi({
  reducerPath: "iplApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    "Teams",
    "Team",
    "Players",
    "Player",
    "Seasons",
    "Overall",
    "Charts",
    "Analysis",
    "Stats",
    "Scorecard",
  ],
  endpoints: (builder) => ({
    // Teams
    getTeams: builder.query<any[], void>({
      query: () => `/teams`,
      transformResponse: (res: any) => res?.teams ?? res,
      providesTags: ["Teams"],
    }),
    getTeamById: builder.query<any, string | number>({
      query: (teamId) => `/teams/${teamId}`,
      providesTags: (_r, _e, id) => [{ type: "Team", id }],
    }),
    getTeamStats: builder.query<any, string | number>({
      query: (teamId) => `/teams/${teamId}/stats`,
      providesTags: (_r, _e, id) => [{ type: "Team", id }],
    }),

    // Players
    getPlayers: builder.query<any[], void>({
      query: () => `/players`,
      transformResponse: (res: any) => res?.players ?? res,
      providesTags: ["Players"],
    }),
    getPlayerById: builder.query<any, string | number>({
      query: (playerId) => `/players/${playerId}`,
      providesTags: (_r, _e, id) => [{ type: "Player", id }],
    }),
    getPlayerStats: builder.query<any, string | number>({
      query: (playerId) => `/players/${playerId}/stats`,
      providesTags: (_r, _e, id) => [{ type: "Player", id }],
    }),

    // Seasons
    getSeasons: builder.query<any[], void>({
      query: () => `/seasons`,
      transformResponse: (res: any) => res?.seasons ?? res,
      providesTags: ["Seasons"],
    }),
    getSeasonWinners: builder.query<any, string | number>({
      query: (season) => `/seasons/${season}/winners`,
      providesTags: ["Seasons"],
    }),
    getSeasonTopBatsmen: builder.query<any[], string | number>({
      query: (season) => `/seasons/${season}/top-batsmen?limit=10`,
      transformResponse: (res: any) => res?.top_batsmen ?? res ?? [],
      providesTags: ["Seasons"],
    }),
    getSeasonTopBowlers: builder.query<any[], string | number>({
      query: (season) => `/seasons/${season}/top-bowlers?limit=10`,
      transformResponse: (res: any) => res?.top_bowlers ?? res ?? [],
      providesTags: ["Seasons"],
    }),
    getSeasonMatches: builder.query<any[], string | number>({
      query: (season) => `/seasons/${season}/matches`,
      transformResponse: (res: any) => res?.matches ?? res ?? [],
      providesTags: ["Seasons"],
    }),

    // Overall
    getOverallTopBatsmen: builder.query<any[], void>({
      query: () => `/overall/top-batsmen?limit=10`,
      transformResponse: (res: any) => {
        if (Array.isArray(res)) return res;
        return (
          res?.top_batsmen ?? res?.batsmen ?? res?.players ?? res?.data ?? res?.results ?? []
        );
      },
      providesTags: ["Overall"],
    }),
    getOverallTopBowlers: builder.query<any[], void>({
      query: () => `/overall/top-bowlers?limit=10`,
      transformResponse: (res: any) => {
        if (Array.isArray(res)) return res;
        return (
          res?.top_bowlers ?? res?.bowlers ?? res?.players ?? res?.data ?? res?.results ?? []
        );
      },
      providesTags: ["Overall"],
    }),
    getOverallTeamStandings: builder.query<any[], void>({
      query: () => `/overall/team-standings`,
      transformResponse: (res: any) => {
        if (Array.isArray(res)) return res;
        return res?.standings ?? res?.table ?? res?.data ?? res?.results ?? [];
      },
      providesTags: ["Overall"],
    }),

    // Charts
    getSeasonTeamPerformancePie: builder.query<any, string | number>({
      query: (season) => `/charts/pie/team-performance`,
      providesTags: ["Charts"],
    }),
    getSeasonRunsDistributionPie: builder.query<any, string | number>({
      query: (season) => `/charts/pie/player-runs-distribution?limit=10`,
      providesTags: ["Charts"],
    }),
    getSeasonBatsmanRunsBar: builder.query<any, { season: string | number; limit?: number }>({
      query: ({ season, limit = 15 }) => `/charts/bar/season-wise-stats`,
      providesTags: ["Charts"],
    }),
    getSeasonBowlerWicketsBar: builder.query<any, { season: string | number; limit?: number }>({
      query: ({ season, limit = 15 }) => `/charts/pie/wicket-types`,
      providesTags: ["Charts"],
    }),
    getPlayerPerformanceLine: builder.query<any, string | number>({
      query: (playerId) => `/charts/line/player-performance/${playerId}`,
      providesTags: ["Charts"],
    }),

    // Analysis
    getSeasonDetailedAnalysis: builder.query<any, string | number>({
      query: (season) => `/analysis/seasons/${season}/detailed`,
      providesTags: ["Analysis"],
    }),
    getBallByBallAnalysis: builder.query<any, string | number>({
      query: (matchId) => `/analysis/ball-by-ball/${matchId}`,
      providesTags: ["Analysis"],
    }),
    getOverByOverAnalysis: builder.query<any, string | number>({
      query: (matchId) => `/analysis/over-by-over/${matchId}`,
      providesTags: ["Analysis"],
    }),
    getPlayerDetailedAnalysis: builder.query<any, string | number>({
      query: (playerId) => `/analysis/player/${playerId}/detailed`,
      providesTags: ["Analysis"],
    }),

    // Stats
    getDetailedBatsmenStats: builder.query<any[], { limit?: number }>({
      query: ({ limit = 20 }) => `/stats/batsmen/detailed?limit=${limit}`,
      transformResponse: (res: any) => res?.top_batsmen ?? res ?? [],
      providesTags: ["Stats"],
    }),
    getDetailedBowlersStats: builder.query<any[], { limit?: number }>({
      query: ({ limit = 20 }) => `/stats/bowlers/detailed?limit=${limit}`,
      transformResponse: (res: any) => res?.top_bowlers ?? res ?? [],
      providesTags: ["Stats"],
    }),
    getComprehensiveTeamStats: builder.query<any[], void>({
      query: () => `/stats/teams/comprehensive`,
      transformResponse: (res: any) => res?.team_rankings ?? res ?? [],
      providesTags: ["Stats"],
    }),
    getRecentMatches: builder.query<any[], { limit?: number }>({
      query: ({ limit = 10 }) => `/stats/matches/recent?limit=${limit}`,
      transformResponse: (res: any) => res?.recent_matches ?? res ?? [],
      providesTags: ["Stats"],
    }),
    getPlayerCareerStats: builder.query<any, string | number>({
      query: (playerId) => `/stats/players/${playerId}/career`,
      providesTags: ["Stats"],
    }),
    getSeasonComprehensiveStats: builder.query<any, string | number>({
      query: (season) => `/stats/seasons/${season}/comprehensive`,
      providesTags: ["Stats"],
    }),

    // Match Scorecards
    getMatchScorecard: builder.query<any, string | number>({
      query: (matchId) => `/matches/${matchId}/scorecard`,
      providesTags: ["Scorecard"],
    }),
    getMatchScorecardComplete: builder.query<any, string | number>({
      query: (matchId) => `/matches/${matchId}/scorecard/complete`,
      providesTags: ["Scorecard"],
    }),
    getMatchScorecardSimple: builder.query<any, string | number>({
      query: (matchId) => `/matches/${matchId}/scorecard/simple`,
      providesTags: ["Scorecard"],
    }),
    getMatchLiveScore: builder.query<any, string | number>({
      query: (matchId) => `/matches/${matchId}/live-score`,
      providesTags: ["Scorecard"],
    }),

    // Match Lists
    getMatchById: builder.query<any, string | number>({
      query: (matchId) => `/matches/${matchId}`,
      providesTags: ["Scorecard"],
    }),

    // Power BI report (season undefined = all seasons)
    getPowerBIReport: builder.query<any, number | undefined>({
      query: (season) => (season ? `/powerbi/report?season=${season}` : "/powerbi/report"),
      providesTags: ["Seasons"],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useGetTeamStatsQuery,
  useGetPlayersQuery,
  useGetPlayerByIdQuery,
  useGetPlayerStatsQuery,
  useGetSeasonsQuery,
  useGetSeasonWinnersQuery,
  useGetSeasonTopBatsmenQuery,
  useGetSeasonTopBowlersQuery,
  useGetSeasonMatchesQuery,
  useGetOverallTopBatsmenQuery,
  useGetOverallTopBowlersQuery,
  useGetOverallTeamStandingsQuery,
  // Charts
  useGetSeasonTeamPerformancePieQuery,
  useGetSeasonRunsDistributionPieQuery,
  useGetSeasonBatsmanRunsBarQuery,
  useGetSeasonBowlerWicketsBarQuery,
  useGetPlayerPerformanceLineQuery,
  // Analysis
  useGetSeasonDetailedAnalysisQuery,
  useGetBallByBallAnalysisQuery,
  useGetOverByOverAnalysisQuery,
  useGetPlayerDetailedAnalysisQuery,
  // Stats
  useGetDetailedBatsmenStatsQuery,
  useGetDetailedBowlersStatsQuery,
  useGetComprehensiveTeamStatsQuery,
  useGetRecentMatchesQuery,
  useGetPlayerCareerStatsQuery,
  useGetSeasonComprehensiveStatsQuery,
  // Scorecard
  useGetMatchScorecardQuery,
  useGetMatchScorecardCompleteQuery,
  useGetMatchScorecardSimpleQuery,
  useGetMatchLiveScoreQuery,
  // Match Lists
  useGetMatchByIdQuery,
  // Power BI
  useGetPowerBIReportQuery,
} = iplApi;


