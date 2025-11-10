"use client"

import { useState } from 'react';
import { Brain, Activity, Loader2, TrendingUp, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ContactSupport from "@/components/ContactSupport";
import AppSidebar from "@/components/AppSidebar";

export default function WinProbability() {
  const [loading, setLoading] = useState(false);
  const [probability, setProbability] = useState<any>(null);
  const [formData, setFormData] = useState({
    match_id: '',
    current_innings: '2',
    current_over: '',
    current_score: '',
    wickets_fallen: '',
    target: ''
  });

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ml/win-probability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: parseInt(formData.match_id),
          current_innings: parseInt(formData.current_innings),
          current_over: parseFloat(formData.current_over),
          current_score: parseInt(formData.current_score),
          wickets_fallen: parseInt(formData.wickets_fallen),
          target: parseInt(formData.target)
        })
      });
      const data = await response.json();
      setProbability(data);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSidebar>
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Win Probability</h1>
            <p className="text-purple-100 text-sm sm:text-base mt-1">Real-Time Match Outcome Analysis</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
          <p className="text-sm sm:text-base">🧠 Calculate live win probabilities during matches using current match situation, required run rate, and historical patterns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Form */}
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
            <CardTitle className="text-purple-800 flex items-center gap-2 text-base sm:text-lg">
              <Activity className="w-5 h-5" />
              Match Situation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matchId">Match ID</Label>
              <Input
                id="matchId"
                type="number"
                placeholder="e.g., 335982"
                value={formData.match_id}
                onChange={(e) => setFormData({...formData, match_id: e.target.value})}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="innings">Innings</Label>
                <Input
                  id="innings"
                  type="number"
                  placeholder="2"
                  value={formData.current_innings}
                  onChange={(e) => setFormData({...formData, current_innings: e.target.value})}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="over">Current Over</Label>
                <Input
                  id="over"
                  type="number"
                  step="0.1"
                  placeholder="15.3"
                  value={formData.current_over}
                  onChange={(e) => setFormData({...formData, current_over: e.target.value})}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Current Score</Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="142"
                  value={formData.current_score}
                  onChange={(e) => setFormData({...formData, current_score: e.target.value})}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wickets">Wickets</Label>
                <Input
                  id="wickets"
                  type="number"
                  placeholder="4"
                  value={formData.wickets_fallen}
                  onChange={(e) => setFormData({...formData, wickets_fallen: e.target.value})}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                type="number"
                placeholder="180"
                value={formData.target}
                onChange={(e) => setFormData({...formData, target: e.target.value})}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>

            <Button 
              onClick={handleCalculate}
              disabled={loading || !formData.match_id || !formData.current_over || !formData.current_score || !formData.target}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Calculating...</>
              ) : (
                <><Brain className="w-5 h-5 mr-2" /> Calculate Probability</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Probability Results */}
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
            <CardTitle className="text-purple-800 flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-5 h-5" />
              Win Probability
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {!probability ? (
              <div className="text-center py-12 sm:py-20">
                <Brain className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Enter match situation to calculate win probability</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Main Probability */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 sm:p-6">
                  <div className="text-center">
                    <p className="text-sm sm:text-base opacity-90 mb-2">Batting Team Win Probability</p>
                    <h2 className="text-4xl sm:text-6xl font-bold">
                      {(probability.batting_team_win_probability * 100).toFixed(1)}%
                    </h2>
                  </div>
                  <div className="mt-4 bg-white/20 rounded-full h-3 sm:h-4 overflow-hidden">
                    <div 
                      className="bg-white h-full transition-all duration-500 rounded-full"
                      style={{ width: `${probability.batting_team_win_probability * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Match Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-blue-700 font-semibold">Required RR</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-800 mt-1">
                        {probability.required_run_rate?.toFixed(2) || 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-green-700 font-semibold">Runs Needed</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-800 mt-1">
                        {probability.runs_required || 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-orange-700 font-semibold">Balls Left</p>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-800 mt-1">
                        {probability.balls_remaining || 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <p className="text-xs sm:text-sm text-red-700 font-semibold">Wickets Left</p>
                      <p className="text-2xl sm:text-3xl font-bold text-red-800 mt-1">
                        {probability.wickets_in_hand || 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Match Status */}
                {probability.match_status && (
                  <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border-2 border-purple-200 text-center">
                    <p className="text-xs sm:text-sm text-purple-700 font-semibold mb-1">Match Status</p>
                    <p className="text-base sm:text-lg font-bold text-purple-800">{probability.match_status}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-indigo-800 mb-2 text-sm sm:text-base">🎯 Real-Time Analysis</h3>
            <p className="text-xs sm:text-sm text-indigo-700">Updates probability based on current match situation and required run rate.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-purple-800 mb-2 text-sm sm:text-base">📊 Historical Patterns</h3>
            <p className="text-xs sm:text-sm text-purple-700">Uses thousands of past matches to predict outcomes accurately.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold text-pink-800 mb-2 text-sm sm:text-base">⚡ Dynamic Updates</h3>
            <p className="text-xs sm:text-sm text-pink-700">Probability changes with every ball, reflecting the match momentum.</p>
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

