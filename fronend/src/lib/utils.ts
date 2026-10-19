import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalizes player image values coming from API
// - Full image URLs are returned as is (AvatarImage falls back to initials if they fail)
// - Uploaded files ("player_61_xxx.jpg" or "/player_images/...") go through the
//   Next.js /api rewrite, so they load from whichever backend is configured
// - Anything else (empty, profile pages) returns null
export function normalizePlayerImage(src?: string | null): string | null {
  if (!src) return null;
  const trimmed = String(src).trim();
  if (!trimmed) return null;
  // Skip obvious non-image pages (e.g., espncricinfo profile pages)
  if (/^https?:\/\//i.test(trimmed)) {
    return /espncricinfo\.com\//i.test(trimmed) && !/\.(png|jpe?g|webp|gif)(\?|$)/i.test(trimmed) ? null : trimmed;
  }
  // Already normalized (callers sometimes normalize twice)
  if (trimmed.startsWith("/api/")) return trimmed;
  const file = trimmed.replace(/^\/?(player_images\/)?/, "");
  if (/^[\w.-]+\.(png|jpe?g|webp|gif)$/i.test(file)) return `/api/player_images/${file}`;
  return null;
}
