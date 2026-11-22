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
  const pageProgress=$('#pageProgress'),manifestoArt=$('.manifesto-sculpture'),manifesto=$('.manifesto'),threadStepNumber=$('#threadStepNumber'),threadStepWord=$('#threadStepWord');
  let lastThreadStage=-1;
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
    // This cinematic object rotates on EVERY device including Lite/mobile.
    // Only one parent transform updates per scroll frame; child orbits use GPU CSS transforms.
    if(visible(metrics.manifesto) && manifestoArt){
      const m=metrics.manifesto;
      const pos=clamp((scrollY+height-m.top)/(m.height+height));
      const strength=lite ? .50 : 1;
      const xx=(15+Math.sin(pos*Math.PI)*13*strength);
      const yy=(-25+pos*50*strength);
      const zz=(-9+pos*18*strength);
      manifestoArt.style.transform=`translate3d(-50%,-50%,0) rotateX(${xx.toFixed(1)}deg) rotateY(${yy.toFixed(1)}deg) rotateZ(${zz.toFixed(1)}deg)`;
      const stage=pos<.38?0:pos<.64?1:2;
      if(lastThreadStage!==stage){
        lastThreadStage=stage;
        if(threadStepNumber)threadStepNumber.textContent=`0${stage+1} / 03`;
        if(threadStepWord)threadStepWord.textContent=['LISTEN','TRACE','VERIFY'][stage];
      }
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
  // Pause CSS orbit animations when the sculpture is offscreen to save battery.
  if(manifesto && 'IntersectionObserver' in window){
    const threadObserver=new IntersectionObserver(entries=>{
      for(const entry of entries){entry.target.classList.toggle('thread-active',entry.isIntersecting && !reduced.matches);}
    },{threshold:0.04});
    threadObserver.observe(manifesto);
  }else if(manifesto && !reduced.matches){manifesto.classList.add('thread-active');}
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


/* V16 original code-rain and interactive cyber art. No libraries, no network calls. */
(() => {
  'use strict';
  const root=document.documentElement;
  const globalCanvas=document.getElementById('matrixRainCanvas');
  const panelCanvas=document.getElementById('threadRainCanvas');
  const scene=document.getElementById('threadCinema');
  const word=document.getElementById('threadVisualWord');
  const number=document.getElementById('threadStepNumber');
  const caption=document.getElementById('threadStepDescription');
  const buttons=Array.from(document.querySelectorAll('[data-thread-stage]'));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const stageWords=['LISTEN','TRACE','VERIFY'];
  const stageCaptions=[
    "Listen before trying to fix what you don't understand.",
    'Trace the signal through forms, data, APIs and handoffs.',
    'Verify the result and leave a clear record for the next person.'
  ];
  const state={stage:0, mode:'lite', visible:true, width:0, height:0, last:0, frame:0, observer:null};
  function setStage(next){
    const index=Math.max(0,Math.min(2,Number(next)||0));state.stage=index;
    if(scene)scene.dataset.stage=String(index);
    if(word)word.textContent=stageWords[index];
    if(number)number.textContent=`0${index+1} / 03`;
    if(caption)caption.textContent=stageCaptions[index];
    buttons.forEach((b,i)=>{const selected=i===index;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
  }
  buttons.forEach(b=>b.addEventListener('click',()=>setStage(b.dataset.threadStage)));
  setStage(0); // 01 is the real initial state; all stages remain visible and selectable.

  const glyphs='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ[]{}<>/\\:;+-=_*';
  const layers=[globalCanvas,panelCanvas].filter(Boolean).map((canvas,i)=>({canvas,ctx:canvas.getContext('2d',{alpha:true}),panel:canvas===panelCanvas,cols:[],w:0,h:0,font:15,gap:18})).filter(l=>l.ctx);
  if(!layers.length)return;
  const coarse=matchMedia('(pointer: coarse)').matches;
  function readMode(){return root.dataset.motion==='full'?'full':'lite';}
  function setupLayer(layer){
    const rect=layer.canvas.getBoundingClientRect();
    const w=Math.max(1,Math.round(rect.width)), h=Math.max(1,Math.round(rect.height));
    const lite=state.mode==='lite';
    // Render at CSS-pixel font sizes with a modest retina backing store.
    // A 1x canvas was making large characters look soft on high-DPI iPhones.
    const dpr=Math.min(window.devicePixelRatio||1,coarse?1.5:1.6);
    layer.canvas.width=Math.round(w*dpr);layer.canvas.height=Math.round(h*dpr);
    layer.ctx.setTransform(dpr,0,0,dpr,0,0);
    layer.w=w;layer.h=h;
    // Small, evenly proportioned monospace glyphs, with ~2x the phone columns.
    layer.font=layer.panel?(lite?10:9):(lite?10:9);
    layer.line=layer.font+2;
    layer.gap=layer.panel?(lite?11:9):(lite?12:10);
    const max=layer.panel?(lite?52:92):(lite?90:148);
    const n=Math.min(max,Math.max(10,Math.ceil(w/layer.gap)));
    layer.cols=Array.from({length:n},(_,i)=>({
      x:(i+.5)*w/n,phase:Math.random()*(h+layer.line*12),
      speed:(layer.panel?37:31)+Math.random()*(layer.panel?97:81),
      seed:Math.floor(Math.random()*glyphs.length),
      shade:.55+Math.random()*.45,
      trail:layer.panel?(lite?10:14):(lite?8:12)
    }));
  }
  function setup(){state.mode=readMode();layers.forEach(setupLayer);state.last=0;}
  let activePanel=true;
  if(scene&&'IntersectionObserver' in window){
    const obs=new IntersectionObserver(entries=>{activePanel=entries[0]?.isIntersecting??false;},{threshold:0});obs.observe(scene);
  }
  function renderLayer(layer,elapsed,delta){
    const ctx=layer.ctx,w=layer.w,h=layer.h, panel=layer.panel, lite=state.mode==='lite';
    ctx.clearRect(0,0,w,h);
    ctx.textAlign='center';ctx.textBaseline='top';ctx.font=`${layer.font}px "SFMono-Regular", ui-monospace, Menlo, Consolas, monospace`;
    const advance=Math.min(.075,Math.max(0,delta/1000));
    for(let c=0;c<layer.cols.length;c++){
      const col=layer.cols[c];col.phase=(col.phase+col.speed*advance)%(h+col.trail*layer.line+80);
      const head=col.phase-col.trail*layer.line;
      for(let k=0;k<col.trail;k++){
        const y=head-k*layer.line;
        if(y<0||y>h-layer.font)continue;
        const intensity=Math.pow(1-k/col.trail,1.1);
        const alpha=((panel?.07:.05)+intensity*(panel?(lite?.66:.8):(lite?.43:.6)))*col.shade;
        const glyph=glyphs[(col.seed+Math.floor(elapsed/(160+(c%5)*32))+k*7+c*3)%glyphs.length];
        ctx.fillStyle=k===0?`rgba(207,255,223,${Math.min(1,alpha+.22).toFixed(3)})`: `rgba(${panel?121:107},${panel?255:246},${panel?177:160},${alpha.toFixed(3)})`;
        ctx.fillText(glyph,col.x,y);
      }
    }
  }
  let animationId=0;
  function frame(time){
    if(document.hidden||reduced.matches){animationId=0;return;}
    animationId=requestAnimationFrame(frame);
    const fps=state.mode==='full'?26:14;
    if(state.last&&time-state.last<1000/fps)return;
    const delta=state.last?time-state.last:16;state.last=time;
    for(const layer of layers){if(layer.panel&&!activePanel)continue;renderLayer(layer,time,delta);}
  }
  function start(){
    if(reduced.matches){layers.forEach(l=>l.ctx.clearRect(0,0,l.w,l.h));if(animationId)cancelAnimationFrame(animationId);animationId=0;return;}
    if(!animationId){state.last=0;animationId=requestAnimationFrame(frame);}
  }
  function stop(){if(animationId)cancelAnimationFrame(animationId);animationId=0;}
  const motionObserver=new MutationObserver(()=>{const next=readMode();if(next!==state.mode){setup();start();}});
  motionObserver.observe(root,{attributes:true,attributeFilter:['data-motion']});
  let resizePending=0;
  addEventListener('resize',()=>{if(resizePending)cancelAnimationFrame(resizePending);resizePending=requestAnimationFrame(()=>{setup();resizePending=0;});},{passive:true});
  addEventListener('visibilitychange',()=>document.hidden?stop():start());
  reduced.addEventListener?.('change',()=>{setup();start();});
  setup();start();
})();