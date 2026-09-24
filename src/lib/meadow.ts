// Client controller for MeadowScene.astro: decodes the build-time payload, picks
// a renderer (WebGL2, else a still Canvas 2D frame, else the CSS background),
// and runs the loop only while the hero is on screen and the tab is visible.

import { buildField, decodeMeadow } from './meadow-data';
import { layoutFor, mixPalette, PALETTE_DARK } from './meadow-look';
import { createMeadowGL, type FrameState, type MeadowRenderer } from './meadow-gl';
import { drawMeadow2D } from './meadow-2d';

/** Seed for the field layout; chosen by eye for a balanced composition. */
export const MEADOW_SEED = 20221;
/** Scene time used for the WebGL still frame (reduced motion). */
const STILL_TIME = 41.5;
/** Pixel budget for the canvas backing store. */
const MAX_PIXELS = 2_400_000;
const MAX_DPR = 1.5;
const THEME_FADE_MS = 700;

/** Calls `cb` whenever devicePixelRatio changes (zoom, moving to another screen). */
const onDprChange = (cb: () => void) => {
  const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
  mq.addEventListener(
    'change',
    () => {
      cb();
      onDprChange(cb);
    },
    { once: true },
  );
};

const themeIsLight = () => {
  const t = document.documentElement.dataset.theme;
  if (t === 'light') return true;
  if (t === 'dark') return false;
  return window.matchMedia('(prefers-color-scheme: light)').matches;
};

export const mountMeadow = (root: HTMLElement) => {
  if (root.dataset.meadowMounted) return;
  root.dataset.meadowMounted = '1';
  const payload = root.dataset.meadow;
  const threshold = Number(root.dataset.threshold);
  if (!payload || Number.isNaN(threshold)) return;

  const field = buildField(decodeMeadow(payload), threshold, MEADOW_SEED);
  const makeCanvas = () => {
    const c = document.createElement('canvas');
    c.className = 'meadow-scene__canvas';
    c.setAttribute('aria-hidden', 'true');
    root.appendChild(c);
    return c;
  };
  let canvas = makeCanvas();

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer: MeadowRenderer | null = null;
  try {
    renderer = createMeadowGL(canvas, field);
  } catch (err) {
    console.warn(err);
    renderer = null;
  }
  const palette = new Float32Array(PALETTE_DARK.length);

  let height = 0;
  let themeFrom = themeIsLight() ? 1 : 0;
  let themeTo = themeFrom;
  let themeStart = 0;
  let lightMix = themeFrom;

  if (!renderer) {
    // No WebGL2: paint one still frame with Canvas 2D (and keep it in sync with
    // resizes and the theme). If even that fails, the CSS background remains.
    // A canvas that already tried WebGL cannot switch context types, so start fresh.
    canvas.remove();
    canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      return;
    }
    const paint2D = () => {
      const rect = root.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(canvas.width / rect.width, 0, 0, canvas.height / rect.height, 0, 0);
      const light = themeIsLight() ? 1 : 0;
      drawMeadow2D(ctx, field, rect.width, rect.height, layoutFor(rect.width, rect.height), mixPalette(light, palette), light);
      root.classList.add('is-live');
    };
    paint2D();
    let t2: number | undefined;
    const repaint2D = () => {
      window.clearTimeout(t2);
      t2 = window.setTimeout(paint2D, 160);
    };
    new ResizeObserver(repaint2D).observe(root);
    onDprChange(repaint2D);
    new MutationObserver(paint2D).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return;
  }
  const gl = renderer;
  const glCanvas = canvas;

  const frame: FrameState = { time: STILL_TIME, motion: 1, parX: 0, parY: 0, scroll: 0, light: lightMix, palette };
  let time = STILL_TIME;
  let last = 0;
  let raf = 0;
  let visible = true;
  let started = false;
  /** Set once the WebGL context is lost; the CSS background takes over for good. */
  let lost = false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  const still = () => reduced.matches;

  const size = () => {
    const rect = root.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (w * h * dpr * dpr > MAX_PIXELS) dpr = Math.sqrt(MAX_PIXELS / (w * h));
    height = h;
    gl.resize(w, h, dpr, layoutFor(w, h));
  };

  const draw = (now: number) => {
    if (themeFrom !== themeTo) {
      const k = still() ? 1 : Math.min(1, (now - themeStart) / THEME_FADE_MS);
      const e = k * k * (3 - 2 * k);
      lightMix = themeFrom + (themeTo - themeFrom) * e;
      if (k >= 1) themeFrom = themeTo;
    } else {
      lightMix = themeTo;
    }
    mixPalette(lightMix, palette);
    frame.light = lightMix;
    if (still()) {
      frame.time = STILL_TIME;
      frame.motion = 0;
      frame.parX = 0;
      frame.parY = 0;
      frame.scroll = 0;
    } else {
      frame.time = time;
      frame.motion = 1;
      frame.parX = pointer.x;
      frame.parY = pointer.y;
      frame.scroll = Math.min(window.scrollY, height);
    }
    gl.render(frame);
    if (!started) {
      started = true;
      root.classList.add('is-live');
    }
  };

  const tick = (now: number) => {
    raf = 0;
    if (lost || !visible || document.hidden) return;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    // Cap at ~60 fps; the scene is slow and does not need 120 Hz.
    if (last && now - last < 15) {
      raf = requestAnimationFrame(tick);
      return;
    }
    last = now;
    time += dt;
    const ease = 1 - Math.exp(-dt * 2.2);
    pointer.x += (pointer.tx - pointer.x) * ease;
    pointer.y += (pointer.ty - pointer.y) * ease;
    draw(now);
    if (!still()) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (raf || lost || !visible || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  };

  const redrawStill = () => {
    // One frame (reduced motion, or a change while paused).
    if (lost) return;
    requestAnimationFrame((now) => {
      if (!lost) draw(now);
    });
  };

  size();
  wake();
  if (still()) redrawStill();

  let resizeTimer: number | undefined;
  const resize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (lost) return;
      size();
      if (still() || !visible) redrawStill();
      else wake();
    }, 140);
  };
  new ResizeObserver(resize).observe(root);
  onDprChange(resize);

  new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) wake();
    },
    { rootMargin: '64px' },
  ).observe(root);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) wake();
  });

  new MutationObserver(() => {
    const target = themeIsLight() ? 1 : 0;
    if (target === themeTo) return;
    themeFrom = lightMix;
    themeTo = target;
    themeStart = performance.now();
    if (still()) redrawStill();
    else wake();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  reduced.addEventListener('change', () => {
    if (still()) redrawStill();
    else wake();
  });

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' || still()) return;
      pointer.tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
      pointer.ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1));
    },
    { passive: true },
  );

  // No preventDefault: the context is never restored, so no stale GL objects get
  // reused, and the canvas fades out to the CSS background.
  glCanvas.addEventListener('webglcontextlost', () => {
    lost = true;
    cancelAnimationFrame(raf);
    raf = 0;
    root.classList.remove('is-live');
  });
};
