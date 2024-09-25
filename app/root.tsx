import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import styles from "./tailwind.css?url";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./session.server";
import clsx from "clsx";
import { authenticator } from "./auth.server";
import { AuthProvider } from "./components/authprovider";
import sonnerStyles from "~/components/ui/sonner.css?url";
import "@fontsource-variable/public-sans";
import publicSans from "@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: sonnerStyles },
  {
    rel: "preload",
    href: publicSans,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

// shadcn dark mode
// Return the theme from the session storage using the loader
export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  const user = await authenticator.isAuthenticated(request);
  return { theme: getTheme(), user };
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <AuthProvider user={data.user}>
      <ThemeProvider
        specifiedTheme={data.theme}
        themeAction="/action/set-theme"
      >
        <App />
      </ThemeProvider>
    </AuthProvider>
  );
}

function CloudflareAnalytics() {
  return (
    <>
      {/* <!-- Cloudflare Web Analytics --> */}
      <script
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "9d4559e260a94dff956a06d5e52a1f14"}'
      ></script>
      {/* <!-- End Cloudflare Web Analytics --> */}
    </>
  );
}

export function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
