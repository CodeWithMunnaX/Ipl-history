"use client"

import AppSidebar from "@/components/AppSidebar";
import { useGetSeasonsQuery, useGetSeasonWinnersQuery, useGetSeasonTopBatsmenQuery, useGetSeasonTopBowlersQuery, useGetSeasonMatchesQuery, useGetPlayersQuery, useGetTeamsQuery, useGetPlayerByIdQuery } from "@/lib/services/iplApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AvatarImage from "@/components/AvatarImage";
import Image from "next/image";
import CricketHero, { CountUp } from "@/components/CricketHero";
import TeamLogo, { teamColor } from "@/components/TeamLogo";
import Link from "next/link";
import ChartsSection from "@/components/charts/ChartsSection";
import SeasonStats from "@/components/SeasonStats";
import orangeCapImage from "@/app/images/Orange Cap.png";
import purpleCapImage from "@/app/images/Purple Cap.png";
import { normalizePlayerImage } from "@/lib/utils";

// Component for Top Batsman Card with individual player data fetch
function TopBatsmanCard({ batsman, idx, img, name, runs, teamLogo }: any) {
  const playerId = batsman.player_id || batsman.id;
  const { data: playerData } = useGetPlayerByIdQuery(playerId, { skip: !playerId });
  
  // Use individual player data if available, otherwise fallback to batsman data
  const finalImg = playerData?.player_image || img;
  const normalizedImg = normalizePlayerImage(finalImg);
  
  return (
    <div className="border-2 rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 border-green-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 min-h-[200px]">
      <div className="flex flex-col sm:flex-row items-start h-full gap-4 sm:gap-6 lg:gap-8">
        {/* Player Image - Mobile: Left, Desktop: Left */}
        <div className="flex-shrink-0">
          <div className="relative h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] lg:h-[200px] lg:w-[200px] xl:h-[220px] xl:w-[220px]">
            <AvatarImage src={normalizedImg} alt={name} width={200} height={200} className="rounded-lg object-contain bg-white border-2 border-green-300 shadow-lg w-full h-full" />
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-green-500 text-white text-sm sm:text-base lg:text-lg px-2 py-1 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg">
              #{idx + 1}
            </div>
          </div>
        </div>
        
        {/* Player Info - Mobile: Left, Desktop: Right */}
        <div className="flex-1 flex flex-col justify-between h-full text-left w-full">
          {/* Player Name */}
          <div className="mb-4">
            <h4 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-800 mb-2 sm:mb-3">{name}</h4>
            <div className="flex items-center justify-start gap-2 sm:gap-4">
              {teamLogo && <Image src={teamLogo} alt={batsman.team_name || batsman.team || name} width={32} height={32} className="rounded-full border-2 border-green-300" />}
              <span className="text-sm sm:text-base lg:text-lg text-gray-600 font-semibold">{batsman.team_name || batsman.team || ""}</span>
            </div>
          </div>
          
          {/* Runs Display */}
          <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-inner border border-green-200">
            <div className="text-xs sm:text-sm lg:text-base uppercase text-gray-500 font-semibold tracking-wider mb-1 sm:mb-2">Total Runs</div>
            <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-green-600">{runs}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: seasons } = useGetSeasonsQuery();
  const [season, setSeason] = useState<string | undefined>("2025");
  const { data: winners } = useGetSeasonWinnersQuery(season ?? "", {
    skip: !season,
  });
  const { data: topBatsmen } = useGetSeasonTopBatsmenQuery(season ?? "", { skip: !season });
  const { data: topBowlers } = useGetSeasonTopBowlersQuery(season ?? "", { skip: !season });
  const { data: matches } = useGetSeasonMatchesQuery(season ?? "", { skip: !season });
  const { data: players } = useGetPlayersQuery();
  const { data: teams } = useGetTeamsQuery();

  // Create dynamic player image mapping that updates when players data changes
  const playerNameToImg: Record<string, string> = useMemo(() => {
    return (players || []).reduce(
      (acc: Record<string, string>, p: any) => {
        const key = (p.player_name || p.name || "").toLowerCase();
        if (key && p.player_image) {
          acc[key] = p.player_image;
        }
        return acc;
      },
      {}
    );
  }, [players]);

  // Fallback team logos for common IPL teams
  const fallbackTeamLogos: Record<string, string> = {
    'royal challengers bangalore': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Royal_Challengers_Bangalore_Logo.svg/200px-Royal_Challengers_Bangalore_Logo.svg.png',
    'rcb': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Royal_Challengers_Bangalore_Logo.svg/200px-Royal_Challengers_Bangalore_Logo.svg.png',
    'mumbai indians': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/200px-Mumbai_Indians_Logo.svg.png',
    'mi': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/200px-Mumbai_Indians_Logo.svg.png',
    'chennai super kings': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/200px-Chennai_Super_Kings_Logo.svg.png',
    'csk': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/200px-Chennai_Super_Kings_Logo.svg.png',
    'kolkata knight riders': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/200px-Kolkata_Knight_Riders_Logo.svg.png',
    'kkr': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/200px-Kolkata_Knight_Riders_Logo.svg.png',
    'delhi capitals': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/200px-Delhi_Capitals_Logo.svg.png',
    'dc': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/200px-Delhi_Capitals_Logo.svg.png',
    'punjab kings': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Punjab_Kings_Logo.svg/200px-Punjab_Kings_Logo.svg.png',
    'pbks': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Punjab_Kings_Logo.svg/200px-Punjab_Kings_Logo.svg.png',
    'rajasthan royals': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/200px-Rajasthan_Royals_Logo.svg.png',
    'rr': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/200px-Rajasthan_Royals_Logo.svg.png',
    'sunrisers hyderabad': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad_logo.svg/200px-Sunrisers_Hyderabad_logo.svg.png',
    'srh': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad_logo.svg/200px-Sunrisers_Hyderabad_logo.svg.png',
    'gujarat titans': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/200px-Gujarat_Titans_Logo.svg.png',
    'gt': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/200px-Gujarat_Titans_Logo.svg.png',
    'lucknow super giants': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Lucknow_Super_Giants_Logo.svg/200px-Lucknow_Super_Giants_Logo.svg.png',
    'lsg': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Lucknow_Super_Giants_Logo.svg/200px-Lucknow_Super_Giants_Logo.svg.png',
  };

  const teamNameToLogo: Record<string, string> = useMemo(() => {
    const result = (teams || []).reduce(
      (acc: Record<string, string>, t: any) => {
        const key = (t.team_name || t.name || "").toLowerCase();
        if (key) {
          // Use API logo first, then fallback to hardcoded logos
          acc[key] = t.image_url || t.logo || fallbackTeamLogos[key] || '';
        }
        return acc;
      },
      {}
    );
    return result;
  }, [teams]);
  
  const teamShortToLogo: Record<string, string> = useMemo(() => {
    return (teams || []).reduce(
      (acc: Record<string, string>, t: any) => {
        const key = (t.team_name_short || t.short || "").toLowerCase();
        if (key) {
          // Use API logo first, then fallback to hardcoded logos
          acc[key] = t.image_url || t.logo || fallbackTeamLogos[key] || '';
        }
        return acc;
      },
      {}
    );
  }, [teams]);
  
  const teamIdToInfo: Record<string, { name: string; logo?: string }> = useMemo(() => {
    return (teams || []).reduce(
      (acc: Record<string, { name: string; logo?: string }>, t: any) => {
        const rawId = t.team_id ?? t.id;
        const id = rawId !== undefined ? String(rawId) : "";
        if (id) {
          const teamName = t.team_name || t.name;
          acc[id] = { 
            name: teamName, 
            logo: t.image_url || t.logo || fallbackTeamLogos[teamName?.toLowerCase()] || ''
          };
        }
        return acc;
      },
      {}
    );
  }, [teams]);

  useEffect(() => {
    if (!season && Array.isArray(seasons) && seasons.length > 0) {
      setSeason(String(seasons[0]));
    }
  }, [seasons, season]);

  const seasonOptions = useMemo(() => (seasons || []).map((s: any) => String(s)), [seasons]);

  return (
    <AppSidebar>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
          <CricketHero
            chips={[
              { label: "Seasons", value: Array.isArray(seasons) ? seasons.length : undefined },
              { label: "Teams", value: Array.isArray(teams) ? teams.length : undefined },
              { label: "Players", value: Array.isArray(players) ? players.length : undefined },
            ]}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-100">Season</span>
              <Select value={season} onValueChange={(val) => setSeason(val)}>
                <SelectTrigger className="w-32 bg-white/15 border-white/30 text-white font-semibold backdrop-blur-sm">
                  <SelectValue placeholder="Select Season" />
                </SelectTrigger>
                <SelectContent>
                  {seasonOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CricketHero>

          {/* Season at a glance */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Matches", value: Array.isArray(matches) ? matches.length : undefined, icon: "🏟️", tone: "from-blue-500 to-indigo-600" },
              { label: "Top run-scorer", value: topBatsmen?.[0]?.total_runs ?? topBatsmen?.[0]?.runs, icon: "🏏", tone: "from-orange-500 to-amber-500", sub: topBatsmen?.[0]?.player_name },
              { label: "Top wicket-taker", value: topBowlers?.[0]?.total_wickets ?? topBowlers?.[0]?.wickets, icon: "🎯", tone: "from-purple-500 to-fuchsia-600", sub: topBowlers?.[0]?.player_name },
              { label: "Teams this season", value: Array.isArray(matches) ? new Set(matches.flatMap((m: any) => [m.team1, m.team2])).size : undefined, icon: "🛡️", tone: "from-emerald-500 to-teal-600" },
            ].map((c, i) => (
              <div key={c.label} className={`card-lift animate-rise rounded-2xl bg-gradient-to-br ${c.tone} p-4 sm:p-5 text-white shadow-lg`}
                   style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-extrabold tabular-nums"><CountUp value={c.value} /></div>
                    <div className="text-xs sm:text-sm text-white/85 font-medium">{c.label}</div>
                    {c.sub && <div className="text-xs text-white/75 mt-0.5 truncate">{c.sub}</div>}
                  </div>
                  <div className="text-2xl sm:text-3xl drop-shadow">{c.icon}</div>
                </div>
              </div>
            ))}
          </div>
        {winners && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-rise [animation-delay:0.35s]">
            <Card className="min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-yellow-700 flex items-center gap-2">
                  🏆 Champion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  let name =
                    winners?.champion?.name ??
                    winners?.champion?.team_name ??
                    winners?.champion_name ??
                    winners?.champion ??
                    winners?.winner; // fallback to 'winner'
                  let logo: string | undefined =
                    teamNameToLogo[(name || "").toLowerCase()] ||
                    teamShortToLogo[(name || "").toLowerCase()];
                  const champRawId: string | number | undefined =
                    winners?.champion_id ??
                    winners?.champion?.team_id ??
                    winners?.winner_team_id ??
                    winners?.winner_id;
                  const champId: string = champRawId !== undefined ? String(champRawId) : "";
                  const hasChamp: boolean = Boolean(champId && champId.length > 0 && teamIdToInfo[String(champId)]);
                  if ((!name || !logo) && hasChamp) {
                    name = name || teamIdToInfo[String(champId)].name;
                    logo = logo || teamIdToInfo[String(champId)].logo;
                  }
                  const displayName: string = name ?? "";
                  return (
                    <div className="flex items-center gap-3">
                      {logo && (
        <Image
                          src={logo}
                          alt={displayName || "Champion"}
                          width={48}
                          height={48}
                        />
                      )}
                      <span className="text-lg font-semibold">{displayName || "-"}</span>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            <Card className="min-h-[120px] sm:min-h-[140px] bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-gray-700 flex items-center gap-2">
                  🥈 Runner Up
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  let name =
                    winners?.runner_up?.name ??
                    winners?.runner_up?.team_name ??
                    winners?.runner_up_name ??
                    winners?.runner_up; // runner_up already supported
                  let logo: string | undefined =
                    teamNameToLogo[(name || "").toLowerCase()] ||
                    teamShortToLogo[(name || "").toLowerCase()];
                  const ruRawId: string | number | undefined =
                    winners?.runner_up_id ??
                    winners?.runner_up?.team_id ??
                    winners?.runner_team_id;
                  const ruId: string = ruRawId !== undefined ? String(ruRawId) : "";
                  const hasRu: boolean = Boolean(ruId && ruId.length > 0 && teamIdToInfo[String(ruId)]);
                  if ((!name || !logo) && hasRu) {
                    name = name || teamIdToInfo[String(ruId)].name;
                    logo = logo || teamIdToInfo[String(ruId)].logo;
                  }
                  const displayName: string = name ?? "";
                  return (
                    <div className="flex items-center gap-3">
                      {logo && (
                        <Image src={logo} alt={displayName || "Runner Up"} width={48} height={48} />
                      )}
                      <span className="text-lg font-semibold">{displayName || "-"}</span>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 animate-rise [animation-delay:0.45s]">
          {/* Orange Cap - Top Batsman */}
          {Array.isArray(topBatsmen) && topBatsmen.length > 0 && (
            <div className="md:col-span-1">
              <div className="border-2 rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 border-orange-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 min-h-[180px] sm:min-h-[200px]">
                <div className="flex flex-col h-full">
                  {/* Orange Cap Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-lg sm:text-xl text-orange-800">Orange Cap</h3>
                    <Image src={orangeCapImage} alt="Orange Cap" width={32} height={32} className="rounded-full border-2 border-orange-300" />
                  </div>
                  
                  {/* Top Batsman Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center mb-4">
                      <h4 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-800 mb-2">{topBatsmen[0]?.player_name ?? topBatsmen[0]?.name ?? "N/A"}</h4>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        {(() => {
                          const topBatsman = topBatsmen[0];
                          const teamLogo =
                            teamNameToLogo[(topBatsman?.team_name || topBatsman?.team || "").toLowerCase()] ||
                            teamShortToLogo[(topBatsman?.team_short || topBatsman?.team_code || "").toLowerCase()] ||
                            (topBatsman?.team_id && teamIdToInfo[String(topBatsman?.team_id)]?.logo);
                          return teamLogo && <Image src={teamLogo} alt={topBatsman?.team_name || topBatsman?.team || ""} width={24} height={24} className="rounded-full border border-orange-300" />;
                        })()}
                        <span className="text-xs sm:text-sm text-gray-600 font-semibold">{topBatsmen[0]?.team_name || topBatsmen[0]?.team || ""}</span>
                      </div>
                    </div>
                    
                    {/* Runs Display */}
                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-inner border border-orange-200 text-center">
                      <div className="text-xs sm:text-sm uppercase text-gray-500 font-semibold tracking-wider mb-1">Total Runs</div>
                      <div className="text-2xl sm:text-3xl font-bold text-orange-600">{topBatsmen[0]?.total_runs ?? topBatsmen[0]?.runs ?? 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Purple Cap - Top Bowler */}
          {Array.isArray(topBowlers) && topBowlers.length > 0 && (
            <div className="md:col-span-1">
              <div className="border-2 rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 border-purple-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 min-h-[180px] sm:min-h-[200px]">
                <div className="flex flex-col h-full">
                  {/* Purple Cap Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-lg sm:text-xl text-purple-800">Purple Cap</h3>
                    <Image src={purpleCapImage} alt="Purple Cap" width={32} height={32} className="rounded-full border-2 border-purple-300" />
                  </div>
                  
                  {/* Top Bowler Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center mb-4">
                      <h4 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-800 mb-2">{topBowlers[0]?.player_name ?? topBowlers[0]?.name ?? "N/A"}</h4>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        {(() => {
                          const topBowler = topBowlers[0];
                          const teamLogo =
                            teamNameToLogo[(topBowler?.team_name || topBowler?.team || "").toLowerCase()] ||
                            teamShortToLogo[(topBowler?.team_short || topBowler?.team_code || "").toLowerCase()] ||
                            (topBowler?.team_id && teamIdToInfo[String(topBowler?.team_id)]?.logo);
                          return teamLogo && <Image src={teamLogo} alt={topBowler?.team_name || topBowler?.team || ""} width={24} height={24} className="rounded-full border border-purple-300" />;
                        })()}
                        <span className="text-xs sm:text-sm text-gray-600 font-semibold">{topBowlers[0]?.team_name || topBowlers[0]?.team || ""}</span>
                      </div>
                    </div>
                    
                    {/* Wickets Display */}
                    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-inner border border-purple-200 text-center">
                      <div className="text-xs sm:text-sm uppercase text-gray-500 font-semibold tracking-wider mb-1">Total Wickets</div>
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600">{topBowlers[0]?.total_wickets ?? topBowlers[0]?.wickets ?? 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Season Stats Card */}
          <div className="md:col-span-1">
            <div className="border-2 rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 min-h-[180px] sm:min-h-[200px]">
              <div className="flex flex-col h-full">
                <h3 className="font-bold text-lg sm:text-xl text-blue-800 mb-3 sm:mb-4">Season {season} Stats</h3>
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <div className="bg-white rounded-lg p-3 shadow-inner border border-blue-200">
                    <div className="text-sm text-gray-500 font-semibold">Total Matches</div>
                    <div className="text-xl font-bold text-blue-600">{Array.isArray(matches) ? matches.length : "…"}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-inner border border-blue-200">
                    <div className="text-sm text-gray-500 font-semibold">Top Batsmen</div>
                    <div className="text-xl font-bold text-blue-600">{Array.isArray(topBatsmen) ? topBatsmen.length : 0}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-inner border border-blue-200">
                    <div className="text-sm text-gray-500 font-semibold">Top Bowlers</div>
                    <div className="text-xl font-bold text-blue-600">{Array.isArray(topBowlers) ? topBowlers.length : 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 animate-rise [animation-delay:0.45s]">
          <div className="md:col-span-3">
            <h3 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-6 text-gray-800 flex items-center gap-3">
              🏏 Top Batsmen
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {Array.isArray(topBatsmen) && topBatsmen.slice(0,5).map((b: any, idx: number) => {
                const name = b.player_name ?? b.name ?? "";
                const runs = b.total_runs ?? b.runs;
                const teamLogo =
                  teamNameToLogo[(b.team_name || b.team || "").toLowerCase()] ||
                  teamShortToLogo[(b.team_short || b.team_code || "").toLowerCase()] ||
                  (b.team_id && teamIdToInfo[String(b.team_id)]?.logo);
                
                // Try to get image from multiple sources
                let img: string = playerNameToImg[name.toLowerCase()] || '';
                
                // If no image found, try to get from batsman data directly
                if (!img) {
                  img = b.player_image || b.image || '';
                }
                
                // Normalize the image URL
                const normalizedImg = normalizePlayerImage(img) || '';
                img = normalizedImg;
                
                return <TopBatsmanCard key={`${name}-${idx}`} batsman={b} idx={idx} img={img} name={name} runs={runs} teamLogo={teamLogo} />;
              })}
            </div>
          </div>
          <div className="md:col-span-3">
            <h3 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-6 text-gray-800 flex items-center gap-3">
              🎯 Top Bowlers
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {Array.isArray(topBowlers) && topBowlers.slice(0,5).map((b: any, idx: number) => {
                const name = b.player_name ?? b.name ?? "";
                const wickets = b.total_wickets ?? b.wickets;
                const teamLogo =
                  teamNameToLogo[(b.team_name || b.team || "").toLowerCase()] ||
                  teamShortToLogo[(b.team_short || b.team_code || "").toLowerCase()] ||
                  (b.team_id && teamIdToInfo[String(b.team_id)]?.logo);
                
                // Try to get image from multiple sources
                let img: string = playerNameToImg[name.toLowerCase()] || '';
                
                // If no image found, try to get from bowler data directly
                if (!img) {
                  img = b.player_image || b.image || '';
                }
                
                // Normalize the image URL
                const normalizedImg = normalizePlayerImage(img) || '';
                img = normalizedImg;
                
                return (
                  <div key={`${name}-${idx}`} className="border-2 rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 border-green-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 min-h-[200px]">
                    <div className="flex flex-col sm:flex-row items-start h-full gap-4 sm:gap-6 lg:gap-8">
                      {/* Player Image - Mobile: Left, Desktop: Left */}
                      <div className="flex-shrink-0">
                        <div className="relative h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] lg:h-[200px] lg:w-[200px] xl:h-[220px] xl:w-[220px]">
                          <AvatarImage src={img} alt={name} width={200} height={200} className="rounded-lg object-contain bg-white border-2 border-green-300 shadow-lg w-full h-full" />
                          <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-green-500 text-white text-sm sm:text-base lg:text-lg px-2 py-1 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg">
                            #{idx + 1}
                          </div>
                        </div>
                      </div>
                      
                      {/* Player Info - Mobile: Left, Desktop: Right */}
                      <div className="flex-1 flex flex-col justify-between h-full text-left w-full">
                        {/* Player Name */}
                        <div className="mb-4">
                          <h4 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-800 mb-2 sm:mb-3">{name}</h4>
                          <div className="flex items-center justify-start gap-2 sm:gap-4">
                            {teamLogo && <Image src={teamLogo} alt={b.team_name || b.team || name} width={32} height={32} className="rounded-full border-2 border-green-300" />}
                            <span className="text-sm sm:text-base lg:text-lg text-gray-600 font-semibold">{b.team_name || b.team || ""}</span>
                          </div>
                        </div>
                        
                        {/* Wickets Display */}
                        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-inner border border-green-200">
                          <div className="text-xs sm:text-sm lg:text-base uppercase text-gray-500 font-semibold tracking-wider mb-1 sm:mb-2">Total Wickets</div>
                          <div className="text-2xl sm:text-3xl lg:text-5xl font-bold text-green-600">{wickets}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="md:col-span-3">
            <h3 className="font-bold text-xl sm:text-2xl mb-4 sm:mb-6 text-gray-800 flex items-center gap-3">
              🏟️ All IPL Teams <span className="text-sm font-medium text-gray-500">({Array.isArray(teams) ? teams.length : "…"} franchises, 2008–2025)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {(teams || []).map((t: any, i: number) => {
                const teamId = t.team_id ?? t.id;
                const teamName = t.team_name || t.name;
                const short = t.team_name_short || t.short_name;
                const color = teamColor(short);
                return (
                  <Link
                    key={teamId}
                    href={`/teams/${teamId}`}
                    className="group card-lift animate-rise relative overflow-hidden rounded-2xl bg-white p-4 flex items-center gap-4 border border-gray-200 shadow-sm"
                    style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}
                  >
                    <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: color }} />
                    <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150"
                          style={{ background: color }} />
                    <div className="relative shrink-0 rounded-full p-0.5 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                         style={{ boxShadow: `0 0 0 2px ${color}` }}>
                      <TeamLogo short={short} name={teamName} url={t.image_url || t.logo} size={52} />
                    </div>
                    <div className="relative min-w-0">
                      <div className="font-bold text-gray-900 leading-snug">{teamName}</div>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                        {short}
                      </div>
                    </div>
                    <span className="relative ml-auto text-gray-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-500">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        </div>
    </div>
    </AppSidebar>
  );
}