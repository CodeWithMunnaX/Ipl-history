"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useGetMatchScorecardSimpleQuery } from '@/lib/services/iplApi';

interface SimpleScorecardProps {
  matchId: string | number;
  className?: string;
}

const SimpleScorecard: React.FC<SimpleScorecardProps> = ({ matchId, className = "" }) => {
  const {
    data: scorecard,
    isLoading,
    error
  } = useGetMatchScorecardSimpleQuery(matchId);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-6 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !scorecard) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="p-4 text-center">
          <p className="text-gray-500">Unable to load scorecard. Please try again later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Match Info - Cricket Style */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-lg overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 tracking-wide">
              {scorecard.team1} vs {scorecard.team2}
            </h2>
            <div className="flex justify-center items-center gap-6 text-sm mt-4">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">📍 Venue</div>
                <div className="text-blue-100">{scorecard.venue}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">📅 Date</div>
                <div className="text-blue-100">{scorecard.match_date}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-green-600 text-white px-6 py-2 rounded-full inline-block font-bold text-lg">
                🏆 {scorecard.match_winner} won
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scorecard - Cricket Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scorecard.scorecard.map((innings: any, index: number) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
            {/* Innings Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
              <h3 className="text-lg font-bold text-center">
                🏏 {innings.batting_team}
              </h3>
            </div>
            
            {/* Score Display */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-blue-800 mb-2">
                  {innings.runs}/{innings.wickets}
                </div>
                <div className="text-lg text-gray-700">
                  ({innings.overs} overs) • RR: {innings.run_rate}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{innings.runs}</div>
                  <div className="text-sm text-gray-600">Runs</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-red-600">{innings.wickets}</div>
                  <div className="text-sm text-gray-600">Wickets</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{innings.overs}</div>
                  <div className="text-sm text-gray-600">Overs</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">{innings.run_rate}</div>
                  <div className="text-sm text-gray-600">Run Rate</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleScorecard;
