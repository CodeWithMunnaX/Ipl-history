"use client"

import { useState, useEffect } from 'react';
import { Users, Loader2, Trophy, Target, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

export default function TeamCreation() {
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teams, setTeams] = useState<any>(null);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    team1_name: '',
    team2_name: '',
    venue: 'Wankhede Stadium',
    season: '2024'
  });

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log('Team Creation - Fetching teams from:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Team Creation - Teams response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Team Creation - Raw teams data received:', data);
        
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
        
        console.log('Team Creation - Processed teams data:', teamsData);
        console.log('Team Creation - Teams count:', teamsData.length);
        
        // If we got very few teams, use fallback
        if (teamsData.length < 5) {
          console.log('Team Creation - Too few teams received, using fallback');
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
          setAvailableTeams(sampleTeams);
        } else {
          setAvailableTeams(teamsData);
        }
      } catch (err) {
        console.error('Team Creation - Error fetching teams:', err);
        
        // Check if it's a timeout error
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Team Creation - Request timed out, using fallback teams');
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
        
        console.log('Team Creation - Using sample teams as fallback');
        setAvailableTeams(sampleTeams);
      } finally {
        setTeamsLoading(false);
      }
    };
    
    fetchTeams();
  }, []);

  const handleCreateTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ml/create-teams`, {
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
      setTeams(data);
    } catch (error) {
      console.error('Team creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold">Team Creation</h1>
              <p className="text-blue-100 text-sm sm:text-base mt-1">Create Two Balanced Teams</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
            <p className="text-sm sm:text-base">🏏 AI-powered team creation that balances batsmen, bowlers, all-rounders, and wicket-keepers for competitive matches.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Input Form */}
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <CardTitle className="text-blue-800 flex items-center gap-2 text-base sm:text-lg">
                <Users className="w-5 h-5" />
                Match Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="team1" className="font-semibold">Team 1 Name</Label>
                  {teamsLoading && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Team Creation - Manual load teams clicked');
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
                        setAvailableTeams(sampleTeams);
                        setTeamsLoading(false);
                      }}
                      className="text-xs px-2 py-1"
                    >
                      Load Teams
                    </Button>
                  )}
                </div>
                <Select onValueChange={(value) => setFormData({...formData, team1_name: value})}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder={teamsLoading ? "Loading teams..." : "Select Team 1"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teamsLoading ? (
                      <SelectItem value="loading" disabled>Loading teams...</SelectItem>
                    ) : availableTeams.length > 0 ? (
                      availableTeams.map((team) => (
                        <SelectItem key={team.team_id} value={team.team_name}>
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
                <Label htmlFor="team2" className="font-semibold">Team 2 Name</Label>
                <Select onValueChange={(value) => setFormData({...formData, team2_name: value})}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder={teamsLoading ? "Loading teams..." : "Select Team 2"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teamsLoading ? (
                      <SelectItem value="loading" disabled>Loading teams...</SelectItem>
                    ) : availableTeams.length > 0 ? (
                      availableTeams.map((team) => (
                        <SelectItem key={team.team_id} value={team.team_name}>
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
                <Label htmlFor="venue" className="font-semibold">Venue</Label>
                <Select onValueChange={(value) => setFormData({...formData, venue: value})}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
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
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <Button 
                onClick={handleCreateTeams}
                disabled={loading || !formData.team1_name || !formData.team2_name || !formData.venue}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating Teams...</>
                ) : (
                  <><Users className="w-5 h-5 mr-2" /> Create Teams</>
                )}
              </Button>

              {/* Debug Info */}
              <div className="bg-gray-100 rounded-lg p-3 text-xs">
                <p><strong>Teams Loading:</strong> {teamsLoading ? 'Yes' : 'No'}</p>
                <p><strong>Teams Count:</strong> {availableTeams.length}</p>
                <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
                {availableTeams.length > 0 ? (
                  <div>
                    <p><strong>First Team:</strong> {availableTeams[0]?.team_name} (ID: {availableTeams[0]?.team_id})</p>
                    <p><strong>All Teams:</strong></p>
                    <ul className="text-xs ml-2">
                      {availableTeams.slice(0, 3).map(team => (
                        <li key={team.team_id}>• {team.team_name} (ID: {team.team_id})</li>
                      ))}
                      {availableTeams.length > 3 && <li>• ... and {availableTeams.length - 3} more</li>}
                    </ul>
                  </div>
                ) : (
                  <p><strong>No teams loaded</strong></p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teams Results */}
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
              <CardTitle className="text-blue-800 flex items-center gap-2 text-base sm:text-lg">
                <Trophy className="w-5 h-5" />
                Created Teams
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {!teams ? (
                <div className="text-center py-12 sm:py-20">
                  <Users className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">Enter match details and click "Create Teams" to see balanced teams</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Match Info */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-4 sm:p-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold">{teams.match_info?.team1_name} vs {teams.match_info?.team2_name}</h2>
                    <p className="text-blue-100 text-sm sm:text-base mt-1">
                      {teams.match_info?.venue} • Season {teams.match_info?.season}
                    </p>
                  </div>

                  {/* Teams */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Team 1 */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
                      <h3 className="font-bold text-green-800 mb-3 text-center border-b-2 border-green-300 pb-2">
                        {teams.match_info?.team1_name}
                      </h3>
                      <div className="space-y-2">
                        {teams.team1?.map((player: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-green-800 text-sm">{player.player_name}</h4>
                                <p className="text-xs text-green-600">{player.player_full_name}</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${
                                  player.player_type === 'batsman' ? 'bg-green-200 text-green-800' :
                                  player.player_type === 'bowler' ? 'bg-red-200 text-red-800' :
                                  player.player_type === 'allrounder' ? 'bg-yellow-200 text-yellow-800' :
                                  'bg-purple-200 text-purple-800'
                                }`}>
                                  {player.player_type}
                                </span>
                              </div>
                              <div className="text-right text-xs text-green-700">
                                <p>Matches: {player.matches}</p>
                                <p>Runs: {player.runs}</p>
                                <p>SR: {player.strike_rate}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team 2 */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                      <h3 className="font-bold text-blue-800 mb-3 text-center border-b-2 border-blue-300 pb-2">
                        {teams.match_info?.team2_name}
                      </h3>
                      <div className="space-y-2">
                        {teams.team2?.map((player: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-blue-800 text-sm">{player.player_name}</h4>
                                <p className="text-xs text-blue-600">{player.player_full_name}</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${
                                  player.player_type === 'batsman' ? 'bg-green-200 text-green-800' :
                                  player.player_type === 'bowler' ? 'bg-red-200 text-red-800' :
                                  player.player_type === 'allrounder' ? 'bg-yellow-200 text-yellow-800' :
                                  'bg-purple-200 text-purple-800'
                                }`}>
                                  {player.player_type}
                                </span>
                              </div>
                              <div className="text-right text-xs text-blue-700">
                                <p>Matches: {player.matches}</p>
                                <p>Runs: {player.runs}</p>
                                <p>SR: {player.strike_rate}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Team Stats Summary */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200 text-center">
                      <p className="text-xs sm:text-sm text-green-700 font-semibold">Team 1 Players</p>
                      <p className="text-lg sm:text-xl font-bold text-green-800">{teams.team1?.length || 0}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200 text-center">
                      <p className="text-xs sm:text-sm text-blue-700 font-semibold">Team 2 Players</p>
                      <p className="text-lg sm:text-xl font-bold text-blue-800">{teams.team2?.length || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">⚖️ Balanced Teams</h3>
              <p className="text-xs sm:text-sm text-blue-700">AI ensures equal distribution of batsmen, bowlers, all-rounders, and wicket-keepers.</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-green-800 mb-2 text-sm sm:text-base">📊 Player Stats</h3>
              <p className="text-xs sm:text-sm text-green-700">Considers player performance, experience, and form for optimal team selection.</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold text-purple-800 mb-2 text-sm sm:text-base">🏆 Competitive</h3>
              <p className="text-xs sm:text-sm text-purple-700">Creates evenly matched teams for exciting and fair competition.</p>
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
