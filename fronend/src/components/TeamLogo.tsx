"use client"

import { useEffect, useState } from "react";

// Logos bundled in /public/team-logos (the old S3 links for defunct teams are dead)
const LOCAL_LOGOS = new Set(["CSK", "DC", "GL", "GT", "KKR", "KTK", "LSG", "MI", "PK", "PWI", "RCB", "RPS", "RR", "SRH"]);

export const TEAM_COLORS: Record<string, string> = {
  CSK: "#F9CD05", MI: "#004BA0", RCB: "#D11D26", KKR: "#3A225D", SRH: "#F26522", RR: "#EA1A85",
  DC: "#17479E", PK: "#DD1F2D", PBKS: "#DD1F2D", LSG: "#0057E2", GT: "#1B2133", GL: "#E04F16",
  RPS: "#6F61AC", KTK: "#F15A29", PWI: "#2F9BE3", DEC: "#4B5563",
};

export function teamColor(short?: string) {
  return TEAM_COLORS[(short || "").toUpperCase()] ?? "#334155";
}

/** Team logo with a coloured initials badge when no image is available or it fails to load. */
export default function TeamLogo({ short, name, url, size = 56 }: {
  short?: string; name: string; url?: string; size?: number;
}) {
  const code = (short || "").toUpperCase();
  const src = LOCAL_LOGOS.has(code) ? `/team-logos/${code}.jpg` : url;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} width={size} height={size} loading="lazy" onError={() => setFailed(true)}
           className="rounded-full bg-white object-contain p-1" style={{ width: size, height: size }} />
    );
  }
  const initials = code || name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  return (
    <div role="img" aria-label={name} className="rounded-full flex items-center justify-center font-extrabold text-white"
         style={{ width: size, height: size, background: teamColor(code), fontSize: Math.round(size * 0.3) }}>
      {initials}
    </div>
  );
}
