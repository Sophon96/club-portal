import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
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
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
  {
    rel: "icon",
    href: "/favicon_light.svg",
    type: "image/svg+xml",
    media: "(prefers-color-scheme: light)",
  },
  {
    rel: "icon",
    href: "/favicon_dark.svg",
    type: "image/svg+xml",
    media: "(prefers-color-scheme: dark)",
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
  const navigation = useNavigation();

  /* Loading indicator */
  const [loadingTimeout, setLoadingTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [loadingToast, setLoadingToast] = useState<string | number | null>(
    null,
  );
  useEffect(() => {
    if (
      navigation.state !== "idle" &&
      !navigation.formAction &&
      !loadingTimeout
    ) {
      setLoadingTimeout(
        setTimeout(
          () =>
            setLoadingToast(
              toast(
                <div className="flex flex-row items-center justify-center">
                  {/* animate-[spin_1s_linear_infinite,ping_1s_cubic-bezier(0,0,0.2,1)_infinite,pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] */}
                  <Loader2 className="mr-1 size-4 animate-spin text-primary" />
                  {Array.from("Loading...").map((c, i) => (
                    <span
                      key={i}
                      className="motion-safe:animate-bounce"
                      style={{ animationDelay: `-${1.5 - i * 0.1}s` }}
                    >
                      {c}
                    </span>
                  ))}
                </div>,
                { duration: Infinity, important: true },
              ),
            ),
          300,
        ),
      );
    } else if (navigation.state === "idle" && loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);

      if (loadingToast) {
        toast.dismiss(loadingToast);
        setLoadingToast(null);
      }
    }
  }, [navigation]);

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
        <Toaster />
        <ScrollRestoration />
        <Scripts />
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
