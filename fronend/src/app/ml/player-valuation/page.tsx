"use client"

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Loader2, Target, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

export default function PlayerValuation() {
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState<any>(null);
  const [playerId, setPlayerId] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch players on component mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/players`)
      .then(res => res.json())
      .then(data => setPlayers(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching players:', err));
  }, []);

  // Filter players based on search term
  const filteredPlayers = players.filter(player => 
    player.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.player_full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 20); // Limit to 20 results

  const handleValuation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ml/valuation/player/${playerId}`);
      const data = await response.json();
      setValuation(data);
    } catch (error) {
      console.error('Valuation error:', error);
      setValuation(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Player Valuation</h1>
            <p className="text-green-100 text-sm sm:text-base mt-1">AI-Powered Auction Price Estimation</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
          <p className="text-sm sm:text-base">💰 Machine learning models analyze player performance, market trends, and historical data to estimate fair auction values.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Form */}
        <Card className="shadow-lg border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
            <CardTitle className="text-green-800 flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-5 h-5" />
              Player Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerSearch" className="font-semibold">
                Search Player
              </Label>
              <Input
                id="playerSearch"
                placeholder="Type player name to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-green-200 focus:border-green-400"
              />
              
              {searchTerm && filteredPlayers.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-green-200 rounded-md bg-white">
                  {filteredPlayers.map((player) => (
                    <div
                      key={player.player_id}
                      className="p-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setPlayerId(player.player_id.toString());
                        setSearchTerm(player.player_name || player.player_full_name || '');
                      }}
                    >
                      <div className="font-medium text-sm">{player.player_name}</div>
                      <div className="text-xs text-gray-500">{player.player_full_name}</div>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500">Search and select a player to see their valuation</p>
            </div>

            <Button 
              onClick={handleValuation}
              disabled={loading || !playerId}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Calculating...</>
              ) : (
                <><DollarSign className="w-5 h-5 mr-2" /> Get Valuation</>
              )}
            </Button>

            {/* Example Players */}
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-semibold text-green-800 mb-2">Popular Players:</p>
              <div className="space-y-1 text-xs text-green-700">
                <p>• Virat Kohli</p>
                <p>• MS Dhoni</p>
                <p>• Rohit Sharma</p>
                <p>• Jasprit Bumrah</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valuation Results */}
        <Card className="shadow-lg border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
            <CardTitle className="text-green-800 flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="w-5 h-5" />
              Valuation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {!valuation ? (
              <div className="text-center py-12 sm:py-20">
                <DollarSign className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Enter a player ID to see valuation analysis</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Player Name */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg p-4 sm:p-6 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold">{valuation.player_name || 'Player'}</h2>
                  <p className="text-green-100 text-sm sm:text-base mt-1">Auction Valuation Analysis</p>
                </div>

                {/* Valuation Details */}
                <div className="space-y-4">
                  {/* Estimated Value */}
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 sm:p-6 border-2 border-yellow-300 text-center">
                    <p className="text-sm sm:text-base text-yellow-700 font-semibold mb-2">Estimated Auction Value</p>
                    <p className="text-3xl sm:text-4xl font-bold text-yellow-800">
                      ₹{valuation.estimated_value || valuation.auction_value || 'N/A'} Cr
                    </p>
                  </div>

                  {/* Value Breakdown */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <p className="text-xs sm:text-sm text-blue-700 font-semibold">Base Value</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-800 mt-1">
                          ₹{valuation.base_value || valuation.min_value || 'N/A'} Cr
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <p className="text-xs sm:text-sm text-purple-700 font-semibold">Max Value</p>
                        <p className="text-lg sm:text-xl font-bold text-purple-800 mt-1">
                          ₹{valuation.max_value || valuation.high_value || 'N/A'} Cr
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Confidence Score */}
                  {valuation.confidence_score && (
                    <div className="bg-green-50 rounded-lg p-3 sm:p-4 border-2 border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm text-green-700 font-semibold">Confidence Score</span>
                        <span className="text-lg sm:text-xl font-bold text-green-800">
                          {(valuation.confidence_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2 sm:h-3">
                        <div 
                          className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                          style={{ width: `${valuation.confidence_score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Key Factors */}
                  {valuation.key_factors && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Key Valuation Factors:</p>
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        {valuation.key_factors.performance && (
                          <p><strong>Performance:</strong> {valuation.key_factors.performance}</p>
                        )}
                        {valuation.key_factors.market_demand && (
                          <p><strong>Market Demand:</strong> {valuation.key_factors.market_demand}</p>
                        )}
                        {valuation.key_factors.age_factor && (
                          <p><strong>Age Factor:</strong> {valuation.key_factors.age_factor}</p>
                        )}
                        {valuation.key_factors.role_value && (
                          <p><strong>Role Value:</strong> {valuation.key_factors.role_value}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Market Comparison */}
                  {valuation.market_comparison && (
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-2 border-blue-200">
                      <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-2">Market Comparison:</p>
                      <div className="text-xs sm:text-sm text-blue-800">
                        <p><strong>Similar Players:</strong> {valuation.market_comparison.similar_players || 'N/A'}</p>
                        <p><strong>Market Trend:</strong> {valuation.market_comparison.trend || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-green-800 mb-2 text-sm sm:text-base">📊 Performance Analysis</h3>
            <p className="text-xs sm:text-sm text-green-700">Analyzes batting, bowling, and fielding statistics to determine player value.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">📈 Market Trends</h3>
            <p className="text-xs sm:text-sm text-blue-700">Considers historical auction data and market demand patterns.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-purple-800 mb-2 text-sm sm:text-base">🎯 Role Value</h3>
            <p className="text-xs sm:text-sm text-purple-700">Evaluates player's role importance and scarcity in the market.</p>
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
