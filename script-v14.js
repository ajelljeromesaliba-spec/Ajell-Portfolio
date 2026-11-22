(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const clamp = (v, min=0, max=1) => Math.min(max, Math.max(min, v));
  const ease = (t) => { const x=clamp(t); return x*x*(3-2*x); };
  const lerp = (a,b,t) => a+(b-a)*t;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const mobile = matchMedia('(max-width: 690px)');
  const motionToggle = $('#motionToggle');
  const motionLabel = $('#motionLabel');
  let motion = (coarse.matches || mobile.matches) ? 'lite' : 'full';
  try { const saved=localStorage.getItem('ajell-portfolio-motion'); if(saved==='full'||saved==='lite') motion=saved; } catch (_) {}
  function setMotion(value, save=false){
    motion = value==='full' ? 'full' : 'lite';
    document.documentElement.dataset.motion=motion;
    if(motionLabel) motionLabel.textContent=motion.toUpperCase();
    if(motionToggle){ motionToggle.setAttribute('aria-pressed',String(motion==='lite')); motionToggle.setAttribute('aria-label',`Motion: ${motion}. Switch to ${motion==='lite'?'full':'lite'} effects`); }
    if(save){ try {localStorage.setItem('ajell-portfolio-motion',motion);} catch (_){} }
    schedule();
  }
  motionToggle?.addEventListener('click',()=>setMotion(motion==='full'?'lite':'full',true));

  const menuButton=$('#menuToggle'), menu=$('#mobileMenu');
  function closeMenu(){ if(!menu||!menuButton)return;menu.classList.remove('active');menu.setAttribute('inert','');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open'); }
  function openMenu(){if(!menu||!menuButton)return;menu.classList.add('active');menu.removeAttribute('inert');menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label','Close navigation');document.body.classList.add('menu-open');}
  menuButton?.addEventListener('click',()=>menu?.classList.contains('active')?closeMenu():openMenu());
  $$('[href^="#"]',menu||document).forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  const copyButton=$('#copyEmail'),copyFeedback=$('#copyFeedback');
  copyButton?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('ajellsaliba@gmail.com');if(copyFeedback)copyFeedback.textContent='EMAIL COPIED';}catch(_){if(copyFeedback)copyFeedback.textContent='ajellsaliba@gmail.com';}});

  const reveals=$$('[data-reveal]');
  if(!reduced.matches && 'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}
    },{threshold:.06,rootMargin:'0px 0px -6% 0px'});
    reveals.forEach(el=>observer.observe(el));
  } else reveals.forEach(el=>el.classList.add('is-visible'));

  const hero=$('.hero-track'),story=$('.story-track'),noir=$('.noir-track');
  const heroImage=$('.hero-image img'),heroMain=$('.hero-main'),heroFocus=$('.hero-focus-frame');
  const storyImage=$('.story-image img'),storyPlate=$('.story-image'),storySculpture=$('.story-sculpture'),storyLight=$('.story-light'),storySteps=$$('[data-story-step]'),storyCounter=$('#storyCounter'),storyPips=$$('[data-story-nav]');
  const noirImage=$('.noir-image img'),noirCurtain=$('.noir-curtain'),noirContent=$('.noir-content');
  const pageProgress=$('#pageProgress'),manifestoArt=$('.manifesto-sculpture'),manifesto=$('.manifesto');
  let metrics={},height=window.innerHeight,lastStage=-1,queued=false,scrollY=window.scrollY||0;
  const rectOf=(el)=>{if(!el)return null;const box=el.getBoundingClientRect();return {top:box.top+scrollY,end:box.top+scrollY+el.offsetHeight,height:el.offsetHeight};};
  function measure(){height=window.innerHeight;metrics={hero:rectOf(hero),story:rectOf(story),noir:rectOf(noir),manifesto:rectOf(manifesto),max:Math.max(1,document.documentElement.scrollHeight-height)};}
  const visible=(m)=>m && scrollY+height>=m.top-160 && scrollY<=m.end+160;
  const progress=(m)=>m?clamp((scrollY-m.top)/Math.max(1,m.height-height)):0;
  function setStageIndex(i){if(i===lastStage)return;lastStage=i;storySteps.forEach((el,j)=>el.classList.toggle('active',j===i));storyPips.forEach((b,j)=>{b.classList.toggle('active',j===i);if(j===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});if(storyCounter)storyCounter.textContent=String(i+1).padStart(2,'0')+' — 03';}
  // Use one animation frame for the entire page. Recalculate only on resize/load.
  function paint(){queued=false;scrollY=window.scrollY||0;const isReduced=reduced.matches;const lite=motion==='lite';
    if(pageProgress){pageProgress.style.transform=`scaleX(${clamp(scrollY/(metrics.max||1)).toFixed(4)})`;}
    if(isReduced)return;
    if(visible(metrics.hero)){
      const p=progress(metrics.hero),fade=1-ease((p-.39)/.34);
      if(heroImage)heroImage.style.transform=`translate3d(0,${(-p*(lite?9:19)).toFixed(1)}px,0) scale(${(1.07+p*(lite?.065:.18)).toFixed(3)})`;
      if(heroMain){heroMain.style.transform=lite?'none':`translate3d(0,${(-p*34).toFixed(1)}px,0) scale(${(1-.018*p).toFixed(3)})`;heroMain.style.opacity=fade.toFixed(3);heroMain.style.pointerEvents=fade<.15?'none':'';}
      if(heroFocus&&!lite){heroFocus.style.transform=`rotateY(${(-5+p*15).toFixed(1)}deg) translate3d(0,${(p*18).toFixed(1)}px,0)`;}
    }
    if(visible(metrics.story)){
      const p=progress(metrics.story);const s=Math.min(2,Math.floor(Math.min(.99999,p)*3));setStageIndex(s);
      storySteps.forEach((el,i)=>{
        const start=i/3,stop=(i+1)/3;
        const inAlpha=i===0?1:ease((p-(start-.045))/.075);
        const outAlpha=i===2?1:1-ease((p-(stop-.045))/.075);
        const alpha=clamp(inAlpha*outAlpha);
        el.style.opacity=alpha.toFixed(3);
        const shift=(1-inAlpha)*55 - (1-outAlpha)*32;
        el.style.transform=mobile.matches?`translate3d(0,${shift.toFixed(1)}px,0) scale(${(.985+alpha*.015).toFixed(3)})`:`translate3d(0,calc(-43% + ${shift.toFixed(1)}px),0) scale(${(.975+alpha*.025).toFixed(3)})`;
      });
      if(storyPlate){
        if(lite || mobile.matches) storyPlate.style.transform='none';
        else storyPlate.style.transform=`perspective(1400px) rotateY(${(-10+p*18).toFixed(1)}deg) rotateX(${(3-4*p).toFixed(1)}deg) translate3d(0,${(19-35*p).toFixed(1)}px,0)`;
      }
      if(storySculpture && !lite){
        storySculpture.style.transform=`rotateY(${(-25+p*68).toFixed(1)}deg) rotateX(${(11+p*25).toFixed(1)}deg) scale(${(.88+p*.21).toFixed(3)})`;
      }
      if(storyLight && !lite && !mobile.matches)storyLight.style.transform=`translate3d(${(p*8).toFixed(1)}%,${(-p*5).toFixed(1)}%,0)`;
      if(storyImage) storyImage.style.transform=lite?'none':`translate3d(0,${(-18+32*p).toFixed(1)}px,0) scale(${(1.07-.06*p).toFixed(3)})`;
    }
    if(!isReduced && !lite && !mobile.matches && visible(metrics.manifesto) && manifestoArt){
      const pos=clamp((scrollY+height-metrics.manifesto.top)/(metrics.manifesto.height+height));
      manifestoArt.style.transform=`rotateX(${(10+pos*18).toFixed(1)}deg) rotateY(${(-34+pos*48).toFixed(1)}deg) rotateZ(${(-8+pos*16).toFixed(1)}deg)`;
    }
    if(visible(metrics.noir)){
      const p=progress(metrics.noir),reveal=ease((p-.05)/.74);
      if(noirCurtain)noirCurtain.style.transform=`translate3d(${(reveal*102).toFixed(2)}%,0,0)`;
      if(noirImage && !lite)noirImage.style.transform=`translate3d(0,${(-25+45*p).toFixed(1)}px,0) scale(${(1.18-.10*p).toFixed(3)})`;
      if(noirContent)noirContent.style.opacity=(.28+.72*ease((p-.16)/.39)).toFixed(3);
    }
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(paint);}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',()=>{scrollY=window.scrollY||0;measure();schedule();},{passive:true});
  addEventListener('load',()=>{scrollY=window.scrollY||0;measure();schedule();},{once:true});
  if(document.fonts?.ready)document.fonts.ready.then(()=>{scrollY=window.scrollY||0;measure();schedule()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){measure();schedule();}});
  storyPips.forEach(b=>b.addEventListener('click',()=>{const stage=Number(b.dataset.storyNav),m=metrics.story;if(!m)return;const offset=(stage+.5)/3*Math.max(0,m.height-height);window.scrollTo({top:m.top+offset,behavior:reduced.matches?'auto':'smooth'});}));
  // Deliberate pointer depth only on fine-pointer desktop devices, without continuously animating.
  if(!coarse.matches){
    $$('.work-visual').forEach(panel=>{
      panel.addEventListener('pointermove',e=>{
        if(motion!=='full'||reduced.matches)return;
        const r=panel.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        panel.style.transform=`perspective(1100px) rotateY(${(x*5).toFixed(1)}deg) rotateX(${(-y*4).toFixed(1)}deg)`;
      },{passive:true});
      panel.addEventListener('pointerleave',()=>{panel.style.transform='';},{passive:true});
    });
  }
  reduced.addEventListener?.('change',()=>{measure();schedule();});
  measure();setMotion(motion);schedule();
})();