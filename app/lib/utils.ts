import { useMatches } from "@remix-run/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type AuthInfo } from "~/auth.server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidObjectId(rawId: string): boolean {
  return /[0-9a-f]{24}/.test(rawId);
}

export function useUser(): AuthInfo | null {
  let [rootMatch] = useMatches();
  return rootMatch.data.user;
}

interface StudentAuthInfo extends AuthInfo {
  type: "student";
}
export function useRequiredStudentUser(): StudentAuthInfo {
  let user = useUser();
  if (!user) throw new Error("User not authenticated");
  if (user.type !== "student") throw new Error("Not a student");
  if (user.type === "student") return user;
  return user;
}
