/**
 * C7 standalone overlay renderer.
 * Ported from shoot.html: renderFormOverlay / drawSkeletonOnCanvas /
 * SKELETON_CONNECTIONS.  This module intentionally has no dependency on the
 * production page; Phase 2 remains a self-contained verification screen.
 */
export const SKELETON_CONNECTIONS = Object.freeze([
  ['LEFT_SHOULDER', 'RIGHT_SHOULDER'], ['LEFT_SHOULDER', 'LEFT_ELBOW'], ['LEFT_ELBOW', 'LEFT_WRIST'],
  ['RIGHT_SHOULDER', 'RIGHT_ELBOW'], ['RIGHT_ELBOW', 'RIGHT_WRIST'], ['LEFT_SHOULDER', 'LEFT_HIP'],
  ['RIGHT_SHOULDER', 'RIGHT_HIP'], ['LEFT_HIP', 'RIGHT_HIP'], ['LEFT_HIP', 'LEFT_KNEE'],
  ['LEFT_KNEE', 'LEFT_ANKLE'], ['RIGHT_HIP', 'RIGHT_KNEE'], ['RIGHT_KNEE', 'RIGHT_ANKLE'],
  ['NOSE', 'LEFT_SHOULDER'], ['NOSE', 'RIGHT_SHOULDER']
]);

const INDEX_TO_NAME = Object.freeze({
  0: 'NOSE', 11: 'LEFT_SHOULDER', 12: 'RIGHT_SHOULDER', 13: 'LEFT_ELBOW', 14: 'RIGHT_ELBOW',
  15: 'LEFT_WRIST', 16: 'RIGHT_WRIST', 23: 'LEFT_HIP', 24: 'RIGHT_HIP', 25: 'LEFT_KNEE',
  26: 'RIGHT_KNEE', 27: 'LEFT_ANKLE', 28: 'RIGHT_ANKLE'
});

export function statusColor(status) {
  if (status === 'error') return { fill: '#ef4444', stroke: '#b91c1c', shadow: 'rgba(239,68,68,.75)', glow: 12 };
  if (status === 'warning') return { fill: '#facc15', stroke: '#a16207', shadow: 'rgba(250,204,21,.7)', glow: 9 };
  if (status === 'unknown') return { fill: '#94a3b8', stroke: '#475569', shadow: 'rgba(148,163,184,.45)', glow: 4 };
  return { fill: '#22c55e', stroke: '#15803d', shadow: 'rgba(34,197,94,.65)', glow: 7 };
}

/** Pure coordinate conversion kept separate so it can be tested in Node. */
export function pointToCanvas(point, width, height) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(width) || !Number.isFinite(height)) return null;
  return { x: point.x * width, y: point.y * height };
}

/** Turns MediaPipe's numeric landmark array into the named ported shape. */
export function namedLandmarks(landmarks, status = 'good') {
  const source = Array.isArray(landmarks?.[0]) ? landmarks[0] : landmarks;
  if (!Array.isArray(source)) return [];
  return Object.entries(INDEX_TO_NAME).flatMap(([index, name]) => {
    const point = source[Number(index)];
    return point && Number.isFinite(point.x) && Number.isFinite(point.y) ? [{ ...point, name, s: point.s ?? status }] : [];
  });
}

function worstStatus(a, b) {
  return a === 'error' || b === 'error' ? 'error' : a === 'warning' || b === 'warning' ? 'warning' : a === 'unknown' || b === 'unknown' ? 'unknown' : 'good';
}

/** Port of shoot.html drawSkeletonOnCanvas, accepting named landmark objects. */
export function drawSkeletonOnCanvas(canvas, landmarks = []) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const { width: w, height: h } = canvas;
  const landmarkMap = Object.fromEntries(landmarks.map((landmark) => [landmark.name ?? landmark.landmark, landmark]));
  ctx.lineWidth = Math.max(3, Math.round(w / 120));
  for (const [a, b] of SKELETON_CONNECTIONS) {
    const first = landmarkMap[a]; const second = landmarkMap[b];
    const start = pointToCanvas(first, w, h); const end = pointToCanvas(second, w, h);
    if (!start || !end) continue;
    const color = statusColor(worstStatus(first.s ?? 'good', second.s ?? 'good'));
    ctx.strokeStyle = color.fill; ctx.shadowColor = color.shadow; ctx.shadowBlur = color.glow;
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
  }
  ctx.shadowBlur = 0;
  const radius = Math.max(5, Math.round(w / 80));
  for (const landmark of landmarks) {
    const point = pointToCanvas(landmark, w, h); if (!point) continue;
    const status = landmark.s ?? 'good'; const color = statusColor(status);
    ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fillStyle = color.fill; ctx.fill();
    ctx.strokeStyle = color.stroke; ctx.lineWidth = 2; ctx.stroke();
  }
  return canvas;
}

/**
 * Ported renderFormOverlay entry point. The source frame is copied first,
 * then named MediaPipe landmarks are drawn without importing shoot.html.
 */
export function renderFormOverlay(srcCanvas, landmarks, yellowJoints = [], redJoints = []) {
  const out = document.createElement('canvas');
  out.width = srcCanvas.width; out.height = srcCanvas.height;
  out.getContext('2d').drawImage(srcCanvas, 0, 0);
  const yellow = new Set(yellowJoints); const red = new Set(redJoints);
  const named = namedLandmarks(landmarks).map((point) => ({ ...point, s: red.has(point.name) ? 'error' : yellow.has(point.name) ? 'warning' : 'good' }));
  return drawSkeletonOnCanvas(out, named);
}
