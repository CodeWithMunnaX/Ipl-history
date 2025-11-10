"use client"

import AppSidebar from "@/components/AppSidebar";
import ContactSupport from "@/components/ContactSupport";
import { useParams } from "next/navigation";
import { useGetTeamByIdQuery, useGetTeamStatsQuery } from "@/lib/services/iplApi";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamDetailsPage() {
  const params = useParams<{ id: string }>();
  const teamId = params?.id as string;
  const { data: team, isLoading: teamLoading, error: teamError } = useGetTeamByIdQuery(teamId, { skip: !teamId });
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetTeamStatsQuery(teamId, { skip: !teamId });

  if (teamLoading) {
    return (
      <AppSidebar>
        <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading team details...</p>
            </div>
          </div>
        </div>
      </AppSidebar>
    );
  }

  if (teamError || (!team && !teamLoading)) {
    return (
      <AppSidebar>
        <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Team Not Found</h2>
              <p className="text-gray-600 mb-4">The team you're looking for doesn't exist or the API is not available.</p>
              <p className="text-sm text-gray-500">Team ID: {teamId}</p>
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
          {/* Team Header */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-8 shadow-xl border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Team Logo */}
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-4 border-white">
                <Image 
                  src={team.image_url || team.logo || '/images/unnamed.png'} 
                  alt={team.team_name || team.name} 
                  width={128} 
                  height={128} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              {/* Team Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {team.team_name || team.name}
                </h1>
                {team.team_name_short && (
                  <p className="text-xl text-gray-600 mb-4">{team.team_name_short}</p>
                )}
                {team.city && (
                  <p className="text-lg text-gray-500 mb-2">📍 {team.city}</p>
                )}
                {team.established && (
                  <p className="text-lg text-gray-500">Established: {team.established}</p>
                )}
              </div>
            </div>
          </div>

          {/* Team Stats */}
          {stats && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Team Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(stats).map(([key, value]) => (
                  <Card key={key} className="bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {String(value)}
                      </div>
                      <div className="text-sm text-gray-600 font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Team Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Performance Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🏆 Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches Played</span>
                    <span className="font-bold">150+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Rate</span>
                    <span className="font-bold">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Championships</span>
                    <span className="font-bold">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Squad Card */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  👥 Squad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Players</span>
                    <span className="font-bold">25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>International</span>
                    <span className="font-bold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domestic</span>
                    <span className="font-bold">17</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Records Card */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  📈 Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Highest Score</span>
                    <span className="font-bold">235</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Bowling</span>
                    <span className="font-bold">5/15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Most Runs</span>
                    <span className="font-bold">2,500+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Matches Placeholder */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">⚽ Recent Matches</h2>
            <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🏏</div>
                  <p>Recent matches data will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <ContactSupport />
      </div>
    </AppSidebar>
  );
}


