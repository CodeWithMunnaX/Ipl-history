"use client"

import { useState, useEffect } from 'react';
import { Zap, Users, DollarSign, Loader2, Star, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

export default function Dream11Optimizer() {
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    team1_id: '',
    team2_id: '',
    venue: '',
    budget: '100'
  });

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log('Dream11 - Fetching teams from:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Dream11 - Teams response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Dream11 - Raw teams data received:', data);
        
        // Handle different possible response structures
        let teamsData = [];
        if (Array.isArray(data)) {
          teamsData = data;
        } else if (data && Array.isArray(data.teams)) {
          teamsData = data.teams;
        } else if (data && Array.isArray(data.data)) {
          teamsData = data.data;
        } else if (data && typeof data === 'object') {
          // Try to find arrays in the object
          const arrays = Object.values(data).filter(item => Array.isArray(item));
          if (arrays.length > 0) {
            teamsData = arrays[0]; // Take the first array found
          } else {
            // If no arrays, try to extract teams from object values
            teamsData = Object.values(data).filter(item => 
              item && typeof item === 'object' && ((item as any).team_id || (item as any).team_name)
            );
          }
        }
        
        console.log('Dream11 - Processed teams data:', teamsData);
        console.log('Dream11 - Teams count:', teamsData.length);
        
        // If we got very few teams, use fallback
        if (teamsData.length < 5) {
          console.log('Dream11 - Too few teams received, using fallback');
          const sampleTeams = [
            { team_id: 1, team_name: "Mumbai Indians" },
            { team_id: 2, team_name: "Chennai Super Kings" },
            { team_id: 3, team_name: "Royal Challengers Bangalore" },
            { team_id: 4, team_name: "Delhi Capitals" },
            { team_id: 5, team_name: "Punjab Kings" },
            { team_id: 6, team_name: "Kolkata Knight Riders" },
            { team_id: 7, team_name: "Rajasthan Royals" },
            { team_id: 8, team_name: "Sunrisers Hyderabad" },
            { team_id: 9, team_name: "Gujarat Titans" },
            { team_id: 10, team_name: "Lucknow Super Giants" }
          ];
          setTeams(sampleTeams);
        } else {
          setTeams(teamsData);
        }
      } catch (err) {
        console.error('Dream11 - Error fetching teams:', err);
        
        // Check if it's a timeout error
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Dream11 - Request timed out, using fallback teams');
        }
        
        // Fallback: Add some sample teams if API fails
        const sampleTeams = [
          { team_id: 1, team_name: "Mumbai Indians" },
          { team_id: 2, team_name: "Chennai Super Kings" },
          { team_id: 3, team_name: "Royal Challengers Bangalore" },
          { team_id: 4, team_name: "Delhi Capitals" },
          { team_id: 5, team_name: "Punjab Kings" },
          { team_id: 6, team_name: "Kolkata Knight Riders" },
          { team_id: 7, team_name: "Rajasthan Royals" },
          { team_id: 8, team_name: "Sunrisers Hyderabad" },
          { team_id: 9, team_name: "Gujarat Titans" },
          { team_id: 10, team_name: "Lucknow Super Giants" }
        ];
        
        console.log('Dream11 - Using sample teams as fallback');
        setTeams(sampleTeams);
      } finally {
        setTeamsLoading(false);
      }
    };
    
    fetchTeams();
  }, []);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ml/dream11/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1_id: parseInt(formData.team1_id),
          team2_id: parseInt(formData.team2_id),
          venue: formData.venue,
          budget: parseFloat(formData.budget)
        })
      });
      const data = await response.json();
      setTeam(data);
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Dream11 Team Optimizer</h1>
            <p className="text-yellow-100 text-sm sm:text-base mt-1">Build Your Winning Fantasy Team</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
          <p className="text-sm sm:text-base">⚡ AI-powered team selection considering player form, match conditions, and budget constraints to maximize your points!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Form */}
        <Card className="shadow-lg border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-orange-200">
            <CardTitle className="text-orange-800 flex items-center gap-2 text-base sm:text-lg">
              <Users className="w-5 h-5" />
              Match & Budget Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="team1" className="flex items-center gap-2">
                  <span className="font-semibold">Team 1</span>
                </Label>
                {teamsLoading && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Dream11 - Manual load teams clicked');
                      const sampleTeams = [
                        { team_id: 1, team_name: "Mumbai Indians" },
                        { team_id: 2, team_name: "Chennai Super Kings" },
                        { team_id: 3, team_name: "Royal Challengers Bangalore" },
                        { team_id: 4, team_name: "Delhi Capitals" },
                        { team_id: 5, team_name: "Punjab Kings" },
                        { team_id: 6, team_name: "Kolkata Knight Riders" },
                        { team_id: 7, team_name: "Rajasthan Royals" },
                        { team_id: 8, team_name: "Sunrisers Hyderabad" },
                        { team_id: 9, team_name: "Gujarat Titans" },
                        { team_id: 10, team_name: "Lucknow Super Giants" }
                      ];
                      setTeams(sampleTeams);
                      setTeamsLoading(false);
                    }}
                    className="text-xs px-2 py-1"
                  >
                    Load Teams
                  </Button>
                )}
              </div>
              <Select onValueChange={(value) => setFormData({...formData, team1_id: value})}>
                <SelectTrigger className="border-orange-200 focus:border-orange-400">
                  <SelectValue placeholder={teamsLoading ? "Loading teams..." : "Select Team 1"} />
                </SelectTrigger>
                <SelectContent>
                  {teamsLoading ? (
                    <SelectItem value="loading" disabled>Loading teams...</SelectItem>
                  ) : teams.length > 0 ? (
                    teams.map((team) => (
                      <SelectItem key={team.team_id} value={team.team_id.toString()}>
                        {team.team_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-teams" disabled>No teams available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team2" className="flex items-center gap-2">
                <span className="font-semibold">Team 2</span>
              </Label>
              <Select onValueChange={(value) => setFormData({...formData, team2_id: value})}>
                <SelectTrigger className="border-orange-200 focus:border-orange-400">
                  <SelectValue placeholder={teamsLoading ? "Loading teams..." : "Select Team 2"} />
                </SelectTrigger>
                <SelectContent>
                  {teamsLoading ? (
                    <SelectItem value="loading" disabled>Loading teams...</SelectItem>
                  ) : teams.length > 0 ? (
                    teams.map((team) => (
                      <SelectItem key={team.team_id} value={team.team_id.toString()}>
                        {team.team_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-teams" disabled>No teams available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue" className="flex items-center gap-2">
                <span className="font-semibold">Venue</span>
              </Label>
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
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget (Credits)
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="100"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="border-orange-200 focus:border-orange-400"
              />
            </div>

            <Button 
              onClick={handleOptimize}
              disabled={loading || !formData.team1_id || !formData.team2_id || !formData.venue}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-6"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Optimizing...</>
              ) : (
                <><Zap className="w-5 h-5 mr-2" /> Build Team</>
              )}
            </Button>

            {/* Debug Info */}
            <div className="bg-gray-100 rounded-lg p-3 text-xs">
              <p><strong>Teams Loading:</strong> {teamsLoading ? 'Yes' : 'No'}</p>
              <p><strong>Teams Count:</strong> {teams.length}</p>
              <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
              {teams.length > 0 ? (
                <div>
                  <p><strong>First Team:</strong> {teams[0]?.team_name} (ID: {teams[0]?.team_id})</p>
                  <p><strong>All Teams:</strong></p>
                  <ul className="text-xs ml-2">
                    {teams.slice(0, 3).map(team => (
                      <li key={team.team_id}>• {team.team_name} (ID: {team.team_id})</li>
                    ))}
                    {teams.length > 3 && <li>• ... and {teams.length - 3} more</li>}
                  </ul>
                </div>
              ) : (
                <p><strong>No teams loaded</strong></p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Results */}
        <Card className="shadow-lg border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-orange-200">
            <CardTitle className="text-orange-800 flex items-center gap-2 text-base sm:text-lg">
              <Star className="w-5 h-5" />
              Optimized Team
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {!team ? (
              <div className="text-center py-12 sm:py-20">
                <Zap className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Enter match details to get your optimized Dream11 team</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Team Summary */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border-2 border-green-200 text-center">
                    <p className="text-xs sm:text-sm text-green-700 font-semibold">Expected Points</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-800 mt-1">
                      {team.summary?.estimated_points || team.expected_points || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border-2 border-blue-200 text-center">
                    <p className="text-xs sm:text-sm text-blue-700 font-semibold">Total Cost</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-800 mt-1">
                      ₹{team.summary?.total_cost || team.total_cost || formData.budget}
                    </p>
                  </div>
                </div>

                {/* Budget Info */}
                {team.summary && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border-2 border-purple-200 text-center">
                    <p className="text-xs sm:text-sm text-purple-700 font-semibold">Remaining Budget</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-800 mt-1">
                      ₹{team.summary.remaining_budget}
                    </p>
                  </div>
                )}

                {/* Captain & Vice Captain */}
                {(team.summary?.captain || team.captain) && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 sm:p-4 border-2 border-yellow-300">
                      <p className="text-xs sm:text-sm text-yellow-700 font-semibold mb-1">👑 Captain</p>
                      <p className="text-sm sm:text-base font-bold text-yellow-800">{team.summary?.captain || team.captain}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 sm:p-4 border-2 border-orange-300">
                      <p className="text-xs sm:text-sm text-orange-700 font-semibold mb-1">⭐ Vice Captain</p>
                      <p className="text-sm sm:text-base font-bold text-orange-800">{team.summary?.vice_captain || team.vice_captain}</p>
                    </div>
                  </div>
                )}

                {/* Players by Role */}
                {(team.team || team.players) && (
                  <div className="space-y-3">
                    {['Batsmen', 'Bowlers', 'All-rounders', 'Wicket-keepers'].map((role) => {
                      const players = team.team || team.players;
                      const rolePlayers = players.filter((p: any) => 
                        p.player_type?.toLowerCase().includes(role.toLowerCase().slice(0, -1)) ||
                        p.role?.toLowerCase().includes(role.toLowerCase().slice(0, -1))
                      );
                      if (rolePlayers.length === 0) return null;
                      
                      return (
                        <div key={role} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                          <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{role}</h4>
                          <div className="space-y-2">
                            {rolePlayers.map((player: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-700">{player.player_name || player.name}</span>
                                  {player.is_captain && <span className="bg-yellow-500 text-white px-1 py-0.5 rounded text-xs font-bold">C</span>}
                                  {player.is_vice_captain && <span className="bg-orange-500 text-white px-1 py-0.5 rounded text-xs font-bold">VC</span>}
                                </div>
                                <span className="font-semibold text-gray-900">₹{player.cost || player.credits}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
            <p className="text-xs sm:text-sm text-yellow-700">AI picks players based on recent form, venue stats, and opposition analysis.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-orange-800 mb-2 text-sm sm:text-base">💰 Budget Optimization</h3>
            <p className="text-xs sm:text-sm text-orange-700">Maximizes points while staying within your budget constraints.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-red-800 mb-2 text-sm sm:text-base">🎯 Captain Picks</h3>
            <p className="text-xs sm:text-sm text-red-700">Suggests optimal captain and vice-captain choices for maximum points.</p>
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

