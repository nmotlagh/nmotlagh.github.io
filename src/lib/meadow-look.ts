// Palettes and composition for the meadow scene. Shared by the WebGL renderer
// and the Canvas 2D fallback so both paint the same picture.

/** Palette slots, in uniform-array order (the shaders index them by position). */
export const PALETTE_KEYS = [
  'skyTop',
  'skyMid',
  'skyHor',
  'glow',
  'core',
  'ridgeFar',
  'ridgeMid',
  'forest',
  'mist',
  'groundFar',
  'ground',
  'stemShadow',
  'stemLit',
  'rim',
  'headLit',
  'headWrong',
  'headShadow',
  'line',
  'firefly',
  'scrim',
  'star',
  'veilLow',
] as const;

export type PaletteKey = (typeof PALETTE_KEYS)[number];
type Palette = Record<PaletteKey, string>;

// Night meadow: green-black sky, a pale afterglow low on the right, moss greys.
const DARK: Palette = {
  skyTop: '#03070a',
  skyMid: '#08100f',
  skyHor: '#1c2922',
  glow: '#48583f',
  core: '#e9eecb',
  ridgeFar: '#1b2721',
  ridgeMid: '#0f1813',
  forest: '#060a08',
  mist: '#7f927c',
  groundFar: '#141e18',
  ground: '#050806',
  stemShadow: '#070b09',
  stemLit: '#66785a',
  rim: '#e6efbd',
  headLit: '#cfd9a8',
  headWrong: '#d99468',
  headShadow: '#121a15',
  line: '#e2f59c',
  firefly: '#d4f25a',
  scrim: '#0a0d0b',
  star: '#dfe8dc',
  veilLow: '#1a251f',
};

// Dawn meadow: pale sage mist, a warm low sun, stalks above the line crisp and
// sunlit, stalks below it veiled in the mist.
const LIGHT: Palette = {
  skyTop: '#c9d4ca',
  skyMid: '#dbe3d8',
  skyHor: '#eff0e4',
  glow: '#fbf3d6',
  core: '#fffdf0',
  ridgeFar: '#c8d3c7',
  ridgeMid: '#b3c2b2',
  forest: '#a9b8a6',
  mist: '#f6f6ee',
  groundFar: '#cbd6c3',
  ground: '#d5ddcc',
  stemShadow: '#91a38c',
  stemLit: '#4c6044',
  rim: '#e9d38a',
  headLit: '#ab9a4f',
  headWrong: '#b8684a',
  headShadow: '#a7b5a1',
  line: '#fffbe6',
  firefly: '#c8d64a',
  scrim: '#eef1ea',
  star: '#ffffff',
  veilLow: '#e6ebe1',
};

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const flatten = (p: Palette) => {
  const out = new Float32Array(PALETTE_KEYS.length * 3);
  PALETTE_KEYS.forEach((k, i) => out.set(hexToRgb(p[k]), i * 3));
  return out;
};

export const PALETTE_DARK = flatten(DARK);
export const PALETTE_LIGHT = flatten(LIGHT);

/** Writes the palette at theme mix `t` (0 dark, 1 light) into `out`. */
export const mixPalette = (t: number, out: Float32Array) => {
  for (let i = 0; i < out.length; i++) out[i] = PALETTE_DARK[i] + (PALETTE_LIGHT[i] - PALETTE_DARK[i]) * t;
  return out;
};

export const paletteColor = (pal: Float32Array, key: PaletteKey) => {
  const i = PALETTE_KEYS.indexOf(key) * 3;
  return [pal[i], pal[i + 1], pal[i + 2]] as const;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface MeadowLayout {
  /** 0 on a phone in portrait, 1 on a landscape desktop. */
  wide: number;
  /** Horizon (= threshold line) in CSS px from the top. */
  horizon: number;
  /** Scene unit in px: the depth scale of the field. */
  unit: number;
  lightX: number;
  lightY: number;
  /** Text column the scene keeps calm, as fractions of width and height:
   * everything left of `textX` and below `textY`. */
  textX: number;
  textY: number;
}

/** Composition for a canvas of `w` x `h` CSS px. The hero text sits bottom-left:
 * the left ~55% and bottom ~60% on desktop, full width and bottom ~70% on phones. */
export const layoutFor = (w: number, h: number): MeadowLayout => {
  const wide = smooth(0.62, 1.35, w / h);
  // Low horizon: the sky band holds the light and the tallest stalks; the copy
  // sits in the calm field below it.
  const horizon = h * lerp(0.3, 0.38, wide);
  const below = h - horizon;
  const unit = Math.max(120, Math.min(below, w * lerp(0.8, 0.5, wide)));
  return {
    wide,
    horizon,
    unit,
    lightX: w * lerp(0.72, 0.76, wide),
    lightY: horizon - h * lerp(0.07, 0.095, wide),
    textX: lerp(1.05, 0.58, wide),
    textY: lerp(0.29, 0.38, wide),
  };
};
