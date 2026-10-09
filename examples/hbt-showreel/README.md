# HBT Conference 2026 Showreel

Remotion port of the Claude Design prototype *HBT Conference Showreel* for Dy-Mark
Australia: a 43-second, 3840×2160, 30 fps, silent, seamlessly looping trade-show video.

| # | Scene | Length |
|---|-------|--------|
| 1 | Opening — "HBT Conference 2026 Exclusive Offers" | 4s |
| 2 | P10 & P20 Paint Markers (+ i70 / i90 / iFine ink markers) | 4.5s |
| 3 | Markal Paintstik B | 4s |
| 4 | Spray Writer — 13-colour wall, fluoros glow | 4.5s |
| 5 | Spray Ink | 4s |
| 6 | Protech — 3D carousel | 4.5s |
| 7 | Zinc Guard | 4s |
| 8 | Day 2 Only Specials (15 Oct) — urgency banner + countdown | 4.5s |
| 9 | AutoTech Floor Coating + Decorative Flakes (Day 2 only) | 4s |
| 10 | Close — logo reveal, visit the stand, fade for loop | 5s |

Scene lengths live in `src/timeline.ts`; every animation is keyed to those cues, so
changing a length shifts everything after it.

## Commands

```bash
npm install
npm run fonts -- /path/to/dy-mark-design-system/fonts   # once, see Fonts
npm run dev          # Remotion Studio
npm run render       # out/hbt-showreel-4k.mp4  (HBTShowreel, 3840×2160)
npm run render:1080  # out/hbt-showreel-1080.mp4 (HBTShowreel1080, fast proxy)
```

## Props (editable in Studio)

- `showWasPrice` (default `true`) — prices roll down from the was-price with a
  strike-through. Off: prices count up and the was-price is hidden.
- `showPlaceholders` (default `false`) — draws dashed boxes with the slot id where
  product or background images are still missing.

## Product and background images

Most product packshots and several backgrounds were empty drop zones in the
prototype. Put files in `public/slots/` and map them in `src/slots.ts`:

- **Products (`pk-*`)** — cut-out PNGs with transparent backgrounds; rendered in
  colour with a cast shadow.
- **Backgrounds (`bg-*`)** — any photo; rendered black-and-white automatically.

Empty slots render nothing, so the video is presentable as-is.

## Fonts

The brand faces (Helvetica Neue LT Std Condensed / Extended) are commercially
licensed, so they're git-ignored. Copy them in with `npm run fonts -- <dir>` before
rendering a final master. Without them the video falls back to Barlow Condensed.
Anton (Day 2 headline) and Barlow Condensed are OFL and committed in
`public/fonts/oss/`.

## Pricing

All prices are ex-GST trade prices from *HBT26 Conference Specials Submission.xlsx*.
Conference specials run 5–23 Oct 2026; Day 2 only specials are 15 Oct 2026.
