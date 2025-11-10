"use client"

import { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Users, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsOverview() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, playersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/overall/top-batsmen?limit=10`)
        ]);
        
        const teamsData = await teamsRes.json();
        const playersData = await playersRes.json();
        
        setTeams(teamsData || []);
        setPlayers(playersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data for charts
  const teamWinsData = Array.isArray(teams) ? teams.slice(0, 6).map(team => ({
    name: team.short_name || team.team_name?.substring(0, 10),
    wins: team.matches_won || 0,
    matches: team.matches_played || 0
  })) : [];

  const topBatsmenData = Array.isArray(players) ? players.slice(0, 8).map(player => ({
    name: player.player_name?.split(' ').pop() || 'Unknown',
    runs: player.total_runs || 0,
    avg: player.batting_average ? parseFloat(player.batting_average) : 0
  })) : [];

  const strikeRateData = Array.isArray(players) ? players.slice(0, 6).map(player => ({
    name: player.player_name?.split(' ').pop() || 'Unknown',
    sr: player.batting_strike_rate ? parseFloat(player.batting_strike_rate) : 0
  })) : [];

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <BarChart2 className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Analytics Overview</h1>
            <p className="text-cyan-100 text-sm sm:text-base mt-1">Comprehensive IPL Statistics & Insights</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
          <p className="text-sm sm:text-base">📊 Visualize team performance, player statistics, and match trends with interactive charts and graphs.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-700 font-semibold">Total Teams</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-800 mt-1">{teams.length}</p>
              </div>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-green-700 font-semibold">Top Players</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-800 mt-1">{players.length}</p>
              </div>
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-purple-700 font-semibold">Avg Runs</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-800 mt-1">
                  {Array.isArray(players) && players.length > 0 ? Math.round(players.reduce((acc, p) => acc + (p.total_runs || 0), 0) / players.length) : 0}
                </p>
              </div>
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-orange-700 font-semibold">Avg SR</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-800 mt-1">
                  {players.length > 0 ? Math.round(players.reduce((acc, p) => acc + (parseFloat(p.batting_strike_rate) || 0), 0) / players.length) : 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Team Wins Bar Chart */}
        <Card className="shadow-lg border-2 border-cyan-200">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b-2 border-cyan-200">
            <CardTitle className="text-cyan-800 flex items-center gap-2 text-base sm:text-lg">
              <BarChart2 className="w-5 h-5" />
              Team Wins Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={teamWinsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="wins" fill="#0ea5e9" name="Wins" />
                  <Bar dataKey="matches" fill="#94a3b8" name="Total Matches" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Batsmen Runs */}
        <Card className="shadow-lg border-2 border-cyan-200">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b-2 border-cyan-200">
            <CardTitle className="text-cyan-800 flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-5 h-5" />
              Top Batsmen Runs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topBatsmenData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="runs" fill="#10b981" name="Total Runs" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Strike Rate Line Chart */}
        <Card className="shadow-lg border-2 border-cyan-200">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b-2 border-cyan-200">
            <CardTitle className="text-cyan-800 flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-5 h-5" />
              Strike Rate Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={strikeRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="sr" stroke="#8b5cf6" strokeWidth={2} name="Strike Rate" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Batting Average Pie Chart */}
        <Card className="shadow-lg border-2 border-cyan-200">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b-2 border-cyan-200">
            <CardTitle className="text-cyan-800 flex items-center gap-2 text-base sm:text-lg">
              <BarChart2 className="w-5 h-5" />
              Runs Distribution (Top 6)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={topBatsmenData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, runs}) => `${name}: ${runs}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="runs"
                  >
                    {topBatsmenData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
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

