import { createCookie } from "@remix-run/node";
import { isProduction } from "./lib/utils";

export const authReturnToCookie = createCookie("HEYYOUCOMEBACKHERE", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60, // 1 minute because it makes no sense to keep it for a long time
  secure: isProduction,
});
