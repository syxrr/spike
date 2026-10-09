import type { CSSProperties } from 'react';

// Authored in 1920×1080 space; Showreel scales ×2 to 3840×2160.
export const W = 1920;
export const H = 1080;
export const SK = 320; // horizontal skew of the diagonal wipe edge

export const C = {
  blue: '#0093D0',
  dblue: '#00608A',
  navy: '#003A5D',
  deep: '#06141F',
  black: '#231F20',
  grey: '#616264',
  steel: '#9AA3AA',
  red: '#D7282F',
  yellow: '#FFE600',
  soft: '#C7D9E5',
};

export const F = {
  cn: '"Helvetica Neue LT Std Cn","Barlow Condensed","Arial Narrow",sans-serif',
  ex: '"Helvetica Neue LT Std Ex","Helvetica Neue",Helvetica,sans-serif',
  imp: '"Podium Sharp","Anton",Impact,sans-serif',
};

export const PANEL = 'linear-gradient(90deg,#06141F 0%,#003A5D 60%,#00608A 100%)';

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// Same hand-rolled curves as the Claude Design prototype, so timing matches exactly.
export const Ease = {
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeOutQuart: (t: number) => 1 - Math.pow(t - 1, 4),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

// The three motion curves every element uses. T, s and d are in seconds.
export const MOTION = {
  enter: (T: number, s: number, d = 0.8) => Ease.easeOutExpo(clamp((T - s) / d, 0, 1)),
  draw: (T: number, s: number, d = 0.8) => Ease.easeInOutCubic(clamp((T - s) / d, 0, 1)),
  pop: (T: number, s: number, d = 0.5) => Ease.easeOutQuart(clamp((T - s) / d, 0, 1)),
};

export const tx = (
  size: number,
  weight = 900,
  color = '#fff',
  fam = F.cn,
  extra: CSSProperties = {},
): CSSProperties => ({
  fontFamily: fam,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 0.9,
  textTransform: 'uppercase',
  margin: 0,
  whiteSpace: 'nowrap',
  ...extra,
});

export const abs = (o: CSSProperties): CSSProperties => ({ position: 'absolute', ...o });
