(()=>{
'use strict';
const root=document.documentElement;
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=window.matchMedia('(pointer: coarse)').matches;
const q=s=>document.querySelector(s),qa=s=>Array.from(document.querySelectorAll(s));
const header=q('.site-header'),line=q('.reading-line'),menu=q('#mobileMenu'),menuToggle=q('#menuToggle'),aura=q('.cursor-aura');
root.classList.add('js-ready');
// Global scroll position, active navigation and a subtle hero/photo parallax.
// One scroll scheduler updates the progress bar, header and three scenes.
// Accessible mobile menu.
function setMenu(open){if(!menu||!menuToggle)return;menu.classList.toggle('open',open);menu.inert=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Close menu':'Open menu');document.body.classList.toggle('menu-open',open);}
menuToggle?.addEventListener('click',()=>setMenu(menuToggle.getAttribute('aria-expanded')!=='true'));
qa('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
// Scroll reveals never hide content on devices with reduced motion or no IO support.
const items=qa('[data-reveal]');
if('IntersectionObserver' in window&&!reduce){const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');obs.unobserve(e.target)}}),{threshold:.09,rootMargin:'0px 0px -12px 0px'});items.forEach((item,i)=>{if(i<3){item.classList.add('is-revealed')}else obs.observe(item)});}else items.forEach(x=>x.classList.add('is-revealed'));
const editorial=q('.editorial-break');if(editorial&&'IntersectionObserver' in window){new IntersectionObserver(entries=>entries.forEach(e=>editorial.classList.toggle('in-view',e.isIntersecting)),{threshold:.2}).observe(editorial)}
// Mouse spotlight and soft magnetic accents (does not interfere with buttons on touch devices).
if(!reduce&&!coarse){
 let auraFrame=0;
 addEventListener('pointermove',e=>{if(!aura||root.dataset.motion==='lite')return;const x=e.clientX,y=e.clientY;
   if(auraFrame)return;
   auraFrame=requestAnimationFrame(()=>{aura.style.transform=`translate3d(${x-256}px,${y-256}px,0)`;aura.style.opacity='.6';auraFrame=0;});
 },{passive:true});
 qa('.magnet').forEach(el=>{el.addEventListener('pointermove',e=>{if(root.dataset.motion==='lite')return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.11}px,${(e.clientY-r.top-r.height/2)*.13}px)`});el.addEventListener('pointerleave',()=>el.style.transform='');});
 qa('.tilt-card').forEach(el=>{let pending=0;el.addEventListener('pointermove',e=>{if(root.dataset.motion==='lite')return;if(pending)return;pending=requestAnimationFrame(()=>{const r=el.getBoundingClientRect(),dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1000px) rotateX(${-dy*3.5}deg) rotateY(${dx*3.5}deg) translateY(-4px)`;pending=0})});el.addEventListener('pointerleave',()=>{if(pending)cancelAnimationFrame(pending);pending=0;el.style.transform=''});});
}
// Work filters update visible grid and accessible pressed states.
const filters=qa('.work-filter'),projects=qa('.project-tile');
filters.forEach(button=>button.addEventListener('click',()=>{const kind=button.dataset.filter;filters.forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});projects.forEach(project=>{project.hidden=kind!=='all'&&project.dataset.category!==kind});}));
// One-at-a-time career accordion, preserving native <details> keyboard semantics.
qa('.career').forEach(c=>c.addEventListener('toggle',()=>{if(c.open)qa('.career').forEach(other=>{if(other!==c)other.open=false})}));
// Clipboard: fall back to manual selection when browser clipboard permission is unavailable.
const email='ajellsaliba@gmail.com',feedback=q('#copyFeedback'),toast=q('#siteToast');let toastHandle;
function notify(text){if(feedback)feedback.textContent=text;if(toast){toast.textContent=text;toast.classList.add('visible');clearTimeout(toastHandle);toastHandle=setTimeout(()=>toast.classList.remove('visible'),2600)}}
q('#copyEmail')?.addEventListener('click',async()=>{try{if(!navigator.clipboard||!window.isSecureContext)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(email);notify('EMAIL COPIED TO CLIPBOARD');}catch(e){notify('COPY THIS EMAIL: '+email)}});
q('#year').textContent=String(new Date().getFullYear());
// In-view nav indication.
const navs=qa('.desktop-nav a');if('IntersectionObserver' in window){const sections=qa('section[id]');const o=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)navs.forEach(a=>a.classList.toggle('is-active',a.hash==='#'+e.target.id))})},{rootMargin:'-20% 0px -64% 0px',threshold:0});sections.forEach(s=>o.observe(s));}

// V6: scroll-controlled scenes, with cached geometry and only transform/opacity updates.
// On touch devices we keep the 3D layers, but turn off expensive shadow/blur and hover work.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,v)=>{let x=clamp((v-a)/(b-a));return x*x*(3-2*x)};
const heroTrack=q('#heroTrack'),heroPhoto=q('.hero-photo img'),heroCopy=q('.hero-copy'),heroBottom=q('.hero-bottom'),heroDepth=q('.hero-depth'),heroDark=q('.hero-darkening'),heroArtObject=q('#heroArtObject'),heroArtWords=q('.hero-art-words');
const depthSection=q('#systems'),depthPhoto=q('.depth-photo img'),depthCards=qa('.depth-plate'),depthButtons=qa('.depth-nav'),depthHead=q('#depthHeading'),depthDesc=q('#depthDescription'),depthCount=q('#depthCounter'),depthReadout=q('#depthReadout'),depthMeter=q('#depthMeterFill'),depthWorld=q('#depthWorld'),depthChecklist=q('#depthChecklist');
const noirTrack=q('#noirTrack'),noirPhoto=q('.editorial-image img'),noirCurtain=q('.noir-curtain'),noirHeading=q('.editorial-content h2'),noirText=q('.editorial-content > p'),noirBeat=q('#noirBeat');
const motionToggle=q('#motionToggle'),motionLabel=q('#motionLabel');
const saveData=Boolean(navigator.connection?.saveData);
let lite=coarse || saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4);
try{const saved=localStorage.getItem('portfolioMotion');if(saved==='lite')lite=true;else if(saved==='full')lite=false;}catch(e){}
if(reduce)lite=true;
function syncMotion(){root.dataset.motion=lite?'lite':'full';if(motionLabel)motionLabel.textContent=lite?'LITE':'FULL';if(motionToggle){motionToggle.setAttribute('aria-pressed',String(!lite));motionToggle.title=lite?'Switch to full 3D motion':'Reduce animation workload';}}
syncMotion();
motionToggle?.addEventListener('click',()=>{lite=!lite;try{localStorage.setItem('portfolioMotion',lite?'lite':'full')}catch(e){}syncMotion();invalidate();schedule();});
const stageCopy=[
 {title:'The website<br><em>starts the journey.</em>',desc:'An enquiry starts with a usable page. I implement responsive layouts, clear calls to action, forms and booking paths.',tasks:['Responsive pages and conversion paths','Forms, calendars and contact destinations','Mobile, desktop and browser checks']},
 {title:'The lead finds<br><em>its destination.</em>',desc:'The next step happens behind the page. CRM routing, contact ownership and follow-up need to agree with the booking experience.',tasks:['GoHighLevel fields, tags and pipelines','Lead assignment, calendars and webhooks','Follow-up logic and message delivery']},
 {title:'The details<br><em>get checked.</em>',desc:'Before handoff, I test submitted records, calendar connections, inbox routing and owner assignments. Unresolved items are documented.',tasks:['Submission and routing QA','Calendar and email checks','Owner and blocker confirmation']},
 {title:'Three parts.<br><em>One working system.</em>',desc:'A usable site, connected automations, and a clear handoff. I document what was verified and what still needs an owner.',tasks:['Working experience and connected records','Issue list with owners and next actions','Launch readiness and clear handover']}
];
// Depth camera keyframes (real CSS 3D planes with translation and rotation).
// Four distinct camera setups: the fourth card is a real delivery card.
// Nonactive cards sit behind the selected card and never cover its text.
const states=[
 [{x:0,y:0,z:260,ry:0,rx:0,a:1},{x:215,y:-25,z:-230,ry:24,rx:3,a:.13},{x:-220,y:48,z:-330,ry:-24,rx:3,a:.10},{x:290,y:65,z:-450,ry:22,rx:3,a:.06}],
 [{x:-230,y:20,z:-310,ry:-26,rx:3,a:.11},{x:0,y:0,z:260,ry:0,rx:0,a:1},{x:230,y:-25,z:-260,ry:25,rx:3,a:.13},{x:-280,y:55,z:-420,ry:-20,rx:3,a:.06}],
 [{x:-270,y:-25,z:-370,ry:-29,rx:4,a:.09},{x:-215,y:30,z:-250,ry:-21,rx:3,a:.13},{x:0,y:0,z:260,ry:0,rx:0,a:1},{x:220,y:-12,z:-280,ry:24,rx:3,a:.13}],
 [{x:-295,y:45,z:-440,ry:-28,rx:3,a:.07},{x:270,y:40,z:-370,ry:29,rx:4,a:.08},{x:-210,y:-15,z:-270,ry:-22,rx:3,a:.12},{x:0,y:0,z:260,ry:0,rx:0,a:1}]
];
let lastStage=-1,lastNoirBeat=-1,lastPct=-1;
function updateDepthCopy(stage){if(stage===lastStage)return;lastStage=stage;const s=stageCopy[stage];
 if(depthHead)depthHead.innerHTML=s.title;if(depthDesc)depthDesc.textContent=s.desc;
 if(depthCount)depthCount.textContent=String(stage+1).padStart(2,'0')+' / 04';
 if(depthChecklist)depthChecklist.replaceChildren(...s.tasks.map(v=>{const li=document.createElement('li');li.textContent=v;return li}));
 depthButtons.forEach((b,i)=>{const on=i===stage;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 depthCards.forEach((card,i)=>{const front=i===stage;card.classList.toggle('is-front',front);card.setAttribute('aria-hidden',String(!front));card.tabIndex=front?0:-1;card.style.zIndex=String(front?10:3-i);card.style.pointerEvents=front?'auto':'none';});
}
function goDepthStage(stage){if(!depthSection)return;const g=geometry.depth;if(!g)return;
 if(reduce){updateDepthCopy(stage);depthCards[stage]?.scrollIntoView({behavior:'instant',block:'center'});return;}
 const targets=[.125,.375,.625,.875];scrollTo({top:g.top+g.travel*targets[stage],behavior:'instant'});schedule();
}
depthButtons.forEach((b,i)=>b.addEventListener('click',()=>goDepthStage(i)));
depthCards.forEach((b,i)=>b.addEventListener('click',()=>goDepthStage(i)));
let geometry={hero:null,depth:null,noir:null,max:1};
function geometryOf(el){if(!el)return null;const r=el.getBoundingClientRect();return{top:r.top+scrollY,height:r.height,travel:Math.max(1,r.height-innerHeight)};}
let dirtyLayout=true;
function invalidate(){dirtyLayout=true;}
function layout(){if(!dirtyLayout)return;geometry.hero=geometryOf(heroTrack);geometry.depth=geometryOf(depthSection);geometry.noir=geometryOf(noirTrack);geometry.max=Math.max(1,document.documentElement.scrollHeight-innerHeight);dirtyLayout=false;}
function progress(g,y){return clamp((y-g.top)/g.travel)}
function visible(g,y){return g&&y+innerHeight>=g.top&&y<=g.top+g.height}
let queued=false;
function paint(){queued=false;layout();const y=scrollY,vh=innerHeight,small=innerWidth<=690,mid=innerWidth<=950,low=lite||small;
 if(line)line.style.transform=`scaleX(${(y/geometry.max).toFixed(4)})`;
 header?.classList.toggle('is-scrolled',y>45);
 if(!reduce&&visible(geometry.hero,y)){
  const p=progress(geometry.hero,y),appear=smooth(.19,.40,p),fade=1-smooth(.90,1,p),show=appear*fade;
  const away=smooth(.12,.37,p);
  if(heroPhoto){const sc=1.06+p*(low?.12:.22);heroPhoto.style.transform=`translate3d(${(-2*p).toFixed(2)}vw,${(-1.4*p).toFixed(2)}vh,0) scale(${sc.toFixed(3)})`;}
  if(heroCopy){heroCopy.style.transform=`translate3d(${(away*(small?40:105)).toFixed(0)}px,${(-away*48).toFixed(0)}px,${(-away*(low?80:230)).toFixed(0)}px)`;heroCopy.style.opacity=(1-away).toFixed(3);heroCopy.style.pointerEvents=away>.9?'none':'';}
  if(heroBottom)heroBottom.style.opacity=(1-smooth(.12,.38,p)).toFixed(3);
  if(heroDark)heroDark.style.opacity=(1+.13*p).toFixed(3);
  if(heroDepth)heroDepth.style.opacity=show.toFixed(3);
  if(heroArtObject){
    const lift=42-70*smooth(.18,.84,p);
    const twist=low?0:-17+28*smooth(.18,.82,p);
    const sc=.83+.23*smooth(.20,.85,p);
    heroArtObject.style.transform=`translate3d(0,${lift.toFixed(1)}px,0) rotateY(${twist.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
  }
  if(heroArtWords){const drift=(1-smooth(.25,.75,p))*25;heroArtWords.style.transform=`translate3d(0,${drift.toFixed(1)}px,0)`;}
 }
 if(!reduce&&visible(geometry.depth,y)){
  const p=progress(geometry.depth,y),stage=Math.min(3,Math.floor(p*4));
  // The selected button, heading and visually frontmost panel share one index.
  updateDepthCopy(stage);
  const stageLocal=p*4-stage;
  const arrive=smooth(0,.17,stageLocal);
  const prev=Math.max(0,stage-1);
  const percentage=Math.round(p*100);if(percentage!==lastPct){lastPct=percentage;if(depthReadout)depthReadout.textContent=String(percentage).padStart(2,'0')+'%';}
  if(depthMeter)depthMeter.style.transform=`scaleX(${p.toFixed(3)})`;
  const size=small?.48:mid?.74:1;
  depthCards.forEach((card,i)=>{
    if(small){
      // A single legible interactive card on phones. Three other planes do not render.
      if(i!==stage){card.style.opacity='0';card.style.visibility='hidden';return;}
      const drift=Math.sin(Math.PI*stageLocal),rot=(low?3.5:8)*(stageLocal-.5),lift=7*drift;
      card.style.visibility='visible';card.style.opacity='1';
      card.style.transform=`translate(-50%,-50%) translate3d(0,${(-lift).toFixed(1)}px,${low?55:90}px) rotateY(${rot.toFixed(2)}deg) rotateX(${(1.5*drift).toFixed(2)}deg)`;
      return;
    }
    const a=states[prev][i],b=states[stage][i];
    const x=lerp(a.x,b.x,arrive)*size,yy=lerp(a.y,b.y,arrive)*size,z=lerp(a.z,b.z,arrive)*(low?.65:1);
    const ry=lerp(a.ry,b.ry,arrive)*(low?.65:1),rx=lerp(a.rx,b.rx,arrive)*(low?.65:1);
    card.style.visibility='visible';
    card.style.transform=`translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) rotateX(${rx.toFixed(1)}deg)`;
    card.style.opacity=(i===stage?1:Math.min(.15,lerp(a.a,b.a,arrive))).toFixed(3);
  });
  if(depthPhoto)depthPhoto.style.transform=`translate3d(${(p*13-6).toFixed(1)}px,${(-20*p).toFixed(1)}px,0) scale(${(1.08-.04*p).toFixed(3)})`;
  if(depthWorld)depthWorld.style.transform=`rotateY(${(p*(low?3:7)-2).toFixed(1)}deg)`;
 }
 if(!reduce&&visible(geometry.noir,y)){
  const p=progress(geometry.noir,y),open=smooth(.09,.86,p);
  // Moving an opaque layer on the compositor avoids the full viewport clip-path repaint.
  if(noirCurtain)noirCurtain.style.transform=`translate3d(${(open*104).toFixed(2)}%,0,0)`;
  if(noirPhoto)noirPhoto.style.transform=`translate3d(${(-3+6*p).toFixed(2)}%,0,0) scale(${(1.18-.11*p).toFixed(3)})`;
  const words=smooth(.30,.65,p);
  if(noirHeading){noirHeading.style.opacity=(.18+.82*words).toFixed(3);noirHeading.style.transform=`translate3d(${((1-words)*(small?28:90)).toFixed(1)}px,0,0)`;}
  if(noirText){noirText.style.opacity=(.2+.8*words).toFixed(3);noirText.style.transform=`translate3d(${((1-words)*(small?20:45)).toFixed(1)}px,0,0)`;}
  const beat=p<.33?0:p<.68?1:2;
  if(beat!==lastNoirBeat){lastNoirBeat=beat;if(noirBeat)noirBeat.textContent=['01 / PREPARE','02 / VERIFY','03 / HAND OFF'][beat];}
 }
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(paint);}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{invalidate();schedule()},{passive:true});
addEventListener('load',()=>{invalidate();schedule()},{once:true});
if('ResizeObserver' in window){const resizeObserver=new ResizeObserver(()=>{invalidate();schedule()});resizeObserver.observe(document.body)}
if(document.fonts?.ready)document.fonts.ready.then(()=>{invalidate();schedule()});
// Hidden tabs should not keep scheduling work.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
updateDepthCopy(0);invalidate();schedule();
})();