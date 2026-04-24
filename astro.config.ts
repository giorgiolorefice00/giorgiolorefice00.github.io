import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  site: "https://YOURUSERNAME.github.io",
  base: "/Dj",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
