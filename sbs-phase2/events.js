/**
 * Three consecutive observed frames suppress a one-frame landmark jitter while
 * retaining the timestamp of the first crossing.  N=3 is intentionally a
 * constant so capture-frame cadence can be tuned later without altering logic.
 */
export const HYSTERESIS_FRAMES = 3;

const STATUS_RANK = Object.freeze({ good: 0, warning: 1, error: 2 });

function frameStatus(frame) {
  const status = typeof frame?.status === 'string' ? frame.status : frame?.status?.overall;
  return Object.hasOwn(STATUS_RANK, status) ? status : null;
}

/**
 * Emits worsening status crossings after HYSTERESIS_FRAMES consecutive valid
 * observations. Unknown frames are ignored and therefore do not reset a
 * pending crossing caused by a temporarily missing landmark.
 */
export function detectEvents(frameScores = []) {
  const events = [];
  let stableStatus = null;
  let candidate = null;

  for (const frame of frameScores) {
    const status = frameStatus(frame);
    if (!status) continue;

    if (stableStatus === null) {
      stableStatus = status;
      continue;
    }

    if (STATUS_RANK[status] <= STATUS_RANK[stableStatus]) {
      stableStatus = status;
      candidate = null;
      continue;
    }

    if (candidate?.to === status && candidate.from === stableStatus) {
      candidate.count += 1;
    } else {
      candidate = { from: stableStatus, to: status, t: frame.t, count: 1 };
    }

    if (candidate.count === HYSTERESIS_FRAMES) {
      events.push({ t: candidate.t, from: candidate.from, to: candidate.to });
      stableStatus = candidate.to;
      candidate = null;
    }
  }
  return events;
}

