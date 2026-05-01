# Content Update: Live Photos, Real Bio, Music Captions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire 6 real live-performance photos into the Media page, replace placeholder bio copy with Giorgio's real biography across the site, and add genre/production captions to the Music page.

**Architecture:** Pure content + template edits — no new components, no routing changes. The one structural change is upgrading the `photos` collection schema to use Astro's `image()` helper so `<Image>` from `astro:assets` can generate WebP automatically. Everything else is find-and-replace on existing files.

**Tech Stack:** Astro 6, astro:content `image()` helper, astro:assets `<Image>`, Zod schemas, YAML frontmatter.

---

## File Map

| File | Change |
|---|---|
| `src/content.config.ts` | `image: z.string()` → `image: image()`, `width`/`height` → optional |
| `src/content/photos/live-01.md` | Update: add real image ref + placeholder metadata |
| `src/content/photos/live-02.md` | Update: add real image ref + placeholder metadata |
| `src/content/photos/live-03.md` | Create: new entry |
| `src/content/photos/live-04.md` | Create: new entry |
| `src/content/photos/live-05.md` | Create: new entry |
| `src/content/photos/live-06.md` | Create: new entry |
| `src/components/media/LivePhotoGrid.astro` | Replace gradient div with `<Image>`, add fallback |
| `src/content/about/about.md` | Real bio: fullBio (3 paras), paragraphs (2), factFile (5 entries) |
| `src/components/music/Discography.astro` | Genre strip line |
| `src/components/music/StreamingEmbeds.astro` | Production caption line |
| `src/components/home/AboutSnippet.astro` | Fix `href="#"` → locale-aware `/about` |

---

## Task 1: Update photos schema

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1.1: Update the photos schema**

Open `src/content.config.ts`. The top import stays as-is (`import { defineCollection, z } from "astro:content"`).

Find the `photos` collection (currently around line 136) and replace the entire `photos` block. The `image()` helper is passed as a parameter to the schema function — this is the required pattern for content-collection images:

```ts
const photos = defineCollection({
  type: "content",
  schema: ({ image: img }) => z.object({
    title:        z.string(),
    photographer: z.string(),
    date:         z.string(),
    category:     z.enum(["press", "live"]),
    venue:        z.string().optional(),
    city:         z.string().optional(),
    image:        img().optional(),
    thumbnail:    z.string().optional(),
    width:        z.number().optional(),
    height:       z.number().optional(),
    credit:       z.string(),
    res:          z.string().optional(),
  }),
});
```

The existing `const bil = z.object(...)` and all other collections are unaffected.

- [ ] **Step 1.2: Verify build passes**

```bash
npm run build 2>&1 | tail -10
```

Expected: `[build] Complete!` with no type errors. If you see "image() can only be used inside a schema function", confirm the schema uses the function form `schema: ({ image: img }) => z.object({...})`.

- [ ] **Step 1.3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat: photos schema — image() helper, width/height optional"
```

---

## Task 2: Update live photo content entries

**Files:**
- Modify: `src/content/photos/live-01.md`
- Modify: `src/content/photos/live-02.md`
- Create: `src/content/photos/live-03.md`
- Create: `src/content/photos/live-04.md`
- Create: `src/content/photos/live-05.md`
- Create: `src/content/photos/live-06.md`

The image paths are relative to each content file (`src/content/photos/`). The photos sit at `src/assets/photos/live/`.

- [ ] **Step 2.1: Replace `live-01.md`**

Overwrite `src/content/photos/live-01.md` completely:

```yaml
---
title: Live performance 01
photographer: TODO
date: "2025-03-15"
category: live
venue: TODO
city: TODO
image: ../../assets/photos/live/de5cdbf0-137d-4f8f-9abe-1cac180e0816.jpg
credit: TODO
---
```

- [ ] **Step 2.2: Replace `live-02.md`**

Overwrite `src/content/photos/live-02.md` completely:

```yaml
---
title: Live performance 02
photographer: TODO
date: "2025-06-22"
category: live
venue: TODO
city: TODO
image: ../../assets/photos/live/8116606d-c5e1-4f92-82fb-83110a7f8277.jpg
credit: TODO
---
```

- [ ] **Step 2.3: Create `live-03.md`**

```yaml
---
title: Live performance 03
photographer: TODO
date: "2025-09-07"
category: live
venue: TODO
city: TODO
image: ../../assets/photos/live/325e7f36-aaf2-4fac-9265-4dde944570d3.jpg
credit: TODO
---
```

- [ ] **Step 2.4: Create `live-04.md`**

```yaml
---
title: Live performance 04
photographer: TODO
date: "2025-11-30"
category: live
venue: TODO
city: TODO
image: ../../assets/photos/live/0215f091-342e-44a4-91a5-63419cc39073.jpg
credit: TODO
---
```

- [ ] **Step 2.5: Create `live-05.md`**

```yaml
---
title: Live performance 05
photographer: TODO
date: "2026-01-18"
category: live
venue: TODO
city: TODO
image: ../../assets/photos/live/a00bd138-6509-480e-9552-83b58fa54de6.jpg
credit: TODO
---
```

- [ ] **Step 2.6: Create `live-06.md`**

```yaml
---
title: Live performance 06
photographer: TODO
date: "2026-03-08"
category: live
venue: TODO
city: TODO
image: ../../assets/photos/live/045838a0-1a16-4914-981c-57ef9862e243.jpg
credit: TODO
---
```

- [ ] **Step 2.7: Verify build passes**

```bash
npm run build 2>&1 | tail -10
```

Expected: `[build] Complete!`. If you see "image not found" errors, check that the relative path from `src/content/photos/` to `src/assets/photos/live/` is correct: two `../` levels up.

- [ ] **Step 2.8: Commit**

```bash
git add src/content/photos/
git commit -m "content: 6 live photo entries with real image refs"
```

---

## Task 3: Refactor LivePhotoGrid to use `<Image>`

**Files:**
- Modify: `src/components/media/LivePhotoGrid.astro`

- [ ] **Step 3.1: Replace the component**

Overwrite `src/components/media/LivePhotoGrid.astro` completely:

```astro
---
import { getCollection } from "astro:content";
import { Image } from "astro:assets";

const photos = (await getCollection("photos"))
  .filter((p) => p.data.category === "live")
  .sort((a, b) => a.id.localeCompare(b.id));

const gradients = [
  "linear-gradient(135deg,#0a0002 0%,#1a0008 60%,#050000 100%)",
  "linear-gradient(160deg,#050000 0%,#0d0003 50%,#1a0008 100%)",
  "linear-gradient(120deg,#1a0008 0%,#050000 40%,#0a0002 100%)",
  "linear-gradient(145deg,#0d0003 0%,#1a0008 55%,#050000 100%)",
];
---

<section style="background:#0a0a0a;overflow:hidden;">
  <div style="padding:80px 72px 32px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#c8102e;letter-spacing:0.22em;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
      <span style="width:20px;height:1px;background:#c8102e;display:inline-block;"></span>
      B — live performances
    </div>
  </div>

  <!-- SCROLL-SNAP CONTAINER -->
  <div
    style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:0 72px 64px;"
  >
    {photos.map((p, i) => {
      const bg = gradients[i % gradients.length];
      return (
        <div style="min-width:75vw;height:520px;flex-shrink:0;scroll-snap-align:start;margin-right:16px;position:relative;overflow:hidden;">
          {p.data.image
            ? <Image
                src={p.data.image}
                alt={p.data.title}
                width={1200}
                height={800}
                style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"
                loading="lazy"
              />
            : <div style={`position:absolute;inset:0;background:${bg};`}></div>
          }
          <!-- RED OVERLAY -->
          <div style="position:absolute;inset:0;background:#c8102e;mix-blend-mode:multiply;opacity:0.3;pointer-events:none;"></div>
          <!-- CAPTION -->
          <div style="position:absolute;bottom:28px;left:28px;z-index:2;">
            <div style="font-family:'Anton',sans-serif;font-size:clamp(20px,2.5vw,32px);color:#e8e8e8;letter-spacing:0.02em;line-height:1;">{p.data.venue ?? "live"}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#6b6b6b;letter-spacing:0.14em;margin-top:4px;">{p.data.city} · {p.data.date}</div>
          </div>
          <!-- COUNTER -->
          <div style="position:absolute;top:24px;right:24px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#e8e8e8;letter-spacing:0.1em;">{String(i + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</div>
        </div>
      );
    })}
  </div>
</section>
```

- [ ] **Step 3.2: Build and check for WebP output**

```bash
npm run build 2>&1 | grep -E "(Complete|error|_astro)"
```

Expected: `[build] Complete!`. Also check that WebP versions appear:

```bash
ls dist/_astro/ | grep -i webp | head -10
```

Expected: at least 6 new `.webp` files (one per live photo).

- [ ] **Step 3.3: Commit**

```bash
git add src/components/media/LivePhotoGrid.astro
git commit -m "feat: LivePhotoGrid — real photos via astro:assets Image"
```

---

## Task 4: Replace about.md with real biography

**Files:**
- Modify: `src/content/about/about.md`

- [ ] **Step 4.1: Overwrite about.md**

Overwrite `src/content/about/about.md` completely (keep the `---` frontmatter delimiters, empty body):

```yaml
---
headlineLines:
  - en: BORN IN THE
    it: BORN IN THE
  - en: BASEMENT
    it: BASEMENT
  - en: OF A CITY THAT NEVER SLEEPS.
    it: OF A CITY THAT NEVER SLEEPS.
paragraphs:
  - en: "Self-taught. Behind the decks since 13. Locked into techno since 16."
    it: "Autodidatta. Dietro i dischi da 13 anni. Fissato col techno da 16."
  - en: "A selection sharpened by years of careful research — hypnotic grooves, sensation, power. Detroit, industrial, acid, mental, hardtek."
    it: "Una selezione affinata da anni di ricerca attenta — groove ipnotici, sensazione, potenza. Detroit, industrial, acid, mental, hardtek."
stats:
  - num: "10+"
    label:
      en: years touring
      it: anni in tour
  - num: "48"
    label:
      en: countries played
      it: paesi visitati
  - num: "∞"
    label:
      en: nights that never ended
      it: notti senza fine
fullBio:
  - en: "Self-taught DJ and producer, started behind the decks at 13. By 16, techno had become the obsession — a fixation that's only sharpened over the years through countless DJ sets, sharpening the ear, exploring genres and subgenres until the selection became surgical."
    it: "DJ e producer autodidatta, ho iniziato a mettere dischi a 13 anni. A 16 il techno è diventato un'ossessione — una fissazione che si è solo affinata negli anni, attraverso innumerevoli DJ set, allenando l'orecchio, esplorando generi e sottogeneri fino a rendere la selezione chirurgica."
  - en: "After years as a DJ, the next step was production. Ableton became the workspace — sound design, composition, live performance, all in service of building a personal sound that doesn't borrow."
    it: "Dopo anni come DJ, il passo successivo è stata la produzione. Ableton è diventato lo spazio di lavoro — sound design, composizione, performance live, tutto al servizio della costruzione di un suono personale che non prende in prestito da nessuno."
  - en: "The selection runs through Detroit, hardgroove, industrial, acid, mental, hardtek, tribe, oldschool. The sets express sensation and power through hypnotic, engaging grooves. The lives lean into acid, mental and groovy territory — produced on Ableton 12 with virtual synths and professional plugins, with one rule: no trends, only emotions."
    it: "La selezione attraversa Detroit, hardgroove, industrial, acid, mental, hardtek, tribe, oldschool. I set esprimono sensazione e potenza attraverso groove ipnotici e coinvolgenti. I live si spingono verso territori acid, mental e groovy — prodotti su Ableton 12 con sintetizzatori virtuali e plugin professionali, con una sola regola: niente trend, solo emozioni."
factFile:
  - label:
      en: djing since
      it: djing since
    value:
      en: "age 13"
      it: "dai 13 anni"
  - label:
      en: producing on
      it: produzione su
    value:
      en: "ableton 12"
      it: "ableton 12"
  - label:
      en: based
      it: base
    value:
      en: "milano"
      it: "milano"
  - label:
      en: genres
      it: generi
    value:
      en: "detroit · industrial · acid · mental · hardtek · tribe"
      it: "detroit · industrial · acid · mental · hardtek · tribe"
  - label:
      en: philosophy
      it: filosofia
    value:
      en: "no trends, only emotions"
      it: "niente trend, solo emozioni"
bornIn: "milano, 1993"
basedIn: "milano"
activeSince: "2013"
---
```

- [ ] **Step 4.2: Build and verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: `[build] Complete!`. If you see YAML parse errors, check that multi-dash strings (`——`) are inside double-quotes in the frontmatter.

- [ ] **Step 4.3: Commit**

```bash
git add src/content/about/about.md
git commit -m "content: real bio — fullBio 3 paras, short paragraphs, factFile"
```

---

## Task 5: Add genre strip to Discography

**Files:**
- Modify: `src/components/music/Discography.astro`

- [ ] **Step 5.1: Insert genre strip**

In `src/components/music/Discography.astro`, find this block (around line 10–12):

```astro
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#c8102e;letter-spacing:0.22em;margin-bottom:48px;display:flex;align-items:center;gap:12px;">
    <span style="width:20px;height:1px;background:#c8102e;display:inline-block;"></span>
    D — discography
  </div>

  <!-- TABLE HEADER -->
```

Replace it with:

```astro
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#c8102e;letter-spacing:0.22em;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
    <span style="width:20px;height:1px;background:#c8102e;display:inline-block;"></span>
    D — discography
  </div>
  <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#6b6b6b;letter-spacing:0.18em;margin-bottom:32px;">
    genres —— detroit · hardgroove · industrial · acid · mental · hardtek · tribe · oldschool
  </div>

  <!-- TABLE HEADER -->
```

(The eyebrow's `margin-bottom` shrinks from 48px to 16px since the genre strip now bridges the gap.)

- [ ] **Step 5.2: Build**

```bash
npm run build 2>&1 | tail -5
```

Expected: `[build] Complete!`

- [ ] **Step 5.3: Commit**

```bash
git add src/components/music/Discography.astro
git commit -m "feat: genre strip on Discography section"
```

---

## Task 6: Add production caption to StreamingEmbeds

**Files:**
- Modify: `src/components/music/StreamingEmbeds.astro`

- [ ] **Step 6.1: Insert production caption**

In `src/components/music/StreamingEmbeds.astro`, find this block (around line 5–8):

```astro
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#c8102e;letter-spacing:0.22em;margin-bottom:48px;display:flex;align-items:center;gap:12px;">
    <span style="width:20px;height:1px;background:#c8102e;display:inline-block;"></span>
    B — streaming
  </div>

  <div class="streaming-cols"
```

Replace it with:

```astro
  <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#c8102e;letter-spacing:0.22em;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
    <span style="width:20px;height:1px;background:#c8102e;display:inline-block;"></span>
    B — streaming
  </div>
  <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#6b6b6b;letter-spacing:0.18em;margin-bottom:32px;">
    produced on ableton 12 — virtual synths, professional plugins, no trends.
  </div>

  <div class="streaming-cols"
```

- [ ] **Step 6.2: Build**

```bash
npm run build 2>&1 | tail -5
```

Expected: `[build] Complete!`

- [ ] **Step 6.3: Commit**

```bash
git add src/components/music/StreamingEmbeds.astro
git commit -m "feat: production caption on streaming embeds section"
```

---

## Task 7: Fix About snippet link

**Files:**
- Modify: `src/components/home/AboutSnippet.astro`

- [ ] **Step 7.1: Add locale-aware href**

In `src/components/home/AboutSnippet.astro`, the frontmatter already has `const locale`. Find line 8:

```astro
const { headlineLines, paragraphs, stats } = entry!.data;
const locale = (Astro.currentLocale ?? "en") as "en" | "it";
```

Add one line after it:

```astro
const aboutHref = locale === "it" ? "/it/about" : "/about";
```

Then find line 37 (the link):

```astro
      <a href="#" class="about-link">
```

Change it to:

```astro
      <a href={aboutHref} class="about-link">
```

- [ ] **Step 7.2: Build**

```bash
npm run build 2>&1 | tail -5
```

Expected: `[build] Complete!`

- [ ] **Step 7.3: Commit**

```bash
git add src/components/home/AboutSnippet.astro
git commit -m "fix: About snippet 'read the full story' links to /about"
```

---

## Task 8: Final verification and push

- [ ] **Step 8.1: Dev server spot-check**

```bash
npm run dev
```

Open browser at `http://localhost:4321` and walk through:

- `/media` → scroll the live gallery → confirm 6 real photos appear (not gradient placeholders), red multiply overlay present, captions show "TODO · TODO"
- `/about` → confirm 3-paragraph bio, fact file shows new entries (djing since / producing on / based / genres / philosophy)
- `/` → About snippet shows 2 new short paragraphs, "read the full story" links to `/about`
- `/music` → genre strip visible below `D — discography` eyebrow; production caption below `B — streaming` eyebrow
- `/it/` and `/it/about` → Italian text renders (autodidatta, dai 13 anni, etc.)

- [ ] **Step 8.2: Final build**

```bash
npm run build 2>&1 | tail -8
```

Expected: `[build] Complete!` with all 12 pages built and WebP images in `dist/_astro/`.

- [ ] **Step 8.3: Push**

```bash
git push
```
