import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import styles from "./tailwind.css";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./session.server";
import clsx from "clsx";
import { authenticator } from "./auth.server";
import { AuthProvider } from "./components/authprovider";
import sonnerStyles from "~/components/ui/sonner.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: sonnerStyles },
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
        <LiveReload />
      </body>
    </html>
  );
}
