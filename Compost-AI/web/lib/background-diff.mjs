// Pure helpers for camera background subtraction. Framework-free so they can be
// unit-tested directly with `node lib/background-diff.test.mjs`.

/**
 * Mean absolute difference between two equal-length grayscale buffers,
 * normalized to 0..1 (0 = identical, 1 = maximally different).
 * Mismatched/empty lengths are treated as maximally different (fail-safe).
 * @param {ArrayLike<number>} a
 * @param {ArrayLike<number>} b
 * @returns {number}
 */
export function meanAbsDiff(a, b) {
  if (a.length === 0 || a.length !== b.length) return 1;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / (a.length * 255);
}

/**
 * True when the current frame differs from the empty-tray baseline enough to
 * count as a newly placed object.
 * @param {ArrayLike<number>} current
 * @param {ArrayLike<number>} baseline
 * @param {number} [threshold=0.05]
 * @returns {boolean}
 */
export function objectPresent(current, baseline, threshold = 0.05) {
  return meanAbsDiff(current, baseline) >= threshold;
}
