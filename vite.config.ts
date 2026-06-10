// @mavunopay/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@mavunopay/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: process.env.VERCEL ? "vercel" : "node-server",
    output: {
      dir: process.env.VERCEL ? ".vercel/output" : ".output",
    },
  },
  vite: {
    server: {
      port: 8080,
      strictPort: false,
      proxy: {
        "/api": {
          target: "http://localhost:3002",
          changeOrigin: true,
        },
      },
    },
  },
});
