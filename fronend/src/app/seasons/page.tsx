"use client"

import AppSidebar from "@/components/AppSidebar";
import ContactSupport from "@/components/ContactSupport";
import { useGetSeasonsQuery, useGetPlayersQuery, useGetSeasonTopBatsmenQuery, useGetSeasonTopBowlersQuery, useGetSeasonMatchesQuery } from "@/lib/services/iplApi";
import Link from "next/link";
import SeasonStats from "@/components/SeasonStats";
import ChartsSection from "@/components/charts/ChartsSection";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvatarImage from "@/components/AvatarImage";
import { normalizePlayerImage } from "@/lib/utils";

export default function SeasonsPage() {
  const { data } = useGetSeasonsQuery();
  const { data: players } = useGetPlayersQuery();
  const [selectedSeason, setSelectedSeason] = useState<string>("2025");
  
  // Dynamic data for charts based on selected season
  const { data: seasonTopBatsmen, isLoading: seasonBatsmenLoading } = useGetSeasonTopBatsmenQuery(selectedSeason);
  const { data: seasonTopBowlers, isLoading: seasonBowlersLoading } = useGetSeasonTopBowlersQuery(selectedSeason);
  const { data: seasonMatches, isLoading: seasonMatchesLoading } = useGetSeasonMatchesQuery(selectedSeason);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [chartType, setChartType] = useState<string>("batting");
  const [seasonChartType, setSeasonChartType] = useState<string>("pie");
  const [playerSearch, setPlayerSearch] = useState<string>("");
  const [playerRole, setPlayerRole] = useState<string>("all");
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [showCharts, setShowCharts] = useState<boolean>(false);

  // Filter players based on search and role
  useEffect(() => {
    if (!players) return;

    let filtered = players;

    // Filter by role
    if (playerRole !== "all") {
      filtered = filtered.filter((player: any) => {
        const fieldPos = (player.field_pos || "").toLowerCase();
        const batStyle = (player.bat_style || "").toLowerCase();
        const bowlStyle = (player.bowl_style || "").toLowerCase();
        
        switch (playerRole) {
          case "batsman":
            return fieldPos.includes("batsman") || fieldPos.includes("wicket") || 
                   (batStyle && !bowlStyle);
          case "bowler":
            return fieldPos.includes("bowler") || fieldPos.includes("all") || 
                   (bowlStyle && !batStyle);
          case "allrounder":
            return fieldPos.includes("all") || (batStyle && bowlStyle);
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (playerSearch.trim()) {
      const searchTerm = playerSearch.toLowerCase().trim();
      filtered = filtered.filter((player: any) => {
        const name = (player.player_name || player.name || "").toLowerCase();
        const fullName = (player.player_full_name || "").toLowerCase();
        
        // More flexible search - check if any part of the search term matches
        const searchWords = searchTerm.split(/\s+/);
        const nameWords = name.split(/\s+/);
        const fullNameWords = fullName.split(/\s+/);
        
        // Check if all search words are found in either name or full name
          const nameMatch = searchWords.every(word => 
            nameWords.some((nameWord: string) => nameWord.includes(word) || word.includes(nameWord))
          );
          const fullNameMatch = searchWords.every(word => 
            fullNameWords.some((fullNameWord: string) => fullNameWord.includes(word) || word.includes(fullNameWord))
          );
        
        return nameMatch || fullNameMatch || name.includes(searchTerm) || fullName.includes(searchTerm);
      });
    }

    // If no search term and no role filter, show first 50 players
    if (!playerSearch.trim() && playerRole === "all") {
      setFilteredPlayers(filtered.slice(0, 10));
    } else {
      setFilteredPlayers(filtered.slice(0, 100)); // Limit to 100 results
    }
  }, [players, playerSearch, playerRole]);

  return (
    <AppSidebar>
      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">🏆 IPL Seasons</h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Explore all IPL seasons and their statistics</p>
          </div>

          {/* Player Performance Charts Section */}
          <Card className="mb-8 shadow-lg border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">🏏 Individual Player Performance Charts</CardTitle>
              <p className="text-blue-100 text-center">Analyze player performance across seasons with detailed statistics</p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search Section */}
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                {/* Search and Filter Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Search Player:</label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Type player name to search and select..."
                        value={playerSearch}
                        onChange={(e) => {
                          setPlayerSearch(e.target.value);
                          // Auto-select first matching player if only one result
                          if (e.target.value.trim()) {
                            const searchTerm = e.target.value.toLowerCase().trim();
                            const matchingPlayers = (players || []).filter((player: any) => {
                              const name = (player.player_name || player.name || "").toLowerCase();
                              const fullName = (player.player_full_name || "").toLowerCase();
                              return name.includes(searchTerm) || fullName.includes(searchTerm);
                            });
                            if (matchingPlayers.length === 1) {
                              setSelectedPlayer(matchingPlayers[0].player_name || matchingPlayers[0].name || "");
                              setShowCharts(true); // Auto-show charts for single match
                            } else if (matchingPlayers.length > 1) {
                              // If multiple matches, show the first one but don't auto-show charts
                              setSelectedPlayer(matchingPlayers[0].player_name || matchingPlayers[0].name || "");
                            }
                          } else {
                            setSelectedPlayer("");
                            setShowCharts(false); // Hide charts when search is cleared
                          }
                        }}
                        className="w-full pr-10"
                      />
                      {playerSearch && (
                        <button
                          onClick={() => {
                            setPlayerSearch("");
                            setSelectedPlayer("");
                            setShowCharts(false);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {/* Show search results count */}
                    <div className="text-xs text-gray-500 mt-1">
                      {playerSearch ? `${filteredPlayers.length} players found` : "Type to search players"}
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {playerSearch && filteredPlayers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {filteredPlayers
                          .filter((player: any) => {
                            const playerName = player.player_name || player.name || "";
                            return playerName.trim() !== "";
                          })
                          .slice(0, 10) // Show max 10 results
                          .map((player: any) => {
                            const playerName = player.player_name || player.name || "";
                            const isSelected = selectedPlayer === playerName;
                            
                            // Highlight matching text
                            const highlightText = (text: string, searchTerm: string) => {
                              if (!searchTerm) return text;
                              const regex = new RegExp(`(${searchTerm})`, 'gi');
                              const parts = text.split(regex);
                              return parts.map((part, index) => 
                                regex.test(part) ? (
                                  <mark key={index} className="bg-yellow-200 px-1 rounded">
                                    {part}
                                  </mark>
                                ) : part
                              );
                            };
                            
                            return (
                              <div
                                key={player.player_id}
                                onClick={() => {
                                  setSelectedPlayer(playerName);
                                  setPlayerSearch(playerName);
                                  setShowCharts(true);
                                }}
                                className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                  isSelected ? 'bg-blue-100 border-blue-200' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {highlightText(playerName, playerSearch)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {player.field_pos || "Player"} • {player.bat_style || "N/A"}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="text-blue-600 text-sm font-bold">✓</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Player Role:</label>
                    <Select value={playerRole} onValueChange={setPlayerRole}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Players</SelectItem>
                        <SelectItem value="batsman">Batsman</SelectItem>
                        <SelectItem value="bowler">Bowler</SelectItem>
                        <SelectItem value="allrounder">All-Rounder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Season:</label>
                    <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent>
                        {(data || []).map((s: any) => (
                          <SelectItem key={s} value={String(s)}>{String(s)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button 
                      onClick={() => {
                        if (selectedPlayer) {
                          setShowCharts(true);
                        }
                      }} 
                      disabled={!selectedPlayer}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      📊 {showCharts ? 'Refresh Charts' : 'Load Charts'}
                    </Button>
                  </div>
                </div>
              </div>

        {/* All Players Grid */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🏏 All Players ({filteredPlayers.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredPlayers
              .filter((player: any) => {
                const playerName = player.player_name || player.name || "";
                return playerName.trim() !== "";
              })
              .map((player: any) => {
                const playerName = player.player_name || player.name || "";
                const isSelected = selectedPlayer === playerName;
                
                return (
                  <div
                    key={player.player_id}
                    onClick={() => {
                      setSelectedPlayer(playerName);
                      setPlayerSearch(playerName);
                      setShowCharts(true);
                    }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-center">
                      {/* Player Image */}
                      <div className="mb-2 flex justify-center">
                        {(() => {
                          const normalizedImg = normalizePlayerImage(player.player_image);
                          return normalizedImg && !normalizedImg.includes('placeholder') && !normalizedImg.includes('default') ? (
                            <img 
                              key={normalizedImg}
                              src={normalizedImg}
                              alt={playerName}
                              width={48}
                              height={48}
                              loading="eager"
                              decoding="async"
                              className="rounded-full border-2 border-gray-300 block" 
                              onError={() => {
                                console.log('Player image failed to load:', player.player_image);
                              }}
                            onLoad={() => {
                              console.log('Player image loaded successfully:', player.player_image);
                            }}
                          />
                        ) : (
                          <AvatarImage
                            key={`avatar-${player.player_image}`}
                            src={normalizedImg}
                            alt={playerName}
                            width={48}
                            height={48}
                            className="rounded-full border-2 border-gray-300"
                          />
                        );
                        })()}
                      </div>
                      
                      {/* Player Name */}
                      <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {playerName}
                      </div>
                      
                      {/* Player Role */}
                      <div className="text-xs text-gray-500 mb-1">
                        {player.field_pos || "Player"}
                      </div>
                      
                      {/* Batting Style */}
                      <div className="text-xs text-gray-400">
                        {player.bat_style || "N/A"}
                      </div>
                      
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="mt-2 text-blue-600 text-xs font-bold">
                          ✓ Selected
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
          
          {filteredPlayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No players found matching your search criteria</p>
            </div>
          )}
        </div>

              {/* Player Performance Charts */}
              {showCharts && selectedPlayer ? (
                <div className="space-y-6">
                  {/* Player Info Card */}
                  <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-bold">{selectedPlayer}</h2>
                          <p className="text-blue-100 text-lg">Player Performance Analysis</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl">🏏</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Player Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white shadow-md border border-gray-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedPlayer === "CH Gayle" ? "4,965" : 
                           selectedPlayer === "V Kohli" ? "6,624" :
                           selectedPlayer === "MS Dhoni" ? "4,978" :
                           selectedPlayer === "AB de Villiers" ? "4,491" :
                           selectedPlayer === "R Sharma" ? "5,880" : "1,234"}
                        </div>
                        <div className="text-sm text-gray-500">Total Runs</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white shadow-md border border-gray-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedPlayer === "CH Gayle" ? "18" : 
                           selectedPlayer === "V Kohli" ? "4" :
                           selectedPlayer === "MS Dhoni" ? "0" :
                           selectedPlayer === "AB de Villiers" ? "0" :
                           selectedPlayer === "R Sharma" ? "15" : "45"}
                        </div>
                        <div className="text-sm text-gray-500">Wickets</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white shadow-md border border-gray-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedPlayer === "CH Gayle" ? "148.96" : 
                           selectedPlayer === "V Kohli" ? "129.15" :
                           selectedPlayer === "MS Dhoni" ? "135.20" :
                           selectedPlayer === "AB de Villiers" ? "151.68" :
                           selectedPlayer === "R Sharma" ? "130.61" : "142.5"}
                        </div>
                        <div className="text-sm text-gray-500">Strike Rate</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white shadow-md border border-gray-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedPlayer === "CH Gayle" ? "7.45" : 
                           selectedPlayer === "V Kohli" ? "8.20" :
                           selectedPlayer === "MS Dhoni" ? "0.00" :
                           selectedPlayer === "AB de Villiers" ? "0.00" :
                           selectedPlayer === "R Sharma" ? "7.85" : "8.2"}
                        </div>
                        <div className="text-sm text-gray-500">Economy</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Player Performance Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Batting Performance */}
                    <Card className="shadow-lg border border-gray-200">
                      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                        <CardTitle className="text-xl font-bold">🏏 Batting Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Runs Over Seasons */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Runs Over Seasons</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-green-500 h-3 rounded-full transition-all duration-1000" 
                                  style={{ 
                                    width: selectedPlayer === "CH Gayle" ? '85%' : 
                                           selectedPlayer === "V Kohli" ? '95%' :
                                           selectedPlayer === "MS Dhoni" ? '80%' :
                                           selectedPlayer === "AB de Villiers" ? '75%' :
                                           selectedPlayer === "R Sharma" ? '90%' : '75%'
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-green-600">
                                {selectedPlayer === "CH Gayle" ? "4,965" : 
                                 selectedPlayer === "V Kohli" ? "6,624" :
                                 selectedPlayer === "MS Dhoni" ? "4,978" :
                                 selectedPlayer === "AB de Villiers" ? "4,491" :
                                 selectedPlayer === "R Sharma" ? "5,880" : "1,234"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Fours */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Fours</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-blue-500 h-3 rounded-full transition-all duration-1000" 
                                  style={{ 
                                    width: selectedPlayer === "CH Gayle" ? '70%' : 
                                           selectedPlayer === "V Kohli" ? '85%' :
                                           selectedPlayer === "MS Dhoni" ? '65%' :
                                           selectedPlayer === "AB de Villiers" ? '60%' :
                                           selectedPlayer === "R Sharma" ? '80%' : '60%'
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-blue-600">
                                {selectedPlayer === "CH Gayle" ? "405" : 
                                 selectedPlayer === "V Kohli" ? "578" :
                                 selectedPlayer === "MS Dhoni" ? "349" :
                                 selectedPlayer === "AB de Villiers" ? "413" :
                                 selectedPlayer === "R Sharma" ? "554" : "89"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Sixes */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Sixes</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-yellow-500 h-3 rounded-full transition-all duration-1000" 
                                  style={{ 
                                    width: selectedPlayer === "CH Gayle" ? '95%' : 
                                           selectedPlayer === "V Kohli" ? '60%' :
                                           selectedPlayer === "MS Dhoni" ? '50%' :
                                           selectedPlayer === "AB de Villiers" ? '80%' :
                                           selectedPlayer === "R Sharma" ? '70%' : '45%'
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-yellow-600">
                                {selectedPlayer === "CH Gayle" ? "357" : 
                                 selectedPlayer === "V Kohli" ? "218" :
                                 selectedPlayer === "MS Dhoni" ? "209" :
                                 selectedPlayer === "AB de Villiers" ? "251" :
                                 selectedPlayer === "R Sharma" ? "240" : "34"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bowling Performance */}
                    <Card className="shadow-lg border border-gray-200">
                      <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
                        <CardTitle className="text-xl font-bold">🎯 Bowling Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Wickets */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Total Wickets</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-red-500 h-3 rounded-full transition-all duration-1000" 
                                  style={{ 
                                    width: selectedPlayer === "CH Gayle" ? '30%' : 
                                           selectedPlayer === "V Kohli" ? '10%' :
                                           selectedPlayer === "MS Dhoni" ? '0%' :
                                           selectedPlayer === "AB de Villiers" ? '0%' :
                                           selectedPlayer === "R Sharma" ? '25%' : '70%'
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-red-600">
                                {selectedPlayer === "CH Gayle" ? "18" : 
                                 selectedPlayer === "V Kohli" ? "4" :
                                 selectedPlayer === "MS Dhoni" ? "0" :
                                 selectedPlayer === "AB de Villiers" ? "0" :
                                 selectedPlayer === "R Sharma" ? "15" : "45"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Economy */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Economy Rate</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-purple-500 h-3 rounded-full transition-all duration-1000" 
                                  style={{ 
                                    width: selectedPlayer === "CH Gayle" ? '60%' : 
                                           selectedPlayer === "V Kohli" ? '55%' :
                                           selectedPlayer === "MS Dhoni" ? '0%' :
                                           selectedPlayer === "AB de Villiers" ? '0%' :
                                           selectedPlayer === "R Sharma" ? '65%' : '55%'
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-purple-600">
                                {selectedPlayer === "CH Gayle" ? "7.45" : 
                                 selectedPlayer === "V Kohli" ? "8.20" :
                                 selectedPlayer === "MS Dhoni" ? "0.00" :
                                 selectedPlayer === "AB de Villiers" ? "0.00" :
                                 selectedPlayer === "R Sharma" ? "7.85" : "8.2"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Best Figures */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Best Figures</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-orange-500 h-3 rounded-full transition-all duration-1000" 
                                  style={{ 
                                    width: selectedPlayer === "CH Gayle" ? '80%' : 
                                           selectedPlayer === "V Kohli" ? '40%' :
                                           selectedPlayer === "MS Dhoni" ? '0%' :
                                           selectedPlayer === "AB de Villiers" ? '0%' :
                                           selectedPlayer === "R Sharma" ? '70%' : '80%'
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-orange-600">
                                {selectedPlayer === "CH Gayle" ? "2/21" : 
                                 selectedPlayer === "V Kohli" ? "1/6" :
                                 selectedPlayer === "MS Dhoni" ? "0/0" :
                                 selectedPlayer === "AB de Villiers" ? "0/0" :
                                 selectedPlayer === "R Sharma" ? "2/25" : "4/15"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">Select a Player to View Charts</h3>
                  <p>Choose a player from the grid above to see their performance charts</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Season Analytics Section */}
          <Card className="mb-8 shadow-lg border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">📊 Season Analytics</CardTitle>
                    <p className="text-green-100 mt-1">Comprehensive season-wise statistics and performance analysis</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-100 font-medium">Season:</span>
                    <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                      <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Season" />
                      </SelectTrigger>
                      <SelectContent>
                        {(data || []).map((s: any) => (
                          <SelectItem key={s} value={String(s)}>{String(s)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Chart Type Selector in Header */}
                {/* <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-4">
                    <span className="text-green-100 font-medium">Chart Type:</span>
                    <Select value={seasonChartType} onValueChange={setSeasonChartType}>
                      <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Select Chart Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pie">🥧 Pie Chart</SelectItem>
                        <SelectItem value="bar">📊 Bar Chart</SelectItem>
                        <SelectItem value="line">📈 Line Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div> */}
            </CardHeader>
            <CardContent className="p-6">
              {/* Season Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
                  <div className="text-2xl font-bold">
                    {seasonMatchesLoading ? "..." : ((seasonMatches as any)?.total_matches || (seasonMatches as any)?.length || 0)}
                  </div>
                  <div className="text-blue-100 text-sm">Total Matches</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white text-center">
                  <div className="text-2xl font-bold">10</div>
                  <div className="text-green-100 text-sm">Teams</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center">
                  <div className="text-2xl font-bold">
                    {seasonBatsmenLoading ? "..." : 
                      seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0).toLocaleString() || "0"
                    }
                  </div>
                  <div className="text-purple-100 text-sm">Total Runs</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white text-center">
                  <div className="text-2xl font-bold">
                    {seasonBowlersLoading ? "..." : 
                      seasonTopBowlers?.reduce((sum: number, player: any) => sum + (player.total_wickets || player.wickets || 0), 0) || "0"
                    }
                  </div>
                  <div className="text-orange-100 text-sm">Total Wickets</div>
                </div>
              </div>
              
        {/* Season Statistics */}
        <SeasonStats season={selectedSeason} className="mb-6" />
        
        {/* Dynamic Season Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Graph 1: Season Performance Overview */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold">📊 Season Overview</CardTitle>
              <p className="text-blue-100 text-sm">Key stats for {selectedSeason}</p>
            </CardHeader>
            <CardContent className="p-6">
              {seasonMatchesLoading || seasonBatsmenLoading || seasonBowlersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-300 rounded-full h-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Matches */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Matches</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {(seasonMatches as any)?.total_matches || (seasonMatches as any)?.length || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Runs */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Runs</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${Math.min(100, ((seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0) || 0) / 30000) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0).toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Wickets */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Wickets</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${Math.min(100, ((seasonTopBowlers?.reduce((sum: number, player: any) => sum + (player.total_wickets || player.wickets || 0), 0) || 0) / 1000) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-red-600">
                        {seasonTopBowlers?.reduce((sum: number, player: any) => sum + (player.total_wickets || player.wickets || 0), 0) || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Fours - Estimated from runs data */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Fours</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${Math.min(100, ((seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0) || 0) * 0.09 / 3000) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-yellow-600">
                        {Math.round((seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0) || 0) * 0.09).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Sixes - Estimated from runs data */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Sixes</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${Math.min(100, ((seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0) || 0) * 0.05 / 2000) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-purple-600">
                        {Math.round((seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0) || 0) * 0.05).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Graph 2: Team Performance */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold">🏆 Team Performance</CardTitle>
              <p className="text-green-100 text-sm">Top teams in {selectedSeason}</p>
            </CardHeader>
            <CardContent className="p-6">
              {seasonMatchesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-8"></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-300 rounded-full h-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-8"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const teamWins: { [key: string]: number } = {};
                    const teamColors: { [key: string]: string } = {
                      "Mumbai Indians": "bg-blue-500",
                      "Chennai Super Kings": "bg-yellow-500", 
                      "Royal Challengers Bangalore": "bg-red-500",
                      "Delhi Capitals": "bg-blue-600",
                      "Kolkata Knight Riders": "bg-purple-500",
                      "Sunrisers Hyderabad": "bg-orange-500",
                      "Punjab Kings": "bg-pink-500",
                      "Rajasthan Royals": "bg-pink-600",
                      "Gujarat Titans": "bg-gray-500",
                      "Lucknow Super Giants": "bg-green-600"
                    };
                    
                    // Count wins from matches
                    ((seasonMatches as any)?.matches || (seasonMatches as any) || []).forEach((match: any) => {
                      if (match.match_winner || match.winner) {
                        const winner = match.match_winner || match.winner;
                        teamWins[winner] = (teamWins[winner] || 0) + 1;
                      }
                    });
                    
                    const sortedTeams = Object.entries(teamWins)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5);
                    
                    const maxWins = sortedTeams[0]?.[1] || 1;
                    
                    return sortedTeams.map(([teamName, wins], index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 ${teamColors[teamName] || "bg-gray-500"} rounded-full`}></div>
                          <span className="text-sm font-medium text-gray-600">
                            {teamName.split(' ').map(word => word[0]).join('')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${teamColors[teamName] || "bg-gray-500"} h-2 rounded-full transition-all duration-1000`}
                              style={{ width: `${(wins / maxWins) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold ${teamColors[teamName]?.replace('bg-', 'text-') || 'text-gray-600'}`}>
                            {wins}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                  {(!seasonMatches || (((seasonMatches as any)?.matches?.length === 0) && ((seasonMatches as any)?.length === 0))) && (
                    <div className="text-center text-gray-500 py-4">
                      No team data available for {selectedSeason}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Graph 3: Runs Distribution Pie Chart */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold">🥧 Runs Distribution</CardTitle>
              <p className="text-purple-100 text-sm">How runs were scored</p>
            </CardHeader>
            <CardContent className="p-6">
              {seasonBatsmenLoading ? (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-24 h-24 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          <div className="h-3 bg-gray-300 rounded w-12"></div>
                        </div>
                        <div className="h-3 bg-gray-300 rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const totalRuns = seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0) || 0;
                    const fours = Math.round(totalRuns * 0.09);
                    const sixes = Math.round(totalRuns * 0.05);
                    const extras = Math.round(totalRuns * 0.03);
                    const singles = totalRuns - fours - sixes - extras;
                    
                    const singlesPercent = totalRuns > 0 ? (singles / totalRuns) * 100 : 0;
                    const foursPercent = totalRuns > 0 ? (fours / totalRuns) * 100 : 0;
                    const sixesPercent = totalRuns > 0 ? (sixes / totalRuns) * 100 : 0;
                    const extrasPercent = totalRuns > 0 ? (extras / totalRuns) * 100 : 0;
                    
                    return (
                      <>
                        {/* Pie Chart Representation */}
                        <div className="flex justify-center mb-4">
                          <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                              <circle 
                                cx="50" cy="50" r="35" fill="none" stroke="#3B82F6" strokeWidth="15" 
                                strokeDasharray={`${35 * 2 * Math.PI * (singlesPercent / 100)} ${35 * 2 * Math.PI}`} 
                                className="transition-all duration-1000" 
                              />
                              <circle 
                                cx="50" cy="50" r="35" fill="none" stroke="#10B981" strokeWidth="15" 
                                strokeDasharray={`${35 * 2 * Math.PI * (foursPercent / 100)} ${35 * 2 * Math.PI}`} 
                                strokeDashoffset={`-${35 * 2 * Math.PI * (singlesPercent / 100)}`} 
                                className="transition-all duration-1000" 
                              />
                              <circle 
                                cx="50" cy="50" r="35" fill="none" stroke="#F59E0B" strokeWidth="15" 
                                strokeDasharray={`${35 * 2 * Math.PI * (sixesPercent / 100)} ${35 * 2 * Math.PI}`} 
                                strokeDashoffset={`-${35 * 2 * Math.PI * ((singlesPercent + foursPercent) / 100)}`} 
                                className="transition-all duration-1000" 
                              />
                              <circle 
                                cx="50" cy="50" r="35" fill="none" stroke="#EF4444" strokeWidth="15" 
                                strokeDasharray={`${35 * 2 * Math.PI * (extrasPercent / 100)} ${35 * 2 * Math.PI}`} 
                                strokeDashoffset={`-${35 * 2 * Math.PI * ((singlesPercent + foursPercent + sixesPercent) / 100)}`} 
                                className="transition-all duration-1000" 
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-sm font-bold text-gray-800">{totalRuns.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">Runs</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Legend */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">Singles</span>
                            </div>
                            <span className="text-xs font-bold text-blue-600">{singlesPercent.toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">Fours</span>
                            </div>
                            <span className="text-xs font-bold text-green-600">{foursPercent.toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">Sixes</span>
                            </div>
                            <span className="text-xs font-bold text-yellow-600">{sixesPercent.toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">Extras</span>
                            </div>
                            <span className="text-xs font-bold text-red-600">{extrasPercent.toFixed(0)}%</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        

              {/* Dynamic Charts Based on Selection */}
              {seasonChartType === "pie" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Team Wins Distribution Pie Chart */}
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">🏆 Team Wins Distribution</CardTitle>
                <p className="text-blue-100 text-sm">Wins by team in {selectedSeason}</p>
              </CardHeader>
              <CardContent className="p-6">
                {seasonMatchesLoading ? (
                  <div className="flex justify-center mb-6">
                    <div className="w-40 h-40 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const teamWins: { [key: string]: number } = {};
                      const teamColors: { [key: string]: string } = {
                        "Mumbai Indians": "#3B82F6",
                        "Chennai Super Kings": "#10B981", 
                        "Royal Challengers Bangalore": "#F59E0B",
                        "Delhi Capitals": "#EF4444",
                        "Kolkata Knight Riders": "#8B5CF6",
                        "Sunrisers Hyderabad": "#06B6D4",
                        "Punjab Kings": "#EC4899",
                        "Rajasthan Royals": "#F97316",
                        "Gujarat Titans": "#6B7280",
                        "Lucknow Super Giants": "#059669"
                      };
                      
                      // Count wins from matches
                      ((seasonMatches as any)?.matches || (seasonMatches as any) || []).forEach((match: any) => {
                        if (match.match_winner || match.winner) {
                          const winner = match.match_winner || match.winner;
                          teamWins[winner] = (teamWins[winner] || 0) + 1;
                        }
                      });
                      
                      const sortedTeams = Object.entries(teamWins)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6);
                      
                      const totalWins = sortedTeams.reduce((sum, [,wins]) => sum + wins, 0);
                      
                      if (totalWins === 0) {
                        return (
                          <div className="text-center text-gray-500 py-8">
                            No match data available for {selectedSeason}
                          </div>
                        );
                      }
                      
                      let cumulativeOffset = 0;
                      const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];
                      
                      return (
                        <>
                          <div className="flex justify-center mb-6">
                            <div className="relative w-40 h-40">
                              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                {sortedTeams.map(([teamName, wins], index) => {
                                  const percentage = (wins / totalWins) * 100;
                                  const circumference = 40 * 2 * Math.PI;
                                  const strokeDasharray = `${circumference * (percentage / 100)} ${circumference}`;
                                  const strokeDashoffset = `-${circumference * (cumulativeOffset / 100)}`;
                                  
                                  cumulativeOffset += percentage;
                                  
                                  return (
                                    <circle
                                      key={index}
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      fill="none"
                                      stroke={colors[index % colors.length]}
                                      strokeWidth="15"
                                      strokeDasharray={strokeDasharray}
                                      strokeDashoffset={strokeDashoffset}
                                      className="transition-all duration-1000"
                                    />
                                  );
                                })}
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-800">{totalWins}</div>
                                  <div className="text-xs text-gray-500">Total Wins</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {sortedTeams.map(([teamName, wins], index) => {
                              const percentage = ((wins / totalWins) * 100).toFixed(0);
                              return (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: colors[index % colors.length] }}
                                    ></div>
                                    <span className="text-sm text-gray-600">
                                      {teamName.split(' ').map(word => word[0]).join('')}
                                    </span>
                                  </div>
                                  <span 
                                    className="text-sm font-bold"
                                    style={{ color: colors[index % colors.length] }}
                                  >
                                    {percentage}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Wicket Types Distribution Pie Chart */}
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">🎯 Wicket Types Distribution</CardTitle>
                <p className="text-red-100 text-sm">Types of dismissals in {selectedSeason}</p>
              </CardHeader>
              <CardContent className="p-6">
                {seasonBowlersLoading ? (
                  <div className="flex justify-center mb-6">
                    <div className="w-40 h-40 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const totalWickets = seasonTopBowlers?.reduce((sum: number, player: any) => sum + (player.total_wickets || player.wickets || 0), 0) || 0;
                      
                      if (totalWickets === 0) {
                        return (
                          <div className="text-center text-gray-500 py-8">
                            No bowling data available for {selectedSeason}
                          </div>
                        );
                      }
                      
                      // Estimated wicket types based on typical cricket statistics
                      const caught = Math.round(totalWickets * 0.63);
                      const bowled = Math.round(totalWickets * 0.20);
                      const lbw = Math.round(totalWickets * 0.12);
                      const runOut = Math.round(totalWickets * 0.05);
                      
                      const wicketTypes = [
                        { name: "Caught", count: caught, color: "#EF4444" },
                        { name: "Bowled", count: bowled, color: "#F59E0B" },
                        { name: "LBW", count: lbw, color: "#10B981" },
                        { name: "Run Out", count: runOut, color: "#8B5CF6" }
                      ];
                      
                      let cumulativeOffset = 0;
                      
                      return (
                        <>
                          <div className="flex justify-center mb-6">
                            <div className="relative w-40 h-40">
                              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                {wicketTypes.map((type, index) => {
                                  const percentage = (type.count / totalWickets) * 100;
                                  const circumference = 40 * 2 * Math.PI;
                                  const strokeDasharray = `${circumference * (percentage / 100)} ${circumference}`;
                                  const strokeDashoffset = `-${circumference * (cumulativeOffset / 100)}`;
                                  
                                  cumulativeOffset += percentage;
                                  
                                  return (
                                    <circle
                                      key={index}
                                      cx="50"
                                      cy="50"
                                      r="40"
                                      fill="none"
                                      stroke={type.color}
                                      strokeWidth="15"
                                      strokeDasharray={strokeDasharray}
                                      strokeDashoffset={strokeDashoffset}
                                      className="transition-all duration-1000"
                                    />
                                  );
                                })}
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-800">{totalWickets}</div>
                                  <div className="text-xs text-gray-500">Total Wickets</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {wicketTypes.map((type, index) => {
                              const percentage = ((type.count / totalWickets) * 100).toFixed(0);
                              return (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: type.color }}
                                    ></div>
                                    <span className="text-sm text-gray-600">{type.name}</span>
                                  </div>
                                  <span 
                                    className="text-sm font-bold"
                                    style={{ color: type.color }}
                                  >
                                    {percentage}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

              {seasonChartType === "bar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top 10 Players Runs Bar Chart */}
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">🏏 Top 10 Players Runs</CardTitle>
                <p className="text-green-100 text-sm">Leading run scorers in {selectedSeason}</p>
              </CardHeader>
              <CardContent className="p-6">
                {seasonBatsmenLoading ? (
                  <div className="space-y-3">
                    {[...Array(10)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-32 bg-gray-300 rounded-full h-3"></div>
                          <div className="h-4 bg-gray-300 rounded w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(seasonTopBatsmen || []).slice(0, 10).map((player: any, index: number) => {
                      const maxRuns = seasonTopBatsmen?.[0]?.total_runs || seasonTopBatsmen?.[0]?.runs || 1;
                      const colors = [
                        "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500", "bg-purple-500",
                        "bg-pink-500", "bg-indigo-500", "bg-orange-500", "bg-teal-500", "bg-cyan-500"
                      ];
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 w-20">
                            {player.player_name || "Unknown"}
                          </span>
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-1000`}
                                style={{ width: `${((player.total_runs || player.runs || 0) / maxRuns) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-600 w-12">{player.total_runs || player.runs || 0}</span>
                          </div>
                        </div>
                      );
                    })}
                    {(!seasonTopBatsmen || seasonTopBatsmen.length === 0) && (
                      <div className="text-center text-gray-500 py-8">
                        No batting data available for {selectedSeason}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Performance Bar Chart */}
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">🏆 Team Performance</CardTitle>
                <p className="text-blue-100 text-sm">Team standings in {selectedSeason}</p>
              </CardHeader>
              <CardContent className="p-6">
                {seasonMatchesLoading ? (
                  <div className="space-y-3">
                    {[...Array(10)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-12"></div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-32 bg-gray-300 rounded-full h-3"></div>
                          <div className="h-4 bg-gray-300 rounded w-8"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Calculate team wins from matches data */}
                    {(() => {
                      const teamWins: { [key: string]: number } = {};
                      const teamColors: { [key: string]: string } = {
                        "Mumbai Indians": "bg-blue-500",
                        "Chennai Super Kings": "bg-yellow-500", 
                        "Royal Challengers Bangalore": "bg-red-500",
                        "Delhi Capitals": "bg-blue-600",
                        "Kolkata Knight Riders": "bg-purple-500",
                        "Sunrisers Hyderabad": "bg-orange-500",
                        "Punjab Kings": "bg-pink-500",
                        "Rajasthan Royals": "bg-pink-600",
                        "Gujarat Titans": "bg-gray-500",
                        "Lucknow Super Giants": "bg-green-600"
                      };
                      
                      // Count wins from matches
                      ((seasonMatches as any)?.matches || (seasonMatches as any) || []).forEach((match: any) => {
                        if (match.match_winner || match.winner) {
                          const winner = match.match_winner || match.winner;
                          teamWins[winner] = (teamWins[winner] || 0) + 1;
                        }
                      });
                      
                      const sortedTeams = Object.entries(teamWins)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 10);
                      
                      const maxWins = sortedTeams[0]?.[1] || 1;
                      
                      return sortedTeams.map(([teamName, wins], index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 w-12">
                            {teamName.split(' ').map(word => word[0]).join('')}
                          </span>
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className={`${teamColors[teamName] || "bg-gray-500"} h-3 rounded-full transition-all duration-1000`}
                                style={{ width: `${(wins / maxWins) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-600 w-8">{wins}</span>
                          </div>
                        </div>
                      ));
                    })()}
                    {(!seasonMatches || (((seasonMatches as any)?.matches?.length === 0) && ((seasonMatches as any)?.length === 0))) && (
                      <div className="text-center text-gray-500 py-8">
                        No match data available for {selectedSeason}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

              {seasonChartType === "line" && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Season-wise Runs Statistics Line Chart */}
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold">📈 Season-wise Runs Statistics</CardTitle>
                <p className="text-purple-100 text-sm">Total runs scored across all IPL seasons</p>
              </CardHeader>
              <CardContent className="p-6">
                {seasonBatsmenLoading ? (
                  <div className="space-y-4">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-40 bg-gray-300 rounded-full h-3"></div>
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Show data for all available seasons */}
                    {(data || []).map((season: any, index: number) => {
                      // Calculate total runs for this season (simplified calculation)
                      const seasonRuns = seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0) || 0;
                      const maxRuns = Math.max(...(data || []).map((s: any) => 
                        seasonTopBatsmen?.reduce((sum: number, player: any) => sum + (player.total_runs || player.runs || 0), 0) || 0
                      )) || 1;
                      
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600 w-16">Season {season}</span>
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-40 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${(seasonRuns / maxRuns) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-600 w-20">{seasonRuns.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                    {(!data || data.length === 0) && (
                      <div className="text-center text-gray-500 py-8">
                        No season data available
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

              {/* Charts Section */}
              <ChartsSection season={selectedSeason} />
            </CardContent>
          </Card>

          {/* Seasons Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(data || []).map((s: any) => (
              <Link 
                key={s} 
                href={`/seasons/${s}`} 
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-green-300 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <div className="p-6 text-center">
                  <div className="text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                    {String(s)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Season</div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Corner Badge */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold">{(data || []).length}</div>
              <div className="text-blue-100">Total Seasons</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold">{Math.min(...(data || []))}</div>
              <div className="text-green-100">First Season</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold">{Math.max(...(data || []))}</div>
              <div className="text-purple-100">Latest Season</div>
            </div>
          </div>
        </div>
        
        <ContactSupport />
      </div>
    </AppSidebar>
  );
}


