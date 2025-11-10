"use client"

import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartData {
  season: number;
  runs: number;
  matches: number;
  wickets?: number;
}

interface LineChartProps {
  data: LineChartData[];
  title: string;
  playerName?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  className?: string;
  dataKey?: string;
  dataKeyLabel?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  playerName,
  height = 400,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  className = "",
  dataKey = "runs",
  dataKeyLabel = "Runs"
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">Season {label}</p>
          <p className="text-sm text-gray-600">
            {dataKeyLabel}: {data[dataKey]}
          </p>
          {data.matches && (
            <p className="text-sm text-gray-500">
              Matches: {data.matches}
            </p>
          )}
          {data.wickets && (
            <p className="text-sm text-gray-500">
              Wickets: {data.wickets}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
      {playerName && (
        <p className="text-sm text-gray-600 text-center mb-4">{playerName}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey="season" 
            tick={{ fontSize: 12 }}
            label={{ value: 'Season', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: dataKeyLabel, angle: -90, position: 'insideLeft' }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend />}
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
            className="hover:stroke-blue-600 transition-colors duration-200"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
