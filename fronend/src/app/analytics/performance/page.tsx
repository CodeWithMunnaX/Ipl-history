"use client"

import { useEffect, useState } from 'react';
import { LineChart as LineChartIcon, Activity, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

export default function PerformanceAnalytics() {
  const [batsmen, setBatsmen] = useState<any[]>([]);
  const [bowlers, setBowlers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batsmenRes, bowlersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/overall/top-batsmen?limit=10`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/overall/top-bowlers?limit=10`)
        ]);
        
        const batsmenData = await batsmenRes.json();
        const bowlersData = await bowlersRes.json();
        
        setBatsmen(batsmenData || []);
        setBowlers(bowlersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Batting Performance Data
  const battingPerformanceData = Array.isArray(batsmen) ? batsmen.slice(0, 8).map(player => ({
    name: player.player_name?.split(' ').pop() || 'Unknown',
    runs: player.total_runs || 0,
    avg: player.batting_average ? parseFloat(player.batting_average) : 0,
    sr: player.batting_strike_rate ? parseFloat(player.batting_strike_rate) : 0,
    fours: player.total_fours || 0,
    sixes: player.total_sixes || 0
  })) : [];

  // Bowling Performance Data
  const bowlingPerformanceData = Array.isArray(bowlers) ? bowlers.slice(0, 8).map(player => ({
    name: player.player_name?.split(' ').pop() || 'Unknown',
    wickets: player.total_wickets || 0,
    avg: player.bowling_average ? parseFloat(player.bowling_average) : 0,
    econ: player.economy_rate ? parseFloat(player.economy_rate) : 0
  })) : [];

  // Radar Chart Data (Top 5 batsmen)
  const radarData = Array.isArray(batsmen) ? batsmen.slice(0, 5).map(player => ({
    subject: player.player_name?.split(' ').pop() || 'Unknown',
    runs: Math.min((player.total_runs || 0) / 50, 100),
    avg: Math.min((parseFloat(player.batting_average) || 0) * 2, 100),
    sr: Math.min((parseFloat(player.batting_strike_rate) || 0) / 2, 100),
    fours: Math.min((player.total_fours || 0) / 3, 100),
    sixes: Math.min((player.total_sixes || 0) / 2, 100)
  })) : [];

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <LineChartIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Performance Analytics</h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1">Player Stats & Performance Trends</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
          <p className="text-sm sm:text-base">📈 Deep dive into batting and bowling statistics with advanced visualizations.</p>
        </div>
      </div>

      {/* Batting Performance Chart */}
      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
          <CardTitle className="text-blue-800 flex items-center gap-2 text-base sm:text-lg">
            <Activity className="w-5 h-5" />
            Batting Performance - Runs vs Strike Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="h-80 sm:h-96 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={384}>
              <AreaChart data={battingPerformanceData}>
                <defs>
                  <linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }} />
                <Area yAxisId="left" type="monotone" dataKey="runs" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRuns)" name="Runs" />
                <Area yAxisId="right" type="monotone" dataKey="sr" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSR)" name="Strike Rate" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Fours & Sixes Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-lg border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
            <CardTitle className="text-green-800 flex items-center gap-2 text-base sm:text-lg">
              <Award className="w-5 h-5" />
              Boundaries Analysis (4s & 6s)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={battingPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }} />
                  <Bar dataKey="fours" fill="#10b981" name="Fours" />
                  <Bar dataKey="sixes" fill="#f59e0b" name="Sixes" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bowling Performance */}
        <Card className="shadow-lg border-2 border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-200">
            <CardTitle className="text-red-800 flex items-center gap-2 text-base sm:text-lg">
              <Activity className="w-5 h-5" />
              Bowling Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={bowlingPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }} />
                  <Line type="monotone" dataKey="wickets" stroke="#ef4444" strokeWidth={2} name="Wickets" />
                  <Line type="monotone" dataKey="econ" stroke="#f97316" strokeWidth={2} name="Economy" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Player Comparison Radar */}
      <Card className="shadow-lg border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
          <CardTitle className="text-purple-800 flex items-center gap-2 text-base sm:text-lg">
            <Activity className="w-5 h-5" />
            Multi-Dimensional Player Comparison (Top 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="h-80 sm:h-96 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={384}>
              <RadarChart data={[
                { subject: 'Runs', ...Object.fromEntries(radarData.map(p => [p.subject, p.runs])) },
                { subject: 'Average', ...Object.fromEntries(radarData.map(p => [p.subject, p.avg])) },
                { subject: 'Strike Rate', ...Object.fromEntries(radarData.map(p => [p.subject, p.sr])) },
                { subject: 'Fours', ...Object.fromEntries(radarData.map(p => [p.subject, p.fours])) },
                { subject: 'Sixes', ...Object.fromEntries(radarData.map(p => [p.subject, p.sixes])) }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12 }} />
                {radarData.map((player, index) => (
                  <Radar
                    key={player.subject}
                    name={player.subject}
                    dataKey={player.subject}
                    stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index]}
                    fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index]}
                    fillOpacity={0.6}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <ContactSupport 
        whatsapp="https://wa.me/918700000000" 
        linkedin="https://www.linkedin.com/in/munna-kumar" 
        facebook="https://www.facebook.com/"
      />
      </div>
    </AppSidebar>
  );
}

