import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalizes player image values coming from API
// - If it's a full URL, return as is
// - If it's just a filename like "player_61_xxx.jpg", prefix the API host path
// - Otherwise return null to indicate no valid image
export function normalizePlayerImage(src?: string | null): string | null {
  if (!src) return null;
  const trimmed = String(src).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Skip obvious non-image pages (e.g., espncricinfo profile pages)
  if (/espncricinfo\.com\//i.test(trimmed) && !/\.(png|jpe?g|webp|gif)$/i.test(trimmed)) return null;
  // Filename case -> prefix with backend static path
  if (/^player_\d+_.+\.(png|jpe?g|webp|gif)$/i.test(trimmed)) {
    const host = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ipl-anylasis-2.onrender.com";
    return `${host}/player_images/${trimmed}`;
  }
  return trimmed;
}
