import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MIN_LANDMARK_VISIBILITY,
  createMonotonicTimestampsMs,
  isLowConfidence
} from './detect-series.js';

function assertStrictlyIncreasing(values) {
  for (let index = 1; index < values.length; index += 1) {
    assert.ok(values[index] > values[index - 1]);
  }
}

test('createMonotonicTimestampsMs converts C4 seconds to strictly increasing ms', () => {
  const timestamps = createMonotonicTimestampsMs([0, 0.25, 0.5]);
  assert.deepEqual(timestamps, [0, 250, 500]);
  assertStrictlyIncreasing(timestamps);
});

test('createMonotonicTimestampsMs corrects duplicate timestamps', () => {
  const timestamps = createMonotonicTimestampsMs([1, 1, 1]);
  assert.deepEqual(timestamps, [1000, 1001, 1002]);
  assertStrictlyIncreasing(timestamps);
});

test('createMonotonicTimestampsMs corrects non-monotonic and invalid timestamps', () => {
  const timestamps = createMonotonicTimestampsMs([2, 1.5, Number.NaN, 3]);
  assert.deepEqual(timestamps, [2000, 2001, 2002, 3000]);
  assertStrictlyIncreasing(timestamps);
});

test('isLowConfidence applies visibility threshold including its boundary', () => {
  assert.equal(isLowConfidence([{ visibility: MIN_LANDMARK_VISIBILITY }]), false);
  assert.equal(isLowConfidence([{ visibility: MIN_LANDMARK_VISIBILITY + 0.01 }]), false);
  assert.equal(isLowConfidence([{ visibility: MIN_LANDMARK_VISIBILITY - 0.01 }]), true);
  assert.equal(isLowConfidence([{ visibility: 0.8 }, { visibility: 0.4 }], 0.5), true);
});

test('isLowConfidence safely treats missing and empty landmarks as indeterminate', () => {
  assert.equal(isLowConfidence(), true);
  assert.equal(isLowConfidence(null), true);
  assert.equal(isLowConfidence([]), true);
  assert.equal(isLowConfidence([{}]), true);
});
