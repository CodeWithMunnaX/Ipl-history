"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, Users, Medal, Activity, LayoutGrid, FileText, BarChart3, Pin } from "lucide-react";
import Image from "next/image";
import iplLogo from "@/app/images/tata_ipl-logo_brandlogos.net_k2ryd (1).png";

export default function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { 
      href: "/", 
      icon: Home, 
      label: "Dashboard",
      description: "Overview & Analytics"
    },
    { 
      href: "/teams", 
      icon: Users, 
      label: "Teams",
      description: "Team Statistics"
    },
    { 
      href: "/players", 
      icon: Activity, 
      label: "Players",
      description: "Player Profiles"
    },
    { 
      href: "/seasons", 
      icon: Medal, 
      label: "Seasons",
      description: "Season Analysis"
    },
    { 
      href: "/overall", 
      icon: LayoutGrid, 
      label: "Overall",
      description: "All-time Records"
    },
    { 
      href: "/stats", 
      icon: BarChart3, 
      label: "Statistics",
      description: "Detailed Stats"
    },
    { 
      href: "/scorecard", 
      icon: FileText, 
      label: "Scorecard",
      description: "Match Details"
    },
  ];


  return (
    <SidebarProvider>
      <Sidebar className="border-r-2 border-gray-300 bg-white shadow-lg w-64 md:w-72">
        <SidebarHeader className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-md border border-green-300">
              <Image src={iplLogo} alt="IPL" width={28} height={28} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">IPL Analytics</h2>
              <p className="text-gray-600 text-sm font-medium">Cricket Dashboard</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-white">
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-700 font-bold text-sm uppercase tracking-wider px-4 py-3 bg-gray-100 border-b-2 border-gray-200">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent className="p-3">
              <SidebarMenu className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group relative rounded-lg p-6 ${
                          isActive 
                            ? "bg-green-100 text-green-800 border-l-4 border-green-500 font-semibold shadow-sm" 
                            : "hover:bg-gray-100 hover:text-gray-800 hover:border-l-4 hover:border-gray-300"
                        } transition-all duration-200`}
                      >
                        <Link href={item.href} className="flex items-center gap-3 w-full">
                          <div className={`p-2 rounded-md ${
                            isActive 
                              ? "bg-green-200" 
                              : "bg-gray-200 group-hover:bg-gray-300"
                          } transition-colors duration-200`}>
                            <Icon className={`w-5 h-5 ${
                              isActive ? "text-green-700" : "text-gray-600"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm ${
                              isActive ? "text-green-800" : "text-gray-800"
                            }`}>
                              {item.label}
                            </div>
                            <div className={`text-xs ${
                              isActive ? "text-green-600" : "text-gray-500"
                            } truncate`}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
        <SidebarSeparator className="bg-gray-300 h-px" />
        <SidebarFooter className="bg-gray-100 p-3 border-t-2 border-gray-200">
          {/* Pinned: Power BI report */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={`rounded-lg p-6 transition-all duration-200 ${
                  pathname === "/powerbi"
                    ? "bg-[#252423] text-white shadow-md"
                    : "bg-white border border-gray-300 hover:bg-[#252423] hover:text-white"
                }`}
              >
                <Link href="/powerbi" className="group flex items-center gap-3 w-full">
                  <div className="p-2 rounded-md bg-[#252423] group-hover:bg-[#3b3a39]">
                    <div className="flex items-end gap-[2px] h-5 w-5 justify-center" aria-hidden>
                      <span className="w-1 h-2 rounded-sm bg-[#f2c811]" />
                      <span className="w-1 h-3.5 rounded-sm bg-[#f2c811]" />
                      <span className="w-1 h-5 rounded-sm bg-[#f2c811]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">Power BI</div>
                    <div className="text-xs opacity-70 truncate">Full data report</div>
                  </div>
                  <Pin className="w-4 h-4 opacity-60 rotate-45" aria-label="Pinned" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center gap-3 p-3 sm:p-4 border-b-2 border-gray-200 bg-white shadow-sm sticky top-0 z-20 sm:ml-8">
          <SidebarTrigger className="hover:bg-gray-100 rounded-lg p-2 transition-colors" />
          <div className="h-6 w-px bg-gray-300" />  
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 text-base sm:text-lg">Dashboard</h1>
            <p className="text-gray-500 text-xs sm:text-sm">IPL Analytics & Statistics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 text-xs sm:text-sm">Live</span>
          </div>
        </div>
        <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 max-w-screen-xl mx-auto w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


