# Giorgio Lorefice — Project Context

This file tells Claude Code what this project is and how to build it. Read this fully before doing anything.

## What this project is

A static portfolio website for **Giorgio Lorefice**, an underground rave / warehouse techno DJ based in Milano.

## Source of truth

The design files from Claude design are the exact specs. When in doubt, open them and copy faithfully. Do not invent new layouts, colors, or copy.

Design files expected in the repo root during development:
- `Dj.html` — homepage
- `about.html` — about page
- `music.html` — music page
- `events.html` — events page
- `media.html` — media page
- `contact.html` — contact page

(Names may vary slightly depending on how they were exported. Confirm filenames at the start of each build step.)

## Tech stack (non-negotiable)

- **Astro 6.x** — static site, content collections, React islands
- **Tailwind CSS v4** — via `@tailwindcss/vite`
- **React** — islands only (do not hydrate what doesn't need it)
- **Three.js** — used on the Contact page for a live dark wireframe skull scene that sits behind the form
- **TypeScript** strict mode
- **Astro Content Collections + Zod** — typed markdown frontmatter for events, press, mixes, releases, achievements, videos, photos, about
- **Decap CMS** — Git-backed, admin panel at `/admin`
- **GitHub Pages** — static hosting at `/Dj` subpath
- **GitHub Actions** — auto-build + deploy on push to main
- **Vercel** — hosts a separate tiny OAuth proxy for Decap CMS GitHub login (in a separate `Dj-oauth` repo)

## Do NOT install

- shadcn / shadcn CLI — we are not using it
- Next.js — this is Astro
- Any CSS-in-JS library (styled-components, emotion, etc.)
- UI component libraries (MUI, Chakra, Radix as a runtime dependency)

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.


## Brand system

### Colors (exact)

| Token | Hex | Usage |
|---|---|---|
| black | `#000000` | Primary background |
| near-black | `#0A0A0A` | Section shade-shift |
| blood | `#C8102E` | Primary accent, CTAs, key type |
| blood-hot | `#FF1F1F` | Hover states, glow |
| bone | `#E8E8E8` | Body text (never pure white) |
| ash | `#6B6B6B` | Meta text, captions |

Expose these as Tailwind v4 `@theme` tokens in `src/styles/global.css`:

```css
@theme {
  --color-black: #000000;
  --color-near-black: #0A0A0A;
  --color-blood: #C8102E;
  --color-blood-hot: #FF1F1F;
  --color-bone: #E8E8E8;
  --color-ash: #6B6B6B;
}
```

### Fonts

- **Display** (DJ name, section headers, huge dates): Anton, Bebas Neue — heavy, condensed, industrial sans, ALL CAPS
- **Mono** (UI labels, meta, nav, captions): JetBrains Mono, IBM Plex Mono — lowercase, tight
- **Body** (longer paragraphs on About page): Inter

Load Google Fonts via `<link>` in `src/layouts/Base.astro`.

### Visual rules

- Pitch black backgrounds with blood red accents — underground warehouse rave aesthetic
- Sharp edges everywhere. **No rounded corners anywhere.**
- No gradients. No glassmorphism. No drop shadows on text.
- No emojis in UI copy.
- The logo is a hand-drawn smiley — use as-is, never polish or redraw it.
- Tone for body copy: lowercase-leaning, short, slightly cryptic. Never marketing-speak.

## Site structure

```
/                 homepage
/about            about page
/music            music page
/events           events page
/media            media page
/contact          contact page
/admin            Decap CMS (auth via Vercel OAuth proxy)
```

Every page uses the same fixed Header and Footer. The nav link for the current page gets an active state: blood red text + 1px blood red bottom border.

## Page header pattern (reuse across inner pages)

Every inner page (About / Music / Events / Media / Contact) starts with this header band directly below the fixed site header:

- Small mono breadcrumb: `home / [pagename]`
- Section number: `[ 002 / about ]` — increments per page
- Page title in massive display type, two lines when useful, second line in blood red
- Thin 1px blood red horizontal divider below
- Background: pure black `#000`

Build this as a reusable Astro component: `src/components/PageHeader.astro`, props: `{ number, name, titleLine1, titleLine2 }`.

## Page contents

### Homepage (`/`)

In order: Header, Hero, About snippet, Featured Mix, Events preview, Press slider, Footer.

- Hero has the full-viewport WebGL smoke shader behind it (React island, `client:load`)
- Press slider is a React island (`client:visible`)
- Everything else is pure Astro

### About page (`/about`)

Intro band: `THE MAN` / `BEHIND THE DECKS.`

1. Full biography — 60/40 split, long-form bio left (4–5 paragraphs with drop-cap and inline pull quotes), sticky portrait + "fact file" right
2. Notable achievements & club residencies — two-column: vertical achievements list left (5–7 rows), 2x3 residency card grid right
3. Brand partnerships & festival highlights — horizontal infinite-scroll logo marquee (8–10 logos)
4. Press articles & testimonials — 3-column card grid (6 cards)
5. EPK download — full-width centered band with enormous download CTA

### Music page (`/music`)

Intro band: `THE SOUND` / `ON RECORD.`

1. Latest release — 40/60 split, square artwork left, metadata + tracklist + streaming buttons right
2. Embedded streaming players — 50/50 Spotify + Apple Music iframes, each framed with 1px red border
3. Mixes & podcasts library — filter chips (all / resident / festival / radio / guest) + 3-column grid of mix cards with duotone covers, "load more" CTA
4. Full discography — list view, table-like mono layout with year / title / format / label / streaming icons

### Events page (`/events`)

Intro band: `WHERE TO` / `FIND HIM.`

1. Upcoming tour dates — vertical list rows (8 rows), date block left, venue center, ticket CTA right. Toggle for list/calendar view.
2. Interactive tour map — stylized dark SVG-style map with blood red dots for tour stops (upcoming pulsing, past solid, cancelled strikethrough). Tooltips on click.
3. Past notable performances archive — year filter chips + 4-column grid of past gig cards (8 cards)

### Media page (`/media`)

Intro band: `THE VISUAL` / `RECORD.`

1. Press photos gallery — masonry grid (4 col desktop, 2 mobile), duotone treatment, hover reveals download + credit overlay, "download all .zip" CTA
2. Live performance photo grid — horizontal scroll-snap gallery, 1.5 images visible, captions bottom-left
3. Video gallery — tab bar (music videos / live sets / aftermovies / interviews), 3-column grid of video cards with play button overlays, clicking opens lightbox modal

### Contact page (`/contact`)

Intro band: `GET IN` / `TOUCH.`

1. Booking inquiry form — brutalist form (1px bottom border only per field), fields: name, email, event type, date, venue, budget, message, rider checkbox, submit
2. Direct contact information — 3-column grid: management / booking agency / press
3. General inquiry — centered mailto link in massive blood red display type

**Contact page has a live Three.js background:** a slow-rotating low-poly wireframe skull in blood red floating behind the form. Rotates subtly with mouse position. Implement as a React island (`client:visible`) using `three`. The form sits on top with a subtle black overlay for readability.

## React islands — where they go

Only these use React with `client:` directives:

| Component | Directive | Used on |
|---|---|---|
| `SmokeBackground.tsx` | `client:load` | Homepage hero |
| `PressSlider.tsx` | `client:visible` | Homepage press section |
| `TourMap.tsx` | `client:visible` | Events page map |
| `VideoLightbox.tsx` | `client:load` | Media page video grid |
| `SkullScene.tsx` | `client:visible` | Contact page background |
| `BookingForm.tsx` | `client:load` | Contact page form |

Everything else is pure Astro. Use CSS `scroll-snap` for the mobile event carousel and the media horizontal gallery — no JS.

## Assets in this folder during development

- `dj-photo.jpg` — hero photo of Giorgio behind the decks. Apply a duotone filter at render time (black shadows → blood red highlights) via inline SVG `<feColorMatrix>`, never by pre-processing the file. The duotone filter applies to all DJ photos across all pages.
- `logo.png` — the hand-drawn smiley. Use as-is everywhere it appears.
- `Dj.html`, `about.html`, `music.html`, `events.html`, `media.html`, `contact.html` — the design files. Extract styles, structure, copy, shader code, and any inlined scripts from here.
- `Dj_files/` — reference assets the browser dumped alongside `Dj.html`. Ignore unless you need a specific stylesheet. Do not ship.

Delete all reference files (`*.html`, `Dj_files/`, this `CLAUDE.md`) before the final commit that ships to GitHub Pages.

## Content collections

Define all schemas in `src/content/config.ts` using Zod.

### `events` (`src/content/events/*.md`)
Used by: homepage events preview, events page tour list, events page map.
Fields: `title`, `date` (ISO), `venue`, `city`, `country`, `setTime`, `ticketUrl` (optional), `status` (`"on-sale" | "sold-out" | "few-left" | "cancelled"`), `serialTag`, `latitude` (optional, for map), `longitude` (optional, for map), `isPast` (boolean, for archive filtering).

### `press` (`src/content/press/*.md`)
Used by: homepage press slider, about page press articles section.
Fields: `quote`, `publication`, `author` (optional), `date` (ISO), `sourceUrl` (optional), `featured` (boolean — if true, appears in homepage slider).

### `about` (`src/content/about.md` — singleton)
Fields: `headlineLine1`, `headlineLine2`, `headlineLine3`, `shortParagraphs` (array, for homepage snippet), `fullBio` (array of paragraph strings, for about page), `stats` (array of `{value, label}`), `factFile` (array of `{label, value}`), `bornIn`, `basedIn`, `activeSince`.

### `achievements` (`src/content/achievements/*.md`)
Used by: about page.
Fields: `year`, `title`, `description`, `order` (for sorting).

### `residencies` (`src/content/residencies/*.md`)
Used by: about page.
Fields: `venue`, `city`, `startYear`, `endYear` (optional — null means "present").

### `partnerships` (`src/content/partnerships/*.md`)
Used by: about page marquee.
Fields: `name`, `type` (`"brand" | "festival"`), `year` (optional).

### `releases` (`src/content/releases/*.md`)
Used by: music page featured release, discography.
Fields: `title`, `subtitle` (optional — e.g. `"EP · 4 TRACKS"`), `releaseDate` (ISO), `label`, `format` (`"EP" | "Single" | "Remix" | "Album"`), `description`, `coverArt` (image path), `tracklist` (array of `{number, title, duration}`), `spotifyUrl` (optional), `appleMusicUrl` (optional), `bandcampUrl` (optional), `featured` (boolean).

### `mixes` (`src/content/mixes/*.md`)
Used by: homepage featured mix, music page mixes library.
Fields: `title`, `duration`, `venue` (optional), `date` (ISO), `category` (`"resident" | "festival" | "radio" | "guest"`), `coverArt`, `soundcloudUrl` (optional), `mixcloudUrl` (optional), `bpmRange`, `genre`, `tracklist` (array of track titles or null), `featured` (boolean — homepage).

### `videos` (`src/content/videos/*.md`)
Used by: media page.
Fields: `title`, `category` (`"music-video" | "live-set" | "aftermovie" | "interview"`), `youtubeId` (optional), `vimeoId` (optional), `duration`, `date` (ISO), `producer` (optional), `thumbnail` (image path).

### `photos` (`src/content/photos/*.md`)
Used by: media page press gallery and live grid.
Fields: `title`, `photographer`, `date` (ISO), `category` (`"press" | "live"`), `venue` (optional — for live), `city` (optional), `image` (path to high-res), `thumbnail` (path), `width`, `height`.

## Deploy setup

- GitHub Pages, subpath `/Dj`
- `astro.config.mjs`: `site: 'https://yourusername.github.io'`, `base: '/Dj'`
- GitHub Actions workflow at `.github/workflows/deploy.yml` using `withastro/action@v3`, deploys via `actions/deploy-pages@v4`
- Required workflow permissions: `pages: write`, `id-token: write`
- Decap CMS at `/admin` — requires separate Vercel OAuth proxy (built in a separate `Dj-oauth` repo, deployed to Vercel)
- Decap config at `public/admin/config.yml` must have its `base_url` pointing to the actual Vercel URL of the OAuth proxy

## Build rules

- Always compare output to the corresponding design HTML file before saying a page is done.
- Never hardcode copy that belongs in a content collection.
- Keep JS bundles small — if reaching for a library beyond what's in the stack, ask first.
- Run `npm run build` at the end of every major step to catch type errors.
- Use `import.meta.env.BASE_URL` for internal links and image paths — do NOT hardcode `/logo.png`, use `${import.meta.env.BASE_URL}logo.png` so the `/Dj` subpath works on GitHub Pages.
- All images go in `public/` organized by page: `public/photos/press/`, `public/photos/live/`, `public/releases/`, `public/mixes/`, `public/videos/thumbs/`.

## Naming conventions

- Astro components: PascalCase — `PageHeader.astro`, `EventCard.astro`
- React components: PascalCase — `SmokeBackground.tsx`, `TourMap.tsx`
- Content collection entries: kebab-case slugs — `warehouse-ritual-vol-04.md`
- CSS utility classes: Tailwind-native, no custom classes unless absolutely needed (duotone filter, grain texture)

## Duotone filter (global)

Define once in `src/layouts/Base.astro` as a hidden SVG:

```html
<svg width="0" height="0" style="position:absolute">
  <filter id="duotone">
    <feColorMatrix type="matrix" values="
      0.21 0.72 0.07 0 0
      0.21 0.72 0.07 0 0
      0.21 0.72 0.07 0 0
      0    0    0    1 0
    "/>
    <feComponentTransfer>
      <feFuncR tableValues="0 0.784"/>
      <feFuncG tableValues="0 0.063"/>
      <feFuncB tableValues="0 0.180"/>
    </feComponentTransfer>
  </filter>
</svg>
```

Apply to any `<img>` via `style="filter: url(#duotone)"` or a Tailwind utility.

## Common pitfalls to avoid

- **Asset 404s on GitHub Pages:** caused by missing `base: '/Dj'` or hardcoded `/` paths. Always use `import.meta.env.BASE_URL`.
- **Tailwind v4 colors not applying:** `global.css` needs `@import "tailwindcss";` at the top, then `@theme { ... }` block. Use tokens as `bg-blood`, `text-bone` — NOT `bg-[#C8102E]`.
- **Hydration mismatches:** React islands that read `window` or `document` must guard with `typeof window !== 'undefined'` or use `useEffect`.
- **Decap CMS login loops:** the `base_url` in `public/admin/config.yml` must exactly match the Vercel proxy URL, and the OAuth app callback URL on GitHub must match `{base_url}/api/callback` exactly.
- **Three.js bundle bloat:** import only what you need from `three`, not the whole package. Tree-shake aggressively for the `SkullScene.tsx` island.
