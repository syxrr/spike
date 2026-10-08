import { createRoot, type Root } from 'react-dom/client'
import avatarCss from '@bible-strong/avatar-react/styles.css?inline'
import ownCss from './styles.css?inline'
import { Companion, type CompanionOptions, type Corner } from './Companion'

const HOST_ID = 'spike-avatar-root'
let root: Root | null = null

function injectStyles() {
  if (document.getElementById('spike-avatar-styles')) return
  const style = document.createElement('style')
  style.id = 'spike-avatar-styles'
  style.textContent = `${avatarCss}\n${ownCss}`
  document.head.appendChild(style)
}

export function mount(options: CompanionOptions = {}) {
  if (root) return
  injectStyles()
  const host = document.createElement('div')
  host.id = HOST_ID
  document.body.appendChild(host)
  root = createRoot(host)
  root.render(<Companion {...options} />)
}

export function unmount() {
  root?.unmount()
  root = null
  document.getElementById(HOST_ID)?.remove()
}

/** Read config off the script tag: <script src="..." data-corner="top-left" data-size="96"> */
function optionsFromScript(): CompanionOptions {
  const el =
    (document.currentScript as HTMLScriptElement | null) ??
    document.querySelector<HTMLScriptElement>('script[src*="spike-avatar"]')
  if (!el) return {}
  const corner = el.dataset.corner as Corner | undefined
  const size = el.dataset.size ? Number(el.dataset.size) : undefined
  return {
    ...(corner ? { corner } : {}),
    ...(Number.isFinite(size) ? { size } : {}),
    ...(el.dataset.pageClicks === 'false' ? { reactToPageClicks: false } : {}),
  }
}

const options = optionsFromScript()
const start = () => mount(options)

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
else start()

// Also reachable manually: SpikeAvatar.mount({ corner: 'top-left' })
export { Companion }
