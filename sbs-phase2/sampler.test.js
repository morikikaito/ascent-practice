import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_VIDEO_DURATION_SECONDS,
  RECOMMENDED_VIDEO_DURATION_SECONDS,
  checkVideoDuration,
  sampleTimes
} from './sampler.js';

function assertEvenlySpaced(times) {
  if (times.length < 3) return;
  const interval = times[1] - times[0];
  for (let index = 2; index < times.length; index += 1) {
    assert.ok(Math.abs((times[index] - times[index - 1]) - interval) < 1e-12);
  }
}

test('sampleTimes returns an evenly spaced sequence including zero and duration', () => {
  const times = sampleTimes(2, 2);
  assert.deepEqual(times, [0, 0.5, 1, 1.5, 2]);
  assert.equal(times.clamped, false);
  assertEvenlySpaced(times);
});

test('sampleTimes downsamples evenly when MAX_FRAMES is exceeded', () => {
  const times = sampleTimes(10, 30, 5);
  assert.equal(times.length, 5);
  assert.equal(times[0], 0);
  assert.equal(times.at(-1), 10);
  assert.equal(times.clamped, true);
  assert.equal(times.wasClamped, true);
  assertEvenlySpaced(times);
});

test('video duration guard distinguishes recommended and maximum limits', () => {
  assert.deepEqual(checkVideoDuration(RECOMMENDED_VIDEO_DURATION_SECONDS), {
    duration: 15, recommendedExceeded: false, maximumExceeded: false
  });
  assert.deepEqual(checkVideoDuration(20), {
    duration: 20, recommendedExceeded: true, maximumExceeded: false
  });
  assert.deepEqual(checkVideoDuration(MAX_VIDEO_DURATION_SECONDS + 0.01), {
    duration: 30.01, recommendedExceeded: true, maximumExceeded: true
  });
});

test('zero and invalid values are safe and produce a bounded fallback sequence', () => {
  assert.deepEqual(sampleTimes(0, 0), [0]);
  assert.deepEqual(sampleTimes(3, 0), [0, 3]);
  assert.deepEqual(sampleTimes(-1, 24), [0]);
  assert.deepEqual(sampleTimes(3, 24, 0), [0]);
  assert.deepEqual(checkVideoDuration(Number.NaN), {
    duration: 0, recommendedExceeded: false, maximumExceeded: false
  });
});
