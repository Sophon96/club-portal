import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { StudentAuthInfo, type AuthInfo } from "~/auth.server";

export const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.CONTEXT === "production"; /* Netlify sets CONTEXT */

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

/**
 * Loader function to indicate that the route is not ready for production use.
 * Remove when finished with implementation.
 */
export function notReady(func?: LoaderFunction) {
  return (lfa: LoaderFunctionArgs) => {
      if (isProduction) {
        console.log("notReady loader hit:", lfa.request.url);
      throw new Response(null, { status: 404, statusText: "Not Found" });
    }

    if (typeof func !== "undefined") func(lfa);
    else return null;
  };
}

/* 2024-08-23 -- First and foremost: I have on clue what this is for.
 * I'm pretty sure I wrote this about six months ago, and I didn't finish it.
 * My thought it that I meant to restrict access to /clubs/* routes to student
 * accounts only, but I didn't implement the root layout loader or fix any of
 * the type errors. Anyways, I've commented it out for now.
 * Update: It was actually 11 months ago. 2024-09-30. Yikes. I should probably
 * start writing comments so stuff like this doesn't happen again.
 * useUser: ???
 * useRequiredStudentUser: ???
 */
// export function useUser(): AuthInfo | null {
//   let [rootMatch] = useMatches();
//   return rootMatch.data.user;
// }

// export function useRequiredStudentUser(): StudentAuthInfo {
//   let user = useUser();
//   if (!user) throw new Error("User not authenticated");
//   if (user.type !== "student") throw new Error("Not a student");
//   if (user.type === "student") return user;
//   return user;
// }
