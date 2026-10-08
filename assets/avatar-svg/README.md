# Avatar SVGs

Static poses exported from the real renderer, not redrawn. Each file is
standalone: inline fills, no classes, no external stylesheet, and its clip-path
ids are namespaced so several can be inlined into one page without colliding.
`viewBox` is cropped to the painted geometry with 6 units of padding, so the
spikes are never clipped, and `width`/`height` are set to 512px wide — override
them or drop them to let the file scale.

## Angles

Head rotation only, from the `neutral` expression. `head.y` is yaw (negative
looks left), `head.x` is pitch (**positive looks up**).

| File | yaw | pitch |
| --- | --- | --- |
| `angle-front.svg` | 0 | 0 |
| `angle-look-left.svg` | -30 | 0 |
| `angle-look-right.svg` | +30 | 0 |
| `angle-look-up.svg` | 0 | +16 |
| `angle-look-down.svg` | 0 | -14 |
| `angle-three-quarter.svg` | -22 | +9 |

## Reactions

The avatar's own authored expressions, unmodified.

| File | Expression |
| --- | --- |
| `react-happy.svg` | `joyful-wide` |
| `react-surprised.svg` | `surprised-wide-left` |
| `react-angry.svg` | `angry-brows` — carries its own red colour override |
| `react-curious.svg` | `curious-left` |
| `react-sleepy.svg` | `sleepy-squint` |
| `react-asleep.svg` | `eyes-closed` |

Regenerate by rendering each pose and reading `svg.innerHTML`; the geometry is
computed at runtime, so there is no source file to edit.
