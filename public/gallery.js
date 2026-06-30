// gallery.js
// Aplica fade da imagem real sobre o LQIP assim que o carregamento termina
export function initGallery() {
  document.querySelectorAll('.gal-img').forEach((img) => {
    if (img.complete) {
      img.classList.add('is-loaded');
      return;
    }
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  });
}
