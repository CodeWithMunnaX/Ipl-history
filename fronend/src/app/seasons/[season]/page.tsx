"use client"

import AppSidebar from "@/components/AppSidebar";
import ContactSupport from "@/components/ContactSupport";
import { useParams } from "next/navigation";
import React, { useMemo } from "react";
import {
  useGetSeasonMatchesQuery,
  useGetSeasonTopBatsmenQuery,
  useGetSeasonTopBowlersQuery,
  useGetSeasonWinnersQuery,
} from "@/lib/services/iplApi";
import { useGetPlayersQuery, useGetTeamsQuery } from "@/lib/services/iplApi";
import AvatarImage from "@/components/AvatarImage";
import Image from "next/image";
import { normalizePlayerImage } from "@/lib/utils";

export default function SeasonDetailsPage() {
  const params = useParams<{ season: string }>();
  const season = params?.season as string;
  const { data: winners } = useGetSeasonWinnersQuery(season, { skip: !season });
  const { data: batsmen } = useGetSeasonTopBatsmenQuery(season, { skip: !season });
  const { data: bowlers } = useGetSeasonTopBowlersQuery(season, { skip: !season });
  const { data: matches } = useGetSeasonMatchesQuery(season, { skip: !season });
  const { data: players } = useGetPlayersQuery();
  const { data: teams } = useGetTeamsQuery();

  const playerNameToImg: Record<string, string> = useMemo(() => {
    return (players || []).reduce(
      (acc: Record<string, string>, p: any) => {
        const key = (p.player_name || p.name || "").toLowerCase();
        if (key && p.player_image) {
          const normalizedImg = normalizePlayerImage(p.player_image);
          if (normalizedImg) acc[key] = normalizedImg;
        }
        return acc;
      },
      {}
    );
  }, [players]);

  const teamNameToLogo: Record<string, string> = useMemo(() => {
    return (teams || []).reduce(
      (acc: Record<string, string>, t: any) => {
        const key = (t.team_name || t.name || "").toLowerCase();
        if (key) acc[key] = t.image_url || t.logo;
        return acc;
      },
      {}
    );
  }, [teams]);

  // Enhanced team mapping with common variations
  const getTeamLogo = (teamName: string) => {
    if (!teamName || teamName === "Unknown Team") return null;
    
    const variations = [
      teamName.toLowerCase(),
      teamName.toLowerCase().replace(/\s+/g, ''),
      teamName.toLowerCase().replace(/[^a-z]/g, ''),
    ];
    
    for (const variation of variations) {
      if (teamNameToLogo[variation]) {
        return teamNameToLogo[variation];
      }
    }
    
    // Fallback to common team mappings with better logos
    const commonMappings: Record<string, string> = {
      'rajasthan royals': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340005.png',
      'chennai super kings': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340003.png',
      'mumbai indians': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340004.png',
      'kolkata knight riders': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340006.png',
      'royal challengers bangalore': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340002.png',
      'delhi capitals': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340007.png',
      'punjab kings': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340008.png',
      'sunrisers hyderabad': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340009.png',
      'gujarat titans': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340010.png',
      'lucknow super giants': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340011.png',
      'deccan chargers': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340012.png',
      'rising pune supergiant': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340013.png',
      'kings xi punjab': 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/340000/340008.png',
    };
    
    return commonMappings[teamName.toLowerCase()] || null;
  };

  // Get proper team name with fallback
  const getTeamName = (teamName: string) => {
    if (!teamName || teamName === "Unknown Team" || teamName.trim() === "") {
      return "Team Not Found";
    }
    return teamName.trim();
  };

  // Debug function to check team data
  const debugTeamData = () => {
    console.log("Teams data:", teams);
    console.log("Team name to logo mapping:", teamNameToLogo);
    if (batsmen && batsmen.length > 0) {
      console.log("First batsman team data:", batsmen[0]);
    }
    if (matches && (matches as any).matches && (matches as any).matches.length > 0) {
      console.log("First match data:", (matches as any).matches[0]);
    }
  };

  // Dynamic data calculation from matches
  const getSeasonData = (season: string, matchesData: any) => {
    const seasonData: Record<string, any> = {
      "2008": { champion: "Rajasthan Royals", runnerUp: "Chennai Super Kings", totalMatches: 58 },
      "2009": { champion: "Deccan Chargers", runnerUp: "Royal Challengers Bangalore", totalMatches: 59 },
      "2010": { champion: "Chennai Super Kings", runnerUp: "Mumbai Indians", totalMatches: 60 },
      "2011": { champion: "Chennai Super Kings", runnerUp: "Royal Challengers Bangalore", totalMatches: 74 },
      "2012": { champion: "Kolkata Knight Riders", runnerUp: "Chennai Super Kings", totalMatches: 76 },
      "2013": { champion: "Mumbai Indians", runnerUp: "Chennai Super Kings", totalMatches: 76 },
      "2014": { champion: "Kolkata Knight Riders", runnerUp: "Kings XI Punjab", totalMatches: 60 },
      "2015": { champion: "Mumbai Indians", runnerUp: "Chennai Super Kings", totalMatches: 60 },
      "2016": { champion: "Sunrisers Hyderabad", runnerUp: "Royal Challengers Bangalore", totalMatches: 60 },
      "2017": { champion: "Mumbai Indians", runnerUp: "Rising Pune Supergiant", totalMatches: 60 },
      "2018": { champion: "Chennai Super Kings", runnerUp: "Sunrisers Hyderabad", totalMatches: 60 },
      "2019": { champion: "Mumbai Indians", runnerUp: "Chennai Super Kings", totalMatches: 60 },
      "2020": { champion: "Mumbai Indians", runnerUp: "Delhi Capitals", totalMatches: 60 },
      "2021": { champion: "Chennai Super Kings", runnerUp: "Kolkata Knight Riders", totalMatches: 60 },
      "2022": { champion: "Gujarat Titans", runnerUp: "Rajasthan Royals", totalMatches: 74 },
      "2023": { champion: "Chennai Super Kings", runnerUp: "Gujarat Titans", totalMatches: 74 },
      "2024": { champion: "Kolkata Knight Riders", runnerUp: "Sunrisers Hyderabad", totalMatches: 74 },
      "2025": { champion: "Royal Challengers Bangalore", runnerUp: "Kings XI Punjab", totalMatches: 74 }
    };

    // Use API data if available, otherwise fallback to hardcoded
    if (matchesData && matchesData.total_matches) {
      return {
        ...seasonData[season],
        totalMatches: matchesData.total_matches
      };
    }
    
    return seasonData[season] || { champion: "TBD", runnerUp: "TBD", totalMatches: 0 };
  };

  // Calculate team wins from matches data
  const getTeamWins = (matchesData: any) => {
    if (!matchesData || !matchesData.matches) return {};
    
    const teamWins: Record<string, number> = {};
    matchesData.matches.forEach((match: any) => {
      const winner = match.match_winner || match.winner;
      if (winner) {
        teamWins[winner] = (teamWins[winner] || 0) + 1;
      }
    });
    
    return teamWins;
  };

  const seasonInfo = getSeasonData(season, matches);
  const teamWins = getTeamWins(matches);

  // Debug team data on component mount
  React.useEffect(() => {
    debugTeamData();
  }, [teams, batsmen, matches]);

  return (
    <AppSidebar>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Season {season}</h1>
            <p className="text-gray-600 text-lg">IPL {season} Statistics and Performance</p>
          </div>

          {/* Champion Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Champion */}
            <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-300/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <div className="text-5xl mb-3">🏆</div>
                <div className="text-xl font-bold mb-3">Champion</div>
                
                <div className="flex flex-col items-center gap-3 mb-4">
                  {getTeamLogo(seasonInfo.champion) && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image 
                        src={getTeamLogo(seasonInfo.champion)!} 
                        alt={seasonInfo.champion} 
                        width={64} 
                        height={64} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <div className="text-2xl font-bold text-center">{getTeamName(seasonInfo.champion)}</div>
                </div>
                
                <div className="text-yellow-100 text-sm font-medium">Winners of IPL {season}</div>
              </div>
            </div>

            {/* Runner Up */}
            <div className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-300/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <div className="text-5xl mb-3">🥈</div>
                <div className="text-xl font-bold mb-3">Runner Up</div>
                
                <div className="flex flex-col items-center gap-3 mb-4">
                  {getTeamLogo(seasonInfo.runnerUp) && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image 
                        src={getTeamLogo(seasonInfo.runnerUp)!} 
                        alt={seasonInfo.runnerUp} 
                        width={64} 
                        height={64} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <div className="text-2xl font-bold text-center">{getTeamName(seasonInfo.runnerUp)}</div>
                </div>
                
                <div className="text-gray-100 text-sm font-medium">Finalists of IPL {season}</div>
              </div>
            </div>

            {/* Total Matches */}
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <div className="text-5xl mb-3">⚽</div>
                <div className="text-xl font-bold mb-3">Total Matches</div>
                <div className="text-4xl font-bold mb-4">{seasonInfo.totalMatches}</div>
                <div className="text-blue-100 text-sm font-medium">Matches in IPL {season}</div>
              </div>
            </div>
          </div>

          {/* Top Batsmen Section */}
          {Array.isArray(batsmen) && batsmen.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🏏 Top Batsmen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {batsmen.slice(0, 12).map((b: any, idx: number) => {
                  const name = b.player_name ?? b.name ?? "";
                  const runs = b.total_runs ?? b.runs ?? 0;
                  const rawTeamName = b.team_name || b.team || "";
                  const teamName = getTeamName(rawTeamName);
                  const teamLogo = getTeamLogo(teamName);
                  const img = playerNameToImg[name.toLowerCase()];
                  
                  // Debug individual player data
                  console.log(`Player ${name}:`, {
                    rawTeamName,
                    teamName,
                    hasLogo: !!teamLogo,
                    playerData: b
                  });
                  
                  return (
                    <div key={`${name}-${idx}`} className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                      
                      {/* Rank Badge */}
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {idx + 1}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{runs.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 font-medium">RUNS</div>
                        </div>
                      </div>
                      
                      {/* Player Info */}
                      <div className="text-center relative z-10">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white">
                          <AvatarImage src={img} alt={name} width={80} height={80} className="w-full h-full object-cover" />
                        </div>
                        
                        <h4 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-green-600 transition-colors">
                          {name}
                        </h4>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4 relative z-10">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                            style={{ width: `${Math.min(100, (runs / (batsmen[0]?.total_runs || batsmen[0]?.runs || 1)) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {Math.round((runs / (batsmen[0]?.total_runs || batsmen[0]?.runs || 1)) * 100)}% of top scorer
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Bowlers Section */}
          {Array.isArray(bowlers) && bowlers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🎯 Top Bowlers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {bowlers.slice(0, 12).map((b: any, idx: number) => {
                  const name = b.player_name ?? b.name ?? "";
                  const wickets = b.total_wickets ?? b.wickets ?? 0;
                  const rawTeamName = b.team_name || b.team || "";
                  const teamName = getTeamName(rawTeamName);
                  const teamLogo = getTeamLogo(teamName);
                  const img = playerNameToImg[name.toLowerCase()];
                  
                  // Debug individual bowler data
                  console.log(`Bowler ${name}:`, {
                    rawTeamName,
                    teamName,
                    hasLogo: !!teamLogo,
                    bowlerData: b
                  });
                  
                  return (
                    <div key={`${name}-${idx}`} className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                      
                      {/* Rank Badge */}
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {idx + 1}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">{wickets}</div>
                          <div className="text-xs text-gray-500 font-medium">WICKETS</div>
                        </div>
                      </div>
                      
                      {/* Player Info */}
                      <div className="text-center relative z-10">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white">
                          <AvatarImage src={img} alt={name} width={80} height={80} className="w-full h-full object-cover" />
                        </div>
                        
                        <h4 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-red-600 transition-colors">
                          {name}
                        </h4>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4 relative z-10">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-orange-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                            style={{ width: `${Math.min(100, (wickets / (bowlers[0]?.total_wickets || bowlers[0]?.wickets || 1)) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {Math.round((wickets / (bowlers[0]?.total_wickets || bowlers[0]?.wickets || 1)) * 100)}% of top bowler
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matches Section */}
          {matches && (matches as any).matches && (matches as any).matches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">⚽ Recent Matches</h3>
              <div className="grid gap-4">
                {((matches as any).matches || []).slice(0, 15).map((m: any, idx: number) => {
                  const rawTeam1 = m.team1 || "";
                  const rawTeam2 = m.team2 || "";
                  const rawWinner = m.match_winner || m.winner || "";
                  
                  const team1 = getTeamName(rawTeam1);
                  const team2 = getTeamName(rawTeam2);
                  const winner = getTeamName(rawWinner);
                  const date = m.date || m.match_date;
                  
                  // Debug match data
                  console.log(`Match ${idx + 1}:`, {
                    rawTeam1,
                    rawTeam2,
                    rawWinner,
                    team1,
                    team2,
                    winner,
                    matchData: m
                  });
                  
                  return (
                    <div key={m.match_id || m.id || idx} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
                      
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6">
                          <div className="text-sm text-gray-500 font-medium min-w-[80px] bg-gray-100 rounded-full px-3 py-1">
                            {date ? new Date(date).toLocaleDateString() : "TBD"}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                {getTeamLogo(team1) && (
                                  <Image 
                                    src={getTeamLogo(team1)!} 
                                    alt={team1} 
                                    width={24} 
                                    height={24} 
                                    className="rounded-full border border-gray-300" 
                                  />
                                )}
                                <div className="font-semibold text-gray-800 text-lg">{team1}</div>
                              </div>
                              <div className="text-xs text-gray-500">Team 1</div>
                            </div>
                            <div className="text-2xl font-bold text-gray-400">VS</div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                {getTeamLogo(team2) && (
                                  <Image 
                                    src={getTeamLogo(team2)!} 
                                    alt={team2} 
                                    width={24} 
                                    height={24} 
                                    className="rounded-full border border-gray-300" 
                                  />
                                )}
                                <div className="font-semibold text-gray-800 text-lg">{team2}</div>
                              </div>
                              <div className="text-xs text-gray-500">Team 2</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <div className="font-bold text-green-600 text-lg">
                              {winner}
                            </div>
                            {winner && getTeamLogo(winner) && (
                              <Image 
                                src={getTeamLogo(winner)!} 
                                alt={winner} 
                                width={20} 
                                height={20} 
                                className="rounded-full border border-gray-300" 
                              />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">WINNER</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <ContactSupport />
      </div>
    </AppSidebar>
  );
}



