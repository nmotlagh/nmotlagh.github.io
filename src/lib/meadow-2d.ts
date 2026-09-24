// Canvas 2D fallback for the meadow: one still frame, painted once (and again on
// resize or theme change). It follows the WebGL renderer (meadow-gl.ts) layer by
// layer, with the same palette, composition and data mapping, as the WebGL still
// frame (no wind). Fog is smooth bands rather than noise, and there is no grain.

import { buildFireflies, FLY_COUNT, STALK_STRIDE, type MeadowField } from './meadow-data';
import { paletteColor, type MeadowLayout, type PaletteKey } from './meadow-look';

type RGB = readonly [number, number, number];

// The same hash and noise as the shaders, so the silhouettes match.
const fract = (x: number) => x - Math.floor(x);
const hash11 = (p: number) => {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
};
const vnoise = (x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash11(i) + (hash11(i + 1) - hash11(i)) * u;
};
const fbm = (x: number) => {
  let s = 0;
  let a = 0.5;
  for (let i = 0; i < 5; i++) {
    s += a * vnoise(x);
    x = x * 2.07 + 13.1;
    a *= 0.5;
  }
  return s;
};
const crownLine = (x: number, scale: number, seed: number) => {
  const c = Math.floor(x / scale);
  let best = 0;
  for (let k = -1; k <= 1; k++) {
    const ci = c + k;
    const cx = (ci + 0.5 + 0.4 * (hash11(ci + seed) - 0.5)) * scale;
    const rad = scale * (0.7 + 0.55 * hash11(ci * 1.7 + seed + 3));
    const dx = (x - cx) / rad;
    if (Math.abs(dx) > 1) continue;
    const top = rad * (0.25 + 0.85 * hash11(ci * 2.3 + seed + 7));
    best = Math.max(best, top + rad * 0.6 * Math.sqrt(1 - dx * dx));
  }
  return best;
};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const scale3 = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];
const screen = (a: RGB, b: RGB): RGB => [
  1 - (1 - a[0]) * (1 - clamp01(b[0])),
  1 - (1 - a[1]) * (1 - clamp01(b[1])),
  1 - (1 - a[2]) * (1 - clamp01(b[2])),
];
const css = (c: RGB, a = 1) =>
  `rgba(${Math.round(clamp01(c[0]) * 255)},${Math.round(clamp01(c[1]) * 255)},${Math.round(clamp01(c[2]) * 255)},${clamp01(a)})`;

export const drawMeadow2D = (
  ctx: CanvasRenderingContext2D,
  field: MeadowField,
  w: number,
  h: number,
  lay: MeadowLayout,
  pal: Float32Array,
  light: number,
) => {
  const P = (k: PaletteKey) => paletteColor(pal, k) as RGB;
  const { horizon: hz, unit: U, lightX: lx, lightY: ly, wide } = lay;
  const dpr = ctx.canvas.width / w;
  const latW = w * lerp(0.5, 0.4, wide);
  const fogCol = mix(P('skyHor'), P('mist'), 0.25 + 0.45 * 0.35);

  const withOp = (op: GlobalCompositeOperation, fn: () => void) => {
    ctx.save();
    ctx.globalCompositeOperation = op;
    fn();
    ctx.restore();
  };
  // Vertical band: colour `c` with alpha(dy) sampled at `ys` px from `y0` (down is +).
  const band = (y0: number, ys: number[], alpha: (dy: number) => number, c: RGB) => {
    const top = y0 + ys[0];
    const span = ys[ys.length - 1] - ys[0];
    const gr = ctx.createLinearGradient(0, top, 0, top + span);
    for (const dy of ys) gr.addColorStop((dy - ys[0]) / span, css(c, alpha(dy)));
    ctx.fillStyle = gr;
    ctx.fillRect(0, top, w, span);
  };
  // Elliptical glow centred on (cx, cy): alpha(r), r = 0..1 across the radii.
  const ellipse = (cx: number, cy: number, rx: number, ry: number, rs: number[], alpha: (r: number) => number, c: RGB) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx, ry);
    const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    for (const r of rs) gr.addColorStop(r, css(c, alpha(r)));
    ctx.fillStyle = gr;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  };
  const spread = (n: number, k = 1) => Array.from({ length: n + 1 }, (_, i) => (i / n) ** k);

  // Sky: graded from the horizon haze up to near-black.
  const skyAt = (t: number) => mix(mix(P('skyHor'), P('skyMid'), smooth(0, 0.55, t)), P('skyTop'), smooth(0.3, 1, t));
  const sky = ctx.createLinearGradient(0, 0, 0, hz);
  for (const t of spread(10)) sky.addColorStop(1 - t, css(skyAt(t)));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, hz + 1);

  withOp('screen', () => {
    // Low afterglow along the horizon, strongest under the light.
    band(hz, [-U * 1.3, -U * 0.78, -U * 0.52, -U * 0.26, -U * 0.13, 0], (dy) => 0.3 * Math.exp(dy / (U * 0.26)), P('glow'));
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, hz);
    ctx.clip();
    ellipse(lx, hz, latW * 2, U * 1.1, spread(8, 1.6), (r) => 0.7 * Math.exp(-4.2 * r - 2.5 * r * r) * (1 - r), P('glow'));
    // Moon at night; at dawn a larger sun lost in the mist.
    const halo = (r: number) =>
      Math.exp(-r * lerp(7, 5, light)) * lerp(0.24, 0.35, light) + Math.exp(-r * 2.2) * lerp(0.08, 0.2, light);
    const R = 1.8;
    ellipse(lx, ly, U * R, U * R, spread(12, 2), (r) => halo(r * R) * (1 - r * r), P('core'));
    const discR = lerp(0.032, 0.05, light) * U;
    const edge = lerp(0.8, 8, light);
    const Rt = discR + edge;
    const disc = (r: number) => {
      const d = r * Rt;
      const limb = lerp(0.82 + 0.18 * Math.sqrt(Math.max(1 - (d * d) / (discR * discR), 0)), 1, light);
      return (1 - smooth(discR - 1, discR + edge, d)) * limb * lerp(0.8, 0.6, light);
    };
    ellipse(lx, ly, Rt, Rt, spread(14, 0.7), disc, P('core'));
    ctx.restore();
  });

  // Ridges and woodland: silhouettes standing on the horizon, fogged at the base.
  const ridge = (height: (x: number) => number, c: RGB, fog: number, fogH: number) => {
    ctx.beginPath();
    ctx.moveTo(-2, hz + 1);
    for (let x = -2; x <= w + 3; x += 2) ctx.lineTo(x, hz - Math.max(0, height(x)));
    ctx.lineTo(w + 3, hz + 1);
    ctx.closePath();
    const gr = ctx.createLinearGradient(0, hz, 0, hz - fogH * 5);
    for (const t of spread(6)) gr.addColorStop(t, css(mix(c, fogCol, fog * Math.exp(-t * 5))));
    ctx.fillStyle = gr;
    ctx.fill();
  };
  ridge(
    (x) => {
      const env = lerp(0.45, 1, smooth(0.05, 0.85, x / w));
      return U * (0.035 + 0.24 * env * (fbm((x / U) * 1.1 + 3.7) - 0.18));
    },
    mix(P('ridgeFar'), P('skyHor'), 0.28),
    0.5,
    U * 0.06,
  );
  ridge(
    (x) => {
      const k = x / U;
      const crowns = vnoise(k * 30) ** 1.6 * 0.03 + vnoise(k * 85) * 0.012;
      return U * (0.012 + 0.07 * fbm(k * 2.1 + 11) * lerp(0.6, 1, smooth(0.2, 0.7, x / w)) + crowns);
    },
    P('ridgeMid'),
    0.45,
    U * 0.025,
  );
  const woodEnd = lerp(0.3, 0.46, wide);
  ridge(
    (x) => {
      const env = 1 - smooth(0.02, woodEnd, x / w);
      if (env <= 0) return 0;
      const mass = U * lerp(0.1, 0.15, wide) * env ** 0.7;
      const cr = crownLine(x, U * 0.075, 3) * (0.35 + 0.65 * env);
      return (mass + cr) * smooth(0, 0.18, env) - U * 0.004;
    },
    mix(P('forest'), fogCol, 0.08 * light),
    0.4,
    U * 0.035,
  );
  // Fog lying over the ridge bases.
  band(hz, spread(10).map((t) => -U * 0.24 * (1 - t)), (dy) => 0.14 * Math.exp(-(((-dy - U * 0.03) / (U * 0.065)) ** 2)), fogCol);
  band(hz, spread(8).map((t) => -U * 0.3 * (1 - t)), (dy) => 0.05 * Math.exp(-(((-dy - U * 0.14) / (U * 0.07)) ** 2)), fogCol);

  // Field floor, darkening toward the viewer, with mist on the far field.
  const below = Math.max(1, h - hz);
  const ground = ctx.createLinearGradient(0, hz, 0, h);
  for (const t of spread(8)) {
    const dn = t * below;
    ground.addColorStop(t, css(mix(P('groundFar'), P('ground'), smooth(0, U * 0.6, dn))));
  }
  ctx.fillStyle = ground;
  ctx.fillRect(0, hz, w, h - hz);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, hz, w, h - hz);
  ctx.clip();
  const mistK = lerp(0.75, 0.5, light);
  band(hz, spread(8, 1.6).map((t) => t * U * 0.4), (dy) => 0.3 * mistK * Math.exp(-dy / (U * 0.06)), fogCol);
  ellipse(lx, hz, latW * 2, U * 0.36, spread(8, 1.6), (r) => 0.7 * mistK * Math.exp(-6 * r) * (1 - r), fogCol);
  // A low bank of mist across the middle distance.
  band(hz, spread(10).map((t) => U * (0.05 + 0.7 * t)), (dy) => 0.1 * Math.exp(-(((dy - U * 0.4) / (U * 0.2)) ** 2)) * lerp(1, 1.3, light), fogCol);
  ctx.restore();
  // Haze straddling the horizon, strongest under the light.
  withOp('screen', () => {
    const k = 1 - 0.6 * light;
    const hs = [-1, -0.5, -0.25, -0.1, 0, 0.1, 0.25, 0.5, 1].map((t) => t * U * 0.15);
    band(hz, hs, (dy) => 0.05 * k * Math.exp(-Math.abs(dy) / (U * 0.028)), P('mist'));
    ellipse(lx, hz, latW * 2, U * 0.15, spread(8, 1.6), (r) => 0.3 * k * Math.exp(-5.4 * r) * (1 - r), P('mist'));
  });

  // Stalks, far to near. Near ones are drawn into a layer and blurred together
  // (depth of field) where the browser supports canvas filters.
  const canBlur = 'filter' in ctx;
  let layerCanvas: HTMLCanvasElement | null = null;
  let layer: CanvasRenderingContext2D | null = null;
  let bucket = 0;
  const BLUR = [0, 2.4, 5, 10];
  const flush = () => {
    if (!layer || !layerCanvas || bucket === 0) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = `blur(${(BLUR[bucket] * dpr).toFixed(2)}px)`;
    ctx.drawImage(layerCanvas, 0, 0);
    ctx.restore();
  };
  const target = (b: number) => {
    if (!canBlur || b === bucket) return layer ?? ctx;
    flush();
    bucket = b;
    if (b === 0) return ctx;
    if (!layerCanvas) {
      layerCanvas = document.createElement('canvas');
      layerCanvas.width = ctx.canvas.width;
      layerCanvas.height = ctx.canvas.height;
      layer = layerCanvas.getContext('2d');
      if (!layer) return ctx;
    }
    if (!layer) return ctx;
    layer.setTransform(1, 0, 0, 1, 0, 0);
    layer.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
    layer.setTransform(dpr, 0, 0, dpr, 0, 0);
    return layer;
  };

  const d = field.data;
  const SEG = 10;
  const pts = new Float32Array((SEG + 1) * 4);
  for (let i = 0; i < field.count; i++) {
    const o = i * STALK_STRIDE;
    const gRel = d[o + 1];
    const g = gRel * U;
    const H = d[o + 2];
    const L = H * g;
    const x0 = d[o] * w;
    const y0 = hz + g;
    const bend = d[o + 7];
    const answered = d[o + 4] > 3.5;
    const type = d[o + 4] - (answered ? 4 : 0);
    const correct = d[o + 5];
    const tint = d[o + 6];
    const r = Math.log2(Math.max(g, 0.5) / (U * 0.28));
    const blur = r > 0 ? 1.25 * r * r : 0.2 * -r;
    const sigma = 0.45 + blur;
    const rimK = Math.exp(-(((x0 - lx) / (w * 0.38)) ** 2));
    const haze = Math.exp(-g / (U * 0.075));
    const fg = smooth(1.1, 1.7, gRel);
    const c2 = target(blur < 1.6 ? 0 : blur < 3.5 ? 1 : blur < 7 ? 2 : 3);
    const soft = canBlur ? 1 : Math.min(1, 1.4 / sigma + 0.3);

    // Stem: a tapered ribbon, lit exactly where it rises above the threshold.
    const w0 = 0.0068 * g * d[o + 8];
    for (let k = 0; k <= SEG; k++) {
      const s = k / SEG;
      const px = x0 + bend * L * s * s;
      const py = y0 - L * s;
      const tx = 2 * bend * L * s;
      const ty = -L;
      const tl = Math.hypot(tx, ty) || 1;
      const hw = 0.5 * Math.max(w0 * lerp(1, 0.32, s), 0.9);
      pts[k * 4] = px - (ty / tl) * hw;
      pts[k * 4 + 1] = py + (tx / tl) * hw;
      pts[k * 4 + 2] = px + (ty / tl) * hw;
      pts[k * 4 + 3] = py - (tx / tl) * hw;
    }
    let shadowC = mix(P('stemShadow'), P('veilLow'), haze * 0.85);
    shadowC = mix(shadowC, P('ground'), 0.25 * smooth(0.3, 1.2, gRel));
    let litC = mix(P('stemLit'), P('rim'), clamp01(rimK * 0.6 + tint * 0.08) * lerp(0.55, 0.45, light));
    litC = mix(litC, P('skyHor'), haze * 0.55);
    const fgC = mix(P('forest'), P('stemLit'), lerp(0.1, 0.3, light));
    const stemAt = (s: number): [RGB, number] => {
      const lit = smooth(-0.8 - sigma * 0.5, 0.8 + sigma * 0.5, (s * H - 1) * g);
      const top = mix(litC, screen(litC, scale3(P('rim'), 0.35)), smooth(0.6, 1, s) * rimK * (1 - light));
      const c = mix(mix(shadowC, top, lit), fgC, fg * 0.85);
      return [c, lerp(0.9, 1, lit) * smooth(0, 0.28, s)];
    };
    const th = 1 / H;
    const ds = (0.8 + sigma * 0.5) / Math.max(H * g, 1e-3);
    const stops = [0, 0.07, 0.14, 0.21, 0.28, 0.6, 0.8, 1, th - ds, th, th + ds]
      .filter((s) => s >= 0 && s <= 1)
      .sort((a, b) => a - b);
    const gr = c2.createLinearGradient(0, y0, 0, y0 - L);
    for (const s of stops) {
      const [c, a] = stemAt(s);
      gr.addColorStop(s, css(c, a));
    }
    c2.globalAlpha = Math.min(1, w0 * 0.66 + 0.25) * (1 - 0.3 * fg) * soft;
    c2.fillStyle = gr;
    c2.beginPath();
    c2.moveTo(pts[0], pts[1]);
    for (let k = 1; k <= SEG; k++) c2.lineTo(pts[k * 4], pts[k * 4 + 1]);
    for (let k = SEG; k >= 0; k--) c2.lineTo(pts[k * 4 + 2], pts[k * 4 + 3]);
    c2.closePath();
    c2.fill();

    // Head: seed spike, seed clock, or a spike nodding off the tip.
    const tipX = x0 + bend * L;
    const tipY = y0 - L;
    const tl = Math.hypot(2 * bend * L, L) || 1;
    let tgx = (2 * bend * L) / tl;
    let tgy = -L / tl;
    const hs = d[o + 9];
    const gh = Math.min(g, 0.45 * U) + Math.max(g - 0.45 * U, 0) * 0.35;
    let a: number;
    let b: number;
    let cx: number;
    let cy: number;
    if (type < 0.5) {
      a = Math.max(0.064 * gh * hs, 0.9);
      b = Math.max(0.0105 * gh * hs, 0.45);
      cx = tipX - tgx * a * 0.8;
      cy = tipY - tgy * a * 0.8;
    } else if (type < 1.5) {
      a = Math.max(0.021 * gh * hs, 0.6);
      b = a;
      cx = tipX + tgx * a * 0.3;
      cy = tipY + tgy * a * 0.3;
    } else {
      const ang = bend >= 0 ? 1.75 : -1.75;
      const nx = tgx * Math.cos(ang) - tgy * Math.sin(ang);
      tgy = tgx * Math.sin(ang) + tgy * Math.cos(ang);
      tgx = nx;
      a = Math.max(0.05 * gh * hs, 0.8);
      b = Math.max(0.012 * gh * hs, 0.45);
      cx = tipX + tgx * a * 0.85;
      cy = tipY + tgy * a * 0.85;
    }
    let hc: RGB;
    if (answered) {
      hc = mix(P('headWrong'), P('headLit'), correct);
      hc = scale3(hc, lerp(lerp(0.62, 1, rimK), 1, light));
      hc = mix(hc, screen(hc, scale3(P('rim'), 0.5)), rimK * (1 - light) * 0.6);
      hc = mix(hc, P('skyHor'), haze * 0.45);
      hc = scale3(hc, lerp(0.9, 1, light));
    } else {
      hc = mix(P('headShadow'), mix(P('headShadow'), P('headWrong'), 0.14), 1 - correct);
      hc = mix(hc, P('veilLow'), haze * 0.85);
    }
    c2.globalAlpha = Math.min(1, (Math.min(a, b) + 0.6) / (sigma * 1.4)) * (1 - 0.55 * fg) * soft;
    c2.fillStyle = css(hc);
    c2.beginPath();
    c2.ellipse(cx, cy, a, b, Math.atan2(tgy, tgx), 0, Math.PI * 2);
    c2.fill();
    // Backlit heads near the light bloom a little (night).
    const glowK = answered ? 0.3 * rimK * (1 - haze * 0.6) * (1 - fg) * (1 - 0.7 * light) : 0;
    if (glowK > 0.03 && a > 1.2) {
      // A thin halo that follows the head's outline.
      const glowR = (1.2 * Math.max(a, b) + 1.5) * rimK * (1 - 0.6 * light);
      const pad = 2.5 * (0.3 * glowR + 0.5);
      const gc = mix(P('headWrong'), mix(P('headLit'), P('rim'), 0.4), correct);
      c2.save();
      c2.globalCompositeOperation = 'lighter';
      c2.globalAlpha = 1;
      c2.translate(cx, cy);
      c2.rotate(Math.atan2(tgy, tgx));
      c2.scale(a + pad, b + pad);
      const inner = Math.min(a / (a + pad), b / (b + pad));
      const gg = c2.createRadialGradient(0, 0, 0, 0, 0, 1);
      gg.addColorStop(0, css(gc, 0));
      gg.addColorStop(inner * 0.8, css(gc, glowK * 0.25));
      gg.addColorStop(inner, css(gc, glowK * 0.45));
      gg.addColorStop(inner + (1 - inner) * 0.35, css(gc, glowK * 0.12));
      gg.addColorStop(1, css(gc, 0));
      c2.fillStyle = gg;
      c2.fillRect(-1, -1, 2, 2);
      c2.restore();
    }
  }
  flush();
  ctx.globalAlpha = 1;

  // Fireflies (additive), where they hang in the still frame.
  const flies = buildFireflies();
  withOp('lighter', () => {
    for (let i = 0; i < FLY_COUNT; i++) {
      const [fx, fy, ph, fr] = flies.subarray(i * 4, i * 4 + 4);
      const t = ph * 13;
      const x = fx * w + (0.06 * Math.sin(t * 0.19 + ph) + 0.025 * Math.sin(t * 0.51 + ph * 3)) * U;
      const y = hz + fy * U + (0.03 * Math.sin(t * 0.15 + ph * 2) + 0.015 * Math.sin(t * 0.67 + ph)) * U;
      const p2 = t * (0.45 + 0.35 * fract(ph * 7.3)) + ph * 5;
      const blink = (0.18 + 0.82 * (0.5 + 0.5 * Math.sin(p2)) ** 4) * (1 - 0.55 * light);
      ellipse(x, y, fr * 9, fr * 9, spread(10, 1.8), (r) => (Math.exp(-81 * 1.4 * r * r) + 0.22 * Math.exp(-9 * 0.75 * r)) * blink * (1 - r), P('firefly'));
    }
  });

  // Overlay: text scrim, bottom fade and (night) vignette, painted small and
  // stretched since it is all smooth; then the threshold line.
  const scrimAt = (xn: number, yn: number) => {
    const sx = 1 - smooth(lay.textX - 0.14, lay.textX + 0.22, xn);
    const sy = smooth(lay.textY - 0.08, lay.textY + 0.2, yn);
    let a = sx * sy * lerp(0.5, 0.62, light);
    a = 1 - (1 - a) * (1 - smooth(0.8, 1, yn) * 0.92);
    const vig = (smooth(0.35, 0, yn) * 0.35 + smooth(0.25, 0, xn) * 0.25) * (1 - light);
    return 1 - (1 - a) * (1 - vig);
  };
  const paintSmall = (cw: number, chh: number, px: (x: number, y: number, out: Uint8ClampedArray, i: number) => void) => {
    const c = document.createElement('canvas');
    c.width = cw;
    c.height = chh;
    const cx2 = c.getContext('2d');
    if (!cx2) return null;
    const img = cx2.createImageData(cw, chh);
    for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) px(x, y, img.data, (y * cw + x) * 4);
    cx2.putImageData(img, 0, 0);
    return c;
  };
  const scrimC = P('scrim');
  const S = 128;
  const scrim = paintSmall(S, S, (x, y, out, i) => {
    out[i] = scrimC[0] * 255;
    out[i + 1] = scrimC[1] * 255;
    out[i + 2] = scrimC[2] * 255;
    out[i + 3] = scrimAt((x + 0.5) / S, (y + 0.5) / S) * 255;
  });
  ctx.imageSmoothingEnabled = true;
  if (scrim) ctx.drawImage(scrim, 0, 0, w, h);

  // The threshold: a thin luminous line at the horizon, brightest under the light.
  const LW = 360;
  const LH = 240;
  const reach = 60;
  const lineC = P('line');
  const intensity = (x: number) => {
    const xn = x / w;
    const sx = 1 - smooth(lay.textX - 0.14, lay.textX + 0.22, xn);
    let I = 0.16 + 0.84 * Math.exp(-(((x - lx) / (w * 0.34)) ** 2));
    I *= 1 - 0.45 * sx * (wide >= 0.5 ? 1 : 0);
    return I;
  };
  const lineStrip = paintSmall(LW, LH, (x, y, out, i) => {
    const px = ((x + 0.5) / LW) * w;
    const dy = ((y + 0.5) / LH) * 2 * reach - reach;
    const prof = Math.exp((-dy * dy) / 0.45) * 0.5 + Math.exp(-Math.abs(dy) / 3) * 0.12 + Math.exp(-Math.abs(dy) / 26) * 0.035;
    const shimmer = 0.78 + 0.22 * vnoise(px / 22);
    const k = prof * intensity(px) * shimmer * (1 - scrimAt(px / w, (hz + dy) / h)) * (1 - 0.55 * light);
    out[i] = lineC[0] * 255;
    out[i + 1] = lineC[1] * 255;
    out[i + 2] = lineC[2] * 255;
    out[i + 3] = k * 255;
  });
  if (lineStrip) withOp('lighter', () => ctx.drawImage(lineStrip, 0, hz - reach, w, reach * 2));
  if (light > 0.01) {
    // At dawn the line also gets a fine moss hairline so it reads on pale mist.
    const moss = P('stemLit');
    const hair = paintSmall(LW, 32, (x, y, out, i) => {
      const px = ((x + 0.5) / LW) * w;
      const dy = ((y + 0.5) / 32) * 8 - 4;
      out[i] = moss[0] * 255;
      out[i + 1] = moss[1] * 255;
      out[i + 2] = moss[2] * 255;
      out[i + 3] = Math.exp((-dy * dy) / 0.3) * intensity(px) * 0.3 * light * 255;
    });
    if (hair) ctx.drawImage(hair, 0, hz - 4, w, 8);
  }
};
