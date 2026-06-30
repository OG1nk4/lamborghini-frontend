# Velocci Scroll Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a landing page Velocci em HTML/CSS/JS puro com animação de scroll-sequence Apple-style: 240 frames WebP num `<canvas>`, controlados por GSAP ScrollTrigger + Lenis com fluidez máxima.

**Architecture:** O `index.html` carrega os módulos ES6 em ordem: `main.js` inicializa Lenis e conecta ao ticker do GSAP; `preloader.js` decodifica todos os frames via `createImageBitmap()` antes de liberar o scroll; `scroll-sequence.js` pina o canvas por 600vh e interpola o frame exibido com `scrub: 1.2`. Em mobile (<768px) apenas frames ímpares são carregados (~120 imagens).

**Tech Stack:** HTML5, CSS3, Vanilla JS (ES modules), GSAP 3 + ScrollTrigger (CDN), Lenis 1.x (CDN), FFmpeg (extração de frames)

---

## File Map

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura HTML, imports CDN, canvas hero, preloader markup |
| `style.css` | Estilos da landing page (do design export) + preloader |
| `main.js` | Bootstrap: inicializa Lenis, conecta ao GSAP ticker |
| `preloader.js` | Carrega e decodifica frames; exporta `loadFrames(onProgress)` |
| `scroll-sequence.js` | Canvas + ScrollTrigger scrub, renderização de frames |
| `public/sequencia/` | 240 frames WebP gerados pelo FFmpeg |

---

### Task 1: Instalar FFmpeg e extrair frames do vídeo

**Files:**
- Create: `public/sequencia/` (pasta gerada pelo FFmpeg)

- [ ] **Step 1: Verificar FFmpeg no PATH**

Abra um novo terminal PowerShell (feche e reabra após instalar) e rode:
```powershell
ffmpeg -version
```
Saída esperada: `ffmpeg version 7.x ...`

Se não aparecer, adicione manualmente ao PATH:
```powershell
# Substitua pelo caminho real onde instalou o ffmpeg
$ffmpegBin = "C:\ffmpeg\bin"
[System.Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$ffmpegBin", "User")
```
Feche e reabra o terminal, rode `ffmpeg -version` novamente.

- [ ] **Step 2: Criar pasta de destino**

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\Administrator\Downloads\CodesTestes\velocci-site\public\sequencia"
```

- [ ] **Step 3: Extrair 240 frames a 30fps com largura 1600px**

```powershell
ffmpeg -i "C:\Users\Administrator\Downloads\CodesTestes\velocci-site\assets\video-fonte\Lamborghini_transition_video_front_1080p_202606292337.mp4" `
  -vf "fps=30,scale=1600:-1" `
  -frames:v 240 `
  -q:v 80 `
  "C:\Users\Administrator\Downloads\CodesTestes\velocci-site\public\sequencia\frame-%04d.webp"
```

Saída esperada: mensagens de progresso do FFmpeg terminando com `frame=  240 ...`

- [ ] **Step 4: Verificar resultado**

```powershell
$frames = Get-ChildItem "C:\Users\Administrator\Downloads\CodesTestes\velocci-site\public\sequencia\*.webp"
$count = $frames.Count
$totalMB = [math]::Round(($frames | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
$avgKB = [math]::Round(($totalMB * 1024) / $count, 1)
Write-Host "Frames: $count | Total: ${totalMB}MB | Média: ${avgKB}KB/frame"
```

Saída esperada: `Frames: 240 | Total: X.XXmb | Média: XXXkb/frame`

---

### Task 2: Estrutura HTML base (`index.html`)

**Files:**
- Create: `index.html`

- [ ] **Step 1: Criar index.html**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VELOCCI — GX-12 Corsa</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- PRELOADER -->
  <div id="preloader">
    <div id="preloader-inner">
      <span class="pre-brand bb">VELOCCI</span>
      <span id="pre-label" class="pre-label mn">Carregando Engenharia...</span>
      <div id="pre-bar-wrap">
        <div id="pre-bar"></div>
      </div>
      <span id="pre-pct" class="pre-pct mn">0%</span>
    </div>
  </div>

  <!-- NAV -->
  <nav class="nav">
    <a class="nav-brand" href="#">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polygon points="11,1 21,20 1,20" fill="none" stroke="#C8922A" stroke-width="1.5"/>
        <polygon points="11,7 17,18 5,18" fill="rgba(200,146,42,0.18)"/>
      </svg>
      <span class="nav-logo">VELOCCI</span>
    </a>
    <ul class="nav-ul">
      <li><a href="#">O Carro</a></li>
      <li><a href="#">Tecnologia</a></li>
      <li><a href="#">Galeria</a></li>
      <li><a href="#">Configurar</a></li>
      <li><a href="#">Concessionárias</a></li>
    </ul>
    <button class="nav-cta">Solicitar Brochura</button>
  </nav>

  <!-- HERO SCROLL SEQUENCE -->
  <section id="hero-section">
    <div id="canvas-sticky">
      <canvas id="hero-canvas"></canvas>
      <div id="hero-overlay">
        <span class="ey">Velocci · GX-12 Corsa</span>
        <div class="acl"></div>
        <h1 class="fh">Engenharia<br>Sem <span class="ac">Limites</span></h1>
        <p class="fb">Onde a física encontra a arte. Criado nos ateliês de Maranello Moderna, projetado para redefinir o que um hipercarro pode ser.</p>
      </div>
      <div class="shint">
        <span>Rolar para revelar</span>
        <div class="sbar"></div>
      </div>
    </div>
  </section>

  <!-- SPECS -->
  <section class="s-specs">
    <div class="s-hdr">
      <p class="s-ey">Especificações Técnicas</p>
      <h2 class="s-ti">GX-12 Corsa<br>Em Números</h2>
    </div>
    <div class="sbig-grid">
      <div class="scard"><div class="scard-val">1<span class="scard-unit">250</span></div><div class="scard-lbl">CV de Potência</div><div class="scard-desc">Motor V12 Biturbo naturally aspirated com injeção direta de alta pressão.</div></div>
      <div class="scard"><div class="scard-val">2.<span class="scard-unit">7s</span></div><div class="scard-lbl">0–100 km/h</div><div class="scard-desc">Launch control com diferencial ativo e controle de tração adaptativo.</div></div>
      <div class="scard"><div class="scard-val">3<span class="scard-unit">68</span></div><div class="scard-lbl">km/h Velocidade Máx</div><div class="scard-desc">Limitada eletronicamente. Potencial aerodinâmico para além de 400 km/h.</div></div>
      <div class="scard"><div class="scard-val">1<span class="scard-unit">290</span></div><div class="scard-lbl">kg — Peso Seco</div><div class="scard-desc">Monocoque de fibra de carbono com subframes em titânio.</div></div>
    </div>
    <div class="stbl">
      <div class="stbl-row"><span class="stbl-k">Motor</span><span class="stbl-v">V12 6.5L Biturbo</span></div>
      <div class="stbl-row"><span class="stbl-k">Câmbio</span><span class="stbl-v">DCT 8 Velocidades</span></div>
      <div class="stbl-row"><span class="stbl-k">Tração</span><span class="stbl-v">RWD com Dif. Ativo</span></div>
      <div class="stbl-row"><span class="stbl-k">Carroceria</span><span class="stbl-v">Monocoque Carbono</span></div>
      <div class="stbl-row"><span class="stbl-k">Freios</span><span class="stbl-v">Carbono-Cerâmica 6P</span></div>
      <div class="stbl-row"><span class="stbl-k">Rodas</span><span class="stbl-v">21" Magnésio Forjado</span></div>
    </div>
  </section>

  <!-- GALLERY PLACEHOLDER -->
  <section class="s-gal">
    <div class="s-hdr">
      <p class="s-ey">Galeria</p>
      <h2 class="s-ti">Cada Ângulo,<br>Uma Declaração</h2>
    </div>
    <div class="gal-grid">
      <div class="gal-item"><div class="gal-ph"><span class="gal-lbl">Vista Frontal<br>3/4</span></div><div class="gal-ov">Exterior · Frente</div></div>
      <div class="gal-item"><div class="gal-ph"><span class="gal-lbl">Perfil<br>Lateral</span></div><div class="gal-ov">Exterior · Lateral</div></div>
      <div class="gal-item"><div class="gal-ph"><span class="gal-lbl">Interior<br>Cockpit</span></div><div class="gal-ov">Interior</div></div>
      <div class="gal-item"><div class="gal-ph"><span class="gal-lbl">Roda<br>21"</span></div><div class="gal-ov">Detalhe · Roda</div></div>
      <div class="gal-item"><div class="gal-ph"><span class="gal-lbl">Motor<br>V12</span></div><div class="gal-ov">Motor</div></div>
    </div>
  </section>

  <!-- CTA -->
  <section class="s-cta">
    <div class="cta-in">
      <p class="s-ey">Configurar Seu GX-12</p>
      <h2 class="cta-ti">Faça o Seu<br><span class="ac">Único</span></h2>
      <p class="cta-bd">Personalize cada detalhe do seu GX-12 Corsa — da cor do monocoque às costuras do couro italiano. Produção limitada a 88 unidades por ano.</p>
      <div class="cta-acts">
        <button class="btn-p">Configurar Agora</button>
        <button class="btn-g">Solicitar Brochura</button>
      </div>
      <p class="cta-note">Entregas a partir de Q3 2027 · Preço sob consulta</p>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="ft-top">
      <div>
        <span class="ft-logo">VELOCCI</span>
        <span class="ft-sl">Maranello Moderna · Est. 2024</span>
      </div>
      <div class="ft-links">
        <div class="ft-col">
          <p class="ft-col-ti">Veículo</p>
          <ul>
            <li><a href="#">GX-12 Corsa</a></li>
            <li><a href="#">Tecnologia</a></li>
            <li><a href="#">Configurador</a></li>
          </ul>
        </div>
        <div class="ft-col">
          <p class="ft-col-ti">Empresa</p>
          <ul>
            <li><a href="#">Sobre</a></li>
            <li><a href="#">Concessionárias</a></li>
            <li><a href="#">Contato</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="ft-bot">
      <span class="ft-copy">© 2026 Velocci Automobili. Todos os direitos reservados.</span>
      <div class="ft-legal">
        <a href="#">Privacidade</a>
        <a href="#">Termos</a>
        <a href="#">Cookies</a>
      </div>
    </div>
  </footer>

  <!-- SCRIPTS (ordem importa) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
  <script type="module" src="main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verificar no browser**

Abra `index.html` diretamente no browser. Você deve ver a página sem erros no console (scripts do CDN carregam, conteúdo estático visível). O canvas ainda não anima — isso vem nas próximas tasks.

---

### Task 3: Estilos CSS (`style.css`)

**Files:**
- Create: `style.css`

- [ ] **Step 1: Criar style.css**

```css
:root {
  --bg: #060606;
  --sf: #101010;
  --sf2: #161616;
  --ac: #C8922A;
  --acl: rgba(200,146,42,0.12);
  --tx: #F0EDE6;
  --txd: rgba(240,237,230,0.5);
  --txm: rgba(240,237,230,0.22);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: auto; } /* Lenis cuida do smooth scroll */

body {
  background: var(--bg);
  color: var(--tx);
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

.bb { font-family: 'Bebas Neue', sans-serif; }
.mn { font-family: 'DM Mono', monospace; }

/* ── PRELOADER ── */
#preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

#preloader-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 280px;
}

.pre-brand {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 42px;
  letter-spacing: 0.3em;
  color: var(--tx);
}

.pre-label {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--txd);
}

#pre-bar-wrap {
  width: 100%;
  height: 1px;
  background: rgba(255,255,255,0.08);
  position: relative;
  overflow: hidden;
}

#pre-bar {
  height: 100%;
  width: 0%;
  background: var(--ac);
  transition: width 0.1s linear;
}

.pre-pct {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  color: var(--ac);
  letter-spacing: 0.2em;
}

/* ── NAV ── */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 52px;
  background: linear-gradient(to bottom, rgba(6,6,6,0.92) 0%, transparent 100%);
}

.nav-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.nav-logo { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 0.2em; color: var(--tx); }
.nav-ul { display: flex; gap: 36px; list-style: none; }
.nav-ul a { color: var(--txd); text-decoration: none; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; transition: color 0.25s; }
.nav-ul a:hover { color: var(--ac); }
.nav-cta { background: none; border: 1px solid var(--ac); color: var(--ac); font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase; padding: 10px 22px; cursor: pointer; transition: all 0.25s; }
.nav-cta:hover { background: var(--ac); color: #000; }

/* ── HERO SCROLL SEQUENCE ── */
#hero-section {
  height: 600vh; /* espaço para o pin durar 600vh */
}

#canvas-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

#hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#hero-overlay {
  position: absolute;
  bottom: 78px;
  left: 52px;
  right: 50%;
  z-index: 20;
}

.ey {
  font-family: 'DM Mono', monospace;
  font-size: 9.5px;
  color: var(--ac);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  margin-bottom: 14px;
  display: block;
}

.acl { width: 34px; height: 1px; background: var(--ac); margin-bottom: 18px; }

.fh {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(56px, 7.5vw, 108px);
  line-height: 0.9;
  color: var(--tx);
  letter-spacing: 0.02em;
  margin-bottom: 18px;
}

.fh .ac, .ac { color: var(--ac); }

.fb { font-size: 13px; color: var(--txd); line-height: 1.78; max-width: 340px; font-weight: 300; letter-spacing: 0.01em; }

/* Scroll hint */
.shint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.38;
}

.shint span { font-family: 'DM Mono', monospace; font-size: 7.5px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--txm); }
.sbar { width: 1px; height: 36px; background: linear-gradient(to bottom, var(--ac), transparent); animation: spls 2.4s ease infinite; }

@keyframes spls {
  0%, 100% { opacity: 0.3; transform: scaleY(0.5) translateY(-8px); }
  55% { opacity: 1; transform: scaleY(1) translateY(0); }
}

/* ── SPECS ── */
.s-specs { padding: 116px 52px; background: var(--sf); }
.s-hdr { margin-bottom: 68px; }
.s-ey { font-family: 'DM Mono', monospace; font-size: 9.5px; color: var(--ac); letter-spacing: 0.32em; text-transform: uppercase; margin-bottom: 14px; }
.s-ti { font-family: 'Bebas Neue', sans-serif; font-size: clamp(44px, 5.8vw, 74px); color: var(--tx); letter-spacing: 0.02em; line-height: 1; }

.sbig-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.04); margin-bottom: 2px; }
.scard { background: var(--sf); padding: 36px 28px; position: relative; overflow: hidden; transition: background 0.3s; }
.scard::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--ac); transform: scaleX(0); transition: transform 0.4s; transform-origin: left; }
.scard:hover { background: var(--sf2); }
.scard:hover::after { transform: scaleX(1); }
.scard-val { font-family: 'Bebas Neue', sans-serif; font-size: 52px; color: var(--tx); line-height: 1; margin-bottom: 6px; }
.scard-unit { color: var(--ac); font-size: 22px; }
.scard-lbl { font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--txm); letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 8px; }
.scard-desc { font-size: 11.5px; color: var(--txd); line-height: 1.55; font-style: italic; margin-top: 10px; }

.stbl { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255,255,255,0.05); }
.stbl-row { background: var(--sf); padding: 15px 20px; display: flex; justify-content: space-between; align-items: baseline; }
.stbl-k { font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--txm); letter-spacing: 0.15em; text-transform: uppercase; }
.stbl-v { font-size: 12.5px; color: var(--tx); font-weight: 500; letter-spacing: 0.05em; }

/* ── GALLERY ── */
.s-gal { padding: 116px 52px; }
.gal-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 340px 230px; gap: 4px; margin-top: 62px; }
.gal-item { overflow: hidden; position: relative; background: var(--sf2); cursor: pointer; }
.gal-item:first-child { grid-row: 1 / 3; }
.gal-ph { position: absolute; inset: 0; background-color: #0e0e0e; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 8px); display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 10px; }
.gal-lbl { font-family: 'DM Mono', monospace; font-size: 7.5px; color: var(--txm); letter-spacing: 0.2em; text-align: center; text-transform: uppercase; line-height: 1.6; }
.gal-ov { position: absolute; bottom: 0; left: 0; right: 0; padding: 14px 18px; background: linear-gradient(to top, rgba(0,0,0,0.75), transparent); font-family: 'DM Mono', monospace; font-size: 7.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--txd); opacity: 0; transform: translateY(4px); transition: all 0.3s; }
.gal-item:hover .gal-ov { opacity: 1; transform: translateY(0); }

/* ── CTA ── */
.s-cta { padding: 128px 52px; background: linear-gradient(148deg, var(--sf) 0%, var(--bg) 100%); position: relative; overflow: hidden; }
.s-cta::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.012) 0, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px); pointer-events: none; }
.cta-in { position: relative; z-index: 1; max-width: 760px; }
.cta-ti { font-family: 'Bebas Neue', sans-serif; font-size: clamp(58px, 8vw, 108px); color: var(--tx); line-height: 0.9; letter-spacing: 0.02em; margin-bottom: 22px; }
.cta-bd { font-size: 14px; color: var(--txd); line-height: 1.9; max-width: 500px; margin-bottom: 42px; font-weight: 300; }
.cta-acts { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 26px; align-items: center; }
.cta-note { font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--txm); letter-spacing: 0.15em; }

.btn-p { background: var(--ac); color: #000; font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase; padding: 15px 34px; border: none; cursor: pointer; font-weight: 500; transition: background 0.2s; }
.btn-p:hover { background: #d9a030; }
.btn-g { background: none; border: 1px solid rgba(255,255,255,0.16); color: var(--txd); font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: 0.22em; text-transform: uppercase; padding: 15px 34px; cursor: pointer; transition: all 0.2s; }
.btn-g:hover { border-color: var(--ac); color: var(--ac); }

/* ── FOOTER ── */
.footer { padding: 64px 52px 40px; border-top: 1px solid rgba(255,255,255,0.045); }
.ft-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 52px; }
.ft-logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 0.2em; color: var(--tx); display: block; margin-bottom: 10px; }
.ft-sl { font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--txm); letter-spacing: 0.22em; text-transform: uppercase; }
.ft-links { display: flex; gap: 52px; }
.ft-col-ti { font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--ac); letter-spacing: 0.24em; text-transform: uppercase; margin-bottom: 14px; }
.ft-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.ft-col a { color: var(--txd); text-decoration: none; font-size: 12px; letter-spacing: 0.06em; transition: color 0.2s; }
.ft-col a:hover { color: var(--tx); }
.ft-bot { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.04); }
.ft-copy { font-family: 'DM Mono', monospace; font-size: 7.5px; color: var(--txm); letter-spacing: 0.14em; }
.ft-legal { display: flex; gap: 20px; }
.ft-legal a { font-family: 'DM Mono', monospace; font-size: 7.5px; color: var(--txm); letter-spacing: 0.12em; text-decoration: none; transition: color 0.2s; }
.ft-legal a:hover { color: var(--txd); }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .sbig-grid { grid-template-columns: 1fr 1fr; }
  .stbl { grid-template-columns: 1fr; }
  .gal-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
  .gal-item { height: 200px; }
  .gal-item:first-child { grid-row: auto; height: 260px; }
}

@media (max-width: 768px) {
  .nav { padding: 16px 24px; }
  .nav-ul, .nav-cta { display: none; }
  #hero-overlay { left: 24px; right: 16px; bottom: 58px; }
  .fh { font-size: clamp(48px, 13vw, 68px); }
  .s-specs, .s-gal, .s-cta { padding: 80px 24px; }
  .footer { padding: 48px 24px 32px; }
  .ft-top { flex-direction: column; gap: 36px; }
  .ft-links { gap: 26px; flex-wrap: wrap; }
  .ft-bot { flex-direction: column; gap: 12px; }
}
```

---

### Task 4: Preloader com createImageBitmap (`preloader.js`)

**Files:**
- Create: `preloader.js`

- [ ] **Step 1: Criar preloader.js**

```js
// preloader.js
// Detecta mobile para carregar metade dos frames
const IS_MOBILE = window.innerWidth < 768;
const TOTAL_FRAMES = 240;

// Em mobile: carrega só frames ímpares (1,3,5,...) → ~120 imgs
// Em desktop: todos os 240 frames
export function getFrameIndices() {
  const indices = [];
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    if (IS_MOBILE && i % 2 === 0) continue;
    indices.push(i);
  }
  return indices;
}

// Converte índice lógico (0..N-1) → número do frame no arquivo
export function frameIndexToNumber(logicalIndex) {
  return IS_MOBILE ? logicalIndex * 2 + 1 : logicalIndex + 1;
}

export function pad4(n) {
  return String(n).padStart(4, '0');
}

/**
 * Carrega e decodifica todos os frames fora da thread principal.
 * @param {(pct: number) => void} onProgress  0..100
 * @returns {Promise<ImageBitmap[]>}
 */
export async function loadFrames(onProgress) {
  const indices = getFrameIndices();
  const bitmaps = new Array(indices.length);
  let loaded = 0;

  const CONCURRENCY = 8; // quantas imagens decodificar em paralelo
  let pos = 0;

  async function worker() {
    while (pos < indices.length) {
      const i = pos++;
      const frameNum = indices[i];
      const url = `public/sequencia/frame-${pad4(frameNum)}.webp`;
      const res = await fetch(url);
      const blob = await res.blob();
      bitmaps[i] = await createImageBitmap(blob);
      loaded++;
      onProgress(Math.round((loaded / indices.length) * 100));
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  return bitmaps;
}
```

---

### Task 5: Bootstrap Lenis + GSAP ticker (`main.js`)

**Files:**
- Create: `main.js`

- [ ] **Step 1: Criar main.js**

```js
// main.js
import { loadFrames } from './preloader.js';
import { initScrollSequence } from './scroll-sequence.js';

const preloaderEl  = document.getElementById('preloader');
const preBarEl     = document.getElementById('pre-bar');
const prePctEl     = document.getElementById('pre-pct');
const preLabelEl   = document.getElementById('pre-label');

// Labels que aparecem conforme o carregamento avança
const LOAD_LABELS = [
  [0,   'Carregando Engenharia...'],
  [25,  'Renderizando Carbono...'],
  [50,  'Calibrando V12...'],
  [75,  'Finalizando Detalhe...'],
  [95,  'Quase pronto...'],
];

function updateLabel(pct) {
  for (let i = LOAD_LABELS.length - 1; i >= 0; i--) {
    if (pct >= LOAD_LABELS[i][0]) {
      preLabelEl.textContent = LOAD_LABELS[i][1];
      break;
    }
  }
}

async function bootstrap() {
  // Bloqueia scroll durante carregamento
  document.body.style.overflow = 'hidden';

  const bitmaps = await loadFrames((pct) => {
    preBarEl.style.width = pct + '%';
    prePctEl.textContent = pct + '%';
    updateLabel(pct);
  });

  // Inicializa scroll sequence com os frames prontos
  initScrollSequence(bitmaps);

  // Inicializa Lenis (smooth scroll)
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Conecta Lenis ao ScrollTrigger — ponto crítico:
  // o evento de scroll do Lenis atualiza o ScrollTrigger no mesmo frame
  lenis.on('scroll', ScrollTrigger.update);

  // Usa o ticker do GSAP como loop (não requestAnimationFrame nativo)
  // para manter Lenis e ScrollTrigger no mesmo relógio
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Desativa lag smoothing para não acumular atraso em abas inativas
  gsap.ticker.lagSmoothing(0);

  // Remove preloader com fade
  preloaderEl.style.transition = 'opacity 0.6s ease';
  preloaderEl.style.opacity = '0';
  setTimeout(() => {
    preloaderEl.remove();
    document.body.style.overflow = '';
  }, 650);
}

bootstrap();
```

---

### Task 6: Canvas + ScrollTrigger scrub (`scroll-sequence.js`)

**Files:**
- Create: `scroll-sequence.js`

- [ ] **Step 1: Criar scroll-sequence.js**

```js
// scroll-sequence.js
export function initScrollSequence(bitmaps) {
  const canvas  = document.getElementById('hero-canvas');
  const ctx     = canvas.getContext('2d');
  const section = document.getElementById('hero-section');

  // Dimensiona o canvas ao tamanho real da viewport
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentFrame);
  }

  let currentFrame = 0;

  function drawFrame(index) {
    const bmp = bitmaps[Math.max(0, Math.min(index, bitmaps.length - 1))];
    if (!bmp) return;

    // Cover: preenche o canvas mantendo proporção (como object-fit: cover)
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = bmp.width;
    const ih = bmp.height;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(bmp, sx, sy, sw, sh);
  }

  resize();
  window.addEventListener('resize', resize);

  // Objeto proxy para GSAP animar a propriedade `frame`
  const state = { frame: 0 };

  gsap.registerPlugin(ScrollTrigger);

  gsap.to(state, {
    frame: bitmaps.length - 1,
    snap: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,           // interpolação suave: 1.2s de lag atrás do scroll
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
```

---

### Task 7: Teste manual e validação final

**Files:** nenhum novo arquivo

- [ ] **Step 1: Abrir index.html num servidor local**

Não abra como `file://` — fetch não funciona localmente sem servidor. Use:
```powershell
# Python (normalmente disponível)
python -m http.server 8080 --directory "C:\Users\Administrator\Downloads\CodesTestes\velocci-site"
```
Ou instale `live-server` globalmente:
```powershell
npm install -g live-server
live-server "C:\Users\Administrator\Downloads\CodesTestes\velocci-site" --port=8080
```
Acesse: `http://localhost:8080`

- [ ] **Step 2: Verificar preloader**

- Preloader deve aparecer imediatamente ao abrir a página
- Barra de progresso deve avançar de 0% a 100%
- Labels devem mudar ("Carregando Engenharia..." → "Calibrando V12..." → ...)
- Ao terminar, preloader some com fade

- [ ] **Step 3: Verificar scroll sequence**

- O canvas deve preencher a tela inteira (sem bordas pretas)
- Ao rolar para baixo, os frames devem avançar suavemente
- Ao rolar para cima, os frames devem voltar
- O scroll deve ter inércia suave (Lenis ativo)
- A animação não deve travar nem pular (scrub: 1.2 cria lag suave)

- [ ] **Step 4: Verificar mobile**

No DevTools, ative a simulação de mobile (largura < 768px) e recarregue. Verifique no console:
```js
// Cole no console para conferir quantos frames foram carregados
// (deve ser ~120 em mobile, ~240 em desktop)
```
O preloader deve ser visivelmente mais rápido em mobile.

- [ ] **Step 5: Verificar demais seções**

Role até o fim da página e confira: Specs, Gallery, CTA e Footer visíveis e estilizados corretamente.
