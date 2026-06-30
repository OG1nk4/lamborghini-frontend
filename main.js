// main.js
import { loadFrames } from './preloader.js';
import { initScrollSequence } from './scroll-sequence.js';

const preloaderEl = document.getElementById('preloader');
const preBarEl    = document.getElementById('pre-bar');
const prePctEl    = document.getElementById('pre-pct');
const preLabelEl  = document.getElementById('pre-label');

const LOAD_LABELS = [
  [0,  'Carregando Engenharia...'],
  [25, 'Renderizando Carbono...'],
  [50, 'Calibrando V12...'],
  [75, 'Finalizando Detalhe...'],
  [95, 'Quase pronto...'],
];

function updateLabel(pct) {
  for (let i = LOAD_LABELS.length - 1; i >= 0; i--) {
    if (pct >= LOAD_LABELS[i][0]) {
      preLabelEl.textContent = LOAD_LABELS[i][1];
      return;
    }
  }
}

async function bootstrap() {
  document.body.style.overflow = 'hidden';

  const bitmaps = await loadFrames((pct) => {
    preBarEl.style.width   = pct + '%';
    prePctEl.textContent   = pct + '%';
    updateLabel(pct);
  });

  initScrollSequence(bitmaps);

  // Lenis — smooth scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Conecta Lenis ao ScrollTrigger no mesmo frame (ponto crítico)
  lenis.on('scroll', ScrollTrigger.update);

  // GSAP ticker como loop principal do Lenis
  gsap.ticker.add((time) => lenis.raf(time * 1000));

  // Desativa lag smoothing para não acumular atraso
  gsap.ticker.lagSmoothing(0);

  // Fade out e remove preloader
  preloaderEl.style.transition = 'opacity 0.6s ease';
  preloaderEl.style.opacity    = '0';
  setTimeout(() => {
    preloaderEl.remove();
    document.body.style.overflow = '';
  }, 650);
}

bootstrap();
