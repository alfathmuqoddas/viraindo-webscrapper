// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://alfathmuqoddas.github.io",
  base: "/viraindo-webscrapper",
  output: "static",
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
  },
});
