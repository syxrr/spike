// Scene outline (seconds). Each scene's cue is the running sum of the durations before it.
export const SCENES = [
  { name: 'Opening', dur: 4, desc: 'Angled blue planes sweep in and the HBT 2026 Exclusive Offers title reveals' },
  { name: 'PaintMarkers', dur: 4.5, desc: 'P10 and P20 paint markers slide in with price callouts and colour dots' },
  { name: 'Paintstik', dur: 4, desc: 'Workshop steel marking shot with Markal Paintstik B price and colours' },
  { name: 'SprayWriter', dur: 4.5, desc: '13-colour wall pulls back, fluoros glow, price spotlight panel slides in' },
  { name: 'SprayInk', dur: 4, desc: 'Construction site with Spray Ink price and an angled colour band' },
  { name: 'Protech', dur: 4.5, desc: 'Protech range rotates on a carousel with price list' },
  { name: 'ZincGuard', dur: 4, desc: 'Heavy industry backdrop, Zinc Guard logo sheen and price rows' },
  { name: 'Day2', dur: 4.5, desc: 'Day 2 Only Specials (15 Oct) red banner, countdown and Line Marking range pricing' },
  { name: 'Floor', dur: 4, desc: 'Day 2 only: AutoTech Epoxy Floor Coating and Decorative Flakes pricing as flakes fall' },
  { name: 'Close', dur: 5, desc: 'Logo reveal, visit the stand, then fade to navy for the loop' },
] as const;

export type SceneName = (typeof SCENES)[number]['name'];

export const ORDER: SceneName[] = SCENES.map((s) => s.name);

export const CUES = (() => {
  const out = {} as Record<SceneName, number>;
  let t = 0;
  for (const s of SCENES) {
    out[s.name] = Math.round(t * 1000) / 1000;
    t += s.dur;
  }
  return out;
})();

export const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0); // 43s

// Footer labels for the product scenes (Opening and Close have none).
export const LABELS: Partial<Record<SceneName, string>> = {
  PaintMarkers: 'Paint Markers',
  Paintstik: 'Markal Paintstik',
  SprayWriter: 'Spray Writer',
  SprayInk: 'Spray Ink',
  Protech: 'Protech',
  ZincGuard: 'Zinc Guard',
  Day2: 'Line Marking',
  Floor: 'Floor Coating',
};

export const WIPE_IN = 0.35;
export const WIPE_LEN = 0.85;
