# Kongsi Banner Generator Reference Layout

## Goal

Reshape the generator to match the supplied Stitch reference screenshot while keeping the
existing Kongsi banner compositor and real generated assets. The reference gallery remains
below the generated output and is never used as generated output.

## Visual direction

- Use the existing light Kongsi theme: pale blue-gray page, white surfaces, dark navy ink,
  teal accents, orange action, Inter body, and Montserrat display headings.
- Use a compact white header with Kongsi identity and the LinkedIn `1584 × 396 px` badge.
  Do not add fake Share or Brand Guidelines actions.
- Use a teal status pill, a large two-line hero headline, and concise supporting copy.
- Use white rounded cards with thin borders, restrained shadows, dark numbered step markers,
  and the reference screenshot's spacious hierarchy.
- Keep generated banners visually dominant; keep sample/reference banners clearly secondary.

## Responsive structure

Desktop:

```text
Header
Hero
┌───────────────────┐  ┌───────────────────────────────────┐
│ Role controls     │  │ Mascot controls                    │
│ Generate          │  │ Generated banner downloads         │
└───────────────────┘  └───────────────────────────────────┘
Example banners
How to update your LinkedIn banner
Footer
```

Mobile stacks in this order: hero, role controls, mascot controls, generated banners, example
banners, usage instructions, footer. No horizontal overflow.

## Existing functionality preserved

- `public/assets/layout.json` remains the runtime source of truth for roles, mascot poses,
  panel variations, descriptions, and asset paths.
- `compositeBanner()` remains unchanged in purpose and continues to draw the original PNG
  layers at 1584×396. Download output remains original-size and pixel-accurate.
- Role selection applies that role's default mascot pose.
- Pose and mirror controls remain functional. No color-theme palette is added.
- Generate renders all three panel variations in parallel.
- Pose or mirror changes rerender all three generated banners.
- Changing role resets the output to the visible empty placeholder and applies the new default
  pose.
- A failed asset load keeps the affected card's error state and disables only that card's
  download.

## UI behavior

- The generated result card is always visible; it must not be hidden before generation, because
  hiding it leaves an empty desktop right column.
- Before a role is selected, the result card shows `Nothing generated yet` and a short prompt;
  mascot controls are muted and non-interactive.
- After role selection, controls unlock but the placeholder remains until Generate.
- After Generate, the placeholder is replaced by three real canvas previews. Each card shows
  the description from `layout.json` and a PNG download action labeled with `1584 × 396`.
- Keep the six existing WebP examples below the generated section.
- Add three static usage cards below examples: pick and export, go to LinkedIn profile, and save
  without cropping. Static markup preserves layout stability.

## Scope boundaries

- Do not copy the screenshot's invented banner artwork, color palette controls, Share action,
  Brand Guidelines action, or ZIP download unless separately implemented and approved.
- Do not change the compositor, canvas dimensions, component pack, or original PNG downloads.
- Do not add server-side image processing.

## Verification

- `npm run build` and `npm run typecheck` pass.
- `npx wrangler deploy --dry-run` succeeds.
- Browser check at desktop and 390px mobile confirms the two-column/stacked layouts, no
  horizontal overflow, visible empty state, role selection, generation, pose/mirror rerender,
  and three 1584×396 canvases.
- Check console errors, keyboard focus, reduced-motion behavior, button cursor behavior, and
  contrast of the new light-theme surfaces.
