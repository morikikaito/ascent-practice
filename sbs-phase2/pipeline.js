import { scoreFrame } from './score.js';
import { classifyStatus } from './classify.js';
import { detectEvents } from './events.js';
import { buildTimelineOutput } from './timeline.js';
import { checkVideoDuration, sampleTimes } from './sampler.js';
import { extractFrames } from './extract-frames.js';
import { detectSeries, isLowConfidence } from './detect-series.js';

/** Raised before frame extraction when the 30-second hard limit is exceeded. */
export class VideoDurationLimitError extends Error {
  constructor(duration) {
    super(`動画は30秒以下にしてください（入力: ${duration}秒）`);
    this.name = 'VideoDurationLimitError';
    this.duration = duration;
  }
}

/** Converts C5 pose results to the C1/C2 frame contract. */
export function scoreDetectedFrames({ times = [], detections = [], hand = 'RIGHT', phaseName } = {}) {
  const safeTimes = Array.isArray(times) ? times : [];
  const safeDetections = Array.isArray(detections) ? detections : [];
  return safeTimes.map((time, index) => {
    const landmarks = safeDetections[index] ?? null;
    const metrics = scoreFrame(landmarks ? [landmarks] : null, hand);
    const status = isLowConfidence(landmarks)
      ? classifyStatus({}, phaseName)
      : classifyStatus(metrics, phaseName);
    return {
      t: Math.round((Number.isFinite(time) ? time : 0) * 1000),
      metrics,
      status,
      landmarks: metrics.landmarks
    };
  });
}

/**
 * Browser-facing C1--C5 pipeline. Dependencies can be injected for Node
 * wiring tests. The hard policy rejects videos over 30 seconds; 15--30 second
 * videos continue after an optional warning callback.
 */
export async function runPipeline({
  blob, duration, landmarker, hand = 'RIGHT', phaseName, fps = 6, maxFrames = 90,
  onWarning, sampleTimesFn = sampleTimes, extractFramesFn = extractFrames,
  detectSeriesFn = detectSeries
} = {}) {
  const durationPolicy = checkVideoDuration(duration);
  if (durationPolicy.maximumExceeded) throw new VideoDurationLimitError(durationPolicy.duration);
  if (durationPolicy.recommendedExceeded) onWarning?.('15秒を超える動画です。30秒以下で解析を続行します。');

  const times = sampleTimesFn(durationPolicy.duration, fps, maxFrames);
  const extractedFrames = await extractFramesFn(blob, times);
  const detections = detectSeriesFn(landmarker, extractedFrames, times);
  const frames = scoreDetectedFrames({ times, detections, hand, phaseName });
  const events = detectEvents(frames);
  return buildTimelineOutput(frames, events);
}
