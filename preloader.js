// preloader.js
const TOTAL_FRAMES = 192; // 24fps × 8s
const IS_MOBILE = window.matchMedia('(max-width: 767px)').matches;

// Desktop: todos os 192 frames (1,2,3,...,192)
// Mobile: só frames ímpares (~96 imagens)
export function getFrameNumbers() {
  const nums = [];
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    if (IS_MOBILE && i % 2 === 0) continue;
    nums.push(i);
  }
  return nums;
}

function pad4(n) {
  return String(n).padStart(4, '0');
}

/**
 * Carrega e decodifica todos os frames fora da thread principal.
 * @param {(pct: number) => void} onProgress  0..100
 * @returns {Promise<ImageBitmap[]>}
 */
export async function loadFrames(onProgress) {
  const frameNums = getFrameNumbers();
  const bitmaps = new Array(frameNums.length);
  let loaded = 0;

  const CONCURRENCY = 6;
  let pos = 0;

  async function worker() {
    while (pos < frameNums.length) {
      const i = pos++;
      const url = `public/sequencia/frame-${pad4(frameNums[i])}.webp`;
      const res = await fetch(url);
      const blob = await res.blob();
      bitmaps[i] = await createImageBitmap(blob);
      loaded++;
      onProgress(Math.round((loaded / frameNums.length) * 100));
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return bitmaps;
}
