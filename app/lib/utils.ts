import { useMatches } from "@remix-run/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { StudentAuthInfo, type AuthInfo } from "~/auth.server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidObjectId(rawId: string): boolean {
  return /[0-9a-f]{24}/.test(rawId);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = "";

  if (hours > 0) {
    result += `${hours} hr${hours > 1 ? "s" : ""} `;
  }

  if (minutes > 0) {
    result += `${minutes} min${minutes > 1 ? "s" : ""} `;
  }

  if (remainingSeconds > 0 && hours === 0) {
    // Show seconds only if there are no hours
    result += `${remainingSeconds} sec${remainingSeconds > 1 ? "s" : ""}`;
  }

  return result.trim();
}
