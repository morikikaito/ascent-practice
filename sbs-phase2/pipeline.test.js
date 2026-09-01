import test from 'node:test';
import assert from 'node:assert/strict';
import { VideoDurationLimitError, runPipeline, scoreDetectedFrames } from './pipeline.js';

function landmarks({ visibility = 0.9 } = {}) {
  const pose = [];
  for (const [index, x, y] of [[11,.7,.7],[12,.35,.7],[13,.65,.6],[14,.35,.6],[15,.65,.42],[16,.45,.6],[23,.6,.68],[24,.4,.68]]) {
    pose[index] = { x, y, visibility };
  }
  return pose;
}

test('C6 wires sample, extract, detect, score, classify, events and timeline into the §8 shape', async () => {
  const calls = [];
  const output = await runPipeline({
    blob: { name: 'synthetic.mp4' }, duration: 1, hand: 'RIGHT', landmarker: { id: 'detector' },
    sampleTimesFn: (duration) => { calls.push(['sample', duration]); return [0, .5, 1]; },
    extractFramesFn: async (blob, times) => { calls.push(['extract', blob.name, times]); return ['a', 'b', 'c']; },
    detectSeriesFn: (detector, frames, times) => { calls.push(['detect', detector.id, frames, times]); return [landmarks(), landmarks(), landmarks()]; }
  });
  assert.deepEqual(calls.map(([name]) => name), ['sample', 'extract', 'detect']);
  assert.deepEqual(Object.keys(output), ['frames', 'events', 'timeline', 'peaks']);
  assert.deepEqual(output.frames.map((frame) => frame.t), [0, 500, 1000]);
  assert.ok(output.frames.every((frame) => frame.status.overall === 'good'));
  assert.deepEqual(output.events, []);
  assert.deepEqual(output.timeline, [{ start: 0, end: 1000, status: 'good' }, { start: 1000, end: 2000, status: 'good' }]);
  assert.deepEqual(output.peaks, []);
});

test('C6 rejects a video over the 30-second hard limit before extraction', async () => {
  let extracted = false;
  await assert.rejects(runPipeline({ duration: 30.01, extractFramesFn: async () => { extracted = true; return []; } }), VideoDurationLimitError);
  assert.equal(extracted, false);
});

test('C6 continues with a warning for a recommended-limit exceedance', async () => {
  const warnings = [];
  const output = await runPipeline({ duration: 16, onWarning: (message) => warnings.push(message), sampleTimesFn: () => [], extractFramesFn: async () => [], detectSeriesFn: () => [] });
  assert.equal(warnings.length, 1);
  assert.deepEqual(output, { frames: [], events: [], timeline: [], peaks: [] });
});

test('C6 preserves low-visibility/no-pose frames as unknown and observes zero detections', () => {
  const frames = scoreDetectedFrames({ times: [0, 1], detections: [landmarks({ visibility: .49 }), null] });
  assert.deepEqual(frames.map((frame) => frame.status.overall), ['unknown', 'unknown']);
  assert.deepEqual(frames.map((frame) => frame.t), [0, 1000]);
});
