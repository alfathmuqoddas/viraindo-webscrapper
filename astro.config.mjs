// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import preact from "@astrojs/preact";

export default defineConfig({
  // site: "https://alfathmuqoddas.github.io",
  // base: "/viraindo-webscrapper",
  output: "server",
  adapter: cloudflare(),
  integrations: [preact()],
});
