/**
 * One second is a readable minimum width for the C7 timeline while retaining
 * the short-lived form faults emitted by the current capture loop.  The UI
 * owns rendering; this module only exposes its time-band data.
 */
export const TIMELINE_BUCKET_MS = 1000;

const STATUS_RANK = Object.freeze({ good: 0, warning: 1, error: 2 });

function statusOf(frame) {
  const status = typeof frame?.status === 'string' ? frame.status : frame?.status?.overall;
  return Object.hasOwn(STATUS_RANK, status) ? status : null;
}

function timestampOf(frame) {
  return Number.isFinite(frame?.t) ? frame.t : null;
}

/**
 * Groups observed frames into fixed wall-clock bands.  Empty bands cannot be
 * inferred without a requested capture range, so they are omitted.  A band
 * containing only unknown/invalid classifications is explicitly `unknown`,
 * never silently rendered as `good`.
 */
export function buildTimeline(frameScores = []) {
  if (!Array.isArray(frameScores)) return [];

  const buckets = new Map();
  for (const frame of frameScores) {
    const t = timestampOf(frame);
    if (t === null) continue;

    const start = Math.floor(t / TIMELINE_BUCKET_MS) * TIMELINE_BUCKET_MS;
    const current = buckets.get(start) ?? { start, end: start + TIMELINE_BUCKET_MS, status: 'unknown' };
    const status = statusOf(frame);
    if (status && (current.status === 'unknown' || STATUS_RANK[status] > STATUS_RANK[current.status])) {
      current.status = status;
    }
    buckets.set(start, current);
  }

  return [...buckets.values()].sort((a, b) => a.start - b.start);
}

function peakWeight(frame, status) {
  // C6 may provide a normalized severity.  Prefer it because raw C1 metrics
  // use different units (degrees, ratios, and pixels) and cannot be compared.
  for (const value of [frame?.severity, frame?.score, frame?.status?.severity]) {
    if (Number.isFinite(value)) return value;
  }

  // Until a normalized severity is attached, more offending metrics is the
  // only meaningful, unit-free tie breaker within the same status.
  if (frame?.status && typeof frame.status === 'object') {
    return Object.values(frame.status).filter((value) => value === status).length;
  }
  return 0;
}

/**
 * Selects one representative yellow and red frame.  Event proximity is not a
 * tie-breaker: C7 needs the objectively worst posture, rather than the first
 * hysteresis crossing.  Landmark arrays are deliberately passed by reference
 * so the renderer can draw the original frame without rehydration.
 */
export function pickPeaks(frameScores = [], events = []) { // events reserved for the C6 contract
  void events;
  if (!Array.isArray(frameScores)) return [];

  return ['warning', 'error'].flatMap((status) => {
    let selected = null;
    let selectedWeight = -Infinity;
    for (const frame of frameScores) {
      if (statusOf(frame) !== status || timestampOf(frame) === null) continue;
      const weight = peakWeight(frame, status);
      if (weight > selectedWeight) {
        selected = frame;
        selectedWeight = weight;
      }
    }
    return selected ? [{ t: selected.t, status, landmarks: selected.landmarks }] : [];
  });
}

/**
 * C6's stable hand-off shape.  The original frame and event arrays remain
 * references so landmarks and event metadata are not copied or transformed.
 */
export function buildTimelineOutput(frames = [], events = []) {
  const safeFrames = Array.isArray(frames) ? frames : [];
  const safeEvents = Array.isArray(events) ? events : [];
  return {
    frames: safeFrames,
    events: safeEvents,
    timeline: buildTimeline(safeFrames),
    peaks: pickPeaks(safeFrames, safeEvents)
  };
}
