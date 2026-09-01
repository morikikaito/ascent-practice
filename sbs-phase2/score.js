/**
 * MediaPipe Pose landmark indices used by the SBS scoring core.
 * Kept local so this module has no dependency on the production UI.
 */
export const MP_IDX = Object.freeze({
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28
});

/**
 * Returns the two-dimensional angle ABC in degrees, rounded to the nearest
 * integer, matching the calculation used in shoot.html.
 */
export function calcAngle(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag = Math.sqrt((v1.x ** 2 + v1.y ** 2) * (v2.x ** 2 + v2.y ** 2));
  if (!mag) return 0;
  return Math.round(Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180 / Math.PI);
}

function emptyScore() {
  return {
    elbowAngle: null,
    hipDiff: null,
    flare: null,
    wristLift: null,
    landmarks: []
  };
}

/**
 * Calculates phase-independent, raw SBS metrics for one MediaPipe Pose frame.
 * This function is intentionally free of DOM, MediaPipe runtime, and global
 * state dependencies; classification belongs to the next scoring layer.
 *
 * @param {Array<Array<{x:number, y:number, z?:number, visibility?:number}>>} landmarks
 * @param {'RIGHT'|'LEFT'} hand
 */
export function scoreFrame(landmarks, hand) {
  if (!Array.isArray(landmarks) || !Array.isArray(landmarks[0])) return emptyScore();

  const lm = landmarks[0];
  const activeHand = hand === 'LEFT' ? 'LEFT' : 'RIGHT';
  const oppositeHand = activeHand === 'RIGHT' ? 'LEFT' : 'RIGHT';
  const shoulder = lm[MP_IDX[`${activeHand}_SHOULDER`]];
  const elbow = lm[MP_IDX[`${activeHand}_ELBOW`]];
  const wrist = lm[MP_IDX[`${activeHand}_WRIST`]];
  const hip = lm[MP_IDX[`${activeHand}_HIP`]];
  const oppositeHip = lm[MP_IDX[`${oppositeHand}_HIP`]];

  return {
    elbowAngle: shoulder && elbow && wrist ? calcAngle(shoulder, elbow, wrist) : null,
    hipDiff: hip && oppositeHip ? Math.round(Math.abs(hip.y - oppositeHip.y) * 100) : null,
    flare: shoulder && elbow ? Math.abs(elbow.x - shoulder.x) : null,
    wristLift: shoulder && wrist ? shoulder.y - wrist.y : null,
    landmarks: lm.map((landmark) => landmark && ({
      x: landmark.x,
      y: landmark.y,
      z: landmark.z,
      visibility: landmark.visibility
    }))
  };
}
