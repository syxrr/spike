# spike-avatar

Your avatar as a fixed-corner companion that follows the cursor, reacts to
clicks, and stays put as you move between pages.

It builds to **one self-contained file**. React, the avatar renderer, your
definition and all CSS are bundled in, so it drops into any site — plain HTML,
Astro, Next.js, WordPress — with a single script tag. Your site does not need
React, a bundler, or a build step.

## Install

Copy `dist/spike-avatar.js` next to your pages, then add this before `</body>`
on every page:

```html
<script src="spike-avatar.js" defer></script>
```

That is the whole integration. If your pages share a header/footer partial,
template or layout file, put it there once instead of in each page.

### Options

Set them on the script tag:

```html
<script
  src="spike-avatar.js"
  data-corner="bottom-right"
  data-size="132"
  data-page-clicks="true"
  defer
></script>
```

| Attribute          | Default        | Meaning                                                                               |
| ------------------ | -------------- | ------------------------------------------------------------------------------------- |
| `data-corner`      | `bottom-right` | `bottom-right`, `bottom-left`, `top-right` or `top-left`.                             |
| `data-size`        | `128`          | Avatar width/height in px. The corner inset scales with it automatically.             |
| `data-page-clicks` | `true`         | `false` makes it react only to clicks on the avatar itself, not anywhere on the page. |

Or drive it yourself:

```html
<script src="spike-avatar.js"></script>
<script>
  SpikeAvatar.mount({ corner: 'top-left', size: 96 })
  // SpikeAvatar.unmount()
</script>
```

## Behavior

**Follows the cursor.** The renderer has no "look at this point" control —
expressions are fixed preset keys. So the build synthesises a 9 × 5 grid of gaze
poses by varying only the head rotation of your `neutral` expression
(`head.y` = yaw, negative left; `head.x` = pitch, positive up — measured from the
rendered geometry, not eyeballed),
and switches between them as the pointer moves. Expression changes tween over a
fixed 420 ms, which gives the gaze a soft lag rather than a snap.

**Reacts to clicks** by playing one of `excited`, `celebrate`, `happy`,
`playful`, `laughing` or `surprised` for ~2.2 s, then returns to following.

**Gets bored.** After 5 s with no pointer it plays `idle`, after 30 s `bored`,
after 75 s `sleeping`. Moving the mouse plays `waking` and it resumes watching.

**Stays across pages.** On a single-page app the component never unmounts, so
nothing is lost. On a plain multi-page site each navigation is a fresh page
load, so its drowsiness is carried in `sessionStorage` — navigate away from a
sleeping avatar and it is still asleep when the next page loads.

### Two modes, because the renderer forbids mixing them

Setting the `expression` prop puts `Avatar` into controlled mode, where `play()`
refuses with `controlled_by_props` and **blinking and animations stop**. So the
companion switches between:

- **gaze** — `expression` set, tracking the pointer, no blinking;
- **animation** — `expression` cleared so `play()` is permitted.

The `expression` prop must be cleared in a render _before_ `play()` is called,
which is why the play call lives in an effect keyed on the mode rather than in
the event handler.

## Accessibility and cost

- Honors `prefers-reduced-motion`: no tracking, no animation, a static `neutral`.
- Carries an `aria-label`; it is decorative and not focusable.
- Touch devices have no pointer to follow, so it stays on the idle animations
  and still reacts to taps.
- **129 KB gzipped**, almost all of it React plus the renderer. That is real
  weight for a decorative element — load it with `defer` (as above) so it never
  blocks your page, and consider skipping it on mobile if your budget is tight.

## Build

```bash
npm install
npm run build     # -> dist/spike-avatar.js
```

`src/avatar.json` is your exported definition. Replace it and rebuild to change
the character; the gaze grid is regenerated from its `neutral` expression.
