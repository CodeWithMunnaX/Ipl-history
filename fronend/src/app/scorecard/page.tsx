"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import MatchScorecard from '@/components/scorecard/MatchScorecard';
import SimpleScorecard from '@/components/scorecard/SimpleScorecard';
import LiveScore from '@/components/scorecard/LiveScore';
import AppSidebar from '@/components/AppSidebar';
import {
  useGetSeasonsQuery,
  useGetSeasonMatchesQuery,
} from '@/lib/services/iplApi';
import { useSearchParams } from 'next/navigation';

function ScorecardPageContent() {
  const searchParams = useSearchParams();
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [manualMatchId, setManualMatchId] = useState<string>("");

  const { data: seasons, isLoading: seasonsLoading } = useGetSeasonsQuery();
  const { data: matches, isLoading: matchesLoading } = useGetSeasonMatchesQuery(selectedSeason, {
    skip: !selectedSeason,
  });

  // Handle matchId from URL query parameter
  useEffect(() => {
    const matchIdFromUrl = searchParams.get('matchId');
    if (matchIdFromUrl) {
      setManualMatchId(matchIdFromUrl);
      setSelectedMatch(matchIdFromUrl);
      setSelectedSeason(""); // Clear season selection for manual input
    }
  }, [searchParams]);

  // Auto-select first season if available
  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeason) {
      setSelectedSeason(String(seasons[0]));
    }
  }, [seasons, selectedSeason]);

  // Auto-select first match if available
  useEffect(() => {
    if (matches && matches.length > 0 && !selectedMatch) {
      setSelectedMatch(String(matches[0].match_id || matches[0].id));
    }
  }, [matches, selectedMatch]);

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    setSelectedMatch(""); // Reset match selection
  };

  const handleMatchChange = (matchId: string) => {
    setSelectedMatch(matchId);
  };

  const handleManualMatchId = () => {
    if (manualMatchId.trim()) {
      setSelectedMatch(manualMatchId.trim());
      setSelectedSeason(""); // Clear season selection for manual input
    }
  };

  const currentMatchId = selectedMatch || manualMatchId;

  return (
    <AppSidebar>
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-2xl">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">🏏 IPL Match Scorecard</h1>
              <p className="text-blue-100 text-xs sm:text-sm md:text-base lg:text-lg px-2">Complete match analysis with season and match selection</p>
            </div>
          </div>

          {/* Selection Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Season & Match Selection */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-700 flex items-center gap-2 text-sm sm:text-base">
                  📅 Select Season & Match
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Season Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Select Season
                  </label>
                  {seasonsLoading ? (
                    <Skeleton className="h-8 sm:h-10 w-full" />
                  ) : (
                    <Select value={selectedSeason} onValueChange={handleSeasonChange}>
                      <SelectTrigger className="w-full h-8 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent className="z-50 max-h-64">
                        {seasons?.map((season: any) => (
                          <SelectItem key={season} value={String(season)} className="text-xs sm:text-sm">
                            {season}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Match Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Select Match
                  </label>
                  {matchesLoading ? (
                    <Skeleton className="h-8 sm:h-10 w-full" />
                  ) : (
                    <Select value={selectedMatch} onValueChange={handleMatchChange}>
                      <SelectTrigger className="w-full h-8 sm:h-10 text-xs sm:text-sm">
                        <SelectValue placeholder="Select Match" />
                      </SelectTrigger>
                      <SelectContent className="z-50 max-h-72">
                        {matches?.map((match: any) => (
                          <SelectItem key={match.match_id || match.id} value={String(match.match_id || match.id)} className="text-xs sm:text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-semibold text-xs sm:text-sm truncate">{match.team1} vs {match.team2}</span>
                              <Badge variant="secondary" className="text-xs w-fit">
                                {match.match_date || match.date}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedMatch && (
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs sm:text-sm text-green-800">
                      <strong>Selected Match ID:</strong> {selectedMatch}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manual Match ID Input */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-700 flex items-center gap-2 text-sm sm:text-base">
                  🔢 Enter Match ID Manually
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Match ID
                  </label>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <Input
                      type="text"
                      placeholder="e.g., 1473511"
                      value={manualMatchId}
                      onChange={(e) => setManualMatchId(e.target.value)}
                      className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                    />
                    <Button 
                      onClick={handleManualMatchId}
                      disabled={!manualMatchId.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                    >
                      Load
                    </Button>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  <p>💡 <strong>Tip:</strong> Use this if you have a specific match ID or want to test with sample data.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scorecard Tabs */}
          {currentMatchId && (
            <Tabs defaultValue="complete" className="space-y-3 sm:space-y-4 md:space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg text-xs sm:text-sm h-8 sm:h-10 md:h-12">
                <TabsTrigger value="complete" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2">
                  📊 <span className="hidden sm:inline">Complete Scorecard</span><span className="sm:hidden">Complete</span>
                </TabsTrigger>
                <TabsTrigger value="simple" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2">
                  📋 <span className="hidden sm:inline">Simple Summary</span><span className="sm:hidden">Simple</span>
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2">
                  🔴 <span className="hidden sm:inline">Live Score</span><span className="sm:hidden">Live</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="complete" className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm w-fit">
                    Match ID: {currentMatchId}
                  </Badge>
                  <span className="text-xs sm:text-sm text-gray-600">Complete batting, bowling, and over-by-over analysis</span>
                </div>
                <MatchScorecard matchId={currentMatchId} />
              </TabsContent>

              <TabsContent value="simple" className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs sm:text-sm w-fit">
                    Match ID: {currentMatchId}
                  </Badge>
                  <span className="text-xs sm:text-sm text-gray-600">Quick match summary with key statistics</span>
                </div>
                <SimpleScorecard matchId={currentMatchId} />
              </TabsContent>

              <TabsContent value="live" className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
                  <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs sm:text-sm w-fit">
                    Match ID: {currentMatchId}
                  </Badge>
                  <span className="text-xs sm:text-sm text-gray-600">Live score simulation with current players</span>
                </div>
                <LiveScore matchId={currentMatchId} autoRefresh={true} refreshInterval={5000} />
              </TabsContent>
            </Tabs>
          )}

          {/* Instructions */}
          {!currentMatchId && (
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-800 flex items-center gap-2 text-sm sm:text-base">
                  📖 How to Use
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl mb-2">1️⃣</div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Select Season</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Choose a season from the dropdown to see all matches</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl mb-2">2️⃣</div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Select Match</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Pick a match from the season to view its scorecard</p>
                  </div>
                  <div className="text-center sm:col-span-2 lg:col-span-1">
                    <div className="text-2xl sm:text-3xl mb-2">3️⃣</div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">View Analysis</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Switch between Complete, Simple, and Live score tabs</p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 text-xs sm:text-sm">🎯 Sample Match IDs for Testing:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                    <div className="bg-white p-2 rounded border text-center">1473511</div>
                    <div className="bg-white p-2 rounded border text-center">1234567</div>
                    <div className="bg-white p-2 rounded border text-center">9876543</div>
                    <div className="bg-white p-2 rounded border text-center">5555555</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppSidebar>
  );
}

export default function ScorecardPage() {
  return (
    <Suspense fallback={
      <AppSidebar>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading scorecard...</p>
            </div>
          </div>
        </div>
      </AppSidebar>
    }>
      <ScorecardPageContent />
    </Suspense>
  );
}
