# AGENTS.md

LinkedIn banner generator for Kongsi. A Hono worker serves static files; all banner
compositing happens **client-side** on an HTML5 canvas. No tests exist — verification is
typecheck + `wrangler` dry-run + a browser pass.

## Commands

```sh
npm install
npm run build          # Tailwind -> public/app.css (REQUIRED after any class change)
npm run typecheck      # tsc --noEmit (only static check)
npx wrangler dev       # http://localhost:8787 (no Vite)
npm run dev            # Tailwind watch ONLY — run alongside wrangler dev
npm run deploy         # build + wrangler deploy
npx wrangler deploy --dry-run   # bundle/assets check without uploading
```

## Asset duplication (easy trap)

- `kongsi-banner-components/` is the local-only source pack (gitignored). `public/assets/` is
  the tracked, deployed copy — they are **not** linked. After editing the source pack,
  re-sync it:
  `rsync -a --exclude '.DS_Store' kongsi-banner-components/ public/assets/`
- Sample cards are static `<figure>`s in `public/index.html` (rendered at first paint to avoid
  CLS); `fillSamples()` only fills their captions from `layout.json`. Images load WebP
  derivatives from `public/assets/examples/webp/` (800px wide, ~12 KB each). If the example
  PNGs change, regenerate them:
  `for f in public/assets/examples/*.png; do cwebp -q 80 -resize 800 0 "$f" -o "public/assets/examples/webp/$(basename "${f%.png}").webp"; done`
- Role chips are static `<button data-role>` markup in `public/index.html` (rendered at first
  paint to avoid CLS); `wireRoleChips()` binds them. Adding a role means editing both the chip
  markup and `kongsi-banner-components/layout.json`.
- The browser fetches `public/assets/layout.json` at runtime; it is the single source of
  truth for panel variations and mascot placement. `ROLE_LABELS`/`POSE_LABELS` are
  display-name maps only.

## Compositing model (fixed, from layout.json)

Canvas 1584×396, draw order: background at (0,0) → role panel (396×266) at (872,64) →
mascot `md` PNG at its pose's `banner_placement.left/top`, natural size. `climb-higher` is
the special case (left 1210 / top 52 / height 275). A soft canvas drop-shadow is applied to
the mascot to match finished banners. Only `md` mascot sizes are used; `sm`/`lg` would break
the designed 300px height. Output must stay 1× (panels/mascots have no consistent `@2x`).

Images must stay same-origin: loading them cross-origin taints the canvas and breaks
`toBlob` downloads.

## Tailwind v4 quirks

- No `tailwind.config`; brand colors/fonts are `@theme` tokens in `src/app.css`.
- The page is the **light Kongsi theme** (matches shipkongsi.com): `page` `#f2f4f7`,
  `surface` white, `ink` `#172235`, `ink-soft` `#4a5568`, plus `teal-deep`, `teal-soft`,
  `orange-deep`, `red`. The old `teal-light`/`pill`/`foam` tokens are gone.
- The banner canvas preview uses `bg-navy-deep` and stays **dark on purpose** — the LinkedIn
  banner itself is dark navy. Do not "fix" it to match the light page.
- Chip styling lives in `src/app.css` as `.chip`/`.chip-active` component classes; `app.js`
  only swaps those two class names.
- The scanner reads `public/app.js` too, but **dynamic class-name concatenation**
  (`'bg-' + color`) is not detected — use full literal class strings.
- `public/app.css` is generated (built from `src/app.css`) and ships with the deploy; never
  hand-edit it.
- Fonts are self-hosted at `public/fonts/` — Inter (`inter-latin.woff2`, variable) for body,
  Montserrat (`montserrat-{600,700,800}.woff2`) for `font-display` headings — and preloaded
  from `public/index.html`. Do not re-add the Google Fonts stylesheet: it is render-blocking
  and the CSP no longer allows it.
- Adding a third-party origin (font/CDN) requires updating the CSP meta in
  `public/index.html`. HTML is served with `Cache-Control: no-transform` (see
  `src/index.ts`) so Cloudflare cannot inject its Web Analytics beacon; if you remove that
  header, the beacon returns and the strict `script-src 'self'` will log CSP errors.

## UI notes

- The result panel (`#result`) is always visible; before generation it shows the
  `#result-empty` placeholder and the mascot controls are locked with the `.locked-control`
  visual class and native disabled controls. Do not re-add `hidden` to it — that collapses
  the right column to empty space on desktop.

## Worker behavior

- Static assets are served before the worker (default). `src/index.ts` only handles
  `/api/health`, real 404s for `/assets/*` misses, and an index.html SPA fallback for other
  paths. Keep asset 404s as 404s; do not route them to the shell.

## Deploy

`wrangler.toml` pins the custom domain `kongsibanner.didiktrisusanto.dev`; the DNS zone must
already be on the authenticated Cloudflare account or deploy fails at route creation.

## Known false positive

DevTools keeps reporting "Lazy-loaded images should have explicit dimensions" despite the
sample `<img>`s having `width`/`height`; ignore it.
