// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import preact from "@astrojs/preact";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  // site: "https://alfathmuqoddas.github.io",
  base: "/",
  output: "server",
  adapter: cloudflare(),
  integrations: [preact()],
  vite: {
    plugins: [tailwind()],
  },
});
