# Kongsi banner component layout
Canvas: **1584×396**
## Brand
- Font: Inter (IBM Plex Mono only on engineering Go/terminal panels)
- `navy`: `#0d1b2a`
- `navy_deep`: `#07111c`
- `teal`: `#0f7c85`
- `teal_light`: `#5fd0d8`
- `orange`: `#F4A22C`
- `green`: `#74b943`
- `blue`: `#5CA8FF`
- `pill_text`: `#9ee4e8`

## Layers (bottom → top)
1. `background/background-1584x396.png`
2. Role panel PNG at `(slot.x - 28, slot.y - 28)` — slot is 900,92 / 340×210
3. Mascot PNG at pose-specific left/top (see layout.json); height 300 (climb-higher: 275)

## Default pose per role
- **engineering**: `welcome`
- **finance**: `celebrate`
- **operations**: `carry-parcel`
- **sales**: `celebrate`
- **product**: `welcome`
- **design**: `climb-higher`
- **people-ops**: `celebrate`
- **legal**: `welcome`
- **executives**: `climb-higher`
- **crew**: `celebrate`

## Caveats
- Route lines on the background pass through the mascot/panel zones; they are part of the background layer (not cut out around the mascot).
- Banner CSS applies filter:drop-shadow on .mascot; component mascot PNGs are flat (no baked shadow) so you can restyle in Figma.
- Glow behind mascot is on the background layer.
- Only official Koko assets are included. New poses require assets from Kongsi design.
- Panel captures may have slight anti-alias differences vs full-banner renders.
