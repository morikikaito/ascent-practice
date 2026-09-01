/**
 * Status thresholds copied verbatim from shoot.html's analyzeFrame
 * (shoot.html lines 625-649 as of 2026-07-15).  This module is deliberately
 * UI-free so Phase 2 can be tested without changing the production page.
 */
const STATUS_ORDER = Object.freeze({ unknown: -1, good: 0, warning: 1, error: 2 });

function upperOutside(value, warning, error) {
  if (value > error) return 'error';
  if (value > warning) return 'warning';
  return 'good';
}

function upperWarningOnly(value, warning) {
  return value > warning ? 'warning' : 'good';
}

function range(value, errorLow, warningLow, warningHigh, errorHigh) {
  if (value < errorLow || value > errorHigh) return 'error';
  if (value < warningLow || value > warningHigh) return 'warning';
  return 'good';
}

const PHASE_RULES = Object.freeze({
  dip: Object.freeze({
    elbowAngle: (value) => upperOutside(value, 110, 140),
    hipDiff: (value) => upperOutside(value, 6, 12)
  }),
  setup: Object.freeze({
    elbowAngle: (value) => range(value, 50, 65, 115, 130),
    flare: (value) => upperOutside(value, 0.07, 0.12)
  }),
  release: Object.freeze({
    elbowAngle: (value) => range(value, 120, 135, 175, Infinity),
    hipDiff: (value) => upperWarningOnly(value, 10),
    wristLift: (value) => value < 0.02 ? 'error' : value < 0.08 ? 'warning' : 'good'
  })
});

// With no phase label, retain C1's phase-independent contract by applying the
// one production rule that owns each raw metric (setup elbow/flare, dip hip,
// release wrist lift). Explicit phaseName always uses that phase's exact rule.
const DEFAULT_RULES = Object.freeze({
  elbowAngle: PHASE_RULES.setup.elbowAngle,
  hipDiff: PHASE_RULES.dip.hipDiff,
  flare: PHASE_RULES.setup.flare,
  wristLift: PHASE_RULES.release.wristLift
});

/**
 * Classifies raw C1 metrics. Missing or non-finite metrics are unknown rather
 * than errors, preventing landmark-loss frames from becoming false alerts.
 */
export function classifyStatus(metrics = {}, phaseName) {
  const rules = PHASE_RULES[phaseName] ?? DEFAULT_RULES;
  const result = {};

  for (const metric of ['elbowAngle', 'hipDiff', 'flare', 'wristLift']) {
    const value = metrics[metric];
    result[metric] = Number.isFinite(value) && rules[metric]
      ? rules[metric](value)
      : 'unknown';
  }

  const statuses = Object.values(result);
  result.overall = statuses.reduce(
    (worst, status) => STATUS_ORDER[status] > STATUS_ORDER[worst] ? status : worst,
    'unknown'
  );
  return result;
}
