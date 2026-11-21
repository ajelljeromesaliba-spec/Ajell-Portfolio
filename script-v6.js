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
const heroTrack=q('#heroTrack'),heroPhoto=q('.hero-photo img'),heroCopy=q('.hero-copy'),heroBottom=q('.hero-bottom'),heroDepth=q('.hero-depth'),heroDark=q('.hero-darkening'),heroPlanes=qa('[data-hero-plane]'),heroCamera=q('#heroCameraProgress');
const heroBeatIndex=q('#heroBeatIndex'),heroBeatTitle=q('#heroBeatTitle');
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
const heroBeats=['FIRST IMPRESSION','THE CONNECTION','BUILD · ROUTE · CHECK','READY FOR THE HANDOFF'];
const stageCopy=[
 {title:'The website<br><em>starts the journey.</em>',desc:'An enquiry starts with a usable page. I implement responsive layouts, clear calls to action, forms and booking paths.',tasks:['Responsive pages and conversion paths','Forms, calendars and contact destinations','Mobile, desktop and browser checks']},
 {title:'The lead finds<br><em>its destination.</em>',desc:'The next step happens behind the page. CRM routing, contact ownership and follow-up need to agree with the booking experience.',tasks:['GoHighLevel fields, tags and pipelines','Lead assignment, calendars and webhooks','Follow-up logic and message delivery']},
 {title:'The details<br><em>get checked.</em>',desc:'Before handoff, I test submitted records, calendar connections, inbox routing and owner assignments. Unresolved items are documented.',tasks:['Submission and routing QA','Calendar and email checks','Owner and blocker confirmation']},
 {title:'Three parts.<br><em>One working system.</em>',desc:'A usable site, connected automations, and a clear handoff. I document what was verified and what still needs an owner.',tasks:['Working experience and connected records','Issue list with owners and next actions','Launch readiness and clear handover']}
];
// Depth camera keyframes (real CSS 3D planes with translation and rotation).
const states=[
 [{x:-12,y:8,z:245,ry:-12,rx:3,a:1},{x:175,y:-13,z:-180,ry:32,rx:4,a:.47},{x:255,y:40,z:-430,ry:39,rx:5,a:.19}],
 [{x:-207,y:-10,z:-132,ry:-34,rx:4,a:.56},{x:48,y:0,z:257,ry:5,rx:-4,a:1},{x:228,y:35,z:-288,ry:38,rx:4,a:.3}],
 [{x:-259,y:-28,z:-265,ry:-39,rx:5,a:.29},{x:-167,y:42,z:-118,ry:-18,rx:2,a:.63},{x:56,y:-8,z:254,ry:10,rx:-3,a:1}],
 [{x:-365,y:-8,z:-130,ry:-20,rx:3,a:.45},{x:0,y:10,z:235,ry:0,rx:0,a:1},{x:365,y:-14,z:-130,ry:20,rx:-3,a:.45}]
];
let lastStage=-1,lastHeroBeat=-1,lastNoirBeat=-1,lastPct=-1;
function updateDepthCopy(stage){if(stage===lastStage)return;lastStage=stage;const s=stageCopy[stage];
 if(depthHead)depthHead.innerHTML=s.title;if(depthDesc)depthDesc.textContent=s.desc;
 if(depthCount)depthCount.textContent=String(stage+1).padStart(2,'0')+' / 04';
 if(depthChecklist)depthChecklist.replaceChildren(...s.tasks.map(v=>{const li=document.createElement('li');li.textContent=v;return li}));
 depthButtons.forEach((b,i)=>{const on=i===stage;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 depthCards.forEach((card,i)=>{card.classList.toggle('is-front',i===[0,1,2,1][stage]);card.style.zIndex=String(i===[0,1,2,1][stage]?7:i===1?5:3)});
}
function goDepthStage(stage){if(!depthSection)return;const g=geometry.depth;if(!g)return;
 if(reduce){updateDepthCopy(stage);depthCards[Math.min(stage,2)]?.scrollIntoView({behavior:'instant',block:'center'});return;}
 const targets=[.03,.34,.67,.98];scrollTo({top:g.top+g.travel*targets[stage],behavior:'smooth'});
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
  const p=progress(geometry.hero,y),show=smooth(.23,.43,p)*(1-smooth(.88,.99,p));
  const away=smooth(.14,.42,p),spread=smooth(.28,.66,p),k=small?.46:mid?.68:1;
  if(heroPhoto){const sc=1.06+p*(low?.14:.27);heroPhoto.style.transform=`translate3d(${(-3*p).toFixed(2)}vw,${(-1.8*p).toFixed(2)}vh,0) scale(${sc.toFixed(3)})`;}
  if(heroCopy){heroCopy.style.transform=`translate3d(${(away*(small?65:125)).toFixed(0)}px,${(-away*62).toFixed(0)}px,${(-away*(low?130:290)).toFixed(0)}px) rotateY(${(away*(low?6:12)).toFixed(1)}deg)`;heroCopy.style.opacity=(1-away).toFixed(3);heroCopy.style.pointerEvents=away>.9?'none':'';}
  if(heroBottom)heroBottom.style.opacity=(1-smooth(.11,.37,p)).toFixed(3);
  if(heroDark)heroDark.style.opacity=(1+.14*p).toFixed(3);
  if(heroDepth)heroDepth.style.opacity=show.toFixed(3);
  if(heroCamera)heroCamera.style.transform=`scaleY(${p.toFixed(3)})`;
  heroPlanes.forEach((el,i)=>{const side=i-1,x=side*(small?300:335)*spread*k,yy=120*(1-spread)+Math.abs(side)*12*spread,z=-510+580*spread,angle=side*(low?24:32)-(side*15*spread);
    el.style.transform=`translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${angle.toFixed(1)}deg) rotateX(${((1-spread)*18).toFixed(1)}deg)`;el.style.opacity=show.toFixed(3);
  });
  const beat=p<.20?0:p<.47?1:p<.77?2:3;
  if(lastHeroBeat!==beat){lastHeroBeat=beat;if(heroBeatIndex)heroBeatIndex.textContent=String(beat+1).padStart(2,'0')+' / 04';if(heroBeatTitle)heroBeatTitle.textContent=heroBeats[beat];}
 }
 if(!reduce&&visible(geometry.depth,y)){
  const p=progress(geometry.depth,y),scaled=p*3,idx=Math.min(2,Math.floor(scaled)),t=smooth(.16,.84,scaled-idx);
  const stage=clamp(Math.floor(p*4),0,3);updateDepthCopy(stage);
  const percentage=Math.round(p*100);if(percentage!==lastPct){lastPct=percentage;if(depthReadout)depthReadout.textContent=String(percentage).padStart(2,'0')+'%';}
  if(depthMeter)depthMeter.style.transform=`scaleX(${p.toFixed(3)})`;
  const size=small?.48:mid?.74:1;
  depthCards.forEach((card,i)=>{const a=states[idx][i],b=states[idx+1][i];const x=lerp(a.x,b.x,t)*size,yy=lerp(a.y,b.y,t)*size,z=lerp(a.z,b.z,t)*(low?.55:1),ry=lerp(a.ry,b.ry,t)*(low?.65:1),rx=lerp(a.rx,b.rx,t)*(low?.65:1),opacity=lerp(a.a,b.a,t);
    card.style.transform=`translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) rotateX(${rx.toFixed(1)}deg)`;card.style.opacity=opacity.toFixed(3);
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