import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PASSWORD_REQUIREMENTS } from "@/schemas/auth";
import { API_BASE } from "@/services/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format ISO date string for display
 */
export function formatDate(isoString: string | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(isoString: string | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(isoString);
}

/**
 * Returns which password requirements are satisfied (for UI checkmarks).
 */
export function getPasswordCheckResults(password: string) {
  return PASSWORD_REQUIREMENTS.map(({ id, label, test }) => ({
    id,
    label,
    satisfied: test(password),
  }));
}

export function getWsBaseUrl(): string {
  // API_BASE is like http://localhost:8000/api
  const url = new URL(API_BASE);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  // Replace trailing /api or /api/ with /ws/
  url.pathname = url.pathname.replace(/\/?api\/?$/, "/ws/");
  // Ensure no trailing slash so we can safely append
  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
}
