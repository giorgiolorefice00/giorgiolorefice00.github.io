import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  site: "https://giorgiolorefice.com",
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes("/admin"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
