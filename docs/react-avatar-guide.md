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

| Prop                | Type                                 | Default      | Behavior and constraints                                                                                                                                                                      |
| ------------------- | ------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `definition`        | `AvatarDefinition`                   | — (required) | Validated `AvatarDefinition` object containing the expressions and animations to display.                                                                                                     |
| `animation`         | `AnimationKey \| undefined`          | —            | Controls a timeline by key. Each step chooses the displayed expression. Not to be combined with `expression`, which takes precedence; a controlled target takes priority over default values. |
| `expression`        | `ExpressionKey \| undefined`         | —            | Directly controls an expression by key. Takes precedence over `animation` if both are set; a controlled target takes priority over default values.                                            |
| `defaultAnimation`  | `AnimationKey \| undefined`          | —            | Defines the initial timeline in uncontrolled mode. Read on mount; autoplay is enabled by default. Not to be combined with `defaultExpression`.                                                |
| `defaultExpression` | `ExpressionKey \| undefined`         | —            | Defines the initial expression in uncontrolled mode. Read on mount without starting a timeline. Not to be combined with `defaultAnimation`.                                                   |
| `autoplay`          | `boolean \| undefined`               | `true`       | Automatically starts `defaultAnimation`; without `defaultAnimation`, it has no effect. Only an explicit `false` disables it.                                                                  |
| `ref`               | `Ref<AvatarController> \| undefined` | —            | Provides access to the imperative `AvatarController` API.                                                                                                                                     |

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

- **"Mutually exclusive" is a runtime contract, not a compile-time one.**
  Nothing stops `<Avatar animation="…" expression="…" />` from typechecking.
  When both are set, **`expression` wins** and `animation` is ignored — the
  controlled-target effect applies the expression and returns before it reaches
  the animation branch. The same applies to `defaultAnimation` alongside
  `defaultExpression`. Pass one of each pair.
- **In controlled mode the imperative target commands refuse.** `play()` and
  `setExpression()` return
  `{ ok: false, error: { code: 'controlled_by_props', key, message } }` without
  touching playback; drive the avatar through props instead. `pause()`, `stop()`
  and `getState()` are unaffected.

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

## Verified against

`@bible-strong/avatar-react@0.1.0` with `@bible-strong/avatar-core@0.1.0`,
React 19.3.0, TypeScript 7.0.2. Every example above typechecks under `strict`
with `moduleResolution: bundler` (given the `*.css` declaration noted in
[Installation](#stylesheet-types)). Defaults, the `expression`-over-`animation`
precedence and the `controlled_by_props` behavior were read from the shipped
`dist/index.js` and `dist/*.d.ts`.
