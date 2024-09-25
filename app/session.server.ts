import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";
import { isProduction } from "./lib/utils.server";

// FIXME: code stolen from remix-auth readme
// export the whole sessionStorage object
export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: process.env.COOKIE_SECRETS?.split(" "),
    secure: isProduction, // enable this in prod only
  },
});

const themeSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: process.env.COOKIE_SECRETS?.split(" "),
    ...(isProduction ? { domain: process.env.PROD_DOMAIN!, secure: true } : {}),
  },
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = authSessionStorage;
export const themeSessionResolver =
  createThemeSessionResolver(themeSessionStorage);
