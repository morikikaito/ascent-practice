/**
 * Dense video-frame sampling helpers for SBS Phase 2.
 * This module is deliberately DOM-free so its policy can be verified in Node.
 */

export const RECOMMENDED_VIDEO_DURATION_SECONDS = 15;
export const MAX_VIDEO_DURATION_SECONDS = 30;

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

/**
 * Builds an evenly spaced sampling sequence from zero through `duration`.
 * Both endpoints are included when there is room for two samples.  `fps`
 * determines the desired number of intervals; it does not force the final
 * endpoint off the sequence.  Therefore all returned adjacent intervals stay
 * equal, including when the last source-frame boundary is fractional.
 *
 * The returned Array has non-enumerable `times`, `clamped`, and `wasClamped`
 * properties.  It remains usable as an ordinary `times[]`, while callers that
 * need the MAX_FRAMES outcome can use `result.clamped` (or destructure it).
 *
 * @param {number} duration seconds
 * @param {number} fps desired samples per second
 * @param {number} MAX_FRAMES maximum returned samples
 * @returns {number[] & {times:number[], clamped:boolean, wasClamped:boolean}}
 */
export function sampleTimes(duration, fps, MAX_FRAMES = 60) {
  const safeDuration = finitePositive(duration) ? duration : 0;
  const maxFrames = finitePositive(MAX_FRAMES) ? Math.max(1, Math.floor(MAX_FRAMES)) : 1;
  const desiredFrames = safeDuration === 0
    ? 1
    : finitePositive(fps)
      ? Math.ceil(safeDuration * fps) + 1
      : 2;
  const frameCount = Math.min(desiredFrames, maxFrames);
  const clamped = desiredFrames > frameCount;

  const times = frameCount === 1
    ? [0]
    : Array.from({ length: frameCount }, (_, index) => safeDuration * index / (frameCount - 1));

  Object.defineProperties(times, {
    times: { value: times },
    clamped: { value: clamped },
    wasClamped: { value: clamped }
  });
  return times;
}

/**
 * Duration guard from Phase 2 design §4-P1-⑤ / failure mode §7-2:
 * <=15 seconds is recommended, while anything over 30 seconds exceeds the
 * hard upper limit.  This reports policy only; C6 owns UI/rejection behavior.
 */
export function checkVideoDuration(duration) {
  const seconds = finitePositive(duration) ? duration : 0;
  return Object.freeze({
    duration: seconds,
    recommendedExceeded: seconds > RECOMMENDED_VIDEO_DURATION_SECONDS,
    maximumExceeded: seconds > MAX_VIDEO_DURATION_SECONDS
  });
}
