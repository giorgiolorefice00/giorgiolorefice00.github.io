import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  site: "https://giorgiolorefice.com",
  i18n: {
    locales: ["en", "it"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false, // English at /, Italian at /it/
    },
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes("/admin"),
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US", it: "it-IT" },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
