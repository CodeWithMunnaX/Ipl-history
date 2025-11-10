"use client"

import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartData {
  label: string;
  value: number;
  color: string;
  team_name?: string;
  image_url?: string;
  runs?: number;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 400,
  showLegend = true,
  showTooltip = true,
  className = ""
}) => {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.label}</p>
          <p className="text-sm text-gray-600">
            {data.team_name && `Team: ${data.team_name}`}
            {data.runs !== undefined && `Runs: ${data.runs}`}
            {!data.team_name && !data.runs && `Value: ${data.value}`}
          </p>
          <p className="text-sm text-gray-500">
            Count: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
