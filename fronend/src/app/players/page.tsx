"use client"

import AppSidebar from "@/components/AppSidebar";
import ContactSupport from "@/components/ContactSupport";
import { useGetPlayersQuery } from "@/lib/services/iplApi";
import AvatarImage from "@/components/AvatarImage";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { normalizePlayerImage } from "@/lib/utils";

const PAGE_SIZE = 24;

export default function PlayersPage() {
  const { data, isLoading } = useGetPlayersQuery();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const list = (data || []) as any[];
    const q = query.trim().toLowerCase();
    const byName = q
      ? list.filter((p) => (p.player_name || p.name || "").toLowerCase().includes(q))
      : list;
    const start = (page - 1) * PAGE_SIZE;
    return byName.slice(start, start + PAGE_SIZE);
  }, [data, query, page]);

  const total = (data || []).length || 0;
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (isLoading) {
    return (
      <AppSidebar>
        <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading players...</p>
            </div>
          </div>
        </div>
      </AppSidebar>
    );
  }

  return (
    <AppSidebar>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">👥 IPL Players</h1>
            <p className="text-gray-600 text-lg">All players participating in the Indian Premier League</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Input 
                  value={query} 
                  onChange={(e) => { setPage(1); setQuery(e.target.value); }} 
                  placeholder="Search players by name..." 
                  className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filtered.map((p: any) => {
              const playerName = p.player_name ?? p.name ?? "Unknown Player";
              const playerImage = normalizePlayerImage(p.player_image);
              const playerRole = p.role || p.player_role || "All-rounder";
              const playerTeam = p.team_name || p.team || "Free Agent";
              
              return (
                <Link 
                  key={p.player_id ?? p.id} 
                  href={`/players/${p.player_id ?? p.id}`} 
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                  
                  {/* Player Content */}
                  <div className="text-center relative z-10">
                    {/* Player Image */}
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white">
                      {playerImage && !playerImage.includes('placeholder') && !playerImage.includes('default') ? (
                        <img 
                          key={playerImage}
                          src={playerImage} 
                          alt={playerName} 
                          width={80} 
                          height={80} 
                          loading="eager"
                          decoding="async"
                          className="w-full h-full object-cover rounded-full block" 
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
                          width={80} 
                          height={80} 
                          className="w-full h-full object-cover rounded-full" 
                        />
                      )}
                    </div>
                    
                    {/* Player Name */}
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-green-600 transition-colors">
                      {playerName}
                    </h3>
                    
                    {/* Player Role */}
                    <div className="text-sm text-gray-500 font-medium mb-2">
                      {playerRole}
                    </div>
                    
                    {/* Player Team */}
                    <div className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1 inline-block">
                      {playerTeam}
                    </div>
                    
                    {/* Hover Indicator */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="inline-flex items-center gap-2 text-green-600 text-sm font-medium">
                        <span>View Profile</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Corner Badge */}
                  <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <Button 
              disabled={page <= 1} 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page</span>
              <span className="font-bold text-green-600">{page}</span>
              <span className="text-sm text-gray-600">of</span>
              <span className="font-bold text-green-600">{maxPage}</span>
            </div>
            
            <Button 
              disabled={page >= maxPage} 
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">{total}</div>
                <div className="text-blue-100">Total Players</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">{filtered.length}</div>
                <div className="text-green-100">Showing</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">{maxPage}</div>
                <div className="text-purple-100">Total Pages</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <ContactSupport />
      </div>
    </AppSidebar>
  );
}


