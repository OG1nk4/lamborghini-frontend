// scroll-sequence.js
export function initScrollSequence(bitmaps) {
  const canvas  = document.getElementById('hero-canvas');
  const ctx     = canvas.getContext('2d');
  const section = document.getElementById('hero-section');

  let currentFrame = 0;

  function drawFrame(index) {
    const bmp = bitmaps[Math.max(0, Math.min(index, bitmaps.length - 1))];
    if (!bmp) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / bmp.width, ch / bmp.height);
    const sw = bmp.width  * scale;
    const sh = bmp.height * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(bmp, sx, sy, sw, sh);
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentFrame);
  }

  resize();
  window.addEventListener('resize', resize);

  gsap.registerPlugin(ScrollTrigger);

  const state = { frame: 0 };

  gsap.to(state, {
    frame: bitmaps.length - 1,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: () => {
        const idx = Math.round(state.frame);
        if (idx !== currentFrame) {
          currentFrame = idx;
          drawFrame(currentFrame);
        }
      },
    },
  });
}
