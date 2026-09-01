import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyStatus } from './classify.js';

test('dip thresholds retain shoot.html boundary values for elbow and hip', () => {
  assert.equal(classifyStatus({ elbowAngle: 110 }, 'dip').elbowAngle, 'good');
  assert.equal(classifyStatus({ elbowAngle: 111 }, 'dip').elbowAngle, 'warning');
  assert.equal(classifyStatus({ elbowAngle: 140 }, 'dip').elbowAngle, 'warning');
  assert.equal(classifyStatus({ elbowAngle: 141 }, 'dip').elbowAngle, 'error');
  assert.equal(classifyStatus({ hipDiff: 6 }, 'dip').hipDiff, 'good');
  assert.equal(classifyStatus({ hipDiff: 7 }, 'dip').hipDiff, 'warning');
  assert.equal(classifyStatus({ hipDiff: 12 }, 'dip').hipDiff, 'warning');
  assert.equal(classifyStatus({ hipDiff: 13 }, 'dip').hipDiff, 'error');
});

test('setup thresholds retain shoot.html boundary values for elbow and flare', () => {
  assert.equal(classifyStatus({ elbowAngle: 50 }, 'setup').elbowAngle, 'warning');
  assert.equal(classifyStatus({ elbowAngle: 49 }, 'setup').elbowAngle, 'error');
  assert.equal(classifyStatus({ elbowAngle: 65 }, 'setup').elbowAngle, 'good');
  assert.equal(classifyStatus({ elbowAngle: 115 }, 'setup').elbowAngle, 'good');
  assert.equal(classifyStatus({ elbowAngle: 116 }, 'setup').elbowAngle, 'warning');
  assert.equal(classifyStatus({ elbowAngle: 131 }, 'setup').elbowAngle, 'error');
  assert.equal(classifyStatus({ flare: 0.07 }, 'setup').flare, 'good');
  assert.equal(classifyStatus({ flare: 0.071 }, 'setup').flare, 'warning');
  assert.equal(classifyStatus({ flare: 0.12 }, 'setup').flare, 'warning');
  assert.equal(classifyStatus({ flare: 0.121 }, 'setup').flare, 'error');
});

test('release thresholds retain shoot.html boundary values for elbow, hip, and lift', () => {
  assert.equal(classifyStatus({ elbowAngle: 119 }, 'release').elbowAngle, 'error');
  assert.equal(classifyStatus({ elbowAngle: 120 }, 'release').elbowAngle, 'warning');
  assert.equal(classifyStatus({ elbowAngle: 135 }, 'release').elbowAngle, 'good');
  assert.equal(classifyStatus({ elbowAngle: 175 }, 'release').elbowAngle, 'good');
  assert.equal(classifyStatus({ elbowAngle: 176 }, 'release').elbowAngle, 'warning');
  assert.equal(classifyStatus({ hipDiff: 10 }, 'release').hipDiff, 'good');
  assert.equal(classifyStatus({ hipDiff: 11 }, 'release').hipDiff, 'warning');
  assert.equal(classifyStatus({ wristLift: 0.019 }, 'release').wristLift, 'error');
  assert.equal(classifyStatus({ wristLift: 0.02 }, 'release').wristLift, 'warning');
  assert.equal(classifyStatus({ wristLift: 0.079 }, 'release').wristLift, 'warning');
  assert.equal(classifyStatus({ wristLift: 0.08 }, 'release').wristLift, 'good');
});

test('overall status is the worst available metric status', () => {
  const result = classifyStatus({ elbowAngle: 90, flare: 0.13 }, 'setup');
  assert.equal(result.elbowAngle, 'good');
  assert.equal(result.flare, 'error');
  assert.equal(result.overall, 'error');
});

test('null metrics are unknown and never promoted to error', () => {
  const result = classifyStatus({ elbowAngle: null, hipDiff: null }, 'dip');
  assert.equal(result.elbowAngle, 'unknown');
  assert.equal(result.hipDiff, 'unknown');
  assert.equal(result.overall, 'unknown');
});

test('classifies without a phase name using C1-compatible defaults', () => {
  const result = classifyStatus({ elbowAngle: 90, hipDiff: 0, flare: 0, wristLift: 0.1 });
  assert.deepEqual(result, { elbowAngle: 'good', hipDiff: 'good', flare: 'good', wristLift: 'good', overall: 'good' });
});
