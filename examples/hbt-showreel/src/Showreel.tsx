import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import './fonts';
import { ShowreelCtx, WipeBands, useShowreel } from './primitives';
import { Close, Day2, Floor, Opening, PaintMarkers, Paintstik, Protech, SprayInk, SprayWriter, ZincGuard } from './scenes';
import { C, F, H, MOTION, W, abs, tx } from './theme';
import { CUES, LABELS, ORDER, SceneName } from './timeline';

export type ShowreelProps = {
  /** Roll prices down from the was-price with a strike-through; off = count up from 60%. */
  showWasPrice: boolean;
  /** Draw dashed boxes where product/background image slots are still empty. */
  showPlaceholders: boolean;
};

// Persistent footer: program, dates and scene progress.
function Chrome() {
  const { T } = useShowreel();
  const vis = MOTION.draw(T, CUES.PaintMarkers - 0.2, 0.6) * (1 - MOTION.draw(T, CUES.Close - 0.4, 0.5));
  if (vis <= 0) return null;
  const cur = ORDER.reduce<SceneName>((acc, n) => (LABELS[n] && T >= CUES[n] - 0.1 ? n : acc), 'PaintMarkers');
  const keys = Object.keys(LABELS) as SceneName[];
  const idx = keys.indexOf(cur);
  const day2 = cur === 'Day2' || cur === 'Floor';
  return (
    <div style={abs({ inset: 0, zIndex: 50, opacity: vis })}>
      <div style={abs({ left: 0, right: 0, bottom: 0, height: 76, background: 'linear-gradient(0deg, rgba(6,20,31,.92), rgba(6,20,31,0))' })} />
      <div style={abs({ left: 72, bottom: 30, display: 'flex', gap: 22, alignItems: 'center' })}>
        <div style={{ width: 10, height: 10, background: day2 ? C.red : C.blue }} />
        <span style={tx(24, 700, '#fff', F.ex, { letterSpacing: '.2em' })}>{day2 ? 'HBT Day 2 Only Specials' : 'HBT Conference Specials'}</span>
        <span style={tx(24, 300, C.soft, F.ex, { letterSpacing: '.2em' })}>{day2 ? '15 Oct 2026 only' : '5 – 23 Oct 2026'}</span>
      </div>
      <div style={abs({ right: 72, bottom: 30, display: 'flex', gap: 24, alignItems: 'center' })}>
        <span style={tx(24, 700, '#fff', F.ex, { letterSpacing: '.18em' })}>
          {String(idx + 1).padStart(2, '0')} — {LABELS[cur]}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {keys.map((k, i) => (
            <div key={k} style={{ width: 34, height: 5, background: i === idx ? C.blue : i < idx ? '#fff' : 'rgba(255,255,255,.28)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const Showreel: React.FC<ShowreelProps> = ({ showWasPrice, showPlaceholders }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const T = frame / fps;
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      <ShowreelCtx.Provider value={{ T, showWasPrice, showPlaceholders }}>
        {/* Authored at 1920×1080 and scaled to the composition size (×2 for 4K). */}
        <div style={abs({ left: 0, top: 0, width: W, height: H, transform: `scale(${width / W})`, transformOrigin: '0 0', overflow: 'hidden', background: C.deep, fontFamily: F.cn })}>
          <Opening />
          <PaintMarkers />
          <Paintstik />
          <SprayWriter />
          <SprayInk />
          <Protech />
          <ZincGuard />
          <Day2 />
          <Floor />
          <Close />
          <Chrome />
          <WipeBands />
        </div>
      </ShowreelCtx.Provider>
    </AbsoluteFill>
  );
};
