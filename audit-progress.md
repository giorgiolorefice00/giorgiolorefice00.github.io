# Decap CMS Audit Progress

Started: 2026-05-02

## Summary
- Total tasks: 35
- Complete: 13
- Failed: 0 critical blockers (Phase 2 findings documented below)
- In progress: Task 3.1

## Phase 1 — Configuration sanity check
- [x] 1.1 Read and report full contents of `public/admin/config.yml` — PASS
- [x] 1.2 Confirm `backend.repo` — PASS (`giorgiolorefice00/giorgiolorefice00.github.io`)
- [x] 1.3 Confirm `backend.branch` — PASS (`main`)
- [x] 1.4 Confirm `base_url` — PASS (proxy confirmed live; callback page renders correctly)
- [x] 1.5 Confirm `media_folder` / `public_folder` — PASS

## Phase 2 — Schema integrity
- [x] 2.1 Verify `siteConfig` — N/A (collection does not exist)
- [x] 2.2 Verify `ui` — N/A (collection does not exist)
- [x] 2.3 Verify `pageContent` — N/A (collection does not exist)
- [x] 2.4 Verify `about` — FINDING: 6 bilingual fields in Zod, all plain strings in CMS config
- [x] 2.5 Verify `events`, `press`, `mixes`, `releases` — FINDING: eventTitle/tag/releases.description mismatched; press.bodyIt missing from CMS
- [x] 2.6 Verify `photos`, `videos` — FINDING: videos.title/meta bilingual in Zod, plain in CMS; photos.width/height required in CMS, optional in Zod
- [x] 2.7 Verify `achievements`, `residencies`, `partnerships` — FINDING: achievements.title/description bilingual in Zod, plain in CMS
- [x] 2.8 Mismatch report — 13 CRITICAL + 3 MINOR mismatches (see Failures Log)

## Phase 3 — Content file integrity
- [x] 3.1 List markdown files + build — PASS (83 files, build clean)
- [x] 3.2 Referenced images — FINDING: 7 cover art images MISSING from public/uploads (entire dir is empty except .gitkeep)
- [x] 3.3 TODO:translate markers — PASS (0 markers found)
- [x] 3.4 Identical en/it fields — FINDING: 60 untranslated fields across all collections; big-shampoo.md + tnl2.md have placeholder "TODO: short blurb" in both languages
- [x] 3.5 npm run build — PASS (12 pages, zero errors)

## Phase 4 — CMS UI walkthrough (MANUAL — requires browser)
- [x] 4.1 Login flow — PASS (popup opened, closed, landed on dashboard)
- [x] 4.2 Sidebar collections — PASS (all 10 collections visible)
- [x] 4.3 UI Text collection — N/A (doesn't exist)
- [FAIL] 4.4 About singleton — FAIL: bilingual fields (headlineLines, paragraphs, stats.label, fullBio, factFile.label/value) render as single string inputs showing raw `Map {"en":..., "it":...}` — CMS config uses string widget instead of object widget; editing any of these and saving will corrupt the file and break the build
- [FAIL] 4.5 Events collection — FAIL: eventTitle shows `Map {"en":..., "it":...}` string; all plain fields (venue, city, status etc.) render correctly
- [x] 4.6 Mixes collection — PASS (SoundCloud URL editable plain text; cover art shows broken image as expected — file missing)
- [FAIL] 4.7 Photos collection — FAIL: image upload to media library succeeds, but "Publish" fails with "API_ERROR: Not Found" — authenticated GitHub user lacks write access to giorgiolorefice00/giorgiolorefice00.github.io repo
- [ ] 4.8 Site Config — social URLs editable

## Phase 5 — Round-trip edit test (MANUAL)
- [ ] 5.1 Edit hero tagline to "AUDIT TEST 2026"
- [ ] 5.2 Confirm commit on GitHub
- [ ] 5.3 Confirm change on live site
- [ ] 5.4 Revert change via CMS

## Phase 6 — Bilingual rendering verification (MANUAL)
- [ ] 6.1 Visit English route — confirm English text
- [ ] 6.2 Visit /it/ route — confirm Italian text
- [ ] 6.3 Language switcher on all pages

## Phase 7 — Deliverables
- [ ] 7.1 Generate `audit-report.md`
- [ ] 7.2 Generate `cms-admin-guide.md`

## Failures Log

### Phase 2 — Schema/CMS mismatches (13 critical, 3 minor)
Any CMS save on these fields writes a plain string; Astro build expects `{en, it}` object → `InvalidContentEntryFrontmatterError`.

CRITICAL:
- events.eventTitle — Zod: bil, CMS: string
- events.tag — Zod: bil.optional(), CMS: string
- about.headlineLines[*] — Zod: each bil, CMS: plain string items
- about.paragraphs[*] — Zod: each bil, CMS: plain text items
- about.stats[*].label — Zod: bil, CMS: string
- about.fullBio[*] — Zod: each bil, CMS: plain text items
- about.factFile[*].label — Zod: bil, CMS: string
- about.factFile[*].value — Zod: bil, CMS: string
- achievements.title — Zod: bil, CMS: string
- achievements.description — Zod: bil, CMS: text
- releases.description — Zod: bil, CMS: text
- videos.title — Zod: bil, CMS: string
- videos.meta — Zod: bil, CMS: string

MINOR:
- press.bodyIt — in Zod, missing from CMS (Italian press quotes uneditable via admin)
- photos.width — optional in Zod, required in CMS
- photos.height — optional in Zod, required in CMS
