import test from 'node:test';
import assert from 'node:assert/strict';
import { TIMELINE_BUCKET_MS, buildTimeline, buildTimelineOutput, pickPeaks } from './timeline.js';

const frame = (t, status, severity = 0, landmarks = [{ x: t, y: 0 }]) => ({
  t,
  status,
  severity,
  landmarks
});

test('buildTimeline aggregates each bucket by error > warning > good', () => {
  const timeline = buildTimeline([
    frame(0, 'good'), frame(100, 'warning'), frame(900, 'error'),
    frame(TIMELINE_BUCKET_MS, 'good'), frame(TIMELINE_BUCKET_MS + 1, 'warning')
  ]);
  assert.deepEqual(timeline, [
    { start: 0, end: TIMELINE_BUCKET_MS, status: 'error' },
    { start: TIMELINE_BUCKET_MS, end: TIMELINE_BUCKET_MS * 2, status: 'warning' }
  ]);
});

test('buildTimeline keeps a bucket containing only unknown frames unknown', () => {
  assert.deepEqual(buildTimeline([frame(0, 'unknown'), { t: 10, status: { overall: 'unknown' } }]), [
    { start: 0, end: TIMELINE_BUCKET_MS, status: 'unknown' }
  ]);
});

test('pickPeaks selects the worst normalized frame for each alert status', () => {
  const warningLandmarks = [{ x: 1, y: 2 }];
  const errorLandmarks = [{ x: 3, y: 4 }];
  const peaks = pickPeaks([
    frame(10, 'warning', 2), frame(11, 'warning', 9, warningLandmarks),
    frame(20, 'error', 3), frame(21, 'error', 11, errorLandmarks)
  ], [{ t: 10, from: 'good', to: 'warning' }]);
  assert.deepEqual(peaks, [
    { t: 11, status: 'warning', landmarks: warningLandmarks },
    { t: 21, status: 'error', landmarks: errorLandmarks }
  ]);
  assert.strictEqual(peaks[0].landmarks, warningLandmarks);
  assert.strictEqual(peaks[1].landmarks, errorLandmarks);
});

test('pickPeaks returns no yellow or red peak for all-good frames', () => {
  assert.deepEqual(pickPeaks([frame(0, 'good'), frame(1, 'good')]), []);
});

test('the C6 hand-off has the fixed frames/events/timeline/peaks shape', () => {
  const frames = [frame(0, 'good')];
  const events = [];
  const output = buildTimelineOutput(frames, events);
  assert.deepEqual(Object.keys(output), ['frames', 'events', 'timeline', 'peaks']);
  assert.ok(Array.isArray(output.frames));
  assert.ok(Array.isArray(output.events));
  assert.ok(Array.isArray(output.timeline));
  assert.ok(Array.isArray(output.peaks));
  assert.strictEqual(output.frames, frames);
  assert.strictEqual(output.events, events);
});

test('empty, invalid, and one-frame inputs do not throw', () => {
  assert.deepEqual(buildTimeline([]), []);
  assert.deepEqual(buildTimeline(null), []);
  assert.deepEqual(pickPeaks([], []), []);
  assert.deepEqual(buildTimeline([frame(1234, 'good')]), [
    { start: TIMELINE_BUCKET_MS, end: TIMELINE_BUCKET_MS * 2, status: 'good' }
  ]);
  assert.doesNotThrow(() => buildTimelineOutput(null, null));
});
