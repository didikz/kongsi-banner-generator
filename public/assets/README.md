# Kongsi LinkedIn banner — component pack

Split assets so you can recompose banners in Figma / Canva / Photoshop.

## Folders

| Path | Contents |
|------|----------|
| `background/` | Shared 1584×396 (and 2×) canvas: navy gradient, routes, glow, pill, logo, tagline, accent bar — **no** role panel, **no** mascot |
| `role-panels/<role>/` | 3 transparent PNG variations per role (`-v1`, `-v2`, `-v3`). v1 also has `@2x`. |
| `mascot/<pose>/` | Official Koko only: original + sm/md/lg × normal + horizontally mirrored |
| `examples/` | Recomposed banners from components (verification) |
| `layout.json` / `LAYOUT.md` | Positions, sizes, colors, fonts, per-role defaults |

## Mascot poses (official only)

`welcome`, `celebrate`, `climb-higher`, `carry-parcel`

**New poses are not generated here.** Request official assets from Kongsi’s design team, drop them into `pack/assets/`, then re-export.

Mascot PNGs are flat (no CSS drop-shadow). Full banners apply a soft drop-shadow in CSS; examples bake a light shadow for closer match.

## Recompose

1. Place `background/background-1584x396.png` at (0,0)
2. Place a panel PNG at **(872, 64)** (= slot 900×92 minus 28px capture padding)
3. Place mascot `…-md.png` at the pose’s `place_at` from `layout.json`

## Brand

- Font: **Inter** (mono only for engineering Go/terminal)
- Teal `#0f7c85` · Navy `#0d1b2a` · Orange `#F4A22C` · Green `#74b943`

## Caveats

- Route lines live on the **background** and run under/through panel & mascot zones (same as finished banners).
- Glow behind Koko is on the background.
- Panel rotation/shadows are baked into each panel PNG.
- Pixel-diff vs finished banners may be small (font hinting / shadow approximation).

Source template: `../src/` (`banner.template.html`, `banner.css`, `panels/*-vN.html`).
