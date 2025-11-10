"use client"

import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { normalizePlayerImage } from '@/lib/utils';

interface BarChartData {
  label: string;
  value: number;
  color: string;
  player_image?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 400,
  showGrid = true,
  showTooltip = true,
  className = "",
  xAxisLabel = "Players",
  yAxisLabel = "Value"
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            {data.player_image && (() => {
              const normalizedImg = normalizePlayerImage(data.player_image);
              return normalizedImg ? (
                <img 
                  src={normalizedImg} 
                  alt={label} 
                  className="w-8 h-8 rounded-full inline-block mr-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : null;
            })()}
            Value: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { 
      fill, 
      payload, 
      tooltipPayload, 
      tooltipPosition, 
      dataKey,
      name,
      color,
      stroke,
      strokeWidth,
      strokeDasharray,
      strokeDashoffset,
      strokeLinecap,
      strokeLinejoin,
      strokeMiterlimit,
      strokeOpacity,
      ...rest 
    } = props;
    const barColor = payload?.color || fill || "#8884d8";
    return (
      <rect
        {...rest}
        fill={barColor}
        className="hover:opacity-80 transition-opacity duration-200"
        rx={4} // Rounded corners
        ry={4}
      />
    );
  };

  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Bar 
            dataKey="value" 
            shape={<CustomBar />}
            radius={[4, 4, 0, 0]}
            fill="#8884d8"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
