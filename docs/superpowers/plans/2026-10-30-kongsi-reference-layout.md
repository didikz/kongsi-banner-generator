# Kongsi Reference Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the generator to match the supplied Stitch reference layout while keeping the existing client-side compositor, real generated banners, and example gallery below the output.

**Architecture:** Keep the current single-page Hono/static-assets architecture and `layout.json`-driven canvas compositor. Reshape only the HTML shell, Tailwind component styles, and DOM wiring: a desktop left role rail sits beside a right mascot/output column, while mobile stacks those regions. The generated output remains real canvas previews from the existing PNG layers; the sample WebP gallery stays a separate lower reference section.

**Tech Stack:** Hono + Cloudflare Workers static assets, Tailwind CSS v4, vanilla ES modules, HTML canvas, self-hosted Inter/Montserrat.

---

## File map

- Modify `public/index.html`: reference-inspired header, hero, split workspace, always-visible output placeholder, generated-output card, example gallery, and LinkedIn usage cards.
- Modify `public/app.js`: preserve compositor behavior while adapting state/render functions to the new DOM; keep role/pose/mirror controls and per-card errors.
- Modify `src/app.css`: only add/refine light-theme component utilities needed by the new cards, step markers, status pill, usage cards, and locked controls. Keep existing Kongsi tokens and `.chip`/`.chip-active` classes.
- Regenerate ignored `public/app.css` with `npm run build`; do not commit it.
- Modify `AGENTS.md` only if the final DOM/state structure creates a durable agent trap not already documented.

## Task 1: Replace the page shell with the reference layout

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: Keep the existing security/performance head contract.**

Preserve the current strict CSP, favicon, self-hosted Inter/Montserrat preloads, and `/app.css` link. Do not re-add Google Fonts, third-party scripts, or inline executable code.

- [ ] **Step 2: Build the compact reference header.**

Use a white sticky header with:

- Existing Kongsi mark and `KONGSI`/`Banner Generator` identity.
- A teal status/version pill matching the reference tone, such as `3 panel styles · 1584 × 396 px`.
- The existing `LinkedIn · 1584 × 396 px` badge on wider screens.
- No fake Share or Brand Guidelines buttons.

- [ ] **Step 3: Replace hero copy and spacing.**

Use a light page background, a teal availability pill, a large Montserrat heading that wraps as:

```text
Your Kongsi banner, ready for
LinkedIn.
```

Use supporting copy that states the real behavior:

```text
Pick your role, customize the mascot pose, preview in real time, and download
high-resolution 1584×396 banners for the Kongsi crew.
```

- [ ] **Step 4: Create the desktop workspace grid.**

Use a responsive grid equivalent to:

```html
<div class="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
```

The left card contains role selection and Generate. The right column contains the mascot controls card followed by the generated-output card. At mobile widths, the grid must stack in DOM order.

- [ ] **Step 5: Make the role card match the screenshot hierarchy.**

Keep the ten existing static `button[data-role]` controls in a two-column grid. Add a compact header with a dark numbered marker `1`, `Choose your role`, and `10 presets`. Keep the existing Generate action and hint; do not invent extra role behavior.

- [ ] **Step 6: Split mascot controls from generated output.**

Create a right-side controls card with marker `2`, title `Tune the mascot & style`, helper text, and the existing pose group plus mirror switch. Do not add color palette controls. The mirror switch must retain `role="switch"` and `aria-checked`.

- [ ] **Step 7: Add the generated-output card below controls.**

Create a card with marker `3`, title `Download your banners`, current-role subtitle, and a `banner-list` container. Keep the existing output placeholder and three real generated cards inside this card. Each generated card must retain its description and `Download PNG` action; label the action with the native output size in visible text or accessible name (`PNG · 1584×396`).

- [ ] **Step 8: Add the lower reference and usage sections.**

Keep all six existing WebP example figures below the workspace under `Example banners`. Add a static three-card section titled `How to update your LinkedIn banner` with:

1. `Pick and export` — choose a role and panel style, then download PNG.
2. `Go to LinkedIn profile` — open the profile background/header camera control and upload the PNG.
3. `Save without cropping` — the asset is already 1584×396, so no cropping is needed.

Keep the footer and no horizontal-overflow behavior.

## Task 2: Adapt client wiring without changing banner composition

**Files:**
- Modify: `public/app.js`

- [ ] **Step 1: Preserve the existing compositor contract.**

Do not change `compositeBanner(layout, role, variation, pose, mirror)`, its layer order, 1584×396 canvas dimensions, original PNG inputs, mascot placement, drop shadow, or `toBlob('image/png')` download path.

- [ ] **Step 2: Keep static role-chip wiring compatible with the new markup.**

`wireRoleChips(layout)` must continue binding only valid `data-role` buttons. Selecting a role must:

```js
state.role = role
state.pose = layout.roles[role].mascot.pose
state.mirror = false
```

Then update active chip state, role subtitle, mascot control state, mirror UI, and prefetch the role assets.

- [ ] **Step 3: Keep the result card always visible.**

Do not toggle `hidden` on `#result`. Add or preserve helpers that:

- show `#result-empty` and clear `#banner-list` when a role changes;
- unlock the mascot controls after a role is selected;
- hide `#result-empty` only when `renderBanners()` starts producing cards.

- [ ] **Step 4: Preserve render race/error handling.**

`renderBanners()` must snapshot role, pose, and mirror before awaits; render the three variations in parallel; and catch per-card image failures. Failed cards show an explanatory message and disable only their own download button.

- [ ] **Step 5: Keep caption/data behavior layout-driven.**

`fillSamples(layout)` continues filling the static sample captions from `layout.json`. Do not duplicate panel descriptions in the new HTML. `ROLE_LABELS` and `POSE_LABELS` remain display-label maps only.

- [ ] **Step 6: Update only copy and selectors required by the new markup.**

Do not add color-theme state, ZIP generation, server-side rendering, fake Share/Guidelines actions, or any sample image as generated output.

## Task 3: Refine visual components and responsive states

**Files:**
- Modify: `src/app.css`
- Regenerate: `public/app.css`

- [ ] **Step 1: Keep the current light Kongsi token system.**

Use the existing `page`, `surface`, `ink`, `ink-soft`, `navy`, `teal`, `teal-deep`, `teal-soft`, `orange`, and `orange-deep` tokens. Do not bring back removed dark-page tokens (`teal-light`, `pill`, `foam`).

- [ ] **Step 2: Add reusable reference-layout primitives.**

Define small component classes only where Tailwind markup becomes repetitive:

- `.step-mark` for dark circular numbered markers;
- `.status-pill` for the teal outlined status badge;
- `.usage-card` for the three lower instructional cards;
- a locked-control state that preserves contrast while making pose/mirror controls non-interactive before role selection.

Keep `.chip` and `.chip-active` as the role/pose button styles and retain `button:not(:disabled) { cursor: pointer; }`.

- [ ] **Step 3: Preserve accessibility and motion behavior.**

Keep visible `:focus-visible` outlines, `prefers-reduced-motion` scroll behavior, semantic button labels, explicit image dimensions, and responsive card widths. Check that disabled controls use `disabled` or `pointer-events-none` consistently and remain visually understandable.

- [ ] **Step 4: Build the CSS output.**

Run:

```sh
npm run build
```

Expected: Tailwind completes successfully and emits `public/app.css`; this file stays ignored and uncommitted.

## Task 4: Verify, commit, and deploy

**Files:**
- No new product files; optional `AGENTS.md` update only if needed.

- [ ] **Step 1: Run static checks.**

```sh
node --check public/app.js
npm run typecheck
npm run build
npx wrangler deploy --dry-run
```

Expected: all commands exit 0; dry-run reads the deployed asset tree.

- [ ] **Step 2: Run a local browser smoke test.**

Start `npx wrangler dev --port 8787`, then verify at desktop and 390px mobile:

- result card is visible before selection and shows only the placeholder copy;
- role card and result card sit side-by-side on desktop;
- cards stack on mobile with no horizontal overflow;
- role selection unlocks pose/mirror controls and updates the role subtitle;
- Generate renders exactly three canvases at `1584×396`;
- pose and mirror changes rerender all three canvases;
- sample gallery has six WebP images and three usage cards appear below it;
- no console errors or warnings.

- [ ] **Step 3: Check accessibility and visual states.**

Keyboard-tab through role, Generate, pose, mirror, and download controls. Confirm focus is visible, the empty state is understandable, disabled mascot controls cannot be activated before role selection, and the light-theme contrast remains AA-compliant.

- [ ] **Step 4: Run Lighthouse on the local or deployed page.**

Confirm the redesign does not regress the existing performance gains: no layout shift from static role/sample markup, self-hosted fonts remain used, and no third-party CSP errors appear.

- [ ] **Step 5: Commit the redesign.**

```sh
git add public/index.html public/app.js src/app.css AGENTS.md
git commit -m "Redesign generator around reference workspace layout"
```

Do not stage `public/app.css`, `node_modules/`, `.wrangler/`, env files, or credentials. If new font/assets are added, inspect `git diff --cached --name-only` before committing.

- [ ] **Step 6: Deploy only after verification.**

```sh
npm run deploy
git push origin main
```

After deployment, smoke-check `/`, `/api/health`, `/assets/layout.json`, and one real generated banner flow on `https://kongsibanner.didiktrisusanto.dev`.
