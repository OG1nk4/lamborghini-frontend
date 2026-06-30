// scroll-sequence.js
export function initScrollSequence(bitmaps) {
  const canvas  = document.getElementById('hero-canvas');
  const ctx     = canvas.getContext('2d');
  const section = document.getElementById('hero-section');

  let currentFrame = 0;

  // Em telas estreitas/portrait, "cover" cortaria a maior parte da largura
  // do vídeo (fonte 16:9). Acima de um limiar de corte, trocamos para um
  // "contain" ancorado no topo: mostra o frame inteiro, sem cortar, e
  // deixa espaço livre embaixo para o texto não brigar com a imagem.
  const MAX_CROP_RATIO = 1.6;

  function drawFrame(index) {
    const bmp = bitmaps[Math.max(0, Math.min(index, bitmaps.length - 1))];
    if (!bmp) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const coverScale   = Math.max(cw / bmp.width, ch / bmp.height);
    const containScale = Math.min(cw / bmp.width, ch / bmp.height);
    const cropRatio = coverScale / containScale;

    let scale, sx, sy;
    if (cropRatio > MAX_CROP_RATIO) {
      // contain, ancorado no topo
      scale = containScale;
      sx = (cw - bmp.width * scale) / 2;
      sy = 0;
    } else {
      // cover, centralizado (comportamento desktop/tablet padrão)
      scale = coverScale;
      sx = (cw - bmp.width * scale) / 2;
      sy = (ch - bmp.height * scale) / 2;
    }

    const sw = bmp.width  * scale;
    const sh = bmp.height * scale;

    ctx.fillStyle = '#060606';
    ctx.fillRect(0, 0, cw, ch);
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
