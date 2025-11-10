"use client"

import { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

export default function MatchPredictor() {
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [formData, setFormData] = useState({
    team1_id: '',
    team2_id: '',
    venue: '',
    season: '2025'
  });

  useEffect(() => {
    // Fetch teams
    const fetchTeams = async () => {
      try {
        console.log('Fetching teams from:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`);
        console.log('Teams response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw teams data received:', data);
        
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
        
        console.log('Processed teams data:', teamsData);
        console.log('Teams count:', teamsData.length);
        
        // If we got very few teams, use fallback
        if (teamsData.length < 5) {
          console.log('Too few teams received, using fallback');
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
        console.error('Error fetching teams:', err);
        
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
        
        console.log('Using sample teams as fallback');
        setTeams(sampleTeams);
      } finally {
        setTeamsLoading(false);
      }
    };
    
    fetchTeams();
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ml/predict/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team1_id: parseInt(formData.team1_id),
          team2_id: parseInt(formData.team2_id),
          venue: formData.venue,
          season: parseInt(formData.season)
        })
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const venues = [
    "Wankhede Stadium",
    "M Chinnaswamy Stadium",
    "Eden Gardens",
    "Arun Jaitley Stadium",
    "MA Chidambaram Stadium",
    "Rajiv Gandhi International Stadium",
    "Punjab Cricket Association Stadium",
    "Sawai Mansingh Stadium",
    "Narendra Modi Stadium"
  ];

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Target className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Match Predictor</h1>
            <p className="text-purple-100 text-sm sm:text-base mt-1">AI-Powered Match Outcome Predictions</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
          <p className="text-sm sm:text-base">🤖 Using machine learning to predict match winners based on historical data, team performance, venue stats, and player form.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Form */}
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Match Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="team1" className="flex items-center gap-2">
                  <span className="font-semibold">Team 1</span>
                </Label>
                {!teamsLoading && teams.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTeamsLoading(true);
                      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teams`)
                        .then(res => res.json())
                        .then(data => {
                          console.log('Retry teams data:', data);
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
                        })
                        .catch(err => console.error('Retry failed:', err))
                        .finally(() => setTeamsLoading(false));
                    }}
                    className="text-xs px-2 py-1"
                  >
                    Load All Teams
                  </Button>
                )}
              </div>
              <Select onValueChange={(value) => setFormData({...formData, team1_id: value})}>
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
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
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
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
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">Venue</span>
              </Label>
              <Select onValueChange={(value) => setFormData({...formData, venue: value})}>
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Select Venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue} value={venue}>
                      {venue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">Season</span>
              </Label>
              <Input
                id="season"
                type="number"
                placeholder="2025"
                value={formData.season}
                onChange={(e) => setFormData({...formData, season: e.target.value})}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>

            <Button 
              onClick={handlePredict}
              disabled={loading || !formData.team1_id || !formData.team2_id || !formData.venue}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Predicting...</>
              ) : (
                <><Target className="w-5 h-5 mr-2" /> Predict Winner</>
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

        {/* Prediction Results */}
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {!prediction ? (
              <div className="text-center py-12 sm:py-20">
                <Target className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Enter match details and click "Predict Winner" to see AI predictions</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Winner */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 sm:p-6 border-2 border-green-300">
                  <div className="text-center">
                    <p className="text-sm text-green-700 font-semibold mb-2">🏆 Predicted Winner</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-green-800">{prediction.predicted_winner}</h3>
                  </div>
                </div>

                {/* Win Probabilities */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-2 border-blue-200 text-center">
                    <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-1">Team 1</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-800">
                      {(prediction.team1_win_probability * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border-2 border-orange-200 text-center">
                    <p className="text-xs sm:text-sm text-orange-700 font-semibold mb-1">Team 2</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-800">
                      {(prediction.team2_win_probability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Confidence */}
                <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border-2 border-purple-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm text-purple-700 font-semibold">Confidence Score</span>
                    <span className="text-lg sm:text-xl font-bold text-purple-800">
                      {(prediction.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 sm:h-3">
                    <div 
                      className="bg-purple-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                      style={{ width: `${prediction.confidence_score * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Key Factors */}
                {prediction.key_factors && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Key Factors:</p>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      {prediction.key_factors.venue && (
                        <p><strong>Venue:</strong> {prediction.key_factors.venue}</p>
                      )}
                      {prediction.key_factors.team1_historical_rate && (
                        <p><strong>Team 1 Win Rate:</strong> {(prediction.key_factors.team1_historical_rate * 100).toFixed(1)}%</p>
                      )}
                      {prediction.key_factors.team2_historical_rate && (
                        <p><strong>Team 2 Win Rate:</strong> {(prediction.key_factors.team2_historical_rate * 100).toFixed(1)}%</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Model Info */}
                {prediction.model_version && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 text-xs sm:text-sm text-gray-600">
                    <p><strong>Model:</strong> {prediction.model_version}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">📊 Historical Data</h3>
            <p className="text-xs sm:text-sm text-blue-700">Analyzes past matches, head-to-head records, and team performance trends.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-green-800 mb-2 text-sm sm:text-base">🏟️ Venue Analysis</h3>
            <p className="text-xs sm:text-sm text-green-700">Considers venue-specific factors like pitch conditions and home advantage.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-purple-800 mb-2 text-sm sm:text-base">🎯 Player Form</h3>
            <p className="text-xs sm:text-sm text-purple-700">Evaluates current player form and team composition for accurate predictions.</p>
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
