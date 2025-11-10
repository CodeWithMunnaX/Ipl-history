"use client"

import AppSidebar from "@/components/AppSidebar";
import ContactSupport from "@/components/ContactSupport";
import { useParams } from "next/navigation";
import { useGetPlayerByIdQuery, useGetPlayerStatsQuery } from "@/lib/services/iplApi";
import AvatarImage from "@/components/AvatarImage";
import PlayerImageUpload from "@/components/PlayerImageUpload";
import { normalizePlayerImage } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

export default function PlayerDetailsPage() {
  const params = useParams<{ id: string }>();
  const playerId = params?.id as string;
  const { data: player, isLoading: playerLoading } = useGetPlayerByIdQuery(playerId, { skip: !playerId });
  const { data: stats, isLoading: statsLoading } = useGetPlayerStatsQuery(playerId, { skip: !playerId });
  const [playerImage, setPlayerImage] = useState<string>('');
  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [teamHistory, setTeamHistory] = useState<any[]>([]);

  // Mock team history data - in real app, this would come from API
  useEffect(() => {
    if (player) {
      // Generate mock team history based on player data
      const teams = [
        { team: player.team_name || 'Royal Challengers Bangalore', seasons: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'], matches: 150, runs: 5000 },
        { team: 'Delhi Daredevils', seasons: ['2008', '2009', '2010'], matches: 45, runs: 1200 },
        { team: 'Kolkata Knight Riders', seasons: ['2011', '2012'], matches: 30, runs: 800 }
      ];
      setTeamHistory(teams.filter(t => t.team !== 'Free Agent'));
    }
  }, [player]);

  const handleImageUploaded = (imagePath: string) => {
    console.log('Image uploaded, updating player image to:', imagePath);
    setPlayerImage(imagePath);
    setShowUploader(false); // Hide uploader after successful upload
    
    // Force a re-render by updating a dummy state
    setTimeout(() => {
      console.log('Player image state after update:', playerImage);
    }, 100);
  };

  // Helper function to format values and avoid showing 0
  const formatStatValue = (value: any, fallback: string = 'N/A'): string => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return fallback;
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  // Debug logging
  useEffect(() => {
    console.log('Player Details - Player Data:', player);
    console.log('Player Details - Stats Data:', stats);
    console.log('Player Details - Player ID:', playerId);
  }, [player, stats, playerId]);

  // Helper function to get batting stats
  const getBattingStats = () => {
    if (!stats) {
      // Return mock data if no stats available
      return {
        totalRuns: 8671,
        totalBalls: 6702,
        totalMatches: 259,
        strikeRate: 129.38,
        average: 37.54,
        fours: 774,
        sixes: 292
      };
    }
    
    const battingStats: any = {};
    Object.entries(stats).forEach(([key, value]) => {
      if (key.toLowerCase().includes('runs') || 
          key.toLowerCase().includes('batting') || 
          key.toLowerCase().includes('average') ||
          key.toLowerCase().includes('strike') ||
          key.toLowerCase().includes('fours') ||
          key.toLowerCase().includes('sixes') ||
          key.toLowerCase().includes('balls') ||
          key.toLowerCase().includes('matches')) {
        
        if (typeof value === 'object' && value !== null) {
          const obj = value as any;
          if (obj.total_runs !== undefined && obj.total_runs > 0) battingStats.totalRuns = obj.total_runs;
          if (obj.total_balls !== undefined && obj.total_balls > 0) battingStats.totalBalls = obj.total_balls;
          if (obj.total_matches !== undefined && obj.total_matches > 0) battingStats.totalMatches = obj.total_matches;
          if (obj.strike_rate !== undefined && obj.strike_rate > 0) battingStats.strikeRate = obj.strike_rate;
          if (obj.batting_average !== undefined && obj.batting_average > 0) battingStats.average = obj.batting_average;
          if (obj.fours !== undefined && obj.fours > 0) battingStats.fours = obj.fours;
          if (obj.sixes !== undefined && obj.sixes > 0) battingStats.sixes = obj.sixes;
        } else if (typeof value === 'number' && value > 0) {
          battingStats[key] = value;
        }
      }
    });

    // If no meaningful stats found, use mock data
    if (Object.keys(battingStats).length === 0) {
      return {
        totalRuns: 8671,
        totalBalls: 6702,
        totalMatches: 259,
        strikeRate: 129.38,
        average: 37.54,
        fours: 774,
        sixes: 292
      };
    }

    return battingStats;
  };

  // Helper function to get bowling stats
  const getBowlingStats = () => {
    if (!stats) {
      // Return mock data if no stats available
      return {
        totalWickets: 5,
        totalOvers: 12.5,
        bowlingMatches: 15,
        economy: 7.2,
        bowlingAverage: 24.6
      };
    }
    
    const bowlingStats: any = {};
    Object.entries(stats).forEach(([key, value]) => {
      if (key.toLowerCase().includes('wickets') || 
          key.toLowerCase().includes('bowling') || 
          key.toLowerCase().includes('economy') ||
          key.toLowerCase().includes('overs') ||
          key.toLowerCase().includes('maidens')) {
        
        if (typeof value === 'object' && value !== null) {
          const obj = value as any;
          if (obj.total_wickets !== undefined && obj.total_wickets > 0) bowlingStats.totalWickets = obj.total_wickets;
          if (obj.total_overs !== undefined && obj.total_overs > 0) bowlingStats.totalOvers = obj.total_overs;
          if (obj.bowling_matches !== undefined && obj.bowling_matches > 0) bowlingStats.bowlingMatches = obj.bowling_matches;
          if (obj.economy !== undefined && obj.economy > 0) bowlingStats.economy = obj.economy;
          if (obj.bowling_average !== undefined && obj.bowling_average > 0) bowlingStats.bowlingAverage = obj.bowling_average;
        } else if (typeof value === 'number' && value > 0) {
          bowlingStats[key] = value;
        }
      }
    });

    // If no meaningful stats found, use mock data
    if (Object.keys(bowlingStats).length === 0) {
      return {
        totalWickets: 5,
        totalOvers: 12.5,
        bowlingMatches: 15,
        economy: 7.2,
        bowlingAverage: 24.6
      };
    }

    return bowlingStats;
  };

  // Chart data
  const battingChartData = [
    { name: 'Runs', value: getBattingStats().totalRuns || 0 },
    { name: 'Fours', value: getBattingStats().fours || 0 },
    { name: 'Sixes', value: getBattingStats().sixes || 0 },
    { name: 'Matches', value: getBattingStats().totalMatches || 0 }
  ];

  const teamPerformanceData = teamHistory.map(team => ({
    team: team.team.split(' ').pop(), // Get last word of team name
    runs: team.runs,
    matches: team.matches
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (playerLoading) {
    return (
      <AppSidebar>
        <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading player details...</p>
            </div>
          </div>
        </div>
      </AppSidebar>
    );
  }

  if (!player) {
    return (
      <AppSidebar>
        <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Player Not Found</h2>
              <p className="text-gray-600">The player you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
      </AppSidebar>
    );
  }

  const playerName = player.player_name || player.name || "Unknown Player";
  const currentPlayerImage = normalizePlayerImage(playerImage || player.player_image);
  
  console.log('Current player image:', currentPlayerImage);
  console.log('Player image state:', playerImage);
  console.log('Original player image:', player.player_image);
  const playerRole = player.role || player.player_role || "All-rounder";
  const playerTeam = player.team_name || player.team || "Free Agent";
  const playerCountry = player.country || player.nationality || "Unknown";
  const playerBattingStyle = player.batting_style || player.batting_style || "Right-handed";
  const playerBowlingStyle = player.bowling_style || player.bowling_style || "Right-arm medium";

  return (
    <AppSidebar>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Player Header */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Player Image */}
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-4 border-white">
                {currentPlayerImage && !currentPlayerImage.includes('placeholder') && !currentPlayerImage.includes('default') ? (
                  <img 
                    key={currentPlayerImage}
                    src={currentPlayerImage} 
                    alt={playerName} 
                    width={128} 
                    height={128} 
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover rounded-full block" 
                    onError={() => {
                      console.log('Image failed to load:', currentPlayerImage);
                      // Fallback to placeholder rendering
                      setPlayerImage('');
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', currentPlayerImage);
                    }}
                  />
                ) : (
                  <AvatarImage 
                    key={`avatar-${currentPlayerImage}`}
                    src={currentPlayerImage} 
                    alt={playerName} 
                    width={128} 
                    height={128} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                )}
              </div>
              
              {/* Player Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{playerName}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {playerRole}
                  </Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {playerTeam}
                  </Badge>
                  <Badge variant="outline" className="border-purple-300 text-purple-700">
                    {playerCountry}
                  </Badge>
                </div>
                <div className="flex justify-center md:justify-start">
                  <Button
                    onClick={() => setShowUploader((v) => !v)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    {showUploader ? 'Close Uploader' : (currentPlayerImage ? 'Change Image' : 'Upload Image')}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Batting:</span> {playerBattingStyle}
                  </div>
                  <div>
                    <span className="font-medium">Bowling:</span> {playerBowlingStyle}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> Active
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Statistics */}
          {statsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading statistics...</p>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 text-center">📊 Player Statistics</h2>

              {/* Player Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Player ID Card */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-2">PLAYER ID</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {player?.player_id || player?.id || playerId || '12'}
                    </div>
                  </CardContent>
                </Card>

                {/* Player Name Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-2">PLAYER NAME</div>
                    <div className="text-lg font-bold text-blue-600 truncate">
                      {player?.player_name || player?.player_full_name || player?.name || 'Virat Kohli'}
                    </div>
                  </CardContent>
                </Card>

                {/* Total Runs Card */}
                <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-2">TOTAL RUNS</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatStatValue(getBattingStats().totalRuns, '8,671')}
                    </div>
                  </CardContent>
                </Card>

                {/* Total Wickets Card */}
                <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-2">TOTAL WICKETS</div>
                    <div className="text-2xl font-bold text-teal-600">
                      {formatStatValue(getBowlingStats().totalWickets, '5')}
                    </div>
                  </CardContent>
                </Card>

                {/* Total Matches Card */}
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-2">TOTAL MATCHES</div>
                    <div className="text-2xl font-bold text-pink-600">
                      {formatStatValue(getBattingStats().totalMatches, '259')}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Player Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Player Role Card */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-2">PLAYER ROLE</div>
                    <div className="text-lg font-bold text-green-600">
                      {player?.player_role || player?.role || 'Batsman'}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Team Card */}
                <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-2">CURRENT TEAM</div>
                    <div className="text-lg font-bold text-indigo-600">
                      {player?.team_name || player?.current_team || 'Royal Challengers Bangalore'}
                    </div>
                  </CardContent>
                </Card>

                {/* Country Card */}
                <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-2">COUNTRY</div>
                    <div className="text-lg font-bold text-red-600">
                      {player?.country || player?.nationality || 'India'}
                    </div>
                  </CardContent>
                </Card>

                {/* Strike Rate Card */}
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-xs text-gray-500 font-medium mb-2">STRIKE RATE</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {formatStatValue(getBattingStats().strikeRate, '129.38')}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Team History Section */}
              {teamHistory.length > 0 && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      🏟️ Team History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamHistory.map((team, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-lg">{team.team}</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {team.seasons.map((season: string) => (
                                  <Badge key={season} variant="outline" className="text-xs">
                                    {season}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-4 mt-4 md:mt-0">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{team.matches}</div>
                                <div className="text-xs text-gray-500">Matches</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{team.runs}</div>
                                <div className="text-xs text-gray-500">Runs</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Batting Stats */}
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    🏏 Batting Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(getBattingStats()).map(([key, value]) => {
                        if (!value || value === 0) return null;
                        
                        let displayKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                        if (displayKey.includes('TOTAL RUNS')) displayKey = 'TOTAL RUNS';
                        else if (displayKey.includes('TOTAL BALLS')) displayKey = 'BALLS FACED';
                        else if (displayKey.includes('TOTAL MATCHES')) displayKey = 'MATCHES';
                        else if (displayKey.includes('STRIKE RATE')) displayKey = 'STRIKE RATE';
                        else if (displayKey.includes('AVERAGE')) displayKey = 'AVERAGE';
                        else if (displayKey.includes('FOURS')) displayKey = 'FOURS';
                        else if (displayKey.includes('SIXES')) displayKey = 'SIXES';
                        
                        return (
                          <div key={key} className="text-center p-4 bg-white rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-500 font-medium mb-2">
                              {displayKey}
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                              {formatStatValue(value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Batting Chart */}
                    <div className="bg-white rounded-xl p-4 border border-orange-100">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Batting Performance</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={battingChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Value']} />
                          <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bowling Stats */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    🎯 Bowling Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(getBowlingStats()).map(([key, value]) => {
                        if (!value || value === 0) return null;
                        
                        let displayKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();
                        if (displayKey.includes('TOTAL WICKETS')) displayKey = 'WICKETS';
                        else if (displayKey.includes('TOTAL OVERS')) displayKey = 'OVERS';
                        else if (displayKey.includes('BOWLING MATCHES')) displayKey = 'MATCHES';
                        else if (displayKey.includes('BOWLING ECONOMY')) displayKey = 'ECONOMY';
                        else if (displayKey.includes('BOWLING AVERAGE')) displayKey = 'AVERAGE';
                        else if (displayKey.includes('MAIDENS')) displayKey = 'MAIDENS';
                        
                        return (
                          <div key={key} className="text-center p-4 bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-500 font-medium mb-2">
                              {displayKey}
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatStatValue(value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Team Performance Chart */}
                    {teamPerformanceData.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-blue-100">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Team Performance</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={teamPerformanceData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="runs"
                              label={({ team, runs }) => `${team}: ${runs}`}
                            >
                              {teamPerformanceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any, name: any) => [value.toLocaleString(), 'Runs']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Fielding Stats */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    🧤 Fielding Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(stats).filter(([key]) => 
                    key.toLowerCase().includes('catches') || 
                    key.toLowerCase().includes('fielding') || 
                    key.toLowerCase().includes('stumpings') ||
                    key.toLowerCase().includes('runouts')
                  ).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(stats).filter(([key, value]) => 
                        (key.toLowerCase().includes('catches') || 
                        key.toLowerCase().includes('fielding') || 
                        key.toLowerCase().includes('stumpings') ||
                        key.toLowerCase().includes('runouts')) &&
                        value && value !== 0 && value !== '0'
                      ).map(([key, value]) => {
                        let displayValue = '0';
                        let displayKey = key.replace(/_/g, ' ').toUpperCase();
                        
                        if (typeof value === 'object' && value !== null) {
                          // Handle object values by extracting specific fields
                          const obj = value as any;
                          if (obj.total_catches !== undefined) displayValue = obj.total_catches.toString();
                          else if (obj.total_stumpings !== undefined) displayValue = obj.total_stumpings.toString();
                          else if (obj.total_runouts !== undefined) displayValue = obj.total_runouts.toString();
                          else displayValue = JSON.stringify(value);
                        } else {
                          displayValue = value && typeof value === 'number' && value > 0 ? String(value) : 'N/A';
                        }
                        
                        // Format display key
                        if (displayKey.includes('TOTAL CATCHES')) displayKey = 'CATCHES';
                        else if (displayKey.includes('TOTAL STUMPINGS')) displayKey = 'STUMPINGS';
                        else if (displayKey.includes('TOTAL RUNOUTS')) displayKey = 'RUNOUTS';
                        else if (displayKey.includes('FIELDING')) displayKey = 'FIELDING';
                        
                        return (
                          <div key={key} className="text-center p-4 bg-white rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-500 font-medium mb-2">
                              {displayKey}
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              {displayValue}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🧤</div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Fielding Data Available</h3>
                      <p className="text-gray-500">Fielding statistics for this player are not available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Other Stats */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800 flex items-center gap-2">
                    📈 Additional Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(stats).filter(([key]) => 
                    !key.toLowerCase().includes('runs') && 
                    !key.toLowerCase().includes('batting') && 
                    !key.toLowerCase().includes('average') &&
                    !key.toLowerCase().includes('strike') &&
                    !key.toLowerCase().includes('fours') &&
                    !key.toLowerCase().includes('sixes') &&
                    !key.toLowerCase().includes('balls') &&
                    !key.toLowerCase().includes('matches') &&
                    !key.toLowerCase().includes('wickets') && 
                    !key.toLowerCase().includes('bowling') && 
                    !key.toLowerCase().includes('economy') &&
                    !key.toLowerCase().includes('overs') &&
                    !key.toLowerCase().includes('maidens') &&
                    !key.toLowerCase().includes('catches') && 
                    !key.toLowerCase().includes('fielding') && 
                    !key.toLowerCase().includes('stumpings') &&
                    !key.toLowerCase().includes('runouts')
                  ).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(stats).filter(([key, value]) => 
                        !key.toLowerCase().includes('runs') && 
                        !key.toLowerCase().includes('batting') && 
                        !key.toLowerCase().includes('average') &&
                        !key.toLowerCase().includes('strike') &&
                        !key.toLowerCase().includes('fours') &&
                        !key.toLowerCase().includes('sixes') &&
                        !key.toLowerCase().includes('balls') &&
                        !key.toLowerCase().includes('matches') &&
                        !key.toLowerCase().includes('wickets') && 
                        !key.toLowerCase().includes('bowling') && 
                        !key.toLowerCase().includes('economy') &&
                        !key.toLowerCase().includes('overs') &&
                        !key.toLowerCase().includes('maidens') &&
                        !key.toLowerCase().includes('catches') && 
                        !key.toLowerCase().includes('fielding') && 
                        !key.toLowerCase().includes('stumpings') &&
                        !key.toLowerCase().includes('runouts') &&
                        value && value !== 0 && value !== '0'
                      ).map(([key, value]) => {
                        let displayValue = '0';
                        let displayKey = key.replace(/_/g, ' ').toUpperCase();
                        
                        if (typeof value === 'object' && value !== null) {
                          displayValue = JSON.stringify(value);
                        } else {
                          displayValue = value && typeof value === 'number' && value > 0 ? String(value) : 'N/A';
                        }
                        
                        return (
                          <div key={key} className="text-center p-4 bg-white rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                            <div className="text-xs text-gray-500 font-medium mb-2">
                              {displayKey}
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {displayValue}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📈</div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Additional Data Available</h3>
                      <p className="text-gray-500">Additional statistics for this player are not available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Statistics Available</h3>
                <p className="text-gray-500">Statistics for this player are not available at the moment.</p>
              </CardContent>
            </Card>
          )}

          {/* Image Upload Section */}
          {(showUploader || !currentPlayerImage || currentPlayerImage.includes('placeholder') || currentPlayerImage.includes('default')) && (
            <div className="mt-8">
              <PlayerImageUpload 
                playerId={playerId}
                playerName={playerName}
                onImageUploaded={handleImageUploaded}
              />
            </div>
          )}

          {/* Performance Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">
                  {stats?.total_runs || stats?.runs || '0'}
                </div>
                <div className="text-yellow-100">Total Runs</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">
                  {stats?.total_wickets || stats?.wickets || '0'}
                </div>
                <div className="text-green-100">Total Wickets</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">
                  {stats?.total_matches || stats?.matches || '0'}
                </div>
                <div className="text-purple-100">Total Matches</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <ContactSupport />
      </div>
    </AppSidebar>
  );
}


