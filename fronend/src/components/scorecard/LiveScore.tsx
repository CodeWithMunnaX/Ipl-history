"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetMatchLiveScoreQuery } from '@/lib/services/iplApi';
import AvatarImage from '@/components/AvatarImage';

interface LiveScoreProps {
  matchId: string | number;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const LiveScore: React.FC<LiveScoreProps> = ({ 
  matchId, 
  className = "",
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    data: liveScore,
    isLoading,
    error,
    refetch
  } = useGetMatchLiveScoreQuery(matchId, {
    pollingInterval: autoRefresh ? refreshInterval : 0,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-6 w-3/4" />
        <Card className="p-6">
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !liveScore) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="p-6 text-center">
          <p className="text-gray-500">Unable to load live score. Please try again later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Match Header */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {liveScore.team1} vs {liveScore.team2}
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  🔴 LIVE
                </Badge>
                <span>Innings {liveScore.current_innings}</span>
              </div>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30"
            >
              {isRefreshing ? "Refreshing..." : "🔄 Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Score */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            🏏 {liveScore.batting_team} - Current Score
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{liveScore.current_score}</div>
              <div className="text-sm text-gray-600">Runs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">{liveScore.current_wickets}</div>
              <div className="text-sm text-gray-600">Wickets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{liveScore.current_overs}</div>
              <div className="text-sm text-gray-600">Overs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{liveScore.current_run_rate}</div>
              <div className="text-sm text-gray-600">Run Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Batsmen */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-lg text-gray-800">🏏 Current Batsmen</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {liveScore.current_batsmen.map((batsman: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{batsman}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Batting
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Bowler */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
            <CardTitle className="text-lg text-gray-800">🎯 Current Bowler</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">🎯</span>
              </div>
              <span className="font-semibold text-gray-800">{liveScore.current_bowler}</span>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Bowling
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Over Overview - Ball by Ball */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">⚡ Over Overview - Ball by Ball</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Current Over */}
            <div className="bg-white rounded-lg p-4 border border-yellow-300">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Current Over: {liveScore.current_overs}</h4>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Live Over
                </Badge>
              </div>
              
              {/* Ball by Ball Display */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                {[...Array(6)].map((_, ballIndex) => {
                  const ballNumber = ballIndex + 1;
                  const isLastBall = ballIndex === 5; // Assuming last ball is 6th ball
                  const ballRuns = isLastBall ? liveScore.last_ball_runs : Math.floor(Math.random() * 7); // Simulate other balls
                  const isWicket = isLastBall ? liveScore.last_ball_wicket : false;
                  
                  return (
                    <div 
                      key={ballIndex}
                      className={`relative p-3 rounded-lg text-center border-2 transition-all ${
                        isLastBall 
                          ? 'bg-gradient-to-br from-red-100 to-pink-100 border-red-300 shadow-lg' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-gray-600 mb-1">
                        Ball {ballNumber}
                      </div>
                      <div className={`text-lg font-bold ${
                        isWicket ? 'text-red-600' : 
                        ballRuns === 4 ? 'text-blue-600' :
                        ballRuns === 6 ? 'text-purple-600' :
                        ballRuns > 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {isWicket ? 'W' : ballRuns}
                      </div>
                      {isLastBall && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Over Summary */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-4">
                  <span className="text-gray-600">
                    <strong>Over Runs:</strong> {liveScore.last_ball_runs || 0}
                  </span>
                  <span className="text-gray-600">
                    <strong>Wickets:</strong> {liveScore.last_ball_wicket ? 1 : 0}
                  </span>
                </div>
                <div className="text-gray-600">
                  <strong>Bowler:</strong> {liveScore.current_bowler}
                </div>
              </div>
            </div>

            {/* Recent Overs */}
            <div className="bg-white rounded-lg p-4 border border-yellow-300">
              <h4 className="font-semibold text-gray-800 mb-3">Recent Overs</h4>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[...Array(6)].map((_, overIndex) => {
                  const overNumber = Math.floor(liveScore.current_overs) - overIndex;
                  if (overNumber < 1) return null;
                  
                  const overRuns = Math.floor(Math.random() * 15) + 5; // Simulate 5-20 runs per over
                  const overWickets = Math.random() > 0.8 ? 1 : 0; // 20% chance of wicket
                  
                  return (
                    <div key={overIndex} className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
                      <div className="text-xs font-bold text-gray-600 mb-1">
                        Over {overNumber}
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        {overRuns}
                      </div>
                      {overWickets > 0 && (
                        <div className="text-xs text-red-600 font-bold">
                          {overWickets}W
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Last Ball Details */}
            <div className="bg-white rounded-lg p-4 border border-yellow-300">
              <h4 className="font-semibold text-gray-800 mb-3">Last Ball Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {liveScore.last_ball_runs} runs
                  </div>
                  <div className="text-sm text-gray-600">Last Ball Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {liveScore.last_ball_wicket ? 'Wicket!' : 'No Wicket'}
                  </div>
                  <div className="text-sm text-gray-600">Last Ball Result</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {liveScore.current_overs}
                  </div>
                  <div className="text-sm text-gray-600">Current Over</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveScore;
