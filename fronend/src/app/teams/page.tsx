"use client"

import AppSidebar from "@/components/AppSidebar";
import ContactSupport from "@/components/ContactSupport";
import { useGetTeamsQuery } from "@/lib/services/iplApi";
import Image from "next/image";
import Link from "next/link";

export default function TeamsPage() {
  const { data, isLoading } = useGetTeamsQuery();

  return (
    <AppSidebar>
      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">🏏 IPL Teams</h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">All teams participating in the Indian Premier League</p>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading teams...</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {(data || []).map((t: any) => (
              <Link 
                key={t.team_id} 
                href={`/teams/${t.team_id}`} 
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                
                {/* Team Content */}
                <div className="text-center relative z-10">
                  {/* Team Logo */}
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white">
                    <Image 
                      src={t.image_url || '/images/unnamed.png'} 
                      alt={t.team_name} 
                      width={96} 
                      height={96} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  {/* Team Name */}
                  <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-green-600 transition-colors">
                    {t.team_name}
                  </h3>
                  
                  {/* Team Short Name */}
                  {t.team_name_short && (
                    <div className="text-sm text-gray-500 font-medium">
                      {t.team_name_short}
                    </div>
                  )}
                  
                  {/* Hover Indicator */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="inline-flex items-center gap-2 text-green-600 text-sm font-medium">
                      <span>View Details</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Corner Badge */}
                <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold">{(data || []).length}</div>
              <div className="text-blue-100">Total Teams</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold">10</div>
              <div className="text-green-100">Active Teams</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white text-center">
              <div className="text-3xl font-bold">16</div>
              <div className="text-purple-100">Seasons Played</div>
            </div>
          </div>
        </div>
        
        <ContactSupport />
      </div>
    </AppSidebar>
  );
}


