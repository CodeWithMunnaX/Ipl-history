"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useGetDetailedBatsmenStatsQuery,
  useGetDetailedBowlersStatsQuery,
  useGetComprehensiveTeamStatsQuery,
  useGetRecentMatchesQuery,
} from '@/lib/services/iplApi';
import AvatarImage from '@/components/AvatarImage';
import AppSidebar from '@/components/AppSidebar';
import { normalizePlayerImage } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function StatsPage() {
  const router = useRouter();
  const [batsmenLimit, setBatsmenLimit] = useState(20);
  const [bowlersLimit, setBowlersLimit] = useState(20);
  const [matchesLimit, setMatchesLimit] = useState(10);

  const {
    data: batsmenStats,
    isLoading: batsmenLoading,
    error: batsmenError
  } = useGetDetailedBatsmenStatsQuery({ limit: batsmenLimit });

  const {
    data: bowlersStats,
    isLoading: bowlersLoading,
    error: bowlersError
  } = useGetDetailedBowlersStatsQuery({ limit: bowlersLimit });

  const {
    data: teamStats,
    isLoading: teamLoading,
    error: teamError
  } = useGetComprehensiveTeamStatsQuery();

  const {
    data: recentMatches,
    isLoading: matchesLoading,
    error: matchesError
  } = useGetRecentMatchesQuery({ limit: matchesLimit });

  const handleMatchClick = (matchId: string | number) => {
    router.push(`/scorecard?matchId=${matchId}`);
  };

  const handlePlayerClick = (playerId: string | number) => {
    router.push(`/players/${playerId}`);
  };

  return (
    <AppSidebar>
      <div className="min-h-screen bg-gray-50">
        <div className="p-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">📊 IPL Comprehensive Statistics</h1>
            <p className="text-blue-100 text-lg">Detailed player and team performance analysis</p>
          </div>
        </div>

        {/* Stats Tabs */}
        <Tabs defaultValue="batsmen" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg">
            <TabsTrigger value="batsmen" className="flex items-center gap-2">
              🏏 Batsmen Stats
            </TabsTrigger>
            <TabsTrigger value="bowlers" className="flex items-center gap-2">
              🎯 Bowlers Stats
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              🏆 Team Rankings
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              ⚡ Recent Matches
            </TabsTrigger>
          </TabsList>

          {/* Batsmen Stats */}
          <TabsContent value="batsmen" className="space-y-6">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  🏏 Top Batsmen Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {batsmenLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : batsmenError ? (
                  <div className="text-center space-y-4">
                    <p className="text-red-500">Error loading batsmen stats</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead className="text-center">Runs</TableHead>
                          <TableHead className="text-center">Balls</TableHead>
                          <TableHead className="text-center">Matches</TableHead>
                          <TableHead className="text-center">Innings</TableHead>
                          <TableHead className="text-center">Not Outs</TableHead>
                          <TableHead className="text-center">4s</TableHead>
                          <TableHead className="text-center">6s</TableHead>
                          <TableHead className="text-center">SR</TableHead>
                          <TableHead className="text-center">Avg</TableHead>
                          <TableHead className="text-center">HS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(batsmenStats) && batsmenStats.map((batsman: any, index: number) => {
                          const normalizedImage = normalizePlayerImage(batsman.player_image);
                          console.log('Batsman:', batsman.player_name, 'Original image:', batsman.player_image, 'Normalized:', normalizedImage);
                          return (
                            <TableRow key={index} className="hover:bg-green-50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <AvatarImage 
                                    src={normalizedImage} 
                                    alt={batsman.player_name} 
                                    width={32} 
                                    height={32} 
                                    className="rounded-full"
                                  />
                                  <span 
                                    className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                    onClick={() => handlePlayerClick(batsman.player_id || batsman.id)}
                                  >
                                    {batsman.player_name}
                                  </span>
                                </div>
                              </TableCell>
                            <TableCell className="text-center font-bold text-green-600">{batsman.total_runs || 0}</TableCell>
                            <TableCell className="text-center">{batsman.total_balls || 0}</TableCell>
                            <TableCell className="text-center">{batsman.total_matches || 0}</TableCell>
                            <TableCell className="text-center">{batsman.total_innings || 0}</TableCell>
                            <TableCell className="text-center">{batsman.not_outs || 0}</TableCell>
                            <TableCell className="text-center text-blue-600 font-semibold">{batsman.fours || 0}</TableCell>
                            <TableCell className="text-center text-orange-600 font-semibold">{batsman.sixes || 0}</TableCell>
                            <TableCell className="text-center">{batsman.strike_rate || 0}</TableCell>
                            <TableCell className="text-center">{batsman.average || 0}</TableCell>
                            <TableCell className="text-center font-bold text-purple-600">{batsman.highest_score || 0}</TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bowlers Stats */}
          <TabsContent value="bowlers" className="space-y-6">
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  🎯 Top Bowlers Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bowlersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : bowlersError ? (
                  <div className="text-center space-y-4">
                    <p className="text-red-500">Error loading bowlers stats</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead className="text-center">Wickets</TableHead>
                          <TableHead className="text-center">Matches</TableHead>
                          <TableHead className="text-center">Overs</TableHead>
                          <TableHead className="text-center">Balls</TableHead>
                          <TableHead className="text-center">Runs</TableHead>
                          <TableHead className="text-center">Economy</TableHead>
                          <TableHead className="text-center">Avg</TableHead>
                          <TableHead className="text-center">SR</TableHead>
                          <TableHead className="text-center">Best</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(bowlersStats) && bowlersStats.map((bowler: any, index: number) => {
                          const normalizedImage = normalizePlayerImage(bowler.player_image);
                          console.log('Bowler:', bowler.player_name, 'Original image:', bowler.player_image, 'Normalized:', normalizedImage);
                          return (
                            <TableRow key={index} className="hover:bg-red-50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <AvatarImage 
                                    src={normalizedImage} 
                                    alt={bowler.player_name} 
                                    width={32} 
                                    height={32} 
                                    className="rounded-full"
                                  />
                                  <span 
                                    className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                    onClick={() => handlePlayerClick(bowler.player_id || bowler.id)}
                                  >
                                    {bowler.player_name}
                                  </span>
                                </div>
                              </TableCell>
                            <TableCell className="text-center font-bold text-red-600">{bowler.total_wickets || 0}</TableCell>
                            <TableCell className="text-center">{bowler.total_matches || 0}</TableCell>
                            <TableCell className="text-center">{bowler.total_overs || 0}</TableCell>
                            <TableCell className="text-center">{bowler.total_balls || 0}</TableCell>
                            <TableCell className="text-center">{bowler.runs_conceded || 0}</TableCell>
                            <TableCell className="text-center">{bowler.economy || 0}</TableCell>
                            <TableCell className="text-center">{bowler.bowling_average || 0}</TableCell>
                            <TableCell className="text-center">{bowler.strike_rate || 0}</TableCell>
                            <TableCell className="text-center font-bold text-purple-600">{bowler.best_figures || "-"}</TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Rankings */}
          <TabsContent value="teams" className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  🏆 Team Rankings & Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : teamError ? (
                  <div className="text-center space-y-4">
                    <p className="text-red-500">Error loading team stats</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center">Matches</TableHead>
                          <TableHead className="text-center">Wins</TableHead>
                          <TableHead className="text-center">Losses</TableHead>
                          <TableHead className="text-center">Win %</TableHead>
                          <TableHead className="text-center">Runs Scored</TableHead>
                          <TableHead className="text-center">Runs Conceded</TableHead>
                          <TableHead className="text-center">Wickets Taken</TableHead>
                          <TableHead className="text-center">Batting Avg</TableHead>
                          <TableHead className="text-center">Bowling Avg</TableHead>
                          <TableHead className="text-center">NRR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(teamStats) && teamStats.map((team: any, index: number) => (
                          <TableRow key={index} className="hover:bg-blue-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img 
                                  src={team.image_url} 
                                  alt={team.team_name} 
                                  width={32} 
                                  height={32} 
                                  className="rounded-full"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div>
                                  <div className="font-semibold text-gray-800">{team.team_name}</div>
                                  <div className="text-sm text-gray-600">{team.team_name_short}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{team.total_matches || 0}</TableCell>
                            <TableCell className="text-center font-bold text-green-600">{team.wins || 0}</TableCell>
                            <TableCell className="text-center font-bold text-red-600">{team.losses || 0}</TableCell>
                            <TableCell className="text-center font-bold text-blue-600">{(team.win_percentage || 0).toFixed(1)}%</TableCell>
                            <TableCell className="text-center">{(team.total_runs_scored || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-center">{(team.total_runs_conceded || 0).toLocaleString()}</TableCell>
                            <TableCell className="text-center">{team.total_wickets_taken || 0}</TableCell>
                            <TableCell className="text-center">{team.team_batting_average || 0}</TableCell>
                            <TableCell className="text-center">{team.team_bowling_average || 0}</TableCell>
                            <TableCell className="text-center font-bold text-purple-600">{team.net_run_rate || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Matches */}
          <TabsContent value="matches" className="space-y-6">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center gap-2">
                  ⚡ Recent Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : matchesError ? (
                  <div className="text-center space-y-4">
                    <p className="text-red-500">Error loading recent matches</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(recentMatches) && recentMatches.map((match: any, index: number) => (
                      <div 
                        key={index} 
                        className="bg-white rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
                        onClick={() => handleMatchClick(match.match_id || match.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="font-semibold text-gray-800">{match.team1} vs {match.team2}</h3>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {match.match_winner} won
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>📍 {match.venue}</span>
                              <span>📅 {match.match_date}</span>
                              <span>🏆 {match.player_of_match}</span>
                            </div>
                            {match.win_by_runs && (
                              <div className="text-sm text-green-600 mt-1">
                                Won by {match.win_by_runs} runs
                              </div>
                            )}
                            {match.win_by_wickets && (
                              <div className="text-sm text-green-600 mt-1">
                                Won by {match.win_by_wickets} wickets
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Season {match.season}</div>
                            <div className="text-sm text-gray-500">{match.stage}</div>
                            <div className="text-xs text-blue-600 mt-1 font-semibold">
                              Click to view scorecard →
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AppSidebar>
  );
}
