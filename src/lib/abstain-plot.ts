// Dot-plot layout for the homepage abstention demo. Each sampled test image is
// one dot; columns are confidence bins on a log-odds axis; within a column the
// mistakes stack under the correct answers. Shared by the server render (the
// static SVG) and the client script (hit-testing, clip edges).

export interface PlotSpec {
  /** Axis extent in log-odds of the max softmax. */
  xMin: number;
  xMax: number;
  /** Log-odds per column. */
  bin: number;
  /** Column pitch, row pitch and dot radius, in SVG user units. */
  pitchX: number;
  pitchY: number;
  r: number;
  /** Headroom above the tallest column, in user units. */
  padT: number;
}

export interface PlotLayout extends PlotSpec {
  cols: number;
  width: number;
  height: number;
  /** Dot centres by sample index, in user units. */
  x: number[];
  y: number[];
}

/** Log-odds of a max-softmax confidence `p`. */
export const logit = (p: number) => Math.log(p / (1 - p));

/** Confidence for a demo score (log-odds x 1000). */
export const confidenceOf = (score: number) => 1 / (1 + Math.exp(-score / 1000));

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const layoutDots = (
  logOdds: ArrayLike<number>,
  correct: ArrayLike<boolean>,
  spec: PlotSpec,
): PlotLayout => {
  const cols = Math.ceil((spec.xMax - spec.xMin) / spec.bin - 1e-9);
  const n = logOdds.length;
  const col = new Int32Array(n);
  const counts = new Int32Array(cols);
  for (let i = 0; i < n; i++) {
    const c = clamp(Math.floor((logOdds[i] - spec.xMin) / spec.bin), 0, cols - 1);
    col[i] = c;
    counts[c]++;
  }
  let maxStack = 1;
  for (let c = 0; c < cols; c++) maxStack = Math.max(maxStack, counts[c]);

  const width = cols * spec.pitchX;
  const height = spec.padT + (maxStack - 1) * spec.pitchY + 2 * spec.r;
  const x = new Array<number>(n);
  const y = new Array<number>(n);
  const filled = new Int32Array(cols);
  // Two passes over the (already confidence-sorted) sample: mistakes first so
  // they sit at the bottom of every column, then the correct answers.
  for (const pass of [false, true]) {
    for (let i = 0; i < n; i++) {
      if (Boolean(correct[i]) !== pass) continue;
      const c = col[i];
      const k = filled[c]++;
      x[i] = (c + 0.5) * spec.pitchX;
      y[i] = height - spec.r - k * spec.pitchY;
    }
  }
  return { ...spec, cols, width, height, x, y };
};

/** Horizontal position of a log-odds value as a fraction of the plot width. */
export const fracOf = (l: Pick<PlotSpec, 'xMin' | 'xMax'>, logOdds: number) =>
  clamp((logOdds - l.xMin) / (l.xMax - l.xMin), 0, 1);

/** Right edge (user units) of the declined columns for a threshold at `logOdds`:
 * a column is declined when its centre is at or below the threshold. */
export const cutOf = (l: Pick<PlotLayout, 'xMin' | 'bin' | 'cols' | 'pitchX'>, logOdds: number) =>
  clamp(Math.floor((logOdds - l.xMin) / l.bin + 0.5), 0, l.cols) * l.pitchX;

const fmt = (v: number) => String(Math.round(v * 10) / 10);

/** One SVG path drawing every listed dot as a zero-length, round-capped stroke. */
export const dotPath = (l: PlotLayout, indices: Iterable<number>) => {
  let d = '';
  for (const i of indices) d += `M${fmt(l.x[i])} ${fmt(l.y[i])}h.01`;
  return d;
};

// ---------------------------------------------------------------- wording

export const pct1 = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const int = new Intl.NumberFormat('en-US');

const confFormats = new Map<string, Intl.NumberFormat>();

/** A confidence as a percentage with just enough digits to stay short of 100%.
 * `short` drops the fixed first decimal, for axis ticks ("99.9%", "50%"). */
export const formatConfidence = (p: number, short = false) => {
  const q = 1 - p;
  const digits = q >= 0.005 ? 1 : clamp(Math.ceil(-Math.log10(q)) - 1, 1, 5);
  const key = `${digits}${short ? 's' : ''}`;
  let f = confFormats.get(key);
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: short ? 0 : 1,
      maximumFractionDigits: digits,
    });
    confFormats.set(key, f);
  }
  return f.format(p);
};

export interface Counts {
  total: number;
  answered: number;
  answeredRight: number;
  declined: number;
  declinedRight: number;
  coverage: number;
  selectAcc: number;
  rejectAcc: number;
}

export type Tone = 'ok' | 'warn' | 'neutral';

/** Copy for the readouts and the status line, from test-set counts at a threshold. */
export const describe = (s: Counts, passesCoinFlip: boolean, baseAcc: number, delta: number) => {
  const declinedSome = s.declined > 0;
  const rejectAcc = declinedSome ? pct1.format(s.rejectAcc) : '—';
  let tone: Tone;
  let status: string;
  let rejectSub: string;
  if (!declinedSome) {
    tone = 'neutral';
    rejectSub = 'nothing declined';
    status = 'Nothing declined. Drag the line right to start declining the least confident guesses.';
  } else if (passesCoinFlip) {
    tone = 'ok';
    rejectSub = 'no better than a coin flip';
    status = `No better than a coin flip: the declined guesses were right ${rejectAcc} of the time, so declining them gives up almost nothing.`;
  } else if (delta <= 0.5) {
    tone = 'warn';
    rejectSub = 'better than a coin flip';
    status = `Better than a coin flip: the declined guesses were right ${rejectAcc} of the time. Past here the model is throwing away answers it would more often get right.`;
  } else {
    // Above δ = .5 the test only passes guesses clearly worse than a coin flip,
    // so failing it doesn't mean the declined guesses were better than one.
    tone = 'warn';
    rejectSub = 'not clearly worse than a coin flip';
    status = `Not clearly worse than a coin flip: the declined guesses were right ${rejectAcc} of the time. At this δ the rule declines only guesses that are clearly worse than one.`;
  }
  return {
    coverage: pct1.format(s.coverage),
    coverageSub: `${int.format(s.answered)} of ${int.format(s.total)} test images`,
    selectAcc: s.answered ? pct1.format(s.selectAcc) : '—',
    selectSub: `vs ${pct1.format(baseAcc)} answering everything`,
    rejectAcc,
    rejectSub,
    tone,
    status,
  };
};
