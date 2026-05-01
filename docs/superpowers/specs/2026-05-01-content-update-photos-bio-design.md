# Content Update: Live Photos, Real Bio, Music Captions

Date: 2026-05-01

## Scope

Five targeted content + code changes across the media, about, and music sections. No new pages, no layout changes.

---

## Step 1 — Live Photos on Media Page

### Schema change (`src/content.config.ts`)

Change the `image` field in the `photos` collection from a plain string to Astro's `image()` helper:

```ts
import { defineCollection, z, image } from "astro:content";
// photos schema:
image: image().optional(),
```

This gives `p.data.image` a resolved metadata object (src, width, height) that the `<Image>` component from `astro:assets` needs for WebP conversion and CLS-free rendering.

The `thumbnail` field stays as `z.string().optional()` (unused for now).

### Content files

Six photo entries, all `category: "live"`. Two existing files get updated; four new files created.

| File | Image filename (UUID) | Date |
|---|---|---|
| `live-01.md` | `de5cdbf0-137d-4f8f-9abe-1cac180e0816.jpg` | 2025-03-15 |
| `live-02.md` | `8116606d-c5e1-4f92-82fb-83110a7f8277.jpg` | 2025-06-22 |
| `live-03.md` | `325e7f36-aaf2-4fac-9265-4dde944570d3.jpg` | 2025-09-07 |
| `live-04.md` | `0215f091-342e-44a4-91a5-63419cc39073.jpg` | 2025-11-30 |
| `live-05.md` | `a00bd138-6509-480e-9552-83b58fa54de6.jpg` | 2026-01-18 |
| `live-06.md` | `045838a0-1a16-4914-981c-57ef9862e243.jpg` | 2026-03-08 |

All entries use placeholder metadata (title, photographer, venue, city = "TODO"). Image path in frontmatter is relative to the content file: `../../assets/photos/live/<uuid>.jpg`.

Since `image()` provides width/height automatically, make the explicit `width` and `height` fields optional (`z.number().optional()`). Existing press photo entries that set them will still validate; new live photo entries omit them.

### `LivePhotoGrid.astro` refactor

Replace the placeholder gradient `<div>` with `<Image>` from `astro:assets`:

```astro
import { Image } from "astro:assets";
...
{p.data.image
  ? <Image src={p.data.image} alt={p.data.title} width={1200} height={800}
           style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" loading="lazy" />
  : <div style={`position:absolute;inset:0;background:${bg};`}></div>
}
```

Keep all other elements (red multiply overlay, caption, counter badge) unchanged.

---

## Step 2 — Real Bio in `src/content/about/about.md`

### `fullBio` (3 paragraphs, replaces 5)

**Para 1 EN:** "Self-taught DJ and producer, started behind the decks at 13. By 16, techno had become the obsession — a fixation that's only sharpened over the years through countless DJ sets, sharpening the ear, exploring genres and subgenres until the selection became surgical."

**Para 1 IT:** "DJ e producer autodidatta, ho iniziato a mettere dischi a 13 anni. A 16 il techno è diventato un'ossessione — una fissazione che si è solo affinata negli anni, attraverso innumerevoli DJ set, allenando l'orecchio, esplorando generi e sottogeneri fino a rendere la selezione chirurgica."

**Para 2 EN:** "After years as a DJ, the next step was production. Ableton became the workspace — sound design, composition, live performance, all in service of building a personal sound that doesn't borrow."

**Para 2 IT:** "Dopo anni come DJ, il passo successivo è stata la produzione. Ableton è diventato lo spazio di lavoro — sound design, composizione, performance live, tutto al servizio della costruzione di un suono personale che non prende in prestito da nessuno."

**Para 3 EN:** "The selection runs through Detroit, hardgroove, industrial, acid, mental, hardtek, tribe, oldschool. The sets express sensation and power through hypnotic, engaging grooves. The lives lean into acid, mental and groovy territory — produced on Ableton 12 with virtual synths and professional plugins, with one rule: no trends, only emotions."

**Para 3 IT:** "La selezione attraversa Detroit, hardgroove, industrial, acid, mental, hardtek, tribe, oldschool. I set esprimono sensazione e potenza attraverso groove ipnotici e coinvolgenti. I live si spingono verso territori acid, mental e groovy — prodotti su Ableton 12 con sintetizzatori virtuali e plugin professionali, con una sola regola: niente trend, solo emozioni."

### `paragraphs` (2 entries, replaces 3) — used on homepage

**P1 EN:** "Self-taught. Behind the decks since 13. Locked into techno since 16."
**P1 IT:** "Autodidatta. Dietro i dischi da 13 anni. Fissato col techno da 16."

**P2 EN:** "A selection sharpened by years of careful research — hypnotic grooves, sensation, power. Detroit, industrial, acid, mental, hardtek."
**P2 IT:** "Una selezione affinata da anni di ricerca attenta — groove ipnotici, sensazione, potenza. Detroit, industrial, acid, mental, hardtek."

### `factFile` (5 entries, replaces 5)

| label EN | label IT | value EN | value IT |
|---|---|---|---|
| djing since | djing since | age 13 | dai 13 anni |
| producing on | produzione su | ableton 12 | ableton 12 |
| based | base | milano | milano |
| genres | generi | detroit · industrial · acid · mental · hardtek · tribe | detroit · industrial · acid · mental · hardtek · tribe |
| philosophy | filosofia | no trends, only emotions | niente trend, solo emozioni |

Headlines (`headlineLines`) and stats stay unchanged.

---

## Step 3 — Music Page Captions

### `Discography.astro`

Add one mono line between the eyebrow and the table header:

```
genres —— detroit · hardgroove · industrial · acid · mental · hardtek · tribe · oldschool
```

Style: `font-family: 'JetBrains Mono'; font-size: 9px; color: #6b6b6b; letter-spacing: 0.18em; margin-bottom: 32px;`

### `StreamingEmbeds.astro`

Add one mono line below the eyebrow, above the embed columns:

```
produced on ableton 12 — virtual synths, professional plugins, no trends.
```

Same style as above.

---

## Step 4 — Homepage About Snippet (`AboutSnippet.astro`)

No code changes needed — `paragraphs` is already rendered dynamically from the collection. The Step 2 content update handles this automatically.

Fix: the "read the full story →" link currently points to `href="#"`. Change to locale-aware href:

```astro
const locale = (Astro.currentLocale ?? "en") as "en" | "it";
const aboutHref = locale === "it" ? "/it/about" : "/about";
```

```astro
<a href={aboutHref} class="about-link">
```

---

## Step 5 — Italian translations

Covered inline in Step 2 above. All `it` keys populated with natural Italian provided by the user.

---

## Files changed

| File | Change |
|---|---|
| `src/content.config.ts` | `image: z.string().optional()` → `image: image().optional()`, `width`/`height` → optional |
| `src/content/photos/live-01.md` | Update with real image ref + placeholder metadata |
| `src/content/photos/live-02.md` | Update with real image ref + placeholder metadata |
| `src/content/photos/live-03.md` | New — live-03 image |
| `src/content/photos/live-04.md` | New — live-04 image |
| `src/content/photos/live-05.md` | New — live-05 image |
| `src/content/photos/live-06.md` | New — live-06 image |
| `src/components/media/LivePhotoGrid.astro` | Replace gradient placeholder with `<Image>`, add image() fallback |
| `src/content/about/about.md` | Real bio: fullBio (3 paras), paragraphs (2), factFile (5 entries) |
| `src/components/music/Discography.astro` | Genre strip line |
| `src/components/music/StreamingEmbeds.astro` | Production caption line |
| `src/components/home/AboutSnippet.astro` | Fix `href="#"` → locale-aware `/about` link |

## Verification

1. `npm run dev` — open `/media`, `/about`, `/`, `/music`
2. Media: 6 photos in scroll-snap gallery, real images (not gradient placeholders)
3. About: 3-paragraph bio, updated fact file
4. Homepage About snippet: 2 new short paragraphs, "read the full story" links to `/about`
5. Music: genre strip above discography table, production caption above streaming embeds
6. `npm run build` — no type errors, WebP versions of all 6 photos in `dist/_astro/`
