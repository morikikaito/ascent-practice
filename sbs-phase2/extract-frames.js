/**
 * Thin DOM adapter for the sampler output.  Its Canvas results can be passed
 * directly to MediaPipe's image detector before C1 scoreFrame / C5 processing.
 * Sampling policy and video-duration policy intentionally live in sampler.js.
 */

function frameAt(video, time) {
  return new Promise((resolve) => {
    const onSeeked = () => {
      cleanup();
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const context = canvas.getContext('2d');
        if (!context) return resolve(null);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      } catch {
        resolve(null);
      }
    };
    const onError = () => { cleanup(); resolve(null); };
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.currentTime = Math.min(Math.max(0, time), video.duration);
  });
}

/**
 * Extracts one Canvas (or null on a seek/draw failure) for every supplied
 * timestamp.  Seeks are serial so the returned values retain times[] order.
 *
 * @param {Blob} blob
 * @param {number[]} times
 * @returns {Promise<Array<HTMLCanvasElement | null>>}
 */
export function extractFrames(blob, times = []) {
  const requestedTimes = Array.isArray(times) ? times : [];
  if (!(blob instanceof Blob)) return Promise.resolve(requestedTimes.map(() => null));

  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(blob);
    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    };
    const finish = (frames) => { cleanup(); resolve(frames); };

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.addEventListener('error', () => finish(requestedTimes.map(() => null)), { once: true });
    video.addEventListener('loadedmetadata', async () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        finish(requestedTimes.map(() => null));
        return;
      }
      const frames = [];
      for (const time of requestedTimes) frames.push(await frameAt(video, Number.isFinite(time) ? time : 0));
      finish(frames);
    }, { once: true });
    video.src = url;
    video.load();
  });
}
