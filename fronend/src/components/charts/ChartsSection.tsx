"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PieChart from './PieChart';
import BarChart from './BarChart';
import LineChart from './LineChart';
import {
  useGetSeasonTeamPerformancePieQuery,
  useGetSeasonRunsDistributionPieQuery,
  useGetSeasonBatsmanRunsBarQuery,
  useGetSeasonBowlerWicketsBarQuery,
} from '@/lib/services/iplApi';

interface ChartsSectionProps {
  season: string | number;
  className?: string;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ season, className = "" }) => {
  const {
    data: teamPieData,
    isLoading: teamPieLoading,
    error: teamPieError
  } = useGetSeasonTeamPerformancePieQuery(season);

  const {
    data: runsPieData,
    isLoading: runsPieLoading,
    error: runsPieError
  } = useGetSeasonRunsDistributionPieQuery(season);

  const {
    data: batsmanBarData,
    isLoading: batsmanBarLoading,
    error: batsmanBarError
  } = useGetSeasonBatsmanRunsBarQuery({ season, limit: 10 });

  const {
    data: bowlerBarData,
    isLoading: bowlerBarLoading,
    error: bowlerBarError
  } = useGetSeasonBowlerWicketsBarQuery({ season, limit: 10 });

  const isLoading = teamPieLoading || runsPieLoading || batsmanBarLoading || bowlerBarLoading;
  const hasError = teamPieError || runsPieError || batsmanBarError || bowlerBarError;

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Season Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-80 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Season Analytics</h2>
        <Card className="p-6 text-center">
          <p className="text-gray-500">Unable to load charts. Please try again later.</p>
          <div className="mt-4 text-sm text-gray-400">
            <p>Season: {season}</p>
            <p>Make sure the API server is running on http://localhost:8000</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Season Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Performance Pie Chart */}
        {teamPieData?.data && (
          <PieChart
            data={teamPieData.data}
            title={teamPieData.title}
            height={350}
            className="hover:shadow-xl transition-shadow duration-300"
          />
        )}

        {/* Season-wise Statistics Bar Chart */}
        {batsmanBarData?.data && (
          <BarChart
            data={batsmanBarData.data.map((item: any) => ({
              label: `Season ${item.season}`,
              value: item.runs,
              color: '#4ECDC4'
            }))}
            title="Season-wise Runs Statistics"
            height={350}
            yAxisLabel="Runs"
            className="hover:shadow-xl transition-shadow duration-300"
          />
        )}

        {/* Runs Distribution Pie Chart */}
        {runsPieData?.data && (
          <PieChart
            data={runsPieData.data}
            title={runsPieData.title}
            height={350}
            className="hover:shadow-xl transition-shadow duration-300"
          />
        )}

        {/* Wicket Types Distribution */}
        {bowlerBarData?.data && (
          <PieChart
            data={bowlerBarData.data}
            title={bowlerBarData.title}
            height={350}
            className="hover:shadow-xl transition-shadow duration-300"
          />
        )}
      </div>
    </div>
  );
};

export default ChartsSection;
