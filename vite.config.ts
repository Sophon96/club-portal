import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { netlifyPlugin } from "@netlify/remix-edge-adapter/plugin";
import { installGlobals } from "@remix-run/node";

installGlobals();

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
    ,
    netlifyPlugin(),
    tsconfigPaths(),
  ],
});
