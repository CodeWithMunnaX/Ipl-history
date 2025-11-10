import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "documents.iplt20.com",
      },
      {
        protocol: "https",
        hostname: "ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "1000logos.net",
      },
      {
        protocol: "https",
        hostname: "www.espncricinfo.com",
      },
      {
        protocol: "https",
        hostname: "cricclubs.com",
      },
      {
        protocol: "https",
        hostname: "img1.hscicdn.com",
      },
      {
        protocol: "https",
        hostname: "static.cricbuzz.com",
      },
      {
        protocol: "https",
        hostname: "cricbuzz.com",
      },
      {
        protocol: "https",
        hostname: "www.cricbuzz.com",
      },
      {
        protocol: "https",
        hostname: "images.cricbuzz.com",
      },
      {
        protocol: "https",
        hostname: "m.cricbuzz.com",
      },
      {
        protocol: "https",
        hostname: "www.iplt20.com",
      },
      {
        protocol: "https",
        hostname: "iplt20.com",
      },
      {
        protocol: "https",
        hostname: "ipl-anylasis-2.onrender.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
