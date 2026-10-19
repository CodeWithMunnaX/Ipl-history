"use client"

import { useEffect, useState } from "react";

// Reject malformed values (e.g. stringified pandas Series) before they reach <img>
function isUsableSrc(src?: string | null): src is string {
  if (!src) return false;
  const s = src.trim();
  if (!s || s.includes("dtype: object") || s.includes("Name:") || s.includes("\n")) return false;
  return /^https?:\/\//i.test(s) || s.startsWith("/");
}

function getInitials(name: string) {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function AvatarImage({
  src,
  alt,
  width = 32,
  height = 32,
  className = "",
}: {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  // Let "w-full h-full" callers size the avatar from their container
  const fill = /w-full/.test(className);
  const size = fill ? undefined : { width, height };

  // A new src deserves a fresh attempt
  useEffect(() => setFailed(false), [src]);

  if (!failed && isUsableSrc(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`object-cover bg-white ${className}`}
        style={size}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`${className} bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold select-none`}
      style={{ ...size, fontSize: Math.max(10, Math.round(Math.min(width, height) * 0.36)) }}
    >
      {getInitials(alt)}
    </div>
  );
}
