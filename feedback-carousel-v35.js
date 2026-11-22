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