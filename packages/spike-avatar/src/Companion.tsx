import { Avatar, type AvatarController } from '@bible-strong/avatar-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CENTRE_CELL, cellForOffset, definition, gazeKey } from './gaze'

export type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export type CompanionOptions = {
  corner?: Corner
  size?: number
  /** Clicks anywhere on the page trigger a reaction, not just on the avatar. */
  reactToPageClicks?: boolean
}

/**
 * Two modes, because they are mutually exclusive in the renderer:
 *  - 'gaze' sets the `expression` prop (controlled). Tracks the pointer, but
 *    animations and blinking are suspended while controlled.
 *  - 'anim' clears `expression` (uncontrolled) so ref.play() is permitted.
 * play() returns controlled_by_props if called while an expression prop is set,
 * so the prop must be cleared in a render *before* play is called — which is why
 * the play call lives in an effect keyed on the mode.
 */
type Mode =
  | { kind: 'gaze'; col: number; row: number }
  | { kind: 'anim'; name: string; until: number }

const REACTIONS = ['excited', 'celebrate', 'happy', 'playful', 'laughing', 'surprised']
const IDLE_MS = 5_000
const BORED_MS = 30_000
const SLEEP_MS = 75_000
const REACTION_MS = 2_200
const STORE_KEY = 'spike-avatar:v1'

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Carry drowsiness across full page loads so the companion feels continuous. */
function loadDrowsiness(): number {
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (!raw) return 0
    const { lastSeen, idleFor } = JSON.parse(raw) as { lastSeen: number; idleFor: number }
    const gap = Date.now() - lastSeen
    return gap < 60_000 ? idleFor + gap : 0
  } catch {
    return 0
  }
}

export function Companion({
  corner = 'bottom-right',
  size = 128,
  reactToPageClicks = true,
}: CompanionOptions) {
  const ref = useRef<AvatarController>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = useMemo(prefersReducedMotion, [])

  const [mode, setMode] = useState<Mode>(() =>
    loadDrowsiness() > SLEEP_MS
      ? { kind: 'anim', name: 'sleeping', until: Number.POSITIVE_INFINITY }
      : { kind: 'gaze', ...CENTRE_CELL, col: CENTRE_CELL.col, row: CENTRE_CELL.row },
  )

  const lastPointerAt = useRef(Date.now() - loadDrowsiness())
  const asleep = useRef(loadDrowsiness() > SLEEP_MS)

  // Clearing `expression` and calling play() must happen in that order, so play
  // runs here — after the render in which the prop became undefined.
  useEffect(() => {
    if (mode.kind !== 'anim') return
    const result = ref.current?.play(mode.name)
    if (result && !result.ok) console.warn('[spike-avatar]', result.error.code, result.error.message)
  }, [mode])

  const wake = useCallback(() => {
    lastPointerAt.current = Date.now()
    if (asleep.current) {
      asleep.current = false
      setMode({ kind: 'anim', name: 'waking', until: Date.now() + 1200 })
    }
  }, [])

  // Pointer tracking. setState only fires when the gaze cell actually changes,
  // so a fast mouse sweep costs a handful of renders, not one per event.
  useEffect(() => {
    if (reduced) return
    const onMove = (event: PointerEvent) => {
      wake()
      const host = hostRef.current
      if (!host) return
      const box = host.getBoundingClientRect()
      const { col, row } = cellForOffset(
        event.clientX - (box.left + box.width / 2),
        event.clientY - (box.top + box.height / 2),
      )
      setMode(prev => {
        if (prev.kind === 'anim' && prev.until > Date.now()) return prev
        if (prev.kind === 'gaze' && prev.col === col && prev.row === row) return prev
        return { kind: 'gaze', col, row }
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, wake])

  const react = useCallback(() => {
    wake()
    const name = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
    setMode({ kind: 'anim', name, until: Date.now() + REACTION_MS })
  }, [wake])

  useEffect(() => {
    if (!reactToPageClicks || reduced) return
    window.addEventListener('pointerdown', react, { passive: true })
    return () => window.removeEventListener('pointerdown', react)
  }, [reactToPageClicks, react, reduced])

  // Single timer drives both the return from a reaction and the slide into sleep.
  useEffect(() => {
    if (reduced) return
    const tick = window.setInterval(() => {
      const now = Date.now()
      const idleFor = now - lastPointerAt.current
      try {
        sessionStorage.setItem(STORE_KEY, JSON.stringify({ lastSeen: now, idleFor }))
      } catch {
        /* private mode — drowsiness simply resets next page */
      }
      setMode(prev => {
        if (prev.kind === 'anim' && prev.until > now) return prev
        if (idleFor > SLEEP_MS) {
          asleep.current = true
          return prev.kind === 'anim' && prev.name === 'sleeping'
            ? prev
            : { kind: 'anim', name: 'sleeping', until: Number.POSITIVE_INFINITY }
        }
        if (idleFor > BORED_MS) {
          return prev.kind === 'anim' && prev.name === 'bored'
            ? prev
            : { kind: 'anim', name: 'bored', until: Number.POSITIVE_INFINITY }
        }
        if (idleFor > IDLE_MS) {
          return prev.kind === 'anim' && prev.name === 'idle'
            ? prev
            : { kind: 'anim', name: 'idle', until: Number.POSITIVE_INFINITY }
        }
        // Recent pointer activity but a reaction just finished: resume looking.
        return prev.kind === 'anim' ? { kind: 'gaze', col: CENTRE_CELL.col, row: CENTRE_CELL.row } : prev
      })
    }, 500)
    return () => window.clearInterval(tick)
  }, [reduced])

  // The spikes paint outside the SVG viewBox: measured worst case is 38 of the
  // 300 viewBox units (~12.7% of `size`) as the head turns, and the reaction
  // animations rotate further than the gaze grid does, so allow extra headroom.
  // Derive the corner inset from that so the avatar can never clip the viewport.
  const inset = Math.max(20, Math.ceil(size * 0.16) + 10)

  const onError = useCallback(
    (error: { code: string; message: string }) =>
      console.warn('[spike-avatar]', error.code, error.message),
    [],
  )

  return (
    <div
      ref={hostRef}
      className={`spike-avatar spike-avatar--${corner}`}
      style={{ width: size, height: size, ['--spike-inset' as string]: `${inset}px` }}
      onClick={react}
    >
      <Avatar
        ref={ref}
        definition={definition}
        expression={mode.kind === 'gaze' ? gazeKey(mode.col, mode.row) : undefined}
        defaultExpression={reduced ? 'neutral' : undefined}
        size={size}
        ariaLabel="Spike, an animated avatar that follows your cursor"
        onError={onError}
      />
    </div>
  )
}
