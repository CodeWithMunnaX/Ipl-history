"use client"

import { useEffect, useState } from 'react';
import { PieChart as PieChartIcon, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from 'recharts';
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function AnalyticsInsights() {
  const [batsmen, setBatsmen] = useState<any[]>([]);
  const [bowlers, setBowlers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batsmenRes, bowlersRes, teamsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/overall/top-batsmen?limit=10`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/overall/top-bowlers?limit=10`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`)
        ]);
        
        const batsmenData = await batsmenRes.json();
        const bowlersData = await bowlersRes.json();
        const teamsData = await teamsRes.json();
        
        setBatsmen(batsmenData || []);
        setBowlers(bowlersData || []);
        setTeams(teamsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Role Distribution
  const roleData = [
    { name: 'Batsmen', value: Array.isArray(batsmen) ? batsmen.filter(p => p.role?.toLowerCase().includes('bat')).length : 0 },
    { name: 'Bowlers', value: Array.isArray(bowlers) ? bowlers.length : 0 },
    { name: 'All-rounders', value: Array.isArray(batsmen) ? batsmen.filter(p => p.role?.toLowerCase().includes('all')).length : 0 }
  ].filter(d => d.value > 0);

  // Team Win Distribution
  const teamWinData = Array.isArray(teams) ? teams.slice(0, 6).map(team => ({
    name: team.short_name || team.team_name?.substring(0, 10),
    wins: team.matches_won || 0
  })) : [];

  // Scatter Plot: Average vs Strike Rate
  const scatterData = Array.isArray(batsmen) ? batsmen.slice(0, 10).map(player => ({
    x: parseFloat(player.batting_average) || 0,
    y: parseFloat(player.batting_strike_rate) || 0,
    z: player.total_runs || 0,
    name: player.player_name?.split(' ').pop() || 'Unknown'
  })) : [];

  // Combined Performance
  const combinedData = Array.isArray(batsmen) ? batsmen.slice(0, 6).map(player => ({
    name: player.player_name?.split(' ').pop() || 'Unknown',
    runs: player.total_runs || 0,
    avg: player.batting_average ? parseFloat(player.batting_average) : 0,
    sr: player.batting_strike_rate ? parseFloat(player.batting_strike_rate) / 2 : 0
  })) : [];

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <PieChartIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Deep Insights</h1>
            <p className="text-purple-100 text-sm sm:text-base mt-1">Advanced Analytics & Correlations</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
          <p className="text-sm sm:text-base">🔍 Discover patterns and relationships in IPL data through advanced visualizations.</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Role Distribution Pie */}
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
            <CardTitle className="text-purple-800 flex items-center gap-2 text-base sm:text-lg">
              <PieChartIcon className="w-5 h-5" />
              Player Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Team Wins Pie */}
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
            <CardTitle className="text-purple-800 flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-5 h-5" />
              Team Win Share
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={teamWinData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, wins}) => `${name}: ${wins}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="wins"
                  >
                    {teamWinData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scatter Plot */}
      <Card className="shadow-lg border-2 border-indigo-200">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
          <CardTitle className="text-indigo-800 flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-5 h-5" />
            Batting Average vs Strike Rate (Bubble Size = Total Runs)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="h-80 sm:h-96 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={384}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="Average" tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="y" name="Strike Rate" tick={{ fontSize: 12 }} />
                <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Runs" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }} />
                <Scatter name="Players" data={scatterData} fill="#8b5cf6">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Combined Performance */}
      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
          <CardTitle className="text-blue-800 flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-5 h-5" />
            Multi-Metric Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="h-80 sm:h-96 flex items-center justify-center text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={384}>
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }} />
                <Bar yAxisId="left" dataKey="runs" fill="#3b82f6" name="Runs" />
                <Line yAxisId="right" type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={2} name="Average" />
                <Line yAxisId="right" type="monotone" dataKey="sr" stroke="#f59e0b" strokeWidth={2} name="Strike Rate/2" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">💡 Key Insight</h3>
            <p className="text-xs sm:text-sm text-blue-700">Higher strike rates often correlate with aggressive batting styles, shown in the scatter plot above.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-green-800 mb-2 text-sm sm:text-base">📊 Pattern</h3>
            <p className="text-xs sm:text-sm text-green-700">Top batsmen maintain a balance between average and strike rate for consistent performance.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-purple-800 mb-2 text-sm sm:text-base">🎯 Trend</h3>
            <p className="text-xs sm:text-sm text-purple-700">Multi-metric analysis reveals comprehensive player strengths across different parameters.</p>
          </CardContent>
        </Card>
      </div>

      <ContactSupport 
        whatsapp="https://wa.me/918700000000" 
        linkedin="https://www.linkedin.com/in/munna-kumar" 
        facebook="https://www.facebook.com/"
      />
      </div>
    </AppSidebar>
  );
}

