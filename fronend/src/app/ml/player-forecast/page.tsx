"use client"

import { useState, useEffect } from 'react';
import { TrendingUp, Search, Loader2, BarChart3, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

export default function PlayerForecast() {
  const [loading, setLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [forecast, setForecast] = useState<any>(null);
  const [playerId, setPlayerId] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch players on component mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        console.log('Player Forecast - Fetching players from:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/players`);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/players`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Player Forecast - Players response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Player Forecast - Raw players data received:', data);
        
        // Handle different possible response structures
        let playersData = [];
        if (Array.isArray(data)) {
          playersData = data;
        } else if (data && Array.isArray(data.players)) {
          playersData = data.players;
        } else if (data && Array.isArray(data.data)) {
          playersData = data.data;
        } else if (data && typeof data === 'object') {
          // Try to find arrays in the object
          const arrays = Object.values(data).filter(item => Array.isArray(item));
          if (arrays.length > 0) {
            playersData = arrays[0]; // Take the first array found
          } else {
            // If no arrays, try to extract players from object values
            playersData = Object.values(data).filter(item => 
              item && typeof item === 'object' && ((item as any).player_id || (item as any).player_name)
            );
          }
        }
        
        console.log('Player Forecast - Processed players data:', playersData);
        console.log('Player Forecast - Players count:', playersData.length);
        
        // If we got very few players, use fallback
        if (playersData.length < 10) {
          console.log('Player Forecast - Too few players received, using fallback');
          const samplePlayers = [
            { player_id: 253802, player_name: "Virat Kohli", player_full_name: "Virat Kohli" },
            { player_id: 28763, player_name: "MS Dhoni", player_full_name: "Mahendra Singh Dhoni" },
            { player_id: 41325, player_name: "Rohit Sharma", player_full_name: "Rohit Sharma" },
            { player_id: 352636, player_name: "Jasprit Bumrah", player_full_name: "Jasprit Bumrah" },
            { player_id: 44828, player_name: "Suryakumar Yadav", player_full_name: "Suryakumar Yadav" },
            { player_id: 236779, player_name: "Hardik Pandya", player_full_name: "Hardik Pandya" },
            { player_id: 290716, player_name: "Ravindra Jadeja", player_full_name: "Ravindra Jadeja" },
            { player_id: 28081, player_name: "KL Rahul", player_full_name: "KL Rahul" },
            { player_id: 30045, player_name: "Shubman Gill", player_full_name: "Shubman Gill" },
            { player_id: 326016, player_name: "Rishabh Pant", player_full_name: "Rishabh Pant" }
          ];
          setPlayers(samplePlayers);
        } else {
          setPlayers(playersData);
        }
      } catch (err) {
        console.error('Player Forecast - Error fetching players:', err);
        
        // Check if it's a timeout error
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Player Forecast - Request timed out, using fallback players');
        }
        
        // Fallback: Add some sample players if API fails
        const samplePlayers = [
          { player_id: 253802, player_name: "Virat Kohli", player_full_name: "Virat Kohli" },
          { player_id: 28763, player_name: "MS Dhoni", player_full_name: "Mahendra Singh Dhoni" },
          { player_id: 41325, player_name: "Rohit Sharma", player_full_name: "Rohit Sharma" },
          { player_id: 352636, player_name: "Jasprit Bumrah", player_full_name: "Jasprit Bumrah" },
          { player_id: 44828, player_name: "Suryakumar Yadav", player_full_name: "Suryakumar Yadav" },
          { player_id: 236779, player_name: "Hardik Pandya", player_full_name: "Hardik Pandya" },
          { player_id: 290716, player_name: "Ravindra Jadeja", player_full_name: "Ravindra Jadeja" },
          { player_id: 28081, player_name: "KL Rahul", player_full_name: "KL Rahul" },
          { player_id: 30045, player_name: "Shubman Gill", player_full_name: "Shubman Gill" },
          { player_id: 326016, player_name: "Rishabh Pant", player_full_name: "Rishabh Pant" }
        ];
        
        console.log('Player Forecast - Using sample players as fallback');
        setPlayers(samplePlayers);
      } finally {
        setPlayersLoading(false);
      }
    };
    
    fetchPlayers();
  }, []);

  // Filter players based on search term
  const filteredPlayers = players.filter(player => 
    player.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.player_full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 20); // Limit to 20 results

  const handleForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ml/forecast/player/${playerId}`);
      const data = await response.json();
      setForecast(data);
    } catch (error) {
      console.error('Forecast error:', error);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Player Forecast</h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1">Predict Future Performance Trends</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
          <p className="text-sm sm:text-base">📈 Advanced ML models forecast player performance for upcoming matches based on recent form, career stats, and match conditions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-1 shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
            <CardTitle className="text-blue-800 flex items-center gap-2 text-base sm:text-lg">
              <Search className="w-5 h-5" />
              Search Player
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="playerSearch" className="font-semibold">
                  Search Player
                </Label>
                {playersLoading && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Player Forecast - Manual load players clicked');
                      const samplePlayers = [
                        { player_id: 253802, player_name: "Virat Kohli", player_full_name: "Virat Kohli" },
                        { player_id: 28763, player_name: "MS Dhoni", player_full_name: "Mahendra Singh Dhoni" },
                        { player_id: 41325, player_name: "Rohit Sharma", player_full_name: "Rohit Sharma" },
                        { player_id: 352636, player_name: "Jasprit Bumrah", player_full_name: "Jasprit Bumrah" },
                        { player_id: 44828, player_name: "Suryakumar Yadav", player_full_name: "Suryakumar Yadav" },
                        { player_id: 236779, player_name: "Hardik Pandya", player_full_name: "Hardik Pandya" },
                        { player_id: 290716, player_name: "Ravindra Jadeja", player_full_name: "Ravindra Jadeja" },
                        { player_id: 28081, player_name: "KL Rahul", player_full_name: "KL Rahul" },
                        { player_id: 30045, player_name: "Shubman Gill", player_full_name: "Shubman Gill" },
                        { player_id: 326016, player_name: "Rishabh Pant", player_full_name: "Rishabh Pant" }
                      ];
                      setPlayers(samplePlayers);
                      setPlayersLoading(false);
                    }}
                    className="text-xs px-2 py-1"
                  >
                    Load Players
                  </Button>
                )}
              </div>
              <Input
                id="playerSearch"
                placeholder={playersLoading ? "Loading players..." : "Type player name to search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
              />
              
              {searchTerm && (
                <div className="max-h-40 overflow-y-auto border border-blue-200 rounded-md bg-white">
                  {playersLoading ? (
                    <div className="p-2 text-center text-gray-500 text-sm">
                      Loading players...
                    </div>
                  ) : filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player) => (
                      <div
                        key={player.player_id}
                        className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setPlayerId(player.player_id.toString());
                          setSearchTerm(player.player_name || player.player_full_name || '');
                        }}
                      >
                        <div className="font-medium text-sm">{player.player_name}</div>
                        <div className="text-xs text-gray-500">{player.player_full_name}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-500 text-sm">
                      No players found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-gray-500">Search and select a player to see their forecast</p>
              
              {/* Quick Player Selection */}
              {!playersLoading && players.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Quick Select:</p>
                  <div className="flex flex-wrap gap-1">
                    {players.slice(0, 5).map((player) => (
                      <button
                        key={player.player_id}
                        onClick={() => {
                          setPlayerId(player.player_id.toString());
                          setSearchTerm(player.player_name || player.player_full_name || '');
                        }}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                      >
                        {player.player_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleForecast}
              disabled={loading || !playerId}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-6"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Getting Forecast...</>
              ) : (
                <><TrendingUp className="w-5 h-5 mr-2" /> Get Forecast</>
              )}
            </Button>

            {/* Debug Info */}
            <div className="bg-gray-100 rounded-lg p-3 text-xs">
              <p><strong>Players Loading:</strong> {playersLoading ? 'Yes' : 'No'}</p>
              <p><strong>Players Count:</strong> {players.length}</p>
              <p><strong>Selected Player ID:</strong> {playerId || 'None'}</p>
              <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
              {players.length > 0 ? (
                <div>
                  <p><strong>First Player:</strong> {players[0]?.player_name} (ID: {players[0]?.player_id})</p>
                  <p><strong>Sample Players:</strong></p>
                  <ul className="text-xs ml-2">
                    {players.slice(0, 3).map(player => (
                      <li key={player.player_id}>• {player.player_name} (ID: {player.player_id})</li>
                    ))}
                    {players.length > 3 && <li>• ... and {players.length - 3} more</li>}
                  </ul>
                </div>
              ) : (
                <p><strong>No players loaded</strong></p>
              )}
            </div>

            {/* Example Players */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-semibold text-blue-800 mb-2">Popular Players:</p>
              <div className="space-y-1 text-xs text-blue-700">
                <p>• Virat Kohli</p>
                <p>• MS Dhoni</p>
                <p>• Rohit Sharma</p>
                <p>• Suryakumar Yadav</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Results */}
        <Card className="lg:col-span-2 shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
            <CardTitle className="text-blue-800 flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="w-5 h-5" />
              Performance Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {!forecast ? (
              <div className="text-center py-12 sm:py-20">
                <TrendingUp className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Enter a player ID to see performance forecast</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Player Name */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg p-4 sm:p-6 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold">{forecast.player_name || forecast.player_full_name}</h2>
                  <p className="text-blue-100 text-sm sm:text-base mt-1">
                    {forecast.player_type ? `${forecast.player_type.charAt(0).toUpperCase() + forecast.player_type.slice(1)} • Performance Forecast` : 'Performance Forecast'}
                  </p>
                </div>

                {/* Batting Forecast */}
                {forecast.batting_forecast && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-bold text-blue-800 text-base sm:text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Batting Forecast
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                        <CardContent className="p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm text-green-700 font-semibold">Predicted Runs</p>
                          <p className="text-2xl sm:text-3xl font-bold text-green-800 mt-1">
                            {forecast.batting_forecast.predicted_runs}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                        <CardContent className="p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm text-blue-700 font-semibold">Strike Rate</p>
                          <p className="text-2xl sm:text-3xl font-bold text-blue-800 mt-1">
                            {forecast.batting_forecast.predicted_strike_rate}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                        <CardContent className="p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm text-purple-700 font-semibold">Trend</p>
                          <p className="text-lg sm:text-xl font-bold text-purple-800 mt-1">
                            {forecast.batting_forecast.trend}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Current Season Stats */}
                    {forecast.batting_forecast.current_season_stats && (
                      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-2 border-blue-200">
                        <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-2">Current Season Stats</p>
                        <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                          <div className="text-center">
                            <p className="text-blue-600 font-semibold">Runs</p>
                            <p className="text-blue-800 font-bold">{forecast.batting_forecast.current_season_stats.runs || 'N/A'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-blue-600 font-semibold">Balls</p>
                            <p className="text-blue-800 font-bold">{forecast.batting_forecast.current_season_stats.balls || 'N/A'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-blue-600 font-semibold">SR</p>
                            <p className="text-blue-800 font-bold">{forecast.batting_forecast.current_season_stats.strike_rate || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confidence Interval */}
                    {forecast.batting_forecast.confidence_interval && (
                      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-2 border-blue-200">
                        <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-2">Confidence Range</p>
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-blue-800 font-bold">{forecast.batting_forecast.confidence_interval.min} runs</span>
                          <span className="text-gray-500">to</span>
                          <span className="text-blue-800 font-bold">{forecast.batting_forecast.confidence_interval.max} runs</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bowling Forecast */}
                {forecast.bowling_forecast && (
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-bold text-orange-800 text-base sm:text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Bowling Forecast
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
                        <CardContent className="p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm text-red-700 font-semibold">Predicted Wickets</p>
                          <p className="text-2xl sm:text-3xl font-bold text-red-800 mt-1">
                            {forecast.bowling_forecast.predicted_wickets}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
                        <CardContent className="p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm text-orange-700 font-semibold">Economy Rate</p>
                          <p className="text-2xl sm:text-3xl font-bold text-orange-800 mt-1">
                            {forecast.bowling_forecast.predicted_economy}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
                        <CardContent className="p-3 sm:p-4 text-center">
                          <p className="text-xs sm:text-sm text-yellow-700 font-semibold">Trend</p>
                          <p className="text-lg sm:text-xl font-bold text-yellow-800 mt-1">
                            {forecast.bowling_forecast.trend}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
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

