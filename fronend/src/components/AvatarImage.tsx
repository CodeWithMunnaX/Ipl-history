"use client"

import Image from "next/image";
import { useMemo, useState } from "react";
import fallbackPng from "@/app/images/unnamed.png";

const ALLOWED_HOSTS = new Set([
  "documents.iplt20.com",
  "ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com",
  "1000logos.net",
  "www.espncricinfo.com",
  "cricclubs.com",
  "img1.hscicdn.com",
  "static.cricbuzz.com",
  "cricbuzz.com",
  "www.cricbuzz.com",
  "images.cricbuzz.com",
  "m.cricbuzz.com",
  "www.iplt20.com",
  "iplt20.com",
  "ipl-anylasis-2.onrender.com",
]);

function isAllowedExternal(src?: string): boolean {
  if (!src) return false;
  
  // Check for malformed data (pandas DataFrame info)
  if (src.includes('dtype: object') || src.includes('Name:') || src.includes('\n')) {
    return false;
  }
  
  try {
    const u = new URL(src);
    return ALLOWED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

export default function AvatarImage({
  src,
  alt,
  width = 32,
  height = 32,
  className,
}: {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  // Check if src is valid and not empty
  const isValidSrc = src && src.trim().length > 0 && isAllowedExternal(src);
  const initialUseFallback = !isValidSrc;
  const [useFallback, setUseFallback] = useState<boolean>(initialUseFallback);

  const resolved = useMemo(() => {
    if (useFallback || !src || src.trim().length === 0) {
      return fallbackPng;
    }
    return src;
  }, [useFallback, src]);

  // Generate initials from player name
  const getInitials = (name: string) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`${useFallback ? "" : ""} rounded-full p-0.5`}> 
      {useFallback ? (
        <div 
          className={`${className} bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs`}
          style={{ width, height }}
        >
          {getInitials(alt)}
        </div>
      ) : (
        typeof resolved === 'string' && resolved.trim().length > 0 ? (
          <Image
            src={resolved}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={() => setUseFallback(true)}
          />
        ) : (
          <div 
            className={`${className} bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs`}
            style={{ width, height }}
          >
            {getInitials(alt)}
          </div>
        )
      )}
    </div>
  );
}


