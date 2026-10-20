"use client"

import { ReactNode, useEffect, useRef, useState } from "react";

/** Animated night-stadium banner: the ball is bowled, the batter drives it out of the ground. */
export default function CricketHero({ children, chips }: { children?: ReactNode; chips?: { label: string; value?: number }[] }) {
  return (
    <section className="hero-stadium relative overflow-hidden rounded-3xl text-white shadow-2xl animate-rise">
      {/* floodlights */}
      <div className="floodlight left-[8%]" />
      <div className="floodlight right-[12%] [animation-delay:1.2s]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-900/60 to-transparent" />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] items-center gap-4 p-5 sm:p-8">
        <div className="space-y-4 z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide ring-1 ring-white/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> IPL · 2008 – 2025
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            IPL Analytics
            <span className="block bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="max-w-md text-sm sm:text-base text-blue-100/90">
            Every ball, every season — runs, wickets, champions and the stars who made them.
          </p>
          {children}
          {chips && (
            <div className="flex flex-wrap gap-2 pt-1">
              {chips.map((c) => (
                <div key={c.label} className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur-sm">
                  <div className="text-lg font-bold tabular-nums"><CountUp value={c.value} /></div>
                  <div className="text-[11px] uppercase tracking-wider text-blue-100/80">{c.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <BatBallScene />
      </div>
    </section>
  );
}

function BatBallScene() {
  return (
    <svg viewBox="0 0 420 260" className="w-full max-w-[520px] justify-self-center lg:justify-self-end" role="img"
         aria-label="Animated cricket shot: the ball is bowled and hit for six">
      <defs>
        <linearGradient id="willow" x1="0" x2="1">
          <stop offset="0" stopColor="#f5deb3" />
          <stop offset="0.55" stopColor="#e8c48a" />
          <stop offset="1" stopColor="#c9995a" />
        </linearGradient>
        <radialGradient id="leather" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ff6b6b" />
          <stop offset="0.6" stopColor="#d61f2c" />
          <stop offset="1" stopColor="#8f0f18" />
        </radialGradient>
        <linearGradient id="pitch" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c8a96a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8a6d3b" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* ground and pitch */}
      <ellipse cx="210" cy="248" rx="230" ry="26" fill="#14532d" opacity="0.55" />
      <path d="M60 236 L360 236 L330 252 L90 252 Z" fill="url(#pitch)" />
      <line x1="120" y1="236" x2="110" y2="252" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />

      {/* stumps and bails */}
      <g className="stumps">
        {[72, 82, 92].map((x) => (
          <rect key={x} x={x} y="160" width="5" height="78" rx="2" fill="#fde68a" stroke="#b45309" strokeWidth="1" />
        ))}
        <rect x="95" y="156" width="12" height="4" rx="2" fill="#fbbf24" />
        <rect x="109" y="156" width="12" height="4" rx="2" fill="#fbbf24" />
      </g>

      {/* batter (right-handed, facing the bowler on the right) */}
      <g className="batter">
        <ellipse cx="124" cy="239" rx="11" ry="4" fill="#0f172a" />
        <ellipse cx="150" cy="239" rx="11" ry="4" fill="#0f172a" />
        <rect x="116" y="150" width="15" height="88" rx="7" fill="#f8fafc" stroke="#cbd5e1" />
        <rect x="142" y="150" width="15" height="88" rx="7" fill="#f8fafc" stroke="#cbd5e1" />
        {[166, 186, 206, 222].map((y) => (
          <g key={y}><line x1="118" y1={y} x2="129" y2={y} stroke="#cbd5e1" /><line x1="144" y1={y} x2="155" y2={y} stroke="#cbd5e1" /></g>
        ))}
        <path d="M120 66 Q136 58 154 66 L160 150 Q138 158 112 150 Z" fill="#1d4ed8" />
        <path d="M120 66 Q136 58 154 66 L156 82 Q136 76 118 82 Z" fill="#f59e0b" />
        <text x="137" y="118" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fde047">18</text>
        <path d="M126 74 L150 62 M146 76 L152 62" stroke="#1d4ed8" strokeWidth="9" strokeLinecap="round" />
        <circle cx="151" cy="61" r="6" fill="#f8fafc" />
        <circle cx="136" cy="42" r="15" fill="#1e3a8a" />
        <path d="M121 40 Q136 22 151 40" fill="#2563eb" />
        <path d="M146 38 h10 M146 44 h10 M146 50 h8 M150 36 v16" stroke="#cbd5e1" strokeWidth="1.4" />
      </g>

      {/* bat, pivoting at the batter's hands */}
      <g className="bat">
        <rect x="146" y="58" width="9" height="40" rx="4" fill="#1f2937" />
        <rect x="146" y="62" width="9" height="30" rx="4" fill="#3b82f6" />
        <path d="M141 96 h19 l3 104 q0 10 -12 10 h-1 q-12 0 -12 -10 z" fill="url(#willow)" stroke="#a16207" strokeWidth="1.2" />
        <rect x="146" y="130" width="9" height="34" rx="3" fill="#2563eb" opacity="0.85" />
      </g>

      {/* impact flash */}
      <g className="impact" style={{ transformOrigin: "186px 168px" }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line key={i} x1={186 + Math.cos(a) * 10} y1={168 + Math.sin(a) * 10}
                  x2={186 + Math.cos(a) * 22} y2={168 + Math.sin(a) * 22}
                  stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
          );
        })}
      </g>

      {/* ball with a fading trail */}
      {[0.32, 0.22, 0.12].map((o, i) => (
        <circle key={i} r={9 - i * 2} fill="#f87171" opacity={o} className="ball"
                style={{ animationDelay: `${-0.05 * (i + 1)}s` }} />
      ))}
      <g className="ball">
        <circle r="10" fill="url(#leather)" />
        <path d="M-7 -6 Q0 0 -7 6 M7 -6 Q0 0 7 6" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.2" fill="none" className="seam" />
      </g>

      {/* "SIX!" pop when the ball leaves the ground */}
      <text x="330" y="60" className="six-pop" textAnchor="middle" fontSize="34" fontWeight="900" fill="#fde047"
            stroke="#b45309" strokeWidth="1.5">SIX!</text>
    </svg>
  );
}

/** Counts up to `value` once it is known; shows an ellipsis while loading. */
export function CountUp({ value, duration = 1200 }: { value?: number; duration?: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (value == null) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(value); return; }
    const start = performance.now();
    const begin = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(begin + (value - begin) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  if (value == null) return <span className="opacity-70">…</span>;
  return <>{shown.toLocaleString("en-IN")}</>;
}
