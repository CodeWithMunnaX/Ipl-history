"use client"

import AppSidebar from "@/components/AppSidebar";
import ContactSupport from "@/components/ContactSupport";
import { useGetOverallTeamStandingsQuery, useGetOverallTopBatsmenQuery, useGetOverallTopBowlersQuery, useGetTeamsQuery, useGetPlayersQuery } from "@/lib/services/iplApi";
import Image from "next/image";
import { normalizePlayerImage } from "@/lib/utils";
import AvatarImage from "@/components/AvatarImage";
import { useMemo } from "react";

export default function OverallPage() {
  const { data: standings } = useGetOverallTeamStandingsQuery();
  const { data: topBatsmen } = useGetOverallTopBatsmenQuery();
  const { data: topBowlers } = useGetOverallTopBowlersQuery();
  const { data: teams } = useGetTeamsQuery();
  const { data: players } = useGetPlayersQuery();

  // Create dynamic lookup maps for images that update when data changes
  const teamNameToLogo = useMemo(() => {
    return (teams || []).reduce((acc: any, team: any) => {
      const name = team.team_name || team.name;
      if (name) {
        acc[name.toLowerCase()] = team.image_url || team.logo;
      }
      return acc;
    }, {});
  }, [teams]);

  const teamShortToLogo = useMemo(() => {
    return (teams || []).reduce((acc: any, team: any) => {
      const short = team.team_name_short || team.short_name || team.code;
      if (short) {
        acc[short.toLowerCase()] = team.image_url || team.logo;
      }
      return acc;
    }, {});
  }, [teams]);

  const teamIdToInfo = useMemo(() => {
    return (teams || []).reduce((acc: any, team: any) => {
      const id = team.team_id || team.id;
      if (id) {
        acc[String(id)] = {
          name: team.team_name || team.name,
          logo: team.image_url || team.logo,
          short: team.team_name_short || team.short_name || team.code
        };
      }
      return acc;
    }, {});
  }, [teams]);

  const playerNameToImg = useMemo(() => {
    return (players || []).reduce((acc: any, player: any) => {
      const name = player.player_name || player.name;
      if (name) {
        acc[name.toLowerCase()] = player.player_image || player.image;
      }
      return acc;
    }, {});
  }, [players]);

  return (
    <AppSidebar>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">🏆 All-Time Records</h1>
            <p className="text-gray-600 text-xl">Complete IPL statistics across all seasons</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Batsmen */}
            {Array.isArray(topBatsmen) && topBatsmen.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    🏏 Top Batsmen (All-Time)
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {topBatsmen.map((p: any, idx: number) => {
                    const playerName = p.name ?? p.player_name;
                    const playerImage = normalizePlayerImage(playerNameToImg[playerName?.toLowerCase()]);
                    
                    return (
                      <div key={p.id ?? p.player_id ?? p.player_name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {idx + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            {playerImage && !playerImage.includes('placeholder') && !playerImage.includes('default') ? (
                              <img 
                                key={playerImage}
                                src={playerImage} 
                                alt={playerName} 
                                width={48} 
                                height={48} 
                                loading="eager"
                                decoding="async"
                                className="rounded-full border-2 border-green-300 block" 
                                onError={() => {
                                  console.log('Player image failed to load:', playerImage);
                                }}
                                onLoad={() => {
                                  console.log('Player image loaded successfully:', playerImage);
                                }}
                              />
                            ) : (
                              <AvatarImage 
                                key={`avatar-${playerImage}`}
                                src={playerImage} 
                                alt={playerName} 
                                width={48} 
                                height={48} 
                                className="rounded-full border-2 border-green-300" 
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">{playerName}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Runs</div>
                          <div className="text-2xl font-bold text-green-600">{p.runs ?? p.total_runs}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Bowlers */}
            {Array.isArray(topBowlers) && topBowlers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    🎯 Top Bowlers (All-Time)
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {topBowlers.map((p: any, idx: number) => {
                    const playerName = p.name ?? p.player_name;
                    const playerImage = normalizePlayerImage(playerNameToImg[playerName?.toLowerCase()]);
                    
                    return (
                      <div key={p.id ?? p.player_id ?? p.player_name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {idx + 1}
                          </div>
                          <div className="flex items-center gap-3">
                            {playerImage && !playerImage.includes('placeholder') && !playerImage.includes('default') ? (
                              <img 
                                key={playerImage}
                                src={playerImage} 
                                alt={playerName} 
                                width={48} 
                                height={48} 
                                loading="eager"
                                decoding="async"
                                className="rounded-full border-2 border-red-300 block" 
                                onError={() => {
                                  console.log('Player image failed to load:', playerImage);
                                }}
                                onLoad={() => {
                                  console.log('Player image loaded successfully:', playerImage);
                                }}
                              />
                            ) : (
                              <AvatarImage 
                                key={`avatar-${playerImage}`}
                                src={playerImage} 
                                alt={playerName} 
                                width={48} 
                                height={48} 
                                className="rounded-full border-2 border-red-300" 
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">{playerName}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Wickets</div>
                          <div className="text-2xl font-bold text-red-600">{p.wickets ?? p.total_wickets}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Team Standings */}
          {Array.isArray(standings) && standings.length > 0 && (
            <div className="mt-12">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    🏆 Team Standings (All-Time)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {standings.map((t: any, idx: number) => {
                      const teamName = t.name ?? t.team_name;
                      const teamLogo = 
                        teamNameToLogo[teamName?.toLowerCase()] ||
                        teamShortToLogo[teamName?.toLowerCase()] ||
                        (t.team_id && teamIdToInfo[String(t.team_id)]?.logo);
                      
                      return (
                        <div key={t.id ?? t.team_id ?? t.team_name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                              {idx + 1}
                            </div>
                            <div className="flex items-center gap-3">
                              {teamLogo && (
                                <Image 
                                  src={teamLogo} 
                                  alt={teamName} 
                                  width={32} 
                                  height={32} 
                                  className="rounded-full border border-blue-300" 
                                />
                              )}
                              <div className="font-semibold text-gray-900">{teamName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Points</div>
                            <div className="text-xl font-bold text-blue-600">{t.points ?? t.total_points ?? t.pts}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <ContactSupport />
      </div>
    </AppSidebar>
  );
}


