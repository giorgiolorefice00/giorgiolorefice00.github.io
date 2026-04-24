# Giorgio Lorefice

Portfolio site for underground techno DJ Giorgio Lorefice.  
Built with **Astro 6 · Tailwind CSS v4 · React islands · WebGL smoke shader**.

---

## Local development

```bash
npm install
npm run dev        # http://localhost:4321/Dj/
```

> With `base: '/Dj'` set in `astro.config.ts`, the dev server mirrors the GitHub Pages path.  
> To develop without the prefix, temporarily remove the `base` line and restore before pushing.

---

## Build

```bash
npm run build      # output → dist/
npm run preview    # preview the dist/ build locally
```

---

## Deploy (GitHub Pages)

Deployment is automated via `.github/workflows/deploy.yml` on every push to `main`.

**One-time setup:**

1. Go to your repo → **Settings → Pages**
2. Source: **GitHub Actions**
3. Push to `main` — the workflow builds and deploys automatically

Live URL: `https://YOURUSERNAME.github.io/Dj/`

---

## CMS (Decap CMS + GitHub OAuth)

The CMS is at `/admin/` (e.g. `https://YOURUSERNAME.github.io/Dj/admin/`).

**Before the CMS works you need a GitHub OAuth proxy.**  
The cheapest option is a one-click Vercel deploy of [decap-oauth-proxy](https://github.com/vencax/netlify-cms-github-oauth-provider) (or similar).

1. Deploy the OAuth proxy to Vercel → note the URL, e.g. `https://my-oauth.vercel.app`
2. Create a GitHub OAuth App:
   - Homepage URL: `https://YOURUSERNAME.github.io/Dj`
   - Callback URL: `https://my-oauth.vercel.app/callback`
3. Set `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` as env vars on the Vercel project
4. Update `public/admin/config.yml`:
   ```yaml
   base_url: https://my-oauth.vercel.app
   ```
5. Commit and push — the CMS will now authenticate via GitHub

**Editing content locally** (no OAuth needed):

Run `npm run dev` and open `http://localhost:4321/Dj/admin/`.  
Decap CMS will use the Git backend; you can switch to `local_backend: true` in `config.yml` for offline editing (requires `npx decap-server` in a second terminal).

---

## Content collections

| Collection | Location | Schema |
|---|---|---|
| `events` | `src/content/events/*.md` | venue, city, day, month, year, eventTitle, setTime, serial?, status |
| `press` | `src/content/press/*.md` | publication, author, date · body = quote text |
| `about` | `src/content/about/about.md` | headlineLines[3], paragraphs[], stats[] |

Add new events or press quotes by creating markdown files following the existing pattern, or via the CMS at `/admin/`.

---

## Static asset paths and GitHub Pages

Hardcoded absolute paths (`/logo.png`, `/dj-photo.jpg`) in components are served correctly  
when the GitHub Pages site is the primary deployment.  
If you add new assets, reference them as:

```astro
<img src={`${import.meta.env.BASE_URL}your-asset.jpg`} />
```

This ensures the `/Dj` base prefix is applied automatically.
