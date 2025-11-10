"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetMatchScorecardCompleteQuery } from '@/lib/services/iplApi';
import AvatarImage from '@/components/AvatarImage';
import { normalizePlayerImage } from '@/lib/utils';
import Image from 'next/image';

interface MatchScorecardProps {
  matchId: string | number;
  className?: string;
}

const MatchScorecard: React.FC<MatchScorecardProps> = ({ matchId, className = "" }) => {
  const {
    data: scorecard,
    isLoading,
    error
  } = useGetMatchScorecardCompleteQuery(matchId);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-8 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-64 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !scorecard) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-6 text-center">
          <p className="text-gray-500">Unable to load match scorecard. Please try again later.</p>
        </Card>
      </div>
    );
  }

  const { match_info, innings_scorecards } = scorecard;

  // Helper function to clean player names from pandas DataFrame info
  const cleanPlayerName = (name: string) => {
    if (!name) return 'Unknown Player';
    // Remove pandas DataFrame information
    return name.replace(/\nName: \d+, dtype: object/g, '').trim();
  };

  // Helper function to get player image with fallback
  const getPlayerImage = (playerImage: string | null | undefined, playerName: string): string | undefined => {
    const normalized = normalizePlayerImage(playerImage || '');
    if (!normalized) {
      return undefined; // trigger AvatarImage fallback
    }
    return normalized;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Match Info Header - Cricket Scorecard Style */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 tracking-wide">
              {match_info.team1} vs {match_info.team2}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">📍 Venue</div>
                <div className="text-blue-100">{match_info.venue}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">📅 Date</div>
                <div className="text-blue-100">{match_info.match_date}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">🏆 Toss</div>
                <div className="text-blue-100">{match_info.toss_winner} ({match_info.toss_decision})</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">⭐ Player of Match</div>
                <div className="text-blue-100">{match_info.player_of_match}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-green-600 text-white px-6 py-2 rounded-full inline-block font-bold text-lg">
                🏆 {match_info.result}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Innings Scorecards - Cricket Scorecard Style */}
      {innings_scorecards.map((innings: any, index: number) => (
        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
          {/* Innings Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
            <h2 className="text-xl font-bold text-center">
              🏏 {innings.batting_team} - Innings {innings.innings}
            </h2>
          </div>
          
          {/* Score Summary - Cricket Style */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 border-b-2 border-gray-200">
            <div className="text-center mb-3 sm:mb-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 mb-1 sm:mb-2">
                {innings.total_score}/{innings.wickets_fallen}
              </div>
              <div className="text-sm sm:text-base md:text-lg text-gray-700">
                ({innings.total_overs} overs) • Run Rate: {innings.run_rate}
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-center">
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{innings.fours}</div>
                <div className="text-xs sm:text-sm text-gray-600">Fours</div>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">{innings.sixes}</div>
                <div className="text-xs sm:text-sm text-gray-600">Sixes</div>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{innings.extras}</div>
                <div className="text-xs sm:text-sm text-gray-600">Extras</div>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{innings.run_rate}</div>
                <div className="text-xs sm:text-sm text-gray-600">Run Rate</div>
              </div>
            </div>
          </div>

            {/* Batsman Scorecard - Cricket Style */}
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
                🏏 Batting Scorecard
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm text-xs sm:text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-800 min-w-[140px]">Batsman</th>
                      <th className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[40px]">R</th>
                      <th className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[40px]">B</th>
                      <th className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[40px]">4s</th>
                      <th className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[40px]">6s</th>
                      <th className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[50px]">SR</th>
                      <th className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-gray-800 min-w-[80px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {innings.batsman_scorecard.map((batsman: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 border-b border-gray-200">
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                            <AvatarImage 
                              src={getPlayerImage(batsman.player_image, batsman.player_name)} 
                              alt={cleanPlayerName(batsman.player_name)} 
                              width={24} 
                              height={24} 
                              className="rounded-full flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-800 truncate text-xs sm:text-sm">{cleanPlayerName(batsman.player_name)}</div>
                              {batsman.bat_style && batsman.bat_style.trim() && (
                                <div className="text-[10px] sm:text-xs text-gray-500 truncate">{batsman.bat_style}</div>
                              )}
                              {batsman.runs_distribution && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {Object.entries(batsman.runs_distribution).map(([range, count]: [string, any]) => (
                                    <span key={range} className="text-[10px] bg-gray-100 px-1 rounded">
                                      {range}: {count}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-blue-600 text-xs sm:text-sm">{batsman.runs}</td>
                        <td className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm">{batsman.balls}</td>
                        <td className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-semibold text-green-600 text-xs sm:text-sm">{batsman.fours}</td>
                        <td className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-semibold text-orange-600 text-xs sm:text-sm">{batsman.sixes}</td>
                        <td className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm">{batsman.strike_rate}</td>
                        <td className="border border-gray-300 px-1 sm:px-2 py-2 sm:py-3 text-center">
                          <span className={`px-1 sm:px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                            batsman.not_out 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {batsman.not_out ? 'Not Out' : 'Out'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bowler Scorecard - Cricket Style */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-pink-50">
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-red-300 pb-2">
                🎯 Bowling Scorecard
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm text-xs sm:text-sm min-w-[700px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-100 to-red-200">
                      <th className="border border-red-300 px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-gray-800 min-w-[140px]">Bowler</th>
                      <th className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[40px]">O</th>
                      <th className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[40px]">M</th>
                      <th className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[40px]">R</th>
                      <th className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[40px]">W</th>
                      <th className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[50px]">Econ</th>
                      <th className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[50px]">Avg</th>
                      <th className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[50px]">Wides</th>
                      <th className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-gray-800 w-[60px]">No Balls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {innings.bowler_scorecard.map((bowler: any, idx: number) => (
                      <tr key={idx} className="hover:bg-red-50 border-b border-red-200">
                        <td className="border border-red-300 px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                            <AvatarImage 
                              src={getPlayerImage(bowler.player_image, bowler.player_name)} 
                              alt={cleanPlayerName(bowler.player_name)} 
                              width={24} 
                              height={24} 
                              className="rounded-full flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-800 truncate text-xs sm:text-sm">{cleanPlayerName(bowler.player_name)}</div>
                              {bowler.bowl_style && bowler.bowl_style.trim() && (
                                <div className="text-[10px] sm:text-xs text-gray-500 truncate">{bowler.bowl_style}</div>
                              )}
                              {bowler.best_figures && (
                                <div className="text-xs text-red-600 font-semibold">Best: {bowler.best_figures}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm">{bowler.overs}</td>
                        <td className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm">{bowler.maidens}</td>
                        <td className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm">{bowler.runs_conceded}</td>
                        <td className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center font-bold text-red-600 text-xs sm:text-sm">{bowler.wickets}</td>
                        <td className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm">{bowler.economy}</td>
                        <td className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm">{bowler.bowling_average || '-'}</td>
                        <td className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm">{bowler.wides || '-'}</td>
                        <td className="border border-red-300 px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm">{bowler.no_balls || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fall of Wickets - Cricket Style */}
            {innings.fall_of_wickets && innings.fall_of_wickets.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50">
                <h3 className="text-lg font-bold mb-4 text-gray-800 border-b-2 border-red-300 pb-2">
                  🎯 Fall of Wickets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {innings.fall_of_wickets.map((wicket: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-lg p-3 sm:p-4 border border-red-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                        <div className="text-xs sm:text-sm font-bold text-red-600">Wicket #{wicket.wicket_number}</div>
                        <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit">{wicket.runs}/{wicket.over}</div>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{cleanPlayerName(wicket.batsman)}</div>
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        {wicket.wicket_kind} b {cleanPlayerName(wicket.bowler)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Over Summary - Cricket Style */}
            <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-800 border-b-2 border-yellow-300 pb-2">
                ⚡ Over Summary
              </h3>
              
              {/* Mobile Layout - Scrollable */}
              <div className="block sm:hidden">
                <div className="overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                    {innings.over_summary.map((over: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-1.5 text-center border border-yellow-300 hover:shadow-md transition-shadow min-w-[50px]">
                        <div className="text-[10px] font-bold text-blue-600">{over.over}</div>
                        <div className="text-[10px] text-green-600 font-semibold">{over.runs}</div>
                        <div className="text-[10px] text-red-600">{over.wickets}W</div>
                        {over.extras && <div className="text-[10px] text-orange-600">{over.extras}E</div>}
                        {over.bowler && <div className="text-[9px] text-gray-500 truncate">{cleanPlayerName(over.bowler).charAt(0)}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tablet Layout - 2 rows of 10 */}
              <div className="hidden sm:block lg:hidden">
                <div className="grid grid-cols-10 gap-1.5">
                  {innings.over_summary.map((over: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-lg p-2 text-center border border-yellow-300 hover:shadow-md transition-shadow">
                      <div className="text-[11px] font-bold text-blue-600">{over.over}</div>
                      <div className="text-[11px] text-green-600 font-semibold">{over.runs}</div>
                      <div className="text-[11px] text-red-600">{over.wickets}W</div>
                      {over.extras && <div className="text-[11px] text-orange-600">{over.extras}E</div>}
                      {over.bowler && <div className="text-[10px] text-gray-500 truncate">{cleanPlayerName(over.bowler).substring(0, 3)}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Layout - 3 rows of ~7 */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-7 gap-2">
                  {innings.over_summary.map((over: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-lg p-2 text-center border border-yellow-300 hover:shadow-md transition-shadow">
                      <div className="text-xs font-bold text-blue-600">{over.over}</div>
                      <div className="text-xs text-green-600 font-semibold">{over.runs}</div>
                      <div className="text-xs text-red-600">{over.wickets}W</div>
                      {over.extras && <div className="text-xs text-orange-600">{over.extras}E</div>}
                      {over.bowler && <div className="text-xs text-gray-500 truncate">{cleanPlayerName(over.bowler)}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default MatchScorecard;
