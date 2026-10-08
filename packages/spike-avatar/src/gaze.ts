import type { AvatarDefinition } from '@bible-strong/avatar-core'
import source from './avatar.json'

/**
 * The renderer has no "look at this point" control — expressions are preset keys.
 * So we synthesise a grid of gaze poses up front by varying only the head rotation
 * of `neutral`, and switch between them as the pointer moves.
 *
 * Axes were confirmed by rendering a probe grid:
 *   head.y = yaw   (negative looks left, positive looks right)
 *   head.x = pitch (negative looks up,   positive looks down)
 *
 * The whole definition is built once at module scope. Avatar validates per object
 * reference, so a stable reference means it validates exactly once.
 */
export const YAW_STEPS = 9
export const PITCH_STEPS = 5

const YAW_LIMIT = 30
const PITCH_UP = -16
const PITCH_DOWN = 14

export const gazeKey = (col: number, row: number) => `gaze-c${col}-r${row}`

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const neutral = source.expressions.neutral
const gazeExpressions: Record<string, unknown> = {}
const gazeKeys: string[] = []

for (let col = 0; col < YAW_STEPS; col++) {
  for (let row = 0; row < PITCH_STEPS; row++) {
    const yaw = lerp(-YAW_LIMIT, YAW_LIMIT, col / (YAW_STEPS - 1))
    const pitch = lerp(PITCH_UP, PITCH_DOWN, row / (PITCH_STEPS - 1))
    const key = gazeKey(col, row)
    gazeKeys.push(key)
    gazeExpressions[key] = {
      ...neutral,
      // A touch of counter-roll with the yaw reads as the head leaning into the look.
      head: { x: pitch, y: yaw, z: -yaw * 0.12 },
    }
  }
}

/** The author's definition, plus the synthesised gaze poses. Animations are untouched. */
export const definition = {
  ...source,
  expressions: { ...source.expressions, ...gazeExpressions },
  expressionOrder: [...source.expressionOrder, ...gazeKeys],
} as unknown as AvatarDefinition

/** Map a pointer offset from the avatar's centre onto a gaze cell. */
export function cellForOffset(dx: number, dy: number) {
  const REACH = 520 // px at which the gaze is fully deflected
  const nx = Math.max(-1, Math.min(1, dx / REACH))
  const ny = Math.max(-1, Math.min(1, dy / REACH))
  return {
    col: Math.round(((nx + 1) / 2) * (YAW_STEPS - 1)),
    row: Math.round(((ny + 1) / 2) * (PITCH_STEPS - 1)),
  }
}

export const CENTRE_CELL = { col: (YAW_STEPS - 1) / 2, row: (PITCH_STEPS - 1) / 2 }
