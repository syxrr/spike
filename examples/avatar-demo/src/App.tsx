import { createAvatar, type AvatarController } from '@bible-strong/avatar-react'
import type { AnimationKey, ExpressionKey } from '@bible-strong/avatar-core'
import { useCallback, useRef, useState } from 'react'
import avatarJson from './strobi.avatar.json'

const StrobiAvatar = createAvatar(avatarJson)

type AnimationName = keyof typeof avatarJson.animations
type ExpressionName = keyof typeof avatarJson.expressions

const ANIMATIONS = Object.keys(avatarJson.animations) as AnimationName[]
const EXPRESSIONS = Object.keys(avatarJson.expressions) as ExpressionName[]

export function App() {
  const avatar = useRef<AvatarController>(null)
  const [log, setLog] = useState<string[]>([])
  const [state, setState] = useState('—')

  const note = useCallback((line: string) => {
    setLog(prev => [`${new Date().toLocaleTimeString()}  ${line}`, ...prev].slice(0, 8))
  }, [])

  // These three MUST be referentially stable. Avatar lists each callback in the
  // dependency array of the effect that invokes it, so an inline arrow gets a new
  // identity every render and the effect re-fires on its own output — any handler
  // that sets state then loops until React throws "Maximum update depth exceeded".
  // Note the parameter types: createAvatar narrows the *input* props to this
  // definition's keys, but callback payloads keep the broad AnimationKey /
  // ExpressionKey (= string) from AvatarProps.
  const handleAnimationEnd = useCallback(
    (animation: AnimationKey) => note(`onAnimationEnd(${animation})`),
    [note],
  )
  const handleExpressionChange = useCallback(
    (expression: ExpressionKey) => note(`onExpressionChange(${expression})`),
    [note],
  )
  const handleError = useCallback(
    (error: { code: string }) => note(`onError(${error.code})`),
    [note],
  )

  // play() and setExpression() return a result instead of throwing — surface it.
  const run = (label: string, command: () => ReturnType<AvatarController['play']>) => {
    const result = command()
    note(result.ok ? `${label} → ok` : `${label} → ${result.error.code}: ${result.error.message}`)
    readState()
  }

  const readState = () => {
    const current = avatar.current?.getState()
    setState(
      current
        ? `${current.status} · expression=${current.activeExpression} · animation=${current.activeAnimation ?? 'none'}`
        : '—',
    )
  }

  return (
    <main className="page">
      <header>
        <h1>Strobi</h1>
        <p>
          <code>@bible-strong/avatar-react</code> driven through the imperative{' '}
          <code>AvatarController</code>.
        </p>
      </header>

      <section className="stage">
        <StrobiAvatar
          ref={avatar}
          defaultAnimation="idle"
          size={300}
          ariaLabel="Strobi, a procedural avatar"
          onAnimationEnd={handleAnimationEnd}
          onExpressionChange={handleExpressionChange}
          onError={handleError}
        />
      </section>

      <section className="controls">
        <div className="group">
          <h2>Animations</h2>
          {ANIMATIONS.map(name => (
            <button key={name} onClick={() => run(`play('${name}')`, () => avatar.current!.play(name))}>
              {name}
            </button>
          ))}
        </div>

        <div className="group">
          <h2>Expressions</h2>
          {EXPRESSIONS.map(name => (
            <button
              key={name}
              onClick={() => run(`setExpression('${name}')`, () => avatar.current!.setExpression(name))}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="group">
          <h2>Playback</h2>
          <button onClick={() => { avatar.current?.pause(); note('pause()'); readState() }}>pause</button>
          <button onClick={() => { avatar.current?.stop(); note('stop()'); readState() }}>stop</button>
          <button onClick={readState}>getState()</button>
        </div>
      </section>

      <section className="readout">
        <h2>getState()</h2>
        <output>{state}</output>
        <h2>Events</h2>
        <ul>
          {log.length === 0 ? <li className="muted">Nothing yet — press a button.</li> : null}
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
