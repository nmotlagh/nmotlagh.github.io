// Data model for the homepage meadow (MeadowScene.astro). Each of the demo's
// 1,000 sampled CIFAR-100 test predictions becomes one stalk; its height comes
// from the prediction's confidence and its head is tinted by whether the
// prediction was right.
//
// The geometry trick that keeps the picture honest: the camera sits exactly at
// the learned threshold's height. Every stalk, whatever its distance, crosses
// the horizon at the threshold, so the horizon line *is* the threshold and a
// stalk's head clears it exactly when its score is above the learned value.
// Stalk heights are in "eye units": the threshold is 1.

/** Build time: pack scores (integer log-odds x 1000) and correctness into
 * base64 Int16s, `score * 2 + correct`. Scores sit well inside +-16,000. */
export const encodeMeadow = (scores: ArrayLike<number>, correct: ArrayLike<boolean>) => {
  const packed = new Int16Array(scores.length);
  for (let i = 0; i < scores.length; i++) {
    const v = scores[i] * 2 + (correct[i] ? 1 : 0);
    if (!Number.isInteger(scores[i]) || v < -32768 || v > 32767) {
      throw new Error(`meadow: score ${scores[i]} does not pack into int16`);
    }
    packed[i] = v;
  }
  const bytes = new Uint8Array(packed.buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

export interface MeadowSample {
  score: Int32Array;
  correct: Uint8Array;
}

export const decodeMeadow = (b64: string): MeadowSample => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const packed = new Int16Array(bytes.buffer, 0, bytes.length >> 1);
  const n = packed.length;
  const score = new Int32Array(n);
  const correct = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const v = packed[i];
    correct[i] = v & 1;
    score[i] = (v - (v & 1)) / 2;
  }
  return { score, correct };
};

/** Small, fast, seedable PRNG (mulberry32). */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const FLY_COUNT = 18;

/** Fireflies, 4 floats each: [x fraction, y in units below the horizon, phase, radius px].
 * Most drift over the right of the field, away from the text column. */
export const buildFireflies = (count = FLY_COUNT, seed = 7) => {
  const rnd = mulberry32(seed);
  const out = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const right = i < count * 0.8;
    out[i * 4] = right ? 0.5 + 0.48 * rnd() : 0.08 + 0.4 * rnd();
    out[i * 4 + 1] = -0.12 + 0.42 * rnd() ** 1.4;
    out[i * 4 + 2] = rnd() * 50;
    out[i * 4 + 3] = 0.9 + 0.9 * rnd();
  }
  return out;
};

/** Floats per stalk in the instance buffer (three vec4s). */
export const STALK_STRIDE = 12;

export interface MeadowField {
  count: number;
  /** STALK_STRIDE floats per stalk, sorted far to near:
   * [u, gRel, height, phase,  head, correct, tint, lean,  width, headSize, flex, flutter]
   * where head = headType (0 spike, 1 seed clock, 2 nodding spike) + 4 if the stalk is answered. */
  data: Float32Array;
  /** How many stalks clear the threshold (scores above it). */
  answered: number;
  total: number;
}

// Score range the height map is anchored to. Wider than the sample on purpose so
// the map does not depend on the sample's extremes.
const L_MIN = -2500;
const L_MAX = 16000;
const GAMMA = 0.55;
const H_MIN = 0.34;

/** Monotone map from a score (log-odds x 1000) to stalk height in eye units,
 * with the threshold mapped to exactly 1. */
export const heightOf = (score: number, threshold: number) => {
  const u = (s: number) => Math.min(1, Math.max(0, (s - L_MIN) / (L_MAX - L_MIN))) ** GAMMA;
  const ut = Math.max(u(threshold), 1e-3);
  return H_MIN + ((1 - H_MIN) * u(score)) / ut;
};

/**
 * Lay the stalks out in screen-normalised x (`u`, 0..1 across the canvas) and
 * depth (`gRel`: the distance from horizon to the stalk's ground point, as a
 * fraction of the scene unit). Seeded, so the composition is stable.
 */
export const buildField = (sample: MeadowSample, threshold: number, seed: number): MeadowField => {
  const n = sample.score.length;
  const rng = mulberry32(seed);
  // Seeded shuffle so position never correlates with the (sorted) score order.
  const order = new Int32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = order[i];
    order[i] = order[j];
    order[j] = t;
  }

  // Depth bands: most stalks far away (the fine band where field meets fog),
  // fewer in the midfield, a handful near, and a few big soft foreground ones.
  const bands = [
    { share: 0.6, g0: 0.012, g1: 0.1, bias: 1.0, xBias: 0.2 },
    { share: 0.29, g0: 0.1, g1: 0.42, bias: 1.2, xBias: 0.55 },
    { share: 0.095, g0: 0.42, g1: 0.95, bias: 1.3, xBias: 0.75 },
    { share: 0.015, g0: 1.35, g1: 2.6, bias: 1.0, xBias: 1.0 },
  ];
  const data = new Float32Array(n * STALK_STRIDE);
  let k = 0;
  let answered = 0;
  const counts = bands.map((b) => Math.round(b.share * n));
  counts[0] += n - counts.reduce((a, b) => a + b, 0);

  const rows: number[][] = [];
  for (let b = 0; b < bands.length; b++) {
    const band = bands[b];
    const m = counts[b];
    for (let j = 0; j < m; j++) {
      const idx = order[k++];
      const score = sample.score[idx];
      const correct = sample.correct[idx];
      const isAnswered = score > threshold;
      if (isAnswered) answered++;
      const H = heightOf(score, threshold);
      // Stratified x with jitter; the nearer bands lean toward the right so the
      // text column on the left stays calm.
      let u = (j + rng()) / m;
      if (rng() < band.xBias) u = 1 - (1 - u) ** 1.9;
      if (b === 3) {
        // Foreground: mostly off the right edge, a couple at the far left.
        u = j < 2 ? -0.04 + 0.1 * rng() : 0.66 + 0.4 * rng();
      }
      u = -0.03 + u * 1.06;
      const r = rng();
      const gRel = band.g0 * (band.g1 / band.g0) ** (r ** band.bias);
      const headR = rng();
      const headType = headR < 0.55 ? 0 : headR < 0.75 ? 1 : 2;
      rows.push([
        u,
        gRel,
        H,
        rng() * Math.PI * 2,
        headType + (isAnswered ? 4 : 0),
        correct,
        rng() * 2 - 1,
        0.04 + (rng() - 0.5) * 0.26,
        0.75 + rng() * 0.6,
        0.8 + rng() * 0.5,
        0.7 + rng() * 0.6,
        0.8 + rng() * 0.9,
      ]);
    }
  }
  // Far to near, so plain alpha blending layers them correctly.
  rows.sort((a, b) => a[1] - b[1]);
  rows.forEach((row, i) => data.set(row, i * STALK_STRIDE));
  return { count: n, data, answered, total: n };
};
