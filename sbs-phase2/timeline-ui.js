/** C7 UI-only timeline renderer. Unknown is deliberately not rendered green. */
const STATUS_LABEL = Object.freeze({ good: '良好', warning: '注意', error: '要修正', unknown: '判定不能' });

export function timelineClass(status) {
  return ['good', 'warning', 'error'].includes(status) ? status : 'unknown';
}

export function formatSeconds(milliseconds) {
  return `${(Math.max(0, Number(milliseconds) || 0) / 1000).toFixed(1)}秒`;
}

export function renderTimeline(container, timeline = []) {
  container.replaceChildren();
  if (!timeline.length) { container.textContent = '表示できる時間帯がありません。'; container.className = 'timeline-empty'; return; }
  const track = document.createElement('div'); track.className = 'timeline-track'; track.setAttribute('aria-label', 'フォーム状態タイムライン');
  for (const band of timeline) {
    const status = timelineClass(band.status); const segment = document.createElement('div');
    segment.className = `timeline-segment ${status}`;
    segment.style.flexGrow = String(Math.max(1, (band.end - band.start) / 1000));
    segment.title = `${formatSeconds(band.start)}〜${formatSeconds(band.end)}: ${STATUS_LABEL[status]}`;
    segment.setAttribute('aria-label', segment.title); track.append(segment);
  }
  container.append(track);
  const legend = document.createElement('p'); legend.className = 'timeline-legend';
  legend.textContent = '緑: 良好　黄: 注意　赤: 要修正　斜線グレー: 判定不能'; container.append(legend);
}
