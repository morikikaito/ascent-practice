import test from 'node:test';
import assert from 'node:assert/strict';
import { calcAngle, scoreFrame } from './score.js';

const RIGHT = { shoulder: 12, elbow: 14, wrist: 16, hip: 24, oppositeHip: 23 };
const LEFT = { shoulder: 11, elbow: 13, wrist: 15, hip: 23, oppositeHip: 24 };

function pose(points = {}) {
  const frame = [];
  for (const [index, value] of Object.entries(points)) frame[Number(index)] = value;
  return [frame];
}

function assertClose(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12, `expected ${actual} to be close to ${expected}`);
}

test('calcAngle returns the expected right and straight angles', () => {
  assert.equal(calcAngle({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }), 90);
  assert.equal(calcAngle({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }), 180);
});

test('scoreFrame calculates a known right elbow angle', () => {
  const result = scoreFrame(pose({
    [RIGHT.shoulder]: { x: 0, y: 1 },
    [RIGHT.elbow]: { x: 0, y: 0 },
    [RIGHT.wrist]: { x: 1, y: 0 }
  }), 'RIGHT');
  assert.equal(result.elbowAngle, 90);
});

test('scoreFrame calculates rounded hip difference', () => {
  const result = scoreFrame(pose({
    [RIGHT.hip]: { x: 0.4, y: 0.68 },
    [RIGHT.oppositeHip]: { x: 0.6, y: 0.553 }
  }), 'RIGHT');
  assert.equal(result.hipDiff, 13);
});

test('scoreFrame calculates flare and wrist lift regardless of phase', () => {
  const result = scoreFrame(pose({
    [RIGHT.shoulder]: { x: 0.30, y: 0.70 },
    [RIGHT.elbow]: { x: 0.45, y: 0.60 },
    [RIGHT.wrist]: { x: 0.55, y: 0.42 }
  }), 'RIGHT');
  assertClose(result.flare, 0.15);
  assertClose(result.wristLift, 0.28);
});

test('scoreFrame switches all active joints for LEFT hand', () => {
  const result = scoreFrame(pose({
    [LEFT.shoulder]: { x: 0.70, y: 0.70 },
    [LEFT.elbow]: { x: 0.55, y: 0.60 },
    [LEFT.wrist]: { x: 0.45, y: 0.42 },
    [LEFT.hip]: { x: 0.6, y: 0.68 },
    [LEFT.oppositeHip]: { x: 0.4, y: 0.55 },
    [RIGHT.shoulder]: { x: 0.10, y: 0.90 }
  }), 'LEFT');
  assertClose(result.flare, 0.15);
  assertClose(result.wristLift, 0.28);
  assert.equal(result.hipDiff, 13);
});

test('missing landmarks produce null only for affected metrics without throwing', () => {
  const result = scoreFrame(pose({
    [RIGHT.shoulder]: { x: 0.3, y: 0.7 },
    [RIGHT.elbow]: { x: 0.45, y: 0.6 },
    [RIGHT.hip]: { x: 0.4, y: 0.68 },
    [RIGHT.oppositeHip]: { x: 0.6, y: 0.55 }
  }), 'RIGHT');
  assert.equal(result.elbowAngle, null);
  assert.equal(result.wristLift, null);
  assertClose(result.flare, 0.15);
  assert.equal(result.hipDiff, 13);
});

test('null and empty inputs return the safe empty score', () => {
  const expected = { elbowAngle: null, hipDiff: null, flare: null, wristLift: null, landmarks: [] };
  assert.deepEqual(scoreFrame(null, 'RIGHT'), expected);
  assert.deepEqual(scoreFrame([], 'LEFT'), expected);
});

test('scoreFrame is deterministic and does not mutate its input', () => {
  const input = pose({
    [RIGHT.shoulder]: { x: 0.3, y: 0.7, z: 0.1, visibility: 0.9 },
    [RIGHT.elbow]: { x: 0.45, y: 0.6, z: 0.2, visibility: 0.8 },
    [RIGHT.wrist]: { x: 0.55, y: 0.42, z: 0.3, visibility: 0.7 }
  });
  const before = structuredClone(input);
  assert.deepEqual(scoreFrame(input, 'RIGHT'), scoreFrame(input, 'RIGHT'));
  assert.deepEqual(input, before);
});
