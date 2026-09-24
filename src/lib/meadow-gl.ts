// WebGL2 renderer for the meadow. Four draws per frame:
//   1. backdrop: one fullscreen pass (sky, afterglow, ridges, tree line, fog, field floor)
//   2. stalks:   one instanced draw, 1,000 stems + seed heads, sorted far to near
//   3. fireflies: one small instanced draw, additive
//   4. overlay:  one fullscreen pass (threshold line, text scrim, bottom fade, grain)
// Everything that moves is computed on the GPU from a handful of uniforms, so the
// per-frame JS is a few dozen uniform calls and four draw calls.

import { buildFireflies, FLY_COUNT, STALK_STRIDE, type MeadowField } from './meadow-data';
import { PALETTE_KEYS, type MeadowLayout } from './meadow-look';

export interface FrameState {
  /** Seconds of scene time (frozen when motion is off). */
  time: number;
  /** 1 = wind and fireflies moving, 0 = still. */
  motion: number;
  /** Pointer parallax, -1..1 each axis. */
  parX: number;
  parY: number;
  /** Page scroll in CSS px (clamped by the caller). */
  scroll: number;
  /** Theme mix: 0 dark, 1 light. */
  light: number;
  /** Flat palette (see meadow-look), already mixed for `light`. */
  palette: Float32Array;
}

export interface MeadowRenderer {
  resize(width: number, height: number, dpr: number, layout: MeadowLayout): void;
  render(frame: FrameState): void;
  dispose(): void;
}

const PAL_DEFS = PALETTE_KEYS.map((k, i) => `#define P_${k.toUpperCase()} uPal[${i}]`).join('\n');

const HEADER = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uMotion;
uniform float uHorizon;
uniform float uUnit;
uniform vec2 uLightPos;
uniform vec2 uPar;
uniform float uScroll;
uniform float uLight;
uniform vec2 uText;
uniform float uWide;
uniform vec3 uPal[${PALETTE_KEYS.length}];
${PAL_DEFS}

float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash11(i), hash11(i + 1.0), f * f * (3.0 - 2.0 * f));
}
float vnoise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(float x) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * vnoise(x); x = x * 2.07 + 13.1; a *= 0.5; }
  return s;
}
float fbm2(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vnoise2(p); p = p * 2.03 + vec2(11.7, 5.3); a *= 0.5; }
  return s;
}
vec3 screenBlend(vec3 a, vec3 b) { return 1.0 - (1.0 - a) * (1.0 - clamp(b, 0.0, 1.0)); }
// Height of a row of rounded tree crowns at x (px); each cell is one tree.
float crownLine(float x, float scale, float seed) {
  float c = floor(x / scale);
  float best = 0.0;
  for (int k = -1; k <= 1; k++) {
    float ci = c + float(k);
    float cx = (ci + 0.5 + 0.4 * (hash11(ci + seed) - 0.5)) * scale;
    float rad = scale * (0.7 + 0.55 * hash11(ci * 1.7 + seed + 3.0));
    float dx = (x - cx) / rad;
    float top = rad * (0.25 + 0.85 * hash11(ci * 2.3 + seed + 7.0));
    best = max(best, (top + rad * 0.6 * sqrt(max(1.0 - dx * dx, 0.0))) * step(abs(dx), 1.0));
  }
  return best;
}
`;

const FULLSCREEN_VS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const BACKDROP_FS = `${HEADER}
out vec4 outColor;
void main() {
  vec2 fc = gl_FragCoord.xy / uDpr;
  vec2 px = vec2(fc.x, uRes.y - fc.y);
  float U = uUnit;
  float h = uHorizon - px.y;              // px above the horizon (field is fixed)
  float sy = uScroll * 0.22 + uPar.y * 5.0; // the far world drifts slower than the page
  float hs = h + sy;                      // height above the horizon for backdrop layers
  float xn = px.x / uRes.x;
  vec2 lp = vec2(uLightPos.x - uPar.x * 3.0, uLightPos.y + sy);
  float lat = exp(-pow((px.x - lp.x) / (uRes.x * mix(0.5, 0.4, uWide)), 2.0));

  // Sky: graded from the horizon haze up to near-black, with a low afterglow.
  float t = clamp(hs / max(uHorizon + sy, 1.0), 0.0, 1.0);
  vec3 sky = mix(P_SKYHOR, P_SKYMID, smoothstep(0.0, 0.55, t));
  sky = mix(sky, P_SKYTOP, smoothstep(0.3, 1.0, t));
  float band = exp(-max(hs, 0.0) / (U * 0.26));
  sky = screenBlend(sky, P_GLOW * band * (0.3 + 0.7 * lat));
  vec2 d = (px - lp) / U;
  float r = length(d);
  // Night: a small low moon with a tight halo. Dawn: a larger sun lost in mist.
  float discR = mix(0.032, 0.05, uLight) * U;
  float dl = length(px - lp);
  float disc = 1.0 - smoothstep(discR - 1.0, discR + mix(0.8, 8.0, uLight), dl);
  disc *= mix(0.82 + 0.18 * sqrt(max(1.0 - dl * dl / (discR * discR), 0.0)), 1.0, uLight);
  float halo = exp(-r * mix(7.0, 5.0, uLight)) * mix(0.24, 0.35, uLight) + exp(-r * 2.2) * mix(0.08, 0.2, uLight);
  sky = screenBlend(sky, P_CORE * (disc * mix(0.8, 0.6, uLight) + halo));

  // A few faint stars, night only, kept away from the glow.
  vec2 sp = vec2(px.x + uPar.x * 2.0, px.y - sy);
  vec2 cell = floor(sp / 52.0);
  vec2 cp = (cell + 0.15 + 0.7 * vec2(hash12(cell), hash12(cell + 7.1))) * 52.0;
  float sd = length(sp - cp);
  float sb = step(0.8, hash12(cell + 3.3)) * (0.3 + 0.7 * hash12(cell + 9.2));
  float tw = 0.7 + 0.3 * sin(uTime * uMotion * (0.6 + 1.6 * hash12(cell + 1.7)) + 6.28 * hash12(cell));
  float star = sb * tw * exp(-sd * sd * 1.6) * smoothstep(0.35, 0.8, t) * (1.0 - uLight) * (1.0 - 0.85 * lat);
  sky = screenBlend(sky, P_STAR * star * 0.55);

  vec3 col = sky;
  vec3 fogCol = mix(P_SKYHOR, P_MIST, 0.25 + 0.45 * lat);

  // Far ridge: soft mountains, taller toward the light, dissolving into haze.
  float x1 = (px.x + uPar.x * 4.0) / U;
  float env1 = mix(0.45, 1.0, smoothstep(0.05, 0.85, xn));
  float r1 = U * (0.035 + 0.24 * env1 * (fbm(x1 * 1.1 + 3.7) - 0.18));
  float a1 = smoothstep(-1.0, 1.0, r1 - hs);
  vec3 c1 = screenBlend(mix(P_RIDGEFAR, sky, 0.28), P_GLOW * band * lat * 0.35);
  c1 = mix(c1, fogCol, exp(-max(hs, 0.0) / (U * 0.06)) * 0.5);
  col = mix(col, c1, a1);

  // Mid tree line: low, ragged crowns.
  float x2 = (px.x + uPar.x * 8.0) / U;
  float crowns = pow(vnoise(x2 * 30.0), 1.6) * 0.03 + vnoise(x2 * 85.0) * 0.012;
  float r2 = U * (0.012 + 0.07 * fbm(x2 * 2.1 + 11.0) * mix(0.6, 1.0, smoothstep(0.2, 0.7, xn)) + crowns);
  float a2 = smoothstep(-0.7, 0.7, r2 - hs);
  vec3 c2 = screenBlend(P_RIDGEMID, P_GLOW * band * lat * 0.22);
  c2 = mix(c2, fogCol, exp(-max(hs, 0.0) / (U * 0.025)) * 0.45);
  col = mix(col, c2, a2);

  // Near woodland on the left: a block of rounded crowns that frames the text
  // column and steps down into the field toward the middle.
  float x3 = px.x + uPar.x * 13.0;
  float xs = x3 / uRes.x;
  float env3 = 1.0 - smoothstep(0.02, mix(0.3, 0.46, uWide), xs);
  float mass = U * mix(0.1, 0.15, uWide) * pow(env3, 0.7);
  float cr = crownLine(x3, U * 0.075, 3.0) * (0.35 + 0.65 * env3);
  float r3 = (mass + cr) * smoothstep(0.0, 0.18, env3) - U * 0.004;
  float a3 = smoothstep(-0.8, 0.8, r3 - hs);
  float lift = exp(-max(hs, 0.0) / (U * 0.035));
  vec3 c3 = mix(P_FOREST, fogCol, lift * 0.4 + 0.08 * uLight);
  // Crowns catch a little of the sky on their upper edge.
  c3 = mix(c3, P_RIDGEMID, smoothstep(r3 - 5.0, r3, hs) * 0.35);
  col = mix(col, c3, a3);

  // Drifting fog over the ridge bases.
  float drift = uTime * uMotion;
  float fn = fbm2(vec2((px.x + uPar.x * 6.0) / (U * 0.85) - drift * 0.018, hs / (U * 0.07)));
  float fogB = exp(-pow((hs - U * 0.03) / (U * 0.065), 2.0)) * smoothstep(0.3, 0.85, fn);
  col = mix(col, fogCol, fogB * 0.45);
  float fn2 = fbm2(vec2((px.x - uPar.x * 3.0) / (U * 1.6) + drift * 0.01 + 4.0, hs / (U * 0.16)));
  float fogC = exp(-pow((hs - U * 0.14) / (U * 0.07), 2.0)) * smoothstep(0.45, 0.9, fn2) * (0.4 + 0.6 * lat);
  col = mix(col, fogCol, fogC * 0.22);

  // Field floor: mist lying on the far field, darkening toward the viewer.
  float dn = max(-h, 0.0);
  vec3 ground = mix(P_GROUNDFAR, P_GROUND, smoothstep(0.0, U * 0.6, dn));
  float depth = U * 0.12 / (dn + U * 0.02);
  float gm = fbm2(vec2((px.x - uPar.x * 10.0) / (U * 0.25) * depth * 0.6, depth * 3.0 - drift * 0.01));
  ground = mix(ground, ground * (0.8 + 0.45 * gm), 0.7);
  float mist = exp(-dn / (U * 0.06)) * (0.3 + 0.7 * lat);
  ground = mix(ground, fogCol, mist * mix(0.75, 0.5, uLight));
  float mistLow = fbm2(vec2(px.x / (U * 0.7) + drift * 0.015, dn / (U * 0.12)));
  ground = mix(ground, fogCol, smoothstep(0.5, 0.9, mistLow) * exp(-dn / (U * 0.25)) * 0.18);
  // A low bank of mist across the middle distance, so the shadowed stalks in
  // front of it stand out as silhouettes.
  float mb = exp(-pow((dn - U * 0.4) / (U * 0.2), 2.0));
  float mbn = fbm2(vec2(px.x / (U * 1.1) + drift * 0.012 + 9.0, dn / (U * 0.22)));
  ground = mix(ground, fogCol, mb * (0.3 + 0.7 * smoothstep(0.3, 0.8, mbn)) * mix(0.2, 0.26, uLight) * (0.5 + 0.5 * lat));

  col = mix(ground, col, smoothstep(-0.6, 0.6, h));
  // Haze straddling the horizon, strongest under the light.
  col = screenBlend(col, P_MIST * exp(-abs(h) / (U * 0.028)) * (0.05 + 0.3 * lat) * (1.0 - 0.6 * uLight));
  outColor = vec4(col, 1.0);
}`;

const STALK_VS = `${HEADER}
layout(location = 0) in vec4 aMesh;
layout(location = 1) in vec4 aI0;
layout(location = 2) in vec4 aI1;
layout(location = 3) in vec4 aI2;
out vec2 vLocal;
out float vS;
out float vW;
out float vCov;
flat out vec4 vA;
flat out vec4 vB;
flat out vec4 vC;

float gust(float x) {
  float k = x / uUnit;
  float t = uTime;
  float n = 0.55 * vnoise(k * 1.05 - t * 0.4) + 0.3 * vnoise(k * 2.4 - t * 0.85 + 17.0) + 0.15 * vnoise(k * 5.1 - t * 1.6 + 5.0);
  return smoothstep(0.4, 0.9, n);
}

// Depth of field in px: focus on the near midfield, soft far away, very soft up close.
float dof(float g) {
  float r = log2(max(g, 0.5) / (uUnit * 0.28));
  return r > 0.0 ? 1.25 * r * r : 0.2 * -r;
}

void main() {
  float gRel = aI0.y;
  float g = gRel * uUnit;
  float H = aI0.z;
  float L = H * g;
  float x0 = aI0.x * uRes.x - uPar.x * (3.0 + 24.0 * min(gRel, 2.0));
  float y0 = uHorizon + g;
  float gs = gust(x0) * uMotion;
  float t = uTime;
  float fl = 0.03 * sin(t * aI2.w * 1.9 + aI0.w) + 0.014 * sin(t * aI2.w * 3.3 + aI0.w * 2.3);
  float sway = 0.035 * sin(t * 0.37 + x0 / uUnit * 0.9);
  float soften = mix(1.0, 0.4, smoothstep(0.5, 2.0, gRel));
  float bend = aI1.w + (0.17 * gs + uMotion * (sway + fl)) * aI2.z * soften;

  float head = aI1.x;
  float answered = step(3.5, head);
  float type = head - 4.0 * answered;
  float blur = dof(g);
  float sigma = 0.45 + blur;
  float rimK = exp(-pow((x0 - uLightPos.x) / (uRes.x * 0.38), 2.0));
  vA = vec4(0.0, sigma, g, H);
  vC = vec4(0.0, 0.0, gs, rimK);

  vec2 pos;
  if (aMesh.z < 0.5) {
    float s = aMesh.x;
    vec2 p = vec2(x0 + bend * L * s * s, y0 - L * s);
    vec2 tg = normalize(vec2(2.0 * bend * L * s, -L));
    vec2 nm = vec2(-tg.y, tg.x);
    float w = 0.0068 * g * aI2.x * mix(1.0, 0.32, s);
    float halfW = 0.5 * max(w, 1.0);
    float ext = halfW + 2.5 * sigma + 0.5;
    pos = p + nm * aMesh.y * ext;
    vLocal = vec2(aMesh.y * ext, 0.0);
    vS = s;
    vW = halfW;
    vCov = min(w, 1.0);
    vB = vec4(0.0, answered, aI1.y, aI1.z);
  } else {
    vec2 tip = vec2(x0 + bend * L, y0 - L);
    vec2 tg = normalize(vec2(2.0 * bend * L, -L));
    float hs = aI2.y;
    // Heads grow with nearness, but sub-linearly up close so bokeh stays small.
    float gh = min(g, 0.45 * uUnit) + max(g - 0.45 * uUnit, 0.0) * 0.35;
    float a;
    float b;
    vec2 c;
    if (type < 0.5) {
      a = max(0.064 * gh * hs, 0.9);
      b = max(0.0105 * gh * hs, 0.45);
      c = tip - tg * a * 0.8;
    } else if (type < 1.5) {
      a = max(0.021 * gh * hs, 0.6);
      b = a;
      c = tip + tg * a * 0.3;
    } else {
      // Nodding head: hangs off the tip on the side the stalk leans to.
      float ang = bend >= 0.0 ? 1.75 : -1.75;
      tg = vec2(tg.x * cos(ang) - tg.y * sin(ang), tg.x * sin(ang) + tg.y * cos(ang));
      a = max(0.05 * gh * hs, 0.8);
      b = max(0.012 * gh * hs, 0.45);
      c = tip + tg * a * 0.85;
    }
    vec2 nm = vec2(-tg.y, tg.x);
    // Only heads near the light are backlit enough to bloom.
    float glowR = answered * (1.2 * max(a, b) + 1.5) * rimK * (1.0 - 0.6 * uLight);
    float A = a + 2.5 * sigma + 0.5 + glowR;
    float B = b + 2.5 * sigma + 0.5 + glowR;
    pos = c + tg * aMesh.x * A + nm * aMesh.y * B;
    vLocal = vec2(aMesh.x * A, aMesh.y * B);
    vS = 1.0;
    vW = 0.0;
    vCov = 1.0;
    vA.x = glowR;
    vB = vec4(1.0 + type, answered, aI1.y, aI1.z);
    vC.xy = vec2(a, b);
  }
  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);
}`;

const STALK_FS = `${HEADER}
in vec2 vLocal;
in float vS;
in float vW;
in float vCov;
flat in vec4 vA;
flat in vec4 vB;
flat in vec4 vC;
out vec4 outColor;
void main() {
  float sigma = vA.y;
  float g = vA.z;
  float H = vA.w;
  float answered = vB.y;
  float correct = vB.z;
  float tint = vB.w;
  float gs = vC.z;
  float rimK = vC.w;
  float haze = exp(-g / (uUnit * 0.075));

  if (vB.x < 0.5) {
    float d = abs(vLocal.x);
    float prof = exp(-0.5 * pow(max(d - vW, 0.0) / sigma, 2.0));
    float alpha = prof * min(1.0, 2.0 * vW / (1.8 * sigma)) * vCov;
    // Lit exactly where the stem is above the threshold (the horizon), at rest.
    float above = (vS * H - 1.0) * g;
    float lit = smoothstep(-0.8 - sigma * 0.5, 0.8 + sigma * 0.5, above);
    vec3 shadowC = mix(P_STEMSHADOW, P_VEILLOW, haze * 0.85);
    shadowC = mix(shadowC, P_GROUND, 0.25 * smoothstep(0.3, 1.2, g / uUnit));
    vec3 litC = mix(P_STEMLIT, P_RIM, clamp(rimK * 0.6 + gs * 0.3 + tint * 0.08, 0.0, 1.0) * mix(0.55, 0.45, uLight));
    litC = mix(litC, P_SKYHOR, haze * 0.55);
    // Stems thin toward the tip, and the light catches the upper stem most.
    litC = mix(litC, screenBlend(litC, P_RIM * 0.35), smoothstep(0.6, 1.0, vS) * rimK * (1.0 - uLight));
    vec3 c = mix(shadowC, litC, lit);
    alpha *= mix(0.9, 1.0, lit);
    // The base of each stalk is lost in the grass and mist around it.
    alpha *= smoothstep(0.0, 0.28, vS);
    // Out-of-focus foreground stalks read as soft silhouettes.
    float fg = smoothstep(1.1, 1.7, g / uUnit);
    c = mix(c, mix(P_FOREST, P_STEMLIT, mix(0.1, 0.3, uLight)), fg * 0.85);
    alpha *= 1.0 - 0.3 * fg;
    outColor = vec4(c * alpha, alpha);
  } else {
    float a = vC.x;
    float b = vC.y;
    float glowR = vA.x;
    vec2 q = vLocal / vec2(a, b);
    float e = max(length(q), 1e-4);
    // Distance to the ellipse in px (first-order), so glow and blur are isotropic.
    vec2 grad = vec2(q.x / a, q.y / b) / e;
    float dpx = (e - 1.0) / max(length(grad), 1e-4);
    vec2 quad = abs(vLocal) / (vec2(a, b) + 2.5 * sigma + 0.5 + glowR);
    float window = 1.0 - smoothstep(0.7, 1.0, max(quad.x, quad.y));
    float body = 1.0 - smoothstep(-sigma, sigma, dpx);
    body *= min(1.0, (min(a, b) + 0.6) / (sigma * 1.4));
    // Bristly seed spikes: faint banding along the length.
    if (vB.x < 1.5 || vB.x > 2.5) body *= 0.82 + 0.18 * sin(q.x * 9.0 + q.y * 3.0);
    // Seed clocks: airy, brighter at the rim than the middle.
    else body *= 0.62 + 0.38 * smoothstep(0.2, 1.0, e);
    vec3 hc;
    vec3 glowC = vec3(0.0);
    float glow = 0.0;
    if (answered > 0.5) {
      hc = mix(P_HEADWRONG, P_HEADLIT, correct);
      // Heads far from the light are dimmer at night.
      hc *= mix(mix(0.62, 1.0, rimK), 1.0, uLight);
      hc = mix(hc, screenBlend(hc, P_RIM * 0.5), rimK * (1.0 - uLight) * 0.6);
      hc = mix(hc, P_SKYHOR, haze * 0.45);
      // Backlit seed heads glow at the rim.
      hc = mix(hc * mix(0.78, 1.0, uLight), hc, smoothstep(0.2, 1.0, e));
      glowC = mix(P_HEADWRONG, mix(P_HEADLIT, P_RIM, 0.4), correct);
      glow = exp(-max(dpx, 0.0) / (0.3 * glowR + 0.5)) * (1.0 - body) * 0.3 * rimK * (1.0 - haze * 0.6) * window;
    } else {
      hc = mix(P_HEADSHADOW, mix(P_HEADSHADOW, P_HEADWRONG, 0.14), 1.0 - correct);
      hc = mix(hc, P_VEILLOW, haze * 0.85);
    }
    // Out-of-focus foreground heads are faint bokeh, not bright discs.
    float fg = smoothstep(1.1, 1.7, g / uUnit);
    body *= 1.0 - 0.55 * fg;
    glow *= 1.0 - fg;
    outColor = vec4(hc * body, body) + vec4(glowC * glow * (1.0 - 0.7 * uLight), 0.0);
  }
}`;

const FIREFLY_VS = `${HEADER}
layout(location = 0) in vec2 aQuad;
layout(location = 1) in vec4 aF;
out vec2 vQ;
out float vBlink;
out float vR;
void main() {
  float t = uTime * uMotion + aF.z * 13.0;
  vec2 base = vec2(aF.x * uRes.x, uHorizon + aF.y * uUnit);
  vec2 wob = vec2(0.06 * sin(t * 0.19 + aF.z) + 0.025 * sin(t * 0.51 + aF.z * 3.0),
                  0.03 * sin(t * 0.15 + aF.z * 2.0) + 0.015 * sin(t * 0.67 + aF.z));
  vec2 p = base + wob * uUnit;
  p.x -= uPar.x * 20.0;
  float ph = t * (0.45 + 0.35 * fract(aF.z * 7.3)) + aF.z * 5.0;
  vBlink = 0.18 + 0.82 * pow(0.5 + 0.5 * sin(ph), 4.0);
  float r = aF.w;
  vR = r;
  float ext = r * 9.0;
  vQ = aQuad * ext;
  p += aQuad * ext;
  gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
}`;

const FIREFLY_FS = `${HEADER}
in vec2 vQ;
in float vBlink;
in float vR;
out vec4 outColor;
void main() {
  float d = length(vQ) / vR;
  float core = exp(-d * d * 1.4);
  float halo = exp(-d * 0.75) * 0.22;
  float k = (core + halo) * vBlink * (1.0 - 0.55 * uLight);
  outColor = vec4(P_FIREFLY * k, 0.0);
}`;

const OVERLAY_FS = `${HEADER}
out vec4 outColor;
void main() {
  vec2 fc = gl_FragCoord.xy / uDpr;
  vec2 px = vec2(fc.x, uRes.y - fc.y);
  float xn = px.x / uRes.x;
  float yn = px.y / uRes.y;

  // Calm the text column: fade toward the page colour, bottom-left.
  float sx = 1.0 - smoothstep(uText.x - 0.14, uText.x + 0.22, xn);
  float sy = smoothstep(uText.y - 0.08, uText.y + 0.2, yn);
  float scrim = sx * sy * mix(0.5, 0.62, uLight);
  float bottom = smoothstep(0.8, 1.0, yn);
  float a = 1.0 - (1.0 - scrim) * (1.0 - bottom * 0.92);
  // Gentle vignette at the top and the far left (night only).
  float vig = (smoothstep(0.35, 0.0, yn) * 0.35 + smoothstep(0.25, 0.0, xn) * 0.25) * (1.0 - uLight);
  a = 1.0 - (1.0 - a) * (1.0 - vig);
  vec3 c = P_SCRIM * a;

  // The threshold: a thin luminous line at the horizon, brightest under the light.
  float dy = px.y - uHorizon;
  float I = 0.16 + 0.84 * exp(-pow((px.x - uLightPos.x) / (uRes.x * 0.34), 2.0));
  I *= 1.0 - 0.45 * sx * step(0.5, uWide);
  float shimmer = 0.78 + 0.22 * vnoise(px.x / 22.0 - uTime * uMotion * 0.45);
  float line = exp(-dy * dy / 0.45) * 0.5 + exp(-abs(dy) / 3.0) * 0.12 + exp(-abs(dy) / 26.0) * 0.035;
  c += P_LINE * line * I * shimmer * (1.0 - a) * (1.0 - 0.55 * uLight);
  // At dawn the line also gets a fine moss hairline so it reads on pale mist.
  float ha = exp(-dy * dy / 0.3) * I * 0.3 * uLight;
  c = c * (1.0 - ha) + P_STEMLIT * ha;
  a = a + ha * (1.0 - a);

  // Film grain to break up banding in the gradients.
  float n = hash12(floor(gl_FragCoord.xy)) - 0.5;
  float gk = mix(2.2, 1.6, uLight) / 255.0;
  if (n > 0.0) c += vec3(n * gk * 2.0);
  else a = a + (-n) * gk * 2.0 * (1.0 - a);
  outColor = vec4(c, a);
}`;

const SEGMENTS = 14;

const compile = (gl: WebGL2RenderingContext, type: number, src: string) => {
  const s = gl.createShader(type);
  if (!s) throw new Error('meadow: createShader failed');
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`meadow: shader compile failed: ${log}`);
  }
  return s;
};

const link = (gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string) => {
  const p = gl.createProgram();
  if (!p) throw new Error('meadow: createProgram failed');
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(`meadow: program link failed: ${gl.getProgramInfoLog(p)}`);
  }
  return p;
};

const UNIFORMS = [
  'uRes',
  'uDpr',
  'uTime',
  'uMotion',
  'uHorizon',
  'uUnit',
  'uLightPos',
  'uPar',
  'uScroll',
  'uLight',
  'uText',
  'uWide',
  'uPal',
] as const;
type Loc = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;

export const createMeadowGL = (canvas: HTMLCanvasElement, field: MeadowField): MeadowRenderer | null => {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  let progs: { backdrop: WebGLProgram; stalks: WebGLProgram; flies: WebGLProgram; overlay: WebGLProgram };
  try {
    progs = {
      backdrop: link(gl, FULLSCREEN_VS, BACKDROP_FS),
      stalks: link(gl, STALK_VS, STALK_FS),
      flies: link(gl, FIREFLY_VS, FIREFLY_FS),
      overlay: link(gl, FULLSCREEN_VS, OVERLAY_FS),
    };
  } catch (err) {
    console.warn(err);
    return null;
  }
  const locs = new Map<WebGLProgram, Loc>();
  for (const p of Object.values(progs)) {
    const l = {} as Loc;
    for (const name of UNIFORMS) l[name] = gl.getUniformLocation(p, name);
    locs.set(p, l);
  }

  // Stalk mesh: a ribbon of SEGMENTS quads, then one quad for the seed head.
  const verts: number[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const s = i / SEGMENTS;
    verts.push(s, -1, 0, 0, s, 1, 0, 0);
  }
  const headBase = verts.length / 4;
  verts.push(-1, -1, 1, 0, -1, 1, 1, 0, 1, -1, 1, 0, 1, 1, 1, 0);
  const idx: number[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const v = i * 2;
    idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
  }
  idx.push(headBase, headBase + 1, headBase + 2, headBase + 1, headBase + 3, headBase + 2);

  const stalkVao = gl.createVertexArray();
  gl.bindVertexArray(stalkVao);
  const meshBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, meshBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
  const instBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  gl.bufferData(gl.ARRAY_BUFFER, field.data, gl.STATIC_DRAW);
  for (let i = 0; i < 3; i++) {
    gl.enableVertexAttribArray(1 + i);
    gl.vertexAttribPointer(1 + i, 4, gl.FLOAT, false, STALK_STRIDE * 4, i * 16);
    gl.vertexAttribDivisor(1 + i, 1);
  }
  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  const indexCount = idx.length;

  const flyVao = gl.createVertexArray();
  gl.bindVertexArray(flyVao);
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
  const flyBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, flyBuf);
  gl.bufferData(gl.ARRAY_BUFFER, buildFireflies(), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 16, 0);
  gl.vertexAttribDivisor(1, 1);

  const emptyVao = gl.createVertexArray();
  gl.bindVertexArray(null);

  let cssW = 1;
  let cssH = 1;
  let dpr = 1;
  let layout: MeadowLayout | null = null;

  const setUniforms = (p: WebGLProgram, f: FrameState) => {
    const l = locs.get(p)!;
    const lay = layout!;
    gl.useProgram(p);
    gl.uniform2f(l.uRes, cssW, cssH);
    gl.uniform1f(l.uDpr, dpr);
    gl.uniform1f(l.uTime, f.time);
    gl.uniform1f(l.uMotion, f.motion);
    gl.uniform1f(l.uHorizon, lay.horizon);
    gl.uniform1f(l.uUnit, lay.unit);
    gl.uniform2f(l.uLightPos, lay.lightX, lay.lightY);
    gl.uniform2f(l.uPar, f.parX, f.parY);
    gl.uniform1f(l.uScroll, f.scroll);
    gl.uniform1f(l.uLight, f.light);
    gl.uniform2f(l.uText, lay.textX, lay.textY);
    gl.uniform1f(l.uWide, lay.wide);
    gl.uniform3fv(l.uPal, f.palette);
  };

  return {
    resize(width, height, ratio, lay) {
      cssW = width;
      cssH = height;
      dpr = ratio;
      layout = lay;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      // uDpr maps device px back to CSS px; use the exact ratio after rounding.
      dpr = canvas.width / width;
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render(f) {
      if (!layout || gl.isContextLost()) return;
      gl.disable(gl.BLEND);
      setUniforms(progs.backdrop, f);
      gl.bindVertexArray(emptyVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      setUniforms(progs.stalks, f);
      gl.bindVertexArray(stalkVao);
      gl.drawElementsInstanced(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0, field.count);

      setUniforms(progs.flies, f);
      gl.bindVertexArray(flyVao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, FLY_COUNT);

      setUniforms(progs.overlay, f);
      gl.bindVertexArray(emptyVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    },
    dispose() {
      for (const p of Object.values(progs)) gl.deleteProgram(p);
      for (const b of [meshBuf, instBuf, idxBuf, quadBuf, flyBuf]) gl.deleteBuffer(b);
      for (const v of [stalkVao, flyVao, emptyVao]) gl.deleteVertexArray(v);
    },
  };
};
