
(() => {
  "use strict";
  const toggle=document.getElementById("menuToggle");
  const menu=document.getElementById("mobileMenu");
  const closeMenu=()=>{
    if(!menu||!toggle)return;
    menu.hidden=true;
    toggle.setAttribute("aria-expanded","false");
    toggle.setAttribute("aria-label","Open navigation");
    document.body.classList.remove("menu-open");
  };
  const openMenu=()=>{
    if(!menu||!toggle)return;
    menu.hidden=false;
    toggle.setAttribute("aria-expanded","true");
    toggle.setAttribute("aria-label","Close navigation");
    document.body.classList.add("menu-open");
  };
  toggle?.addEventListener("click",()=>menu?.hidden?openMenu():closeMenu());
  menu?.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu();});
  const media=matchMedia("(max-width: 800px)");
  media.addEventListener?.("change",()=>{if(!media.matches)closeMenu();});
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const reveal=document.querySelectorAll(".reveal");
  if(reduced.matches||!("IntersectionObserver" in window)){
    reveal.forEach(el=>el.classList.add("is-visible"));
  }else{
    const observer=new IntersectionObserver(entries=>{
      for(const e of entries){
        if(!e.isIntersecting)continue;
        e.target.classList.add("is-visible");
        observer.unobserve(e.target);
      }
    },{threshold:0.04,rootMargin:"0px 0px -20px 0px"});
    reveal.forEach(el=>observer.observe(el));
  }
  const copy=document.getElementById("copyEmail");
  const feedback=document.getElementById("copyFeedback");
  copy?.addEventListener("click",async()=>{
    try{
      await navigator.clipboard.writeText("ajellsaliba@gmail.com");
      if(feedback)feedback.textContent="Email copied.";
    }catch(_){
      if(feedback)feedback.textContent="ajellsaliba@gmail.com";
    }
  });
  // On small screens, keep testimonial reading simple and scroll-driven.
})();

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

;
/* V29: cinematic depth and scroll navigation for the live, professional-first layout.
   Zero dependencies. Motion is scroll-driven, paused when idle, and optional. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touchLayout = matchMedia('(max-width: 820px)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
  const chapters = [
    ['home', 'Introduction'], ['expertise', 'Expertise'],
    ['systems-bridge', 'Technical delivery'], ['selected-work', 'Projects'], ['case-studies', 'Case studies'],
    ['rain-scene', 'Perspective'], ['experience', 'Experience'],
    ['voices', 'Recommendations'], ['about', 'About'], ['contact', 'Contact']
  ].map(([id, label]) => ({ id, label, el: document.getElementById(id) }))
   .filter(chapter => chapter.el);
  const hero = document.querySelector('.hero');
  const systems = document.querySelector('.systems-photo-sequence');
  const noir = document.querySelector('.noir-track');
  const portrait = document.querySelector('.experience-portrait');
  const featured = document.querySelector('.project-art');
  if (!hero || !chapters.length) return;
  root.classList.add('v29-ready');

  // The diagram is the portfolio's actual delivery loop. Each node navigates to evidence.
  // Slow orbital signals keep it alive at rest; chapter progress keeps it tied to the page.
  const stage = document.createElement('nav');
  stage.className = 'v29-hero-stage v31-workflow';
  stage.setAttribute('aria-label', 'Explore my working process');
  stage.dataset.phase = '0';
  stage.innerHTML = `
    <div class="v31-workflow-halo" aria-hidden="true"></div>
    <div class="v31-workflow-orbit v31-workflow-orbit-a" aria-hidden="true"><i></i></div>
    <div class="v31-workflow-orbit v31-workflow-orbit-b" aria-hidden="true"><i></i></div>
    <div class="v31-workflow-orbit v31-workflow-orbit-c" aria-hidden="true"></div>
    <div class="v31-workflow-core" aria-hidden="true">
      <small>HOW I WORK</small><strong>ISSUE<br>TO FIX.</strong>
      <span class="v31-core-status">01 / PEOPLE</span>
    </div>
    <a class="v31-flow-node" data-phase="0" href="#expertise"><small>01</small><strong>PEOPLE</strong><em>Understand</em></a>
    <a class="v31-flow-node" data-phase="1" href="#selected-work"><small>02</small><strong>SYSTEMS</strong><em>Build</em></a>
    <a class="v31-flow-node" data-phase="2" href="#case-studies"><small>03</small><strong>QA</strong><em>Verify</em></a>
    <a class="v31-flow-node" data-phase="3" href="#experience"><small>04</small><strong>DELIVERY</strong><em>Follow through</em></a>
    <span class="v31-flow-footnote" aria-hidden="true">FROM FIRST CONTACT TO WORKING DELIVERY</span>
  `;
  hero.appendChild(stage);

  const phaseNames = ['PEOPLE', 'SYSTEMS', 'QA', 'DELIVERY'];
  const chapterPhases = {
    home: 0, expertise: 0, 'systems-bridge': 1, 'selected-work': 1,
    'case-studies': 2, 'rain-scene': 2, experience: 3,
    voices: 3, about: 0, contact: 3
  };
  const phaseNodes = Array.from(stage.querySelectorAll('.v31-flow-node'));
  const coreStatus = stage.querySelector('.v31-core-status');
  let currentPhase = -1;
  function setPhase(phase) {
    if (currentPhase === phase) return;
    currentPhase = phase;
    stage.dataset.phase = String(phase);
    root.dataset.workflowPhase = String(phase);
    phaseNodes.forEach((node, index) => node.classList.toggle('is-active', index === phase));
    if (coreStatus) coreStatus.textContent = String(phase + 1).padStart(2, '0') + ' / ' + phaseNames[phase];
  }
  let idlePhase = 0;
  let heroIsVisible = true;
  const heroObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => { heroIsVisible = entries[0]?.isIntersecting || false; }, { threshold: .08 })
    : null;
  heroObserver?.observe(hero);
  const idleLoop = window.setInterval(() => {
    if (!heroIsVisible || document.hidden || reduced.matches) return;
    // Let scroll control the process once the visitor moves into the page.
    if (window.scrollY > 80) return;
    idlePhase = (idlePhase + 1) % phaseNames.length;
    setPhase(idlePhase);
  }, 2800);
  stage.addEventListener('focusin', () => window.clearInterval(idleLoop), { once: true });

  // Quiet scroll timeline, with real anchor links and a readable chapter label.
  const progress = document.createElement('div');
  progress.className = 'v29-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.appendChild(progress);
  const rail = document.createElement('nav');
  rail.className = 'v29-rail';
  rail.setAttribute('aria-label', 'Portfolio sections');
  const readout = document.createElement('div');
  readout.className = 'v29-readout';
  readout.setAttribute('aria-hidden', 'true');
  readout.innerHTML = '<span class="v29-readout-index">01</span><span class="v29-readout-divider"></span><span class="v29-readout-label">INTRODUCTION</span><span class="v31-readout-phase">PEOPLE</span>';
  const dots = chapters.map((chapter, i) => {
    const link = document.createElement('a');
    link.href = '#' + chapter.id;
    link.className = 'v29-rail-link';
    link.setAttribute('aria-label', 'Go to ' + chapter.label);
    link.title = chapter.label;
    link.innerHTML = '<span></span>';
    rail.appendChild(link);
    return link;
  });
  document.body.appendChild(rail);
  document.body.appendChild(readout);

  const tiltCards = Array.from(document.querySelectorAll('.expertise-item, .featured-project, .case-row, .voice'));
  for (const card of tiltCards) {
    card.classList.add('v29-tilt');
    const reset = () => {
      card.style.setProperty('--v29-rx', '0deg');
      card.style.setProperty('--v29-ry', '0deg');
    };
    card.addEventListener('pointermove', e => {
      if (!pointer.matches || reduced.matches || touchLayout.matches) return;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = clamp((e.clientX - rect.left) / rect.width);
      const y = clamp((e.clientY - rect.top) / rect.height);
      card.style.setProperty('--v29-rx', ((.5 - y) * 3.4).toFixed(2) + 'deg');
      card.style.setProperty('--v29-ry', ((x - .5) * 5.2).toFixed(2) + 'deg');
    }, { passive: true });
    card.addEventListener('pointerleave', reset, { passive: true });
    card.addEventListener('pointercancel', reset, { passive: true });
  }

  let scheduled = false;
  let activeIndex = -1;
  function paint() {
    scheduled = false;
    const vh = Math.max(1, innerHeight);
    const maxScroll = Math.max(1, root.scrollHeight - vh);
    const scroll = window.scrollY || window.pageYOffset || 0;
    root.style.setProperty('--v29-page-progress', clamp(scroll / maxScroll).toFixed(5));
    let current = 0;
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const rect = chapter.el.getBoundingClientRect();
      if (rect.top <= vh * .46) current = i;
      const passed = clamp((vh * .83 - rect.top) / (vh * .83 + Math.min(rect.height, vh) * .68));
      chapter.el.style.setProperty('--v29-section-progress', passed.toFixed(4));
    }
    if (current !== activeIndex) {
      activeIndex = current;
      dots.forEach((dot, i) => {
        if (i === current) dot.setAttribute('aria-current', 'location');
        else dot.removeAttribute('aria-current');
      });
      const number = readout.querySelector('.v29-readout-index');
      const label = readout.querySelector('.v29-readout-label');
      if (number) number.textContent = String(current + 1).padStart(2, '0');
      if (label) label.textContent = chapters[current].label.toUpperCase();
      // A continuous, named workflow links this hero to the section rail.
      const phase = chapterPhases[chapters[current].id] ?? 0;
      setPhase(phase);
      const phaseReadout = readout.querySelector('.v31-readout-phase');
      if (phaseReadout) phaseReadout.textContent = phaseNames[phase];

    }
    // Once scrolling begins, the diagram follows the story instead of the idle loop.
    if (scroll > 80 && current === 0) setPhase(0);
    if (reduced.matches) return;

    const heroRect = hero.getBoundingClientRect();
    const heroTravel = clamp(-heroRect.top / Math.max(heroRect.height, 1));
    const heroMove = Math.round(clamp(-heroRect.top, 0, heroRect.height) * .14);
    hero.style.setProperty('--v29-hero-shift', heroMove + 'px');
    hero.style.setProperty('--v29-orbit-turn', (heroTravel * 165).toFixed(2) + 'deg');
    hero.style.setProperty('--v29-hero-fade', clamp(1 - heroTravel * 1.8).toFixed(3));

    const depthItems = [systems, noir, portrait, featured].filter(Boolean);
    for (const el of depthItems) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -vh * .2 || rect.top > vh * 1.2) continue;
      const p = clamp((vh - rect.top) / (vh + rect.height));
      const distance = touchLayout.matches ? 14 : 48;
      el.style.setProperty('--v29-depth-shift', ((p - .5) * distance).toFixed(2) + 'px');
      el.style.setProperty('--v29-depth-turn', ((p - .5) * (touchLayout.matches ? 0 : 7)).toFixed(2) + 'deg');
      el.style.setProperty('--v29-depth-p', p.toFixed(4));
    }
  }
  function requestPaint() {
    if (scheduled || document.hidden) return;
    scheduled = true;
    requestAnimationFrame(paint);
  }
  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', requestPaint, { passive: true });
  addEventListener('load', requestPaint, { once: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestPaint(); });
  reduced.addEventListener?.('change', requestPaint);
  touchLayout.addEventListener?.('change', requestPaint);
  document.querySelectorAll('details').forEach(el => el.addEventListener('toggle', requestPaint));
  document.fonts?.ready.then(requestPaint).catch(() => {});
  requestPaint();
})();

;
/* V33 - One continuous, scroll-driven visual score for the entire portfolio.
   No canvas/WebGL dependency, no layout reads during idle, no content hidden. */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) return;
  const desktop = matchMedia("(min-width: 821px)");
  const chapters = [
    "home","expertise","systems-bridge","selected-work","case-studies",
    "rain-scene","experience","voices","about","contact"
  ].map(id => document.getElementById(id)).filter(Boolean);
  if (!chapters.length) return;

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a,b,t) => a + (b-a)*t;
  const ease = t => t*t*(3-2*t);
  const visualItems = [
    ...document.querySelectorAll(".expertise-item, .featured-project, .case-row, .voice, .experience-item, .about-text, .contact-actions")
  ];
  const headings = [
    ...document.querySelectorAll(".section-heading, .section-opening, .contact-layout > div:first-child")
  ];
  const frames = [
    document.querySelector(".systems-photo-image"),
    document.querySelector(".editorial-rain .noir-image"),
    document.querySelector(".experience-portrait")
  ].filter(Boolean);
  const rail = document.querySelector(".v29-rail");
  const hero = document.querySelector(".hero");
  const orbit = document.querySelector(".v31-workflow");
  const projectArt = document.querySelector(".project-art");
  const voiceGrid = document.querySelector(".voices-grid");
  let dirty = false, lastChapter = -1, lastWidth = innerWidth;

  // A single progress conductor also drives the existing right-side chapter rail.
  function render() {
    dirty = false;
    if (document.hidden) return;
    const vh = Math.max(1, innerHeight);
    const scroll = Math.max(0, scrollY || pageYOffset || 0);
    const max = Math.max(1, root.scrollHeight - vh);
    const overall = clamp(scroll/max);
    root.style.setProperty("--v33-page",overall.toFixed(5));
    const atDesktop = desktop.matches;
    let chapterIndex = 0;

    chapters.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= vh*.49) chapterIndex = index;
      if (rect.bottom < -vh*.2 || rect.top > vh*1.35) return;
      const travel = Math.max(1, rect.height + vh*.65);
      const p = clamp((vh*.83-rect.top)/travel);
      const local = clamp((vh-rect.top)/Math.max(1,vh+rect.height));
      section.style.setProperty("--v33-progress",p.toFixed(4));
      section.style.setProperty("--v33-line",ease(p).toFixed(4));
      section.style.setProperty("--v33-spot",Math.round(lerp(18,86,p))+"%");
      section.style.setProperty("--v33-light",(.10 + Math.sin(p*Math.PI)*.32).toFixed(3));
      section.style.setProperty("--v33-local",local.toFixed(4));
    });

    if (chapterIndex !== lastChapter) {
      lastChapter = chapterIndex;
      root.dataset.v33Chapter = chapters[chapterIndex].id;
    }

    if (atDesktop) {
      for (const item of visualItems) {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < -60 || rect.top > vh+100) continue;
        const p = ease(clamp((vh*.94-rect.top)/(vh*.58+Math.min(rect.height, vh)*.68)));
        item.style.setProperty("--v33-entry",p.toFixed(3));
        item.style.setProperty("--v33-rise",(lerp(27,0,p)).toFixed(1)+"px");
        item.style.setProperty("--v33-fade",(lerp(.70,1,p)).toFixed(3));
        item.style.setProperty("--v33-wipe",(lerp(-130,130,p)).toFixed(1)+"%");
      }
      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.bottom < -50 || rect.top > vh+80) continue;
        const p = ease(clamp((vh*.84 - rect.top)/(vh*.55+Math.min(rect.height, vh)*.7)));
        heading.style.setProperty("--v33-heading-shift",(22*(1-p)).toFixed(1)+"px");
        heading.style.setProperty("--v33-heading-opacity",(.74 + .26*p).toFixed(3));
        heading.style.setProperty("--v33-heading-line",p.toFixed(3));
      }

      const systems = document.getElementById("systems-bridge");
      const rain = document.getElementById("rain-scene");
      [systems,rain].forEach((section,i) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.bottom < -vh*.2 || rect.top > vh*1.3) return;
        const p = clamp((vh-rect.top)/(vh+rect.height));
        const drift = lerp(-18,18,ease(p));
        const frame = frames[i];
        if(frame) {
          frame.style.setProperty("--v33-drift",drift.toFixed(1)+"px");
          frame.style.setProperty("--v33-angle",(lerp(i===0?-7:7,i===0?7:-7,ease(p))).toFixed(2)+"deg");
        }
        section.style.setProperty("--v33-scan",(lerp(-16,115,p)).toFixed(1)+"%");
      });
      if (projectArt) {
        const rect = projectArt.getBoundingClientRect();
        if(rect.bottom > -vh*.2 && rect.top < vh*1.2){
          const p = clamp((vh-rect.top)/(vh+rect.height));
          projectArt.style.setProperty("--v33-project-turn",Math.round(lerp(-100,155,p))+"deg");
          projectArt.style.setProperty("--v33-project-bright",(.13+.21*Math.sin(Math.PI*p)).toFixed(3));
          projectArt.style.setProperty("--v33-project-slide",Math.round(lerp(-18,18,p))+"px");
        }
      }
      if (voiceGrid) {
        const rect = voiceGrid.getBoundingClientRect();
        if(rect.bottom > -50 && rect.top < vh+50) {
          const p = clamp((vh*.84-rect.top)/Math.max(1,rect.height+vh*.55));
          voiceGrid.style.setProperty("--v33-review-stage",p.toFixed(4));
        }
      }
    }

    // Scene entry and exit transitions read the SAME page-progress variable.
    // This stays subtle so the writing and actual portfolio work remain legible.
    if (hero && atDesktop) {
      const box = hero.getBoundingClientRect();
      if(box.bottom > -vh*.25 && box.top < vh*1.25) {
        const p = clamp(-box.top/Math.max(1,box.height));
        hero.style.setProperty("--v33-hero-parallax",Math.round(p*26)+"px");
      }
    }
  }

  function schedule() {
    if (dirty || document.hidden) return;
    dirty = true;
    requestAnimationFrame(render);
  }

  // Let the interactive hero workflow respond to the pointer in 3D space.
  // Links stay clickable; parallax is on an independent CSS translate property.
  if (hero && orbit) {
    hero.addEventListener("pointermove", event => {
      if (!desktop.matches || event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      const x = clamp((event.clientX-rect.left)/Math.max(1,rect.width));
      const y = clamp((event.clientY-rect.top)/Math.max(1,rect.height));
      orbit.style.setProperty("--v33-orbit-x",((x-.5)*12).toFixed(1)+"px");
      orbit.style.setProperty("--v33-orbit-y",((y-.5)*9).toFixed(1)+"px");
    },{passive:true});
    hero.addEventListener("pointerleave",() => {
      orbit.style.setProperty("--v33-orbit-x","0px");
      orbit.style.setProperty("--v33-orbit-y","0px");
    },{passive:true});
  }

  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",() => {
    if (lastWidth !== innerWidth) lastWidth = innerWidth;
    schedule();
  },{passive:true});
  window.addEventListener("load",schedule,{once:true});
  document.addEventListener("visibilitychange",() => {if(!document.hidden) schedule();});
  document.querySelectorAll("details").forEach(el => el.addEventListener("toggle",schedule));
  document.fonts?.ready.then(schedule).catch(() => {});
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(schedule);
    for (const el of [document.querySelector("main"), voiceGrid].filter(Boolean)) ro.observe(el);
  }
  root.classList.add("v33-motion");
  schedule();
})();
;
/* V35: left-to-right, infinite testimonial lane.
   Keeps every original card and review intact, clones are excluded from accessibility.
   Pauses on hover, focus, drag, visibility changes, and reduced motion. */
(() => {
  "use strict";
  const root = document.querySelector(".voices-marquee");
  if (!root) return;
  const viewport = root.querySelector(".voices-marquee-viewport");
  const track = root.querySelector(".voices-marquee-track");
  const set = track?.querySelector(".voices-grid");
  const pauseButton = root.querySelector(".voices-toggle");
  const leftButton = root.querySelector(".voices-prev");
  const rightButton = root.querySelector(".voices-next");
  if (!viewport || !track || !set || !pauseButton) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const cloneSet = () => {
    const clone = set.cloneNode(true);
    clone.removeAttribute("id");
    clone.setAttribute("aria-hidden","true");
    clone.inert = true;
    clone.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    return clone;
  };
  const before = cloneSet();
  const after = cloneSet();
  track.prepend(before);
  track.append(after);

  let cycle = 1, offset = -1, lastTime = 0, frame = 0;
  let userPaused = false, hovered = false, focused = false, dragging = false;
  let startX = 0, startOffset = 0, pausedByInteraction = false;
  let visible = false;
  const normalize = () => {
    if (!Number.isFinite(cycle) || cycle <= 1) return;
    // Center lane is the accessible original. Adjacent lanes are visual clones.
    while (offset >= 0) offset -= cycle;
    while (offset < -2*cycle) offset += cycle;
  };
  const paint = () => { normalize(); track.style.transform = "translate3d("+offset.toFixed(2)+"px,0,0)"; };
  const measure = () => {
    const old = cycle;
    cycle = Math.max(1, before.getBoundingClientRect().width +
      (parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 18));
    // Preserve fractional visual position if resized mid-scroll.
    offset = old > 1 ? -cycle + (offset + old) / old * cycle : -cycle;
    paint();
  };
  const pauseState = () => reduced.matches || userPaused || hovered || focused || dragging ||
    !visible || document.hidden || pausedByInteraction;
  const syncButton = () => {
    pauseButton.textContent = reduced.matches ? "Motion off" : (userPaused ? "Play" : "Pause");
    pauseButton.disabled = reduced.matches;
    pauseButton.setAttribute("aria-label",reduced.matches ? "Automatic movement disabled by reduced-motion setting" : (userPaused ? "Play feedback movement" : "Pause feedback movement"));
    pauseButton.setAttribute("aria-pressed",String(userPaused));
  };
  const tick = (now) => {
    frame = 0;
    const dt = lastTime ? Math.min(45,now-lastTime) : 16;
    lastTime = now;
    if (!pauseState()) {
      offset += dt * .038; // 38 pixels per second, clearly moving right.
      paint();
    }
    if (!document.hidden) frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!frame && !document.hidden) { lastTime = 0; frame = requestAnimationFrame(tick); }
  };
  const nudge = dir => {
    if (reduced.matches) {
      const card = set.querySelector(".voice");
      viewport.scrollBy({left: ((card ? card.getBoundingClientRect().width : 360) + 18) * dir,behavior:"auto"});
      return;
    }
    userPaused = true;
    pausedByInteraction = false;
    const card = set.querySelector(".voice");
    const amount = (card ? card.getBoundingClientRect().width : 360) + 18;
    offset += amount * dir;
    paint(); syncButton();
  };

  pauseButton.addEventListener("click",() => {
    if (reduced.matches) {
      // Reduced motion means no autoplay, but manual browsing is still possible.
      userPaused = true;
      syncButton();
      return;
    }
    userPaused = !userPaused; pausedByInteraction = false;
    syncButton(); start();
  });
  leftButton?.addEventListener("click",() => nudge(-1));
  rightButton?.addEventListener("click",() => nudge(1));

  viewport.addEventListener("mouseenter",() => { hovered = true; });
  viewport.addEventListener("mouseleave",() => { hovered = false; });
  viewport.addEventListener("focusin",() => { focused = true; });
  viewport.addEventListener("focusout",e => {
    focused = !!(e.relatedTarget && viewport.contains(e.relatedTarget));
  });
  viewport.addEventListener("pointerdown",e => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true; startX = e.clientX; startOffset = offset;
    viewport.classList.add("is-dragging");
    if (e.pointerType === "mouse") viewport.setPointerCapture?.(e.pointerId);
  });
  viewport.addEventListener("pointermove",e => {
    if (!dragging) return;
    offset = startOffset + e.clientX-startX;
    paint();
  });
  const stopDrag = () => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-dragging");
    pausedByInteraction = true; userPaused = true; syncButton();
  };
  viewport.addEventListener("pointerup",stopDrag);
  viewport.addEventListener("pointercancel",stopDrag);
  viewport.addEventListener("lostpointercapture",stopDrag);
  viewport.addEventListener("keydown",e => {
    if (e.key === "ArrowRight") { e.preventDefault(); nudge(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-1); }
  });

  const observer = "IntersectionObserver" in window ?
    new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting || false; start(); },
      {rootMargin:"160px 0px 160px 0px",threshold:0}) : null;
  if (observer) observer.observe(root); else visible = true;
  const resize = "ResizeObserver" in window ? new ResizeObserver(measure) : null;
  resize?.observe(set);
  window.addEventListener("resize",measure,{passive:true});
  document.addEventListener("visibilitychange",start);
  reduced.addEventListener?.("change",() => { measure(); syncButton(); start(); });
  if (reduced.matches) userPaused = true;
  measure(); syncButton(); start();
})();
;
/* Visual enhancement layer: scroll progress, 3D tilt, pointer depth, scroll parallax. */
(()=>{
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
  const add=(c,p=document.body)=>{const d=document.createElement("div");d.className=c;d.setAttribute("aria-hidden","true");p.appendChild(d);return d};
  const bar=add("fx-progress");
  if(!reduce)add("fx-grain");
  const hero=document.querySelector(".hero");
  if(hero&&!reduce){add("fx-orb a",hero);add("fx-orb b",hero)}
  const cards=document.querySelectorAll(".featured-project,.expertise-item,.voice");
  cards.forEach(el=>{
    if(getComputedStyle(el).position==="static")el.style.position="relative";
    if(el.parentElement&&!el.parentElement.style.perspective)el.parentElement.style.perspective="1100px";
    el.classList.add("fx-tilt");
    if(!fine||reduce)return;
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      el.style.rotate=`${-y} ${x} 0 ${Math.min(Math.hypot(x,y)*9,6)}deg`;
      el.style.setProperty("--mx",(x+.5)*100+"%");el.style.setProperty("--my",(y+.5)*100+"%");
    });
    el.addEventListener("pointerleave",()=>{el.style.rotate="none"});
  });
  const heroPhoto=document.querySelector(".hero-city-photo");
  if(hero&&heroPhoto&&fine&&!reduce){
    hero.addEventListener("pointermove",e=>{
      const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      heroPhoto.style.rotate=`${-y} ${x} 0 ${Math.hypot(x,y)*6}deg`;
      heroPhoto.style.translate=`${x*-14}px ${y*-10}px`;
    });
    hero.addEventListener("pointerleave",()=>{heroPhoto.style.rotate="none";heroPhoto.style.translate="none"});
    heroPhoto.style.transition="rotate .5s ease-out,translate .5s ease-out";
  }
  const layers=[...document.querySelectorAll(".systems-photo-image,.editorial-rain,.noir-track")];
  let tick=false;
  const update=()=>{
    tick=false;
    const h=document.documentElement,max=h.scrollHeight-innerHeight;
    bar.style.setProperty("--p",max>0?Math.min(scrollY/max,1):0);
    if(reduce)return;
    layers.forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight)return;
      el.style.setProperty("--py",((r.top+r.height/2-innerHeight/2)/innerHeight*-28).toFixed(1)+"px");
      const img=el.querySelector("img");
      if(img)img.style.objectPosition=`50% ${50+(r.top+r.height/2-innerHeight/2)/innerHeight*-12}%`;
    });
  };
  addEventListener("scroll",()=>{if(!tick){tick=true;requestAnimationFrame(update)}},{passive:true});
  addEventListener("resize",update);update();
})();
