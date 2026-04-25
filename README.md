# Giorgio Lorefice

Portfolio site for underground techno DJ Giorgio Lorefice — Milano.

## Stack

Astro 6 · Tailwind CSS v4 · React islands · Three.js · TypeScript strict · Decap CMS · GitHub Pages

## Local development

```bash
npm install
npm run dev        # http://localhost:4321/
```

> The dev server mirrors the GitHub Pages base path `/Dj`. If another project is already on 4321 the port auto-increments.

## Build

```bash
npm run build      # output → dist/
npm run preview    # serve dist/ locally
```

## Deploy

Push to `main` → GitHub Actions builds and deploys automatically to:

```
https://giorgiolorefice00.github.io/
```

One-time setup: repo → **Settings → Pages → Source: GitHub Actions**.

## CMS

Decap CMS at `/admin/`. Requires a GitHub OAuth proxy — see `public/admin/config.yml` for the `base_url` placeholder. Deploy the proxy to Vercel, update that field, and commit.

## Content collections

```
src/content/
├── about/about.md          singleton — bio, fact file, stats
├── achievements/           about page achievement rows
├── residencies/            about page residency cards
├── partnerships/           about page marquee names
├── events/                 tour dates (upcoming + past)
├── press/                  press quotes
├── releases/               discography + featured release
├── mixes/                  mixes library
├── videos/                 media page video grid
└── photos/                 press + live photo galleries
```

Schemas live in `src/content.config.ts`. Full field specs in `CLAUDE.md`.

## License

© 2026 Giorgio Lorefice — All rights reserved.
