
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
