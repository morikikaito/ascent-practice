import test from 'node:test';
import assert from 'node:assert/strict';
import { namedLandmarks, pointToCanvas, statusColor } from './overlay.js';

test('C7 converts normalized landmark coordinates to canvas coordinates', () => {
  assert.deepEqual(pointToCanvas({ x: .25, y: .5 }, 640, 360), { x: 160, y: 180 });
  assert.equal(pointToCanvas({ x: NaN, y: .5 }, 640, 360), null);
});

test('C7 names supported MediaPipe landmarks and applies the frame status', () => {
  const points = []; points[11] = { x: .1, y: .2 }; points[16] = { x: .3, y: .4 };
  assert.deepEqual(namedLandmarks(points, 'warning'), [
    { x: .1, y: .2, name: 'LEFT_SHOULDER', s: 'warning' }, { x: .3, y: .4, name: 'RIGHT_WRIST', s: 'warning' }
  ]);
  assert.equal(statusColor('unknown').fill, '#94a3b8');
});
