# React avatar usage guide

Install the package, create your component and choose the right control level.

## Installation

Add the React package and its peer dependencies.

```bash
npm install @bible-strong/avatar-react react react-dom
```

If you import types such as `AvatarDefinition`, `AnimationKey` or
`ExpressionKey` — as the [generic Avatar](#generic-avatar) example does — also
add the core package as a direct dependency. `avatar-react` does **not**
re-export them, and it only pulls `avatar-core` in transitively, so a bare
import resolves through npm hoisting and breaks under pnpm, Yarn PnP or a
nested install strategy:

```bash
npm install @bible-strong/avatar-core
```

### Requirements

|               |                                                  |
| ------------- | ------------------------------------------------ |
| React         | `^19.0.0` (peer, `react` and `react-dom`)        |
| Node          | `>=22.12.0`                                      |
| Module format | ESM only (`"type": "module"`, no CommonJS entry) |
| License       | AGPL-3.0-only                                    |

### Stylesheet types

`@bible-strong/avatar-react/styles.css` ships no type declaration, so under
plain `tsc` the side-effect import fails with `TS2882: Cannot find module or
type declarations for side-effect import`. Bundler setups that include
`vite/client` (or equivalent `*.css` ambient types) already cover it; otherwise
declare it once:

```ts
// css.d.ts
declare module '*.css' {}
```

## Recommended API: create a concrete avatar

`createAvatar` validates the JSON and returns a dedicated component with typed
animation keys.

```tsx
import { createAvatar } from '@bible-strong/avatar-react'
import '@bible-strong/avatar-react/styles.css'
import avatarJson from './avatar.avatar.json'

const StrobiAvatar = createAvatar(avatarJson)

export function Strobi() {
  return <StrobiAvatar defaultAnimation="sleeping" />
}
```

## Avatar props

Complete reference: type, default value, behavior and constraints for every prop.

### Target and playback

| Prop                | Type                                 | Default      | Behavior and constraints                                                                                                                                                      |
| ------------------- | ------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `definition`        | `AvatarDefinition`                   | — (required) | Validated `AvatarDefinition` object containing the expressions and animations to display.                                                                                     |
| `animation`         | `AnimationKey \| undefined`          | —            | Controls a timeline by key. Each step chooses the displayed expression. Passing it together with `expression` throws; a controlled target takes priority over default values. |
| `expression`        | `ExpressionKey \| undefined`         | —            | Directly controls an expression by key. Passing it together with `animation` throws; a controlled target takes priority over default values.                                  |
| `defaultAnimation`  | `AnimationKey \| undefined`          | —            | Defines the initial timeline in uncontrolled mode. Read on mount; autoplay is enabled by default. Passing it together with `defaultExpression` throws.                        |
| `defaultExpression` | `ExpressionKey \| undefined`         | —            | Defines the initial expression in uncontrolled mode. Read on mount without starting a timeline. Passing it together with `defaultAnimation` throws.                           |
| `autoplay`          | `boolean \| undefined`               | `true`       | Automatically starts `defaultAnimation`; without `defaultAnimation`, it has no effect. Only an explicit `false` disables it.                                                  |
| `ref`               | `Ref<AvatarController> \| undefined` | —            | Provides access to the imperative `AvatarController` API.                                                                                                                     |

### Presentation

| Prop        | Type                            | Default               | Behavior and constraints                                                  |
| ----------- | ------------------------------- | --------------------- | ------------------------------------------------------------------------- |
| `size`      | `number \| string \| undefined` | `240`                 | Number or CSS value used for the container width and height.              |
| `className` | `string \| undefined`           | —                     | CSS class added to the outer container.                                   |
| `style`     | `CSSProperties \| undefined`    | —                     | Inline styles for the outer container; width and height come from `size`. |
| `ariaLabel` | `string \| undefined`           | `"Procedural avatar"` | Accessible name announced to screen readers.                              |

### Playback callbacks

| Prop                 | Type                                  | Behavior                                                                                                                                   |
| -------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `onAnimationEnd`     | `(animation: AnimationKey) => void`   | Receives the key of a `once` animation when it completes naturally.                                                                        |
| `onExpressionChange` | `(expression: ExpressionKey) => void` | Receives the expression key whenever the displayed semantic expression changes.                                                            |
| `onError`            | `(error: AvatarRuntimeError) => void` | Receives a typed error when an animation, expression or default prop references an unknown key. Without it, these log via `console.error`. |

## Controlled and uncontrolled mode

Passing `animation` or `expression` puts the avatar in **controlled** mode;
`defaultAnimation` and `defaultExpression` do not. Two behaviors are worth
knowing, because neither is visible in the types:

- **"Mutually exclusive" is enforced at runtime, not by the types.** Nothing
  stops `<Avatar animation="…" expression="…" />` from typechecking, but it
  **throws on render**:

  > Avatar accepts either animation or expression, not both. Animation controls
  > a timeline; expression controls a single target.

  `defaultAnimation` together with `defaultExpression` throws the same way. The
  throw is unconditional and happens before any render output, so it takes down
  the subtree rather than reaching `onError` — guard it with an error boundary
  if the props come from somewhere dynamic. Pass one of each pair.

- **In controlled mode the imperative target commands refuse.** `play()` and
  `setExpression()` return
  `{ ok: false, error: { code: 'controlled_by_props', key, message } }` without
  touching playback; drive the avatar through props instead. `pause()`, `stop()`
  and `getState()` are unaffected.

### Callbacks must be referentially stable

`Avatar` lists `onExpressionChange`, `onAnimationEnd` and `onError` in the
dependency arrays of the effects that invoke them. An inline arrow gets a new
identity on every render, so the effect re-runs on every render — and if the
handler sets state, it re-renders, which re-runs the effect, until React throws
`Maximum update depth exceeded`.

```tsx
// Loops: new function identity each render.
<Avatar definition={definition} onExpressionChange={e => setLast(e)} />

// Correct: stable identity.
const handleExpressionChange = useCallback((e: ExpressionKey) => setLast(e), [])
<Avatar definition={definition} onExpressionChange={handleExpressionChange} />
```

Wrap every callback in `useCallback` (or hoist it out of the component). This
bites only when the handler updates state — a handler that just logs re-fires
harmlessly.

### Typed keys narrow inputs only

`createAvatar` narrows `animation`, `defaultAnimation`, `expression` and
`defaultExpression` to the definition's keys, so a typo is a compile error.
It does **not** narrow callback payloads: `CreatedAvatarProps` overrides those
four props and inherits the rest from `AvatarProps`, so `onAnimationEnd` and
`onExpressionChange` still receive the broad `AnimationKey` / `ExpressionKey`
(both aliases of `string`). Type those parameters with the core key types, not
with `keyof typeof definition.animations`.

### Error codes

`onError` and the failed `AvatarCommandResult` carry one of:

| Code                  | Raised when                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| `unknown_animation`   | An animation key is absent from the definition.                                    |
| `unknown_expression`  | An expression key is absent from the definition.                                   |
| `controlled_by_props` | `play()` or `setExpression()` was called while `animation` or `expression` is set. |

With no `onError` handler, prop-target failures fall back to
`console.error('[Avatar] …')`. Command failures are returned, never thrown, so
an ignored `AvatarCommandResult` fails silently.

## Generic Avatar

Use `Avatar` directly when the definition is loaded at runtime or changes
between multiple avatars.

```tsx
import { Avatar } from '@bible-strong/avatar-react'
import type { AvatarDefinition, ExpressionKey } from '@bible-strong/avatar-core'
import '@bible-strong/avatar-react/styles.css'

export function DynamicAvatar({
  definition,
  expression,
}: {
  definition: AvatarDefinition
  expression: ExpressionKey
}) {
  return (
    <Avatar
      definition={definition}
      expression={expression}
      onError={(error) => console.error(error)}
    />
  )
}
```

## Imperative API

The ref exposes playback commands and the avatar's current state.

Target commands are available in uncontrolled mode; otherwise use props.

| Method          | Signature                                            | Behavior                                                                                                           |
| --------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `play`          | `(animation: AnimationKey) => AvatarCommandResult`   | Starts or resumes an animation and returns a typed result. Refuses in controlled mode.                             |
| `pause`         | `() => void`                                         | Pauses the timeline at its exact position.                                                                         |
| `stop`          | `() => void`                                         | In uncontrolled mode, stops playback and returns to neutral. In controlled mode, props remain the source of truth. |
| `setExpression` | `(expression: ExpressionKey) => AvatarCommandResult` | Directly displays an expression. Refuses in controlled mode.                                                       |
| `getState`      | `() => AvatarPlaybackState`                          | Returns the active animation, expression and status.                                                               |

```tsx
import { createAvatar, type AvatarController } from '@bible-strong/avatar-react'
import { useRef } from 'react'
import avatarJson from './avatar.avatar.json'

const StrobiAvatar = createAvatar(avatarJson)

export function Controls() {
  const avatar = useRef<AvatarController>(null)

  return (
    <>
      <StrobiAvatar ref={avatar} defaultAnimation="sleeping" />
      <button onClick={() => avatar.current?.play('sleeping')}>
        Play animation
      </button>
      <button onClick={() => avatar.current?.pause()}>Pause</button>
      <button onClick={() => avatar.current?.setExpression('neutral')}>
        Set expression
      </button>
      <button onClick={() => avatar.current?.stop()}>Stop</button>
      <button onClick={() => console.log(avatar.current?.getState())}>
        Read state
      </button>
    </>
  )
}
```

## Writing a definition

`createAvatar` and `Avatar` both validate the definition and **throw** on a bad
one (`Invalid avatar definition: …`), so these constraints are worth knowing up
front. They come from the shipped `avatarDefinition.schema.json`, and several
are stricter than the TypeScript types suggest:

| Field                                   | Constraint                                                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `colors.body`, `colors.eyes`            | `^#[0-9a-f]{6}$` — **lowercase** six-digit hex. `#5B8DEF` is rejected; the `HexColor` type (`` `#${string}` ``) accepts it. |
| Expression / animation keys             | `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$` — lowercase kebab-case, max 64 chars.                                                     |
| `perspective`                           | `0.1`–`10`. Not a pixel distance; `600` is rejected.                                                                        |
| `surface.width/height/depth`            | `0.001`–`10000`. `surfacePresets` from `avatar-core` gives sensible per-shape values (most around 240).                     |
| `surface.roundness` and friends         | `0`–`1`.                                                                                                                    |
| `surface.type`                          | `sphere`, `mickey`, `cursor`, `cube`, `capsule`, `cylinder`, `cone`, `diamond`.                                             |
| `steps[].holdMs`                        | `100`–`60000`; `transitionMs` `0`–`5000`; 1–128 steps.                                                                      |
| `blink.minIntervalMs` / `maxIntervalMs` | `250`–`120000`; `durationMs` `50`–`2000`.                                                                                   |
| `playbackMode`                          | `loop`, `once` or `pingPong`. `onAnimationEnd` only fires for `once`.                                                       |
| Head rotations                          | `-360`–`360`; most other numbers are bounded to ±10000.                                                                     |

Validate before shipping a hand-written definition:

```ts
import { validateAvatarDefinition } from '@bible-strong/avatar-core'

const result = validateAvatarDefinition(json)
if (!result.ok) console.error(result.errors) // [{ path, code, message }]
```

The definition is validated once per immutable object reference, and
revalidated when that reference changes — so build it outside render or
memoize it, rather than constructing a new object each render.

## Running the demo

[`examples/avatar-demo`](../examples/avatar-demo) is a Vite + React 19 app that
renders a five-expression, three-animation avatar and drives it through the
imperative controller, with a live `getState()` and event readout:

```bash
cd examples/avatar-demo
npm install
npm run dev     # http://localhost:5173
```

## Verified against

`@bible-strong/avatar-react@0.1.0` with `@bible-strong/avatar-core@0.1.0`,
React 19.3.0, TypeScript 7.0.2. Every example above typechecks under `strict`
with `moduleResolution: bundler` (given the `*.css` declaration noted in
[Installation](#stylesheet-types)). Defaults, the definition constraints and the
`controlled_by_props` behavior were read from the shipped `dist/` bundle,
`dist/*.d.ts` and `avatarDefinition.schema.json`. The two mutual-exclusivity
throws, the callback-stability loop and the rendered output were confirmed in a
real browser against `examples/avatar-demo`.
