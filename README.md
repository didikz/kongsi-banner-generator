# Kongsi LinkedIn Banner Generator

Pick a role, generate all three panel styles for it, and download each as a
full-size 1584×396 LinkedIn banner PNG. Compositing happens in the browser on
an HTML5 canvas from the static PNG components in `public/assets/`; the Worker
only serves files.

## Stack

- **Hono** worker (`src/index.ts`) + **Workers static assets** (`public/`)
- **Tailwind v4** (built with `@tailwindcss/cli`)
- Vanilla ES-module JS, no client framework

## Local dev

```sh
npm install
npm run build        # compile Tailwind into public/app.css
npx wrangler dev     # serve on http://localhost:8787
```

For live Tailwind rebuilds while editing styles, run `npm run dev` (watch mode)
in one terminal and `npx wrangler dev` in another.

## Deploy

```sh
npm run deploy       # = npm run build && npx wrangler deploy
```

The worker is routed to the custom domain `kongsibanner.didiktrisusanto.dev`
(see `[[routes]]` in `wrangler.toml`). That DNS zone must already be on the
Cloudflare account you authenticate with, or `wrangler deploy` will fail to
create the route.

## Layout

- `src/index.ts` — Hono worker (health GET, 404s for missing assets, SPA fallback)
- `src/app.css` — Tailwind v4 entry and brand `@theme` tokens
- `public/index.html`, `public/app.js` — the page and compositing logic
- `public/assets/` — copy of `kongsi-banner-components/` (PNGs + `layout.json`)

The client fetches `layout.json` at runtime as the single source of truth for
roles, panel variations, and mascot placement — no role/pose data is hardcoded
in the app.
