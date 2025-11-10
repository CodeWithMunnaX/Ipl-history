"use client"

import { useState } from 'react';
import { Zap, Users, Loader2, Star, DollarSign, Trophy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

export default function Dream11FromTeams() {
  const [loading, setLoading] = useState(false);
  const [dream11Team, setDream11Team] = useState<any>(null);
  const [formData, setFormData] = useState({
    team1_name: 'Mumbai Indians',
    team2_name: 'Chennai Super Kings',
    venue: 'Wankhede Stadium',
    season: '2024'
  });

  const handleCreateDream11 = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ml/dream11-from-teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1_name: formData.team1_name,
          team2_name: formData.team2_name,
          venue: formData.venue,
          season: parseInt(formData.season)
        })
      });
      const data = await response.json();
      setDream11Team(data);
    } catch (error) {
      console.error('Dream11 creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold">Dream11 from Teams</h1>
              <p className="text-yellow-100 text-sm sm:text-base mt-1">Create Dream11 Team from Two Teams</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <p className="text-sm sm:text-base">⚡ AI selects the best 11 players from two teams, assigns captain/vice-captain, and optimizes for maximum Dream11 points!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Input Form */}
          <Card className="shadow-lg border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-orange-200">
              <CardTitle className="text-orange-800 flex items-center gap-2 text-base sm:text-lg">
                <Users className="w-5 h-5" />
                Match Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team1" className="font-semibold">Team 1 Name</Label>
                <Input
                  id="team1"
                  placeholder="Mumbai Indians"
                  value={formData.team1_name}
                  onChange={(e) => setFormData({...formData, team1_name: e.target.value})}
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team2" className="font-semibold">Team 2 Name</Label>
                <Input
                  id="team2"
                  placeholder="Chennai Super Kings"
                  value={formData.team2_name}
                  onChange={(e) => setFormData({...formData, team2_name: e.target.value})}
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue" className="font-semibold">Venue</Label>
                <Select onValueChange={(value) => setFormData({...formData, venue: value})}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
                    <SelectValue placeholder="Select Venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Wankhede Stadium",
                      "M Chinnaswamy Stadium",
                      "Eden Gardens",
                      "Arun Jaitley Stadium",
                      "MA Chidambaram Stadium",
                      "Rajiv Gandhi International Stadium",
                      "Punjab Cricket Association Stadium",
                      "Sawai Mansingh Stadium",
                      "Narendra Modi Stadium"
                    ].map((venue) => (
                      <SelectItem key={venue} value={venue}>
                        {venue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season" className="font-semibold">Season</Label>
                <Input
                  id="season"
                  type="number"
                  placeholder="2024"
                  value={formData.season}
                  onChange={(e) => setFormData({...formData, season: e.target.value})}
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              <Button 
                onClick={handleCreateDream11}
                disabled={loading || !formData.team1_name || !formData.team2_name || !formData.venue}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-6"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating Dream11 Team...</>
                ) : (
                  <><Zap className="w-5 h-5 mr-2" /> Create Dream11 Team</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Dream11 Results */}
          <Card className="shadow-lg border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-orange-200">
              <CardTitle className="text-orange-800 flex items-center gap-2 text-base sm:text-lg">
                <Star className="w-5 h-5" />
                Dream11 Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!dream11Team ? (
                <div className="text-center py-12 sm:py-20">
                  <Zap className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">Enter match details and click "Create Dream11 Team" to see optimized team</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Match Info */}
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg p-4 sm:p-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold">{dream11Team.match_info?.team1_name} vs {dream11Team.match_info?.team2_name}</h2>
                    <p className="text-yellow-100 text-sm sm:text-base mt-1">
                      {dream11Team.match_info?.venue} • Season {dream11Team.match_info?.season}
                    </p>
                  </div>

                  {/* Dream11 Summary */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-3 text-center">Dream11 Team Summary</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-3 border border-purple-200 text-center">
                        <p className="text-xs sm:text-sm text-purple-700 font-semibold">Total Players</p>
                        <p className="text-lg sm:text-xl font-bold text-purple-800">{dream11Team.dream11_summary?.total_players}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-200 text-center">
                        <p className="text-xs sm:text-sm text-purple-700 font-semibold">Total Cost</p>
                        <p className="text-lg sm:text-xl font-bold text-purple-800">₹{dream11Team.dream11_summary?.total_cost}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-200 text-center">
                        <p className="text-xs sm:text-sm text-purple-700 font-semibold">Remaining Budget</p>
                        <p className="text-lg sm:text-xl font-bold text-purple-800">₹{dream11Team.dream11_summary?.remaining_budget}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-200 text-center">
                        <p className="text-xs sm:text-sm text-purple-700 font-semibold">Estimated Points</p>
                        <p className="text-lg sm:text-xl font-bold text-purple-800">{dream11Team.dream11_summary?.estimated_points}</p>
                      </div>
                    </div>

                    {/* Captain & Vice Captain */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                      <div className="bg-yellow-100 rounded-lg p-3 border-2 border-yellow-300 text-center">
                        <p className="text-xs sm:text-sm text-yellow-700 font-semibold">👑 Captain</p>
                        <p className="text-sm sm:text-base font-bold text-yellow-800">{dream11Team.dream11_summary?.captain}</p>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-3 border-2 border-orange-300 text-center">
                        <p className="text-xs sm:text-sm text-orange-700 font-semibold">⭐ Vice Captain</p>
                        <p className="text-sm sm:text-base font-bold text-orange-800">{dream11Team.dream11_summary?.vice_captain}</p>
                      </div>
                    </div>

                    {/* Team Composition */}
                    <div className="bg-white rounded-lg p-3 border border-purple-200 mt-4">
                      <p className="text-xs sm:text-sm text-purple-700 font-semibold mb-2">Team Composition</p>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded">WK: {dream11Team.dream11_summary?.team_composition?.wicketkeepers}</span>
                        <span className="bg-green-200 text-green-800 px-2 py-1 rounded">BAT: {dream11Team.dream11_summary?.team_composition?.batsmen}</span>
                        <span className="bg-red-200 text-red-800 px-2 py-1 rounded">BOWL: {dream11Team.dream11_summary?.team_composition?.bowlers}</span>
                        <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">AR: {dream11Team.dream11_summary?.team_composition?.allrounders}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Players */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-center">Selected Players</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dream11Team.dream11_team?.map((player: any, index: number) => (
                        <div key={index} className={`bg-white rounded-lg p-3 border-2 ${
                          player.player_type === 'batsman' ? 'border-green-300' :
                          player.player_type === 'bowler' ? 'border-red-300' :
                          player.player_type === 'allrounder' ? 'border-yellow-300' :
                          'border-purple-300'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-800 text-sm">{player.player_name}</h4>
                                {player.is_captain && <span className="bg-yellow-500 text-white px-1 py-0.5 rounded text-xs font-bold">C</span>}
                                {player.is_vice_captain && <span className="bg-orange-500 text-white px-1 py-0.5 rounded text-xs font-bold">VC</span>}
                              </div>
                              <p className="text-xs text-gray-600">{player.player_full_name}</p>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${
                                player.player_type === 'batsman' ? 'bg-green-200 text-green-800' :
                                player.player_type === 'bowler' ? 'bg-red-200 text-red-800' :
                                player.player_type === 'allrounder' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-purple-200 text-purple-800'
                              }`}>
                                {player.player_type}
                              </span>
                            </div>
                            <div className="text-right text-xs">
                              <p className="font-bold text-green-600">₹{player.cost}</p>
                              <p className="font-bold text-blue-600">{player.points?.toFixed(0)} pts</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-yellow-800 mb-2 text-sm sm:text-base">⚡ Smart Selection</h3>
              <p className="text-xs sm:text-sm text-yellow-700">AI picks the best 11 players from both teams for maximum Dream11 points.</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-orange-800 mb-2 text-sm sm:text-base">👑 Captain Choice</h3>
              <p className="text-xs sm:text-sm text-orange-700">Automatically selects optimal captain and vice-captain for maximum multiplier effect.</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-red-800 mb-2 text-sm sm:text-base">💰 Budget Optimized</h3>
              <p className="text-xs sm:text-sm text-red-700">Balances high-value players with budget constraints for optimal team composition.</p>
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
