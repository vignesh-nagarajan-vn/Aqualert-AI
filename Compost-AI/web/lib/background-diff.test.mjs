// Accuracy checks for the background-subtraction gate.
// Run: node lib/background-diff.test.mjs
import assert from "node:assert/strict";
import { meanAbsDiff, objectPresent } from "./background-diff.mjs";

const N = 48 * 48; // matches the GRID used in camera-view
const fill = (v) => new Uint8ClampedArray(N).fill(v);

// 1. Identical frames -> no object.
{
  const base = fill(120);
  const cur = fill(120);
  assert.equal(meanAbsDiff(cur, base), 0);
  assert.equal(objectPresent(cur, base), false, "identical frames must not trigger");
}

// 2. Whole-frame strong change -> object present.
{
  const base = fill(40);
  const cur = fill(200);
  const d = meanAbsDiff(cur, base);
  assert.ok(d > 0.5, `full change should be large, got ${d}`);
  assert.equal(objectPresent(cur, base), true);
}

// 3. Sensor noise (+3 on 10% of pixels) -> sub-threshold, no false trigger.
{
  const base = fill(100);
  const cur = fill(100);
  for (let i = 0; i < N; i += 10) cur[i] = 103;
  const d = meanAbsDiff(cur, base);
  assert.ok(d < 0.05, `noise must stay below threshold, got ${d}`);
  assert.equal(objectPresent(cur, base), false);
}

// 4. Object covering ~25% of the square at strong contrast -> triggers.
{
  const base = fill(60);
  const cur = fill(60);
  const quarter = Math.floor(N * 0.25);
  for (let i = 0; i < quarter; i++) cur[i] = 210;
  const d = meanAbsDiff(cur, base);
  assert.ok(objectPresent(cur, base), `25% object should trigger, diff=${d}`);
}

// 5. Just-noticeable small object (~3% area, full contrast) sits near threshold
//    boundary — confirm threshold is doing the gating, not always-true.
{
  const base = fill(0);
  const cur = fill(0);
  const tiny = Math.floor(N * 0.03);
  for (let i = 0; i < tiny; i++) cur[i] = 255;
  // 3% * 255 / 255 = 0.03 < 0.05 default -> should NOT trigger at default,
  // but SHOULD trigger if we lower the threshold to 0.02.
  assert.equal(objectPresent(cur, base), false, "tiny speck must not trigger at default");
  assert.equal(objectPresent(cur, base, 0.02), true, "lower threshold should catch it");
}

// 6. Length mismatch -> fail-safe (treated as fully different).
assert.equal(meanAbsDiff(new Uint8ClampedArray(10), new Uint8ClampedArray(20)), 1);

console.log("✓ all background-diff accuracy checks passed");
