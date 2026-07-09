// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import preact from "@astrojs/preact";

export default defineConfig({
  site: "https://alfathmuqoddas.github.io",
  base: "/viraindo-webscrapper",
  output: "static",
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});