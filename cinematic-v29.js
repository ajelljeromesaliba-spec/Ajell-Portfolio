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
    ['selected-work', 'Projects'], ['case-studies', 'Case studies'],
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

  // Perspective rings are generated only as decoration: no extra network requests or WebGL.
  const stage = document.createElement('div');
  stage.className = 'v29-hero-stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.innerHTML = '<div class="v29-stage-grid"></div>' +
    '<div class="v29-orbit v29-orbit-a"></div>' +
    '<div class="v29-orbit v29-orbit-b"></div>' +
    '<div class="v29-orbit v29-orbit-c"></div>' +
    '<div class="v29-planet"><span></span></div>' +
    '<div class="v29-marker v29-marker-a"></div>' +
    '<div class="v29-marker v29-marker-b"></div>';
  hero.appendChild(stage);

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
  readout.innerHTML = '<span class="v29-readout-index">01</span><span class="v29-readout-divider"></span><span class="v29-readout-label">INTRODUCTION</span>';
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
    }
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
