# Deploying the companion into the portfolio site

Integration notes for the Vite portfolio (`Portfolio Site Dev (localhost)`).

> The stack below was inferred from that session's transcript (`localhost:5173`,
> `npm run build`, `src/main.js`, `templates/render.js` writing files, `effects/`,
> `styles/main.css`) — not from reading the repo. Check the two assumptions
> flagged below before following the steps verbatim.

## Why the prebuilt file, not the npm package

`@bible-strong/avatar-react` is React 19 only. The portfolio is vanilla JS, so
pulling the renderer in as a dependency would add React to its bundle and its
build. `packages/spike-avatar/dist/spike-avatar.js` instead has React, the
renderer, the avatar definition and all CSS compiled into one IIFE that mounts
itself. The site needs no new dependency, no config change, and no React.

It is committed to this repo deliberately so it can be dropped into a consuming
site without a build step.

## Steps

**1. Copy the file into Vite's static directory.**

```bash
cp packages/spike-avatar/dist/spike-avatar.js <portfolio>/public/
```

Vite serves `public/` at the site root in dev and copies it into `dist/`
verbatim on build, so the asset needs no import and no bundler change. If the
project has no `public/`, create it — Vite picks it up by convention.

**2. Add one tag to the shared page template.**

The site generates its pages from `templates/render.js`, so the tag belongs in
whatever shared shell emits `</body>` — add it once there, not per page:

```html
<script
  src="/spike-avatar.js"
  data-corner="bottom-right"
  data-size="132"
  defer
></script>
```

The leading slash matters: pages at nested paths would resolve a relative
`spike-avatar.js` against the wrong directory.

**3. Verify.**

```bash
npm run dev     # then move the cursor, click, and navigate between pages
npm run build && npx vite preview
```

Check that `dist/spike-avatar.js` exists after the build — that confirms the
file was in `public/` rather than somewhere Vite ignores.

## Two assumptions to check first

- **`public/` exists and Vite's root is the project root.** If `vite.config.*`
  sets a custom `publicDir` or `root`, put the file wherever that resolves to.
- **Pages are separate HTML documents.** If `templates/render.js` emits one
  shell and swaps views client-side, the avatar persists on its own and the
  `sessionStorage` continuity below is simply unused — no change needed either
  way.

## What it does on the site

- Follows the cursor from its corner; expression changes tween over a fixed
  420 ms, so the gaze trails rather than snaps.
- Plays a reaction animation on any click.
- Falls to `idle` after 5 s, `bored` after 30 s, `sleeping` after 75 s; wakes
  on pointer movement.
- Carries drowsiness through full page loads in `sessionStorage`, so navigating
  away from a sleeping avatar and back does not reset it.

## Performance note

That session has been chasing hover-driven repaint glitches, so worth being
explicit: the widget adds one **passive** `pointermove` listener, and it only
triggers a React render when the pointer crosses into a different cell of a
9 × 5 gaze grid — not on every event. Its DOM is a single fixed-position SVG in
its own React root appended to `<body>`, outside the site's own render tree, so
it cannot interact with the existing backdrop or scramble effects.

The real cost is weight: **126 KB gzipped**, nearly all React plus the renderer.
`defer` keeps it off the critical path. If that is too much for the site's
budget, the cheapest mitigation is skipping it under a width or
`navigator.connection` check rather than trying to slim the bundle.

## Options

| Attribute          | Default        | Meaning                                                                |
| ------------------ | -------------- | ---------------------------------------------------------------------- |
| `data-corner`      | `bottom-right` | `bottom-right`, `bottom-left`, `top-right`, `top-left`.                |
| `data-size`        | `128`          | Pixel size. The corner inset scales with it, so the spikes never clip. |
| `data-page-clicks` | `true`         | `false` reacts only to clicks on the avatar itself.                    |

Or `SpikeAvatar.mount({ corner, size })` / `SpikeAvatar.unmount()` manually.

`prefers-reduced-motion` is honored automatically: no tracking, no animation,
a static `neutral` pose.
