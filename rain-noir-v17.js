/* V17: Cinematic rainfall over the existing black-and-white portrait.
   Separate, frame-capped canvas; only animates while this scene is visible. */
(() => {
  'use strict';
  const canvas = document.getElementById('noirRainCanvas');
  const scene = document.querySelector('.noir-track');
  const stage = scene?.querySelector('.noir-sticky');
  if (!canvas || !scene || !stage) return;
  const ctx = canvas.getContext('2d', {alpha: true, desynchronized: true});
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const small = window.matchMedia('(max-width: 690px)');
  const rand = (min, max) => min + Math.random() * (max - min);
  let width = 1, height = 1, pixelRatio = 1;
  let drops = [], glass = [], running = false, visible = false;
  let requestId = 0, lastTime = 0, lastDraw = 0;
  let mode = 'lite';

  function readMode() {
    return document.documentElement.dataset.motion === 'full' ? 'full' : 'lite';
  }
  function makeDrop(initial = false) {
    const depth = Math.random();
    return {
      x: rand(-20, width + 20),
      y: initial ? rand(-height * .2, height + 45) : rand(-height * .35, -15),
      depth,
      length: rand(9, 24) + 36 * depth,
      speed: rand(390, 620) + 580 * depth,
      slant: rand(-.15, .23) + depth * .18,
      alpha: rand(.09, .18) + depth * .33,
      line: depth > .82 ? 1.55 : (depth > .55 ? .95 : .55)
    };
  }
  function makeGlassDrop(initial = false) {
    const length = rand(13, 50);
    return {
      x: rand(8, width - 8),
      y: initial ? rand(0, height) : -rand(30, 120),
      size: rand(.85, 2.6), length,
      speed: rand(26, 100), drift: rand(-.065, .085),
      opacity: rand(.16, .42), wobble: rand(0, Math.PI * 2)
    };
  }
  function seed() {
    const count = Math.min(mode === 'full' ? 330 : 155,
      Math.max(mode === 'full' ? 90 : 52,
        Math.round(width * (mode === 'full' ? .42 : .28))));
    const glassCount = Math.min(mode === 'full' ? 48 : 25,
      Math.max(12, Math.round(width * (mode === 'full' ? .045 : .030))));
    drops = Array.from({length: count}, () => makeDrop(true));
    glass = Array.from({length: glassCount}, () => makeGlassDrop(true));
  }
  function sizeCanvas() {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === width && h === height && drops.length) return;
    width = w; height = h;
    pixelRatio = Math.min(window.devicePixelRatio || 1, mode === 'full' ? 1.6 : 1.25);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    seed();
    draw(0);
  }
  function draw(delta) {
    ctx.clearRect(0, 0, width, height);
    const dt = delta / 1000;
    const wind = small.matches ? 0.12 : 0.20;
    ctx.lineCap = 'round';

    // Distant rainfall: individual moving streaks, depth-controlled speed and length.
    for (let i = 0; i < drops.length; i++) {
      let d = drops[i];
      d.y += d.speed * dt;
      d.x += (d.speed * .00016 + wind) * delta * .012;
      if (d.y > height + d.length || d.x > width + 70) {
        d = drops[i] = makeDrop(false);
      }
      const dx = d.length * d.slant;
      ctx.strokeStyle = `rgba(211,227,236,${d.alpha.toFixed(3)})`;
      ctx.lineWidth = d.line;
      ctx.beginPath(); ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + dx, d.y + d.length); ctx.stroke();
      if (d.depth > .87) {
        ctx.fillStyle = `rgba(242,250,255,${(d.alpha * .85).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(d.x + dx, d.y + d.length, d.line * .67, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Near-lens water. Slower, thicker trails behave like drops sliding down glass.
    for (let i = 0; i < glass.length; i++) {
      let d = glass[i];
      d.y += d.speed * dt;
      d.x += d.drift * delta * .035;
      if (d.y > height + d.length + 8) d = glass[i] = makeGlassDrop(false);
      const sway = Math.sin(d.y * .022 + d.wobble) * d.size * .75;
      const x = d.x + sway;
      ctx.strokeStyle = `rgba(193,214,222,${(d.opacity * .52).toFixed(3)})`;
      ctx.lineWidth = Math.max(.55, d.size * .53);
      ctx.beginPath();
      ctx.moveTo(x - 1.2, d.y - d.length);
      ctx.quadraticCurveTo(x + d.size, d.y - d.length * .4, x, d.y - d.size);
      ctx.stroke();
      ctx.fillStyle = `rgba(229,243,247,${(d.opacity * .75).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(x, d.y, d.size * .65, d.size * 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Small highlight on the bead, avoids expensive full-canvas blur.
      ctx.fillStyle = `rgba(255,255,255,${(d.opacity * .55).toFixed(3)})`;
      ctx.fillRect(x - d.size * .33, d.y - d.size * .6, Math.max(.5, d.size * .22), Math.max(1, d.size * .5));
    }
  }
  function frame(now) {
    if (!running) return;
    requestId = window.requestAnimationFrame(frame);
    const targetGap = mode === 'full' ? 1000 / 36 : 1000 / 22;
    if (now - lastDraw < targetGap) return;
    const delta = lastTime ? Math.min(55, now - lastTime) : 16;
    lastTime = now; lastDraw = now;
    draw(delta);
  }
  function stop() {
    running = false;
    if (requestId) window.cancelAnimationFrame(requestId);
    requestId = 0; lastTime = 0; lastDraw = 0;
  }
  function sync() {
    const nextMode = readMode();
    const changed = mode !== nextMode;
    mode = nextMode;
    if (changed) {
      stop();
      // Re-seed for different density when Motion switches between Full and Lite.
      drops = [];
    }
    if (reduced.matches || document.hidden || !visible) {
      stop();
      if (reduced.matches) draw(0);
      return;
    }
    sizeCanvas();
    if (!drops.length) seed();
    if (!running) {running = true; requestId = window.requestAnimationFrame(frame);}
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    }, {rootMargin: '100px 0px 100px 0px', threshold: 0});
    observer.observe(stage);
  } else visible = true;
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(() => {sizeCanvas(); sync();});
    resize.observe(stage);
  } else window.addEventListener('resize', () => {sizeCanvas(); sync();}, {passive:true});
  const motionObserver = new MutationObserver(sync);
  motionObserver.observe(document.documentElement, {attributes:true, attributeFilter:['data-motion']});
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener?.('change', sync);
  mode = readMode();
  sizeCanvas();
  sync();
})();