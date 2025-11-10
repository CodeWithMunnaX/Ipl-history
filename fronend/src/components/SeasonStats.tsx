"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetSeasonDetailedAnalysisQuery } from '@/lib/services/iplApi';
import Image from 'next/image';
import AvatarImage from '@/components/AvatarImage';

interface SeasonStatsProps {
  season: string | number;
  className?: string;
}

const SeasonStats: React.FC<SeasonStatsProps> = ({ season, className = "" }) => {
  const {
    data: seasonData,
    isLoading,
    error
  } = useGetSeasonDetailedAnalysisQuery(season);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Season Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-8 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !seasonData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Season Statistics</h2>
        <Card className="p-6 text-center">
          <p className="text-gray-500">Unable to load season statistics. Please try again later.</p>
        </Card>
      </div>
    );
  }

  const { season_summary, top_batsmen, top_bowlers, team_standings } = seasonData;

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Season Statistics</h2>
      
      {/* Season Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{season_summary?.total_matches || 0}</div>
            <div className="text-sm text-blue-700 font-medium">Total Matches</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{(season_summary?.total_runs || 0).toLocaleString()}</div>
            <div className="text-sm text-green-700 font-medium">Total Runs</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{season_summary?.total_wickets || 0}</div>
            <div className="text-sm text-red-700 font-medium">Total Wickets</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{season_summary?.total_fours || 0}</div>
            <div className="text-sm text-purple-700 font-medium">Total Fours</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{season_summary?.total_sixes || 0}</div>
            <div className="text-sm text-yellow-700 font-medium">Total Sixes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{season_summary?.average_runs_per_match?.toFixed(1) || 0}</div>
            <div className="text-sm text-indigo-700 font-medium">Avg Runs/Match</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Batsmen */}
        <Card className="bg-gradient-to-br from-white to-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              🏏 Top Batsmen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(top_batsmen) && top_batsmen.slice(0, 5).map((batsman: any, index: number) => {
                const name = batsman.player_name || batsman.name || 'Unknown';
                const runs = batsman.total_runs || batsman.runs || 0;
                const image = batsman.player_image || batsman.image || '';
                
                return (
                  <div key={`${name}-${index}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                    <div className="flex-shrink-0">
                      <AvatarImage 
                        src={image} 
                        alt={name} 
                        width={40} 
                        height={40} 
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{name}</div>
                      <div className="text-sm text-gray-600">{runs} runs</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{runs}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Bowlers */}
        <Card className="bg-gradient-to-br from-white to-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              🎯 Top Bowlers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(top_bowlers) && top_bowlers.slice(0, 5).map((bowler: any, index: number) => {
                const name = bowler.player_name || bowler.name || 'Unknown';
                const wickets = bowler.total_wickets || bowler.wickets || 0;
                const image = bowler.player_image || bowler.image || '';
                
                return (
                  <div key={`${name}-${index}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-100">
                    <div className="flex-shrink-0">
                      <AvatarImage 
                        src={image} 
                        alt={name} 
                        width={40} 
                        height={40} 
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{name}</div>
                      <div className="text-sm text-gray-600">{wickets} wickets</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">{wickets}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Standings */}
      {Array.isArray(team_standings) && team_standings.length > 0 && (
        <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              🏆 Team Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-2 px-3 font-semibold text-blue-700">Team</th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-700">Matches</th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-700">Wins</th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-700">Losses</th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-700">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {team_standings.slice(0, 8).map((team: any, index: number) => (
                    <tr key={`${team.team_name}-${index}`} className="border-b border-blue-100 hover:bg-blue-50">
                      <td className="py-2 px-3 font-medium text-gray-800">{team.team_name}</td>
                      <td className="py-2 px-3 text-center text-gray-600">{team.matches || 0}</td>
                      <td className="py-2 px-3 text-center text-green-600 font-semibold">{team.wins || 0}</td>
                      <td className="py-2 px-3 text-center text-red-600 font-semibold">{team.losses || 0}</td>
                      <td className="py-2 px-3 text-center text-blue-600 font-semibold">
                        {(team.win_percentage || 0).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeasonStats;
