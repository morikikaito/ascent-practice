import test from 'node:test';
import assert from 'node:assert/strict';
import { detectEvents, HYSTERESIS_FRAMES } from './events.js';

const frame = (t, status) => ({ t, status });

test('does not emit for a one-frame worsening noise crossing', () => {
  assert.deepEqual(detectEvents([frame(0, 'good'), frame(1, 'warning'), frame(2, 'good')]), []);
});

test('emits once after N frames and preserves the first crossing timestamp', () => {
  const frames = [frame(0, 'good'), ...Array.from({ length: HYSTERESIS_FRAMES + 2 }, (_, i) => frame(i + 10, 'warning'))];
  assert.deepEqual(detectEvents(frames), [{ t: 10, from: 'good', to: 'warning' }]);
});

test('does not duplicate an event while the status remains worsened', () => {
  const frames = [frame(0, 'good'), ...Array.from({ length: HYSTERESIS_FRAMES * 2 }, (_, i) => frame(i + 1, 'warning'))];
  assert.equal(detectEvents(frames).length, 1);
});

test('detects both good-to-warning and warning-to-error transitions', () => {
  const frames = [
    frame(0, 'good'),
    ...Array.from({ length: HYSTERESIS_FRAMES }, (_, i) => frame(i + 1, 'warning')),
    ...Array.from({ length: HYSTERESIS_FRAMES }, (_, i) => frame(i + 10, 'error'))
  ];
  assert.deepEqual(detectEvents(frames), [
    { t: 1, from: 'good', to: 'warning' },
    { t: 10, from: 'warning', to: 'error' }
  ]);
});

test('unknown frames do not reset a valid pending crossing', () => {
  const frames = [frame(0, 'good'), frame(1, 'warning'), frame(2, 'unknown'), frame(3, 'warning'), frame(4, 'warning')];
  assert.deepEqual(detectEvents(frames), [{ t: 1, from: 'good', to: 'warning' }]);
});

