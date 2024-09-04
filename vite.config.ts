import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, ViteDevServer } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { netlifyPlugin } from "@netlify/remix-adapter/plugin";
import { installGlobals } from "@remix-run/node";
import morgan from "morgan";

installGlobals();

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    morganPlugin(),
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
    netlifyPlugin(),
    tsconfigPaths(),
  ],
});

function morganPlugin() {
  return {
    name: "morgan-plugin",
    configureServer(server: ViteDevServer) {
      return () => {
        server.middlewares.use(morgan("dev"));
      };
    },
  };
}
