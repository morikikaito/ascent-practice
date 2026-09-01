/**
 * MediaPipe PoseLandmarker adapter for SBS Phase 2 C5.
 *
 * The timestamp and confidence helpers below are DOM/MediaPipe independent so
 * they can be verified with Node.  detectSeries is the browser-only adapter.
 */

/**
 * A landmark below this visibility is treated as unusable rather than an error.
 * 0.5 is the neutral midpoint of MediaPipe's normalized visibility score and
 * keeps C5's outcome compatible with C2's "判定不能" (indeterminate) path.
 */
export const MIN_LANDMARK_VISIBILITY = 0.5;

/**
 * Converts C4's seconds-based timestamps into strictly increasing integer ms.
 * Invalid values become zero before correction.  A duplicate or earlier value
 * is shifted to exactly one millisecond after the previous value, preserving
 * every frame's position while satisfying VIDEO mode's monotonic requirement.
 *
 * @param {number[]} timestampsSeconds
 * @returns {number[]}
 */
export function createMonotonicTimestampsMs(timestampsSeconds = []) {
  const source = Array.isArray(timestampsSeconds) ? timestampsSeconds : [];
  let previous = -1;

  return source.map((timestampSeconds) => {
    const rawMs = Number.isFinite(timestampSeconds)
      ? Math.round(timestampSeconds * 1000)
      : 0;
    const timestampMs = Math.max(0, rawMs, previous + 1);
    previous = timestampMs;
    return timestampMs;
  });
}

/**
 * Returns whether landmarks should take C2's "判定不能" path.  Missing or empty
 * landmarks are low-confidence too: a caller must not mistake no pose for a
 * trustworthy pose.  Any missing/non-numeric visibility is handled equally
 * conservatively and this function deliberately never throws for bad input.
 *
 * @param {Array<{visibility?: number}> | null | undefined} landmarks
 * @param {number} threshold
 * @returns {boolean}
 */
export function isLowConfidence(landmarks, threshold = MIN_LANDMARK_VISIBILITY) {
  if (!Array.isArray(landmarks) || landmarks.length === 0) return true;
  const safeThreshold = Number.isFinite(threshold) ? threshold : MIN_LANDMARK_VISIBILITY;
  return landmarks.some((landmark) => !Number.isFinite(landmark?.visibility)
    || landmark.visibility < safeThreshold);
}

/**
 * Detects one pose landmark list for each input frame without changing order.
 * A null frame, no detected pose, or detector failure is represented by null;
 * results are never compacted, so their indexes remain aligned with frames[]
 * and C4's timestamp sequence for C6.
 *
 * VIDEO mode contract: PoseLandmarker.detectForVideo(frame, timestampMs) must
 * receive a strictly increasing timestamp for successive calls.  Always use
 * createMonotonicTimestampsMs before this loop; do not pass raw C4 timestamps.
 * The caller must initialize the existing pose_landmarker_lite model with
 * numPoses: 1 and runningMode: 'VIDEO'; this adapter does not alter that setup.
 *
 * @param {{detectForVideo: (frame: unknown, timestampMs: number) => {landmarks?: Array<Array<object>>}}} landmarker
 * @param {unknown[]} frames
 * @param {number[]} timestampsSeconds
 * @returns {Array<Array<object> | null>}
 */
export function detectSeries(landmarker, frames = [], timestampsSeconds = []) {
  const orderedFrames = Array.isArray(frames) ? frames : [];
  const timestampsMs = createMonotonicTimestampsMs(
    orderedFrames.map((_, index) => timestampsSeconds?.[index])
  );

  return orderedFrames.map((frame, index) => {
    if (frame == null || typeof landmarker?.detectForVideo !== 'function') return null;
    try {
      const result = landmarker.detectForVideo(frame, timestampsMs[index]);
      return Array.isArray(result?.landmarks?.[0]) ? result.landmarks[0] : null;
    } catch {
      return null;
    }
  });
}
