import React, { createContext, useContext } from 'react';
import { Img, staticFile } from 'remotion';
import { SLOTS } from './slots';
import { C, F, H, MOTION, SK, W, abs, clamp, tx } from './theme';
import { CUES, ORDER, SceneName, TOTAL, WIPE_IN, WIPE_LEN } from './timeline';

export type ShowreelState = { T: number; showWasPrice: boolean; showPlaceholders: boolean };
export const ShowreelCtx = createContext<ShowreelState>({ T: 0, showWasPrice: true, showPlaceholders: false });
export const useShowreel = () => useContext(ShowreelCtx);

export function useSpan(name: SceneName) {
  const { T } = useShowreel();
  const i = ORDER.indexOf(name);
  const s = CUES[name];
  const e = i < ORDER.length - 1 ? CUES[ORDER[i + 1]] : TOTAL;
  return { T, s, e, lt: T - s, i };
}

// ---------- scene container with diagonal left-to-right wipe ----------
export function Scene({ name, bg = C.deep, children }: { name: SceneName; bg?: string; children: React.ReactNode }) {
  const { T, s, e, i } = useSpan(name);
  const first = i === 0;
  const last = i === ORDER.length - 1;
  const inP = first ? 1 : MOTION.draw(T, s - WIPE_IN, WIPE_LEN);
  const outP = last ? 0 : MOTION.draw(T, e - WIPE_IN, WIPE_LEN);
  const visible = (first || T >= s - WIPE_IN) && (last || T <= e - WIPE_IN + WIPE_LEN);
  if (!visible) return null;
  const X = -SK + inP * (W + 2 * SK);
  const clip = inP < 1 ? `polygon(0 0, ${X + SK}px 0, ${X - SK}px ${H}px, 0 ${H}px)` : 'none';
  return (
    <div data-scene={name} style={abs({ inset: 0, overflow: 'hidden', clipPath: clip, zIndex: i + 1, background: bg })}>
      <div style={abs({ inset: 0, transform: `translateX(${(1 - inP) * -200 + outP * 180}px)` })}>{children}</div>
      <div style={abs({ inset: 0, background: C.deep, opacity: outP * 0.55 })} />
    </div>
  );
}

export function WipeBands() {
  const { T } = useShowreel();
  return (
    <>
      {ORDER.slice(1).map((n) => {
        const p = MOTION.draw(T, CUES[n] - WIPE_IN, WIPE_LEN);
        if (p <= 0 || p >= 1) return null;
        const X = -SK + p * (W + 2 * SK);
        const band = (off: number, w: number, color: string) => (
          <div
            style={abs({
              inset: 0,
              background: color,
              clipPath: `polygon(${X + SK - off - w}px 0, ${X + SK - off}px 0, ${X - SK - off}px ${H}px, ${X - SK - off - w}px ${H}px)`,
            })}
          />
        );
        return (
          <div key={n} style={abs({ inset: 0, zIndex: 60 })}>
            {band(0, 120, C.blue)}
            {band(150, 16, C.dblue)}
            {band(186, 4, '#fff')}
          </div>
        );
      })}
    </>
  );
}

// ---------- image slots ----------
export function Slot({ id, src, fit, placeholder }: { id: string; src?: string; fit: 'cover' | 'contain'; placeholder: string }) {
  const { showPlaceholders } = useShowreel();
  const file = SLOTS[id] ?? src;
  if (file) {
    return <Img src={staticFile(file)} style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />;
  }
  if (!showPlaceholders) return null;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        border: '3px dashed rgba(255,255,255,.45)',
        background: 'rgba(255,255,255,.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        ...tx(22, 500, 'rgba(255,255,255,.75)', F.ex, { whiteSpace: 'normal', lineHeight: 1.3, textTransform: 'none' }),
      }}
    >
      {id}
      <br />
      {placeholder}
    </div>
  );
}

export function Photo({
  id, src, ph, s, e, from = 1.1, to = 1.02, x0 = 0, x1 = 0, grey = true,
}: { id: string; src?: string; ph: string; s: number; e: number; from?: number; to?: number; x0?: number; x1?: number; grey?: boolean }) {
  const { T } = useShowreel();
  const k = clamp((T - (s - WIPE_IN)) / (e - s + WIPE_IN + 0.5), 0, 1);
  return (
    <div
      style={abs({
        inset: -60,
        transform: `translateX(${x0 + (x1 - x0) * k}px) scale(${from + (to - from) * k})`,
        filter: grey ? 'grayscale(1) contrast(1.18) brightness(0.82)' : 'none',
      })}
    >
      <Slot id={id} src={src} fit="cover" placeholder={ph} />
    </div>
  );
}

export function Pack({
  id, ph, x, y, w, h, rot = 0, at, from = -520, float = 0,
}: { id: string; ph: string; x: number; y: number; w: number; h: number; rot?: number; at: number; from?: number; float?: number }) {
  const { T } = useShowreel();
  const p = MOTION.enter(T, at, 1.1);
  const bob = Math.sin((T + float) * 1.6) * 6;
  return (
    <div
      style={abs({
        left: x, top: y, width: w, height: h,
        opacity: clamp(p * 1.6, 0, 1),
        transform: `translateX(${(1 - p) * from}px) translateY(${bob}px) rotate(${rot + (1 - p) * -8}deg)`,
        filter: 'drop-shadow(0 34px 38px rgba(0,0,0,.55))',
      })}
    >
      <Slot id={id} fit="contain" placeholder={ph} />
    </div>
  );
}

// ---------- typography / callouts ----------
export function Reveal({ at, d = 0.85, dir = 'up', style, children }: { at: number; d?: number; dir?: 'up' | 'left'; style?: React.CSSProperties; children: React.ReactNode }) {
  const { T } = useShowreel();
  const p = MOTION.enter(T, at, d);
  const tr = dir === 'up' ? `translateY(${(1 - p) * 108}%)` : `translateX(${(1 - p) * -104}%)`;
  return (
    <div style={{ overflow: 'hidden', paddingBottom: 4, ...style }}>
      <div style={{ transform: tr }}>{children}</div>
    </div>
  );
}

export function Tag({ at, bg = C.blue, children }: { at: number; bg?: string; children: React.ReactNode }) {
  return (
    <Reveal at={at} dir="left" style={{ display: 'flex' }}>
      <div style={{ background: bg, padding: '11px 20px 9px', ...tx(24, 700, '#fff', F.ex, { letterSpacing: '.2em', lineHeight: 1 }) }}>{children}</div>
    </Reveal>
  );
}

export function Rule({ at, w = 220, h = 8, color = C.red, style }: { at: number; w?: number; h?: number; color?: string; style?: React.CSSProperties }) {
  const { T } = useShowreel();
  const p = MOTION.draw(T, at, 0.7);
  return <div style={{ width: w * p, height: h, background: color, ...style }} />;
}

export function Price({ at, value, was, unit, size = 180, color = '#fff' }: { at: number; value: number; was?: number; unit: string; size?: number; color?: string }) {
  const { T, showWasPrice } = useShowreel();
  const vis = MOTION.enter(T, at, 0.7);
  const roll = MOTION.draw(T, at + 0.1, 1.0);
  const showWas = showWasPrice && was !== undefined;
  const start = showWas ? was : value * 0.6;
  const v = start + (value - start) * roll;
  const [d, c] = v.toFixed(2).split('.');
  const strike = MOTION.draw(T, at + 0.5, 0.5);
  return (
    <div style={{ opacity: vis, transform: `translateX(${(1 - vis) * -70}px)`, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: size * 0.05 }}>
        <span style={tx(size * 0.4, 800, color, F.cn, { marginTop: size * 0.07 })}>$</span>
        <span style={tx(size, 900, color, F.cn, { letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' })}>{d}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: size * 0.08, marginTop: size * 0.04 }}>
          <span style={tx(size * 0.46, 900, color, F.cn, { fontVariantNumeric: 'tabular-nums' })}>{c}</span>
          <span style={tx(Math.max(24, size * 0.12), 500, C.soft, F.ex, { letterSpacing: '.14em', lineHeight: 1.15, whiteSpace: 'pre' })}>{unit}</span>
        </div>
      </div>
      {showWas ? (
        <div style={{ position: 'relative', alignSelf: 'flex-start', ...tx(28, 500, C.soft, F.ex, { letterSpacing: '.12em' }) }}>
          WAS ${was.toFixed(2)}
          <div style={abs({ left: -4, top: '45%', height: 3, width: `calc(${strike * 100}% + 8px)`, background: C.red })} />
        </div>
      ) : null}
    </div>
  );
}

export function SaveTag({ at, text, size = 40, style }: { at: number; text: string; size?: number; style?: React.CSSProperties }) {
  const { T } = useShowreel();
  const p = MOTION.pop(T, at, 0.55);
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        opacity: p,
        transform: `scale(${0.6 + 0.4 * p}) rotate(${-4 + 2 * p}deg)`,
        transformOrigin: 'left center',
        background: C.red,
        padding: `${size * 0.28}px ${size * 0.45}px ${size * 0.2}px`,
        ...tx(size, 900, '#fff', F.cn, { letterSpacing: '.02em' }),
        ...style,
      }}
    >
      {text}
    </div>
  );
}

export type Colour = [hex: string, name?: string, fluoro?: 1];

export function Chips({ at, colours, size = 46, gap = 12, labels = false }: { at: number; colours: Colour[]; size?: number; gap?: number; labels?: boolean }) {
  const { T } = useShowreel();
  return (
    <div style={{ display: 'flex', gap, flexWrap: labels ? 'nowrap' : 'wrap' }}>
      {colours.map(([hex, name], i) => {
        const p = MOTION.pop(T, at + i * 0.06, 0.45);
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
            <div style={{ width: size, height: size, background: hex, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.35)' }} />
            {labels ? <span style={tx(24, 500, '#fff', F.cn, { letterSpacing: '.06em' })}>{name}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

export function PriceRows({ rows, at, step, pad, nameSize, valueSize, valueColor = '#fff' }: { rows: [string, string][]; at: number; step: number; pad: number; nameSize: number; valueSize: number; valueColor?: string }) {
  return (
    <>
      {rows.map(([n, v], i) => (
        <Reveal key={n} at={at + i * step} dir="left">
          <div style={{ display: 'flex', gap: 28, justifyContent: 'space-between', alignItems: 'baseline', padding: `${pad}px 0`, borderBottom: '1px solid rgba(255,255,255,.3)' }}>
            <span style={tx(nameSize, 500, '#fff', F.cn, { letterSpacing: '.04em' })}>{n}</span>
            <span style={tx(valueSize, 900, valueColor)}>{v}</span>
          </div>
        </Reveal>
      ))}
    </>
  );
}

export function Logo({ width = 220 }: { width?: number }) {
  return <Img src={staticFile('assets/dymark-logo.png')} alt="Dy-Mark" style={{ width, display: 'block' }} />;
}
