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
        if(frame) frame.style.setProperty("--v33-drift",drift.toFixed(1)+"px");
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