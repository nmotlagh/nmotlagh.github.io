// One global B-CDF reject threshold (Kashani Motlagh et al., ISVC 2022), for the
// homepage demo. Port of learn_threshold in learning-idk's
// examples/modern-backbones/fast_bcdf.py: same candidates, same exact tie-breaking.
//
// Scores are integer log-odds of the max softmax, sorted ascending and split by
// whether the prediction was right. The reject region is every score <= threshold.

// Log-space sums land ~1e-12 off exact boundaries (CDF = 0.5 when delta = 0.5 and
// n is odd); the Python reference uses the same tolerance.
const CDF_EPS = 1e-9;

let logFact = new Float64Array([0]);

const ensureLogFactorials = (n: number) => {
  if (logFact.length > n) return;
  const next = new Float64Array(n + 1);
  next.set(logFact);
  for (let i = logFact.length; i <= n; i++) next[i] = next[i - 1] + Math.log(i);
  logFact = next;
};

/** P[X <= k] for X ~ Binomial(n, 0.5), summed in log space. */
export const binomHalfCdf = (k: number, n: number) => {
  if (k >= n) return 1;
  ensureLogFactorials(n);
  const base = logFact[n] - n * Math.LN2;
  let max = -Infinity;
  for (let i = 0; i <= k; i++) max = Math.max(max, base - logFact[i] - logFact[n - i]);
  let sum = 0;
  for (let i = 0; i <= k; i++) sum += Math.exp(base - logFact[i] - logFact[n - i] - max);
  return Math.exp(max) * sum;
};

/** True when a reject region with `right` correct answers out of `n` is no better
 * than a coin flip at significance `delta` (the B-CDF viability test). */
export const looksLikeCoinFlip = (right: number, n: number, delta: number) =>
  n > 0 && binomHalfCdf(right, n) <= 1 - delta + CDF_EPS;

/** Number of entries <= t in an ascending array. */
export const countAtMost = (sorted: ArrayLike<number>, t: number) => {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/**
 * Highest-select-accuracy threshold whose reject region passes the coin-flip test.
 * `right` and `wrong` are ascending scores. Returns -Infinity to reject nothing.
 */
export const learnThreshold = (right: ArrayLike<number>, wrong: ArrayLike<number>, delta: number) => {
  const total = right.length + wrong.length;
  const totalRight = right.length;
  let bestT = -Infinity;
  if (wrong.length === 0) return bestT;

  // Best so far as an exact fraction; starts at the base accuracy with coverage -1.
  let bestK = totalRight;
  let bestN = total;
  let bestCov = -1;
  let r = 0; // right answers with score <= t
  for (let w = 0; w < wrong.length; w++) {
    const t = wrong[w];
    if (w + 1 < wrong.length && wrong[w + 1] === t) continue; // unique candidates
    while (r < right.length && right[r] <= t) r++;
    const rejected = r + w + 1;
    if (binomHalfCdf(r, rejected) > 1 - delta + CDF_EPS) continue;
    const sel = total - rejected;
    const kSel = totalRight - r;
    let better: boolean;
    let tie = false;
    if (sel === 0) {
      better = bestN !== 0; // an empty select region scores 1.1, as in the reference
    } else if (bestN === 0) {
      better = false;
    } else {
      better = kSel * bestN > bestK * sel;
      tie = kSel * bestN === bestK * sel;
    }
    if (better || (tie && sel > bestCov)) {
      bestT = t;
      bestK = kSel;
      bestN = sel;
      bestCov = sel;
    }
  }
  return bestT;
};

export interface Split {
  total: number;
  answered: number;
  answeredRight: number;
  declined: number;
  declinedRight: number;
  coverage: number;
  selectAcc: number;
  rejectAcc: number;
}

/** Answer when score > t; decline otherwise. Accuracies are NaN for empty sides. */
export const splitAt = (right: ArrayLike<number>, wrong: ArrayLike<number>, t: number): Split => {
  const total = right.length + wrong.length;
  const declinedRight = countAtMost(right, t);
  const declined = declinedRight + countAtMost(wrong, t);
  const answered = total - declined;
  const answeredRight = right.length - declinedRight;
  return {
    total,
    answered,
    answeredRight,
    declined,
    declinedRight,
    coverage: answered / total,
    selectAcc: answered ? answeredRight / answered : NaN,
    rejectAcc: declined ? declinedRight / declined : NaN,
  };
};
