(()=>{
'use strict';
const root=document.documentElement;
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=window.matchMedia('(pointer: coarse)').matches;
const q=s=>document.querySelector(s),qa=s=>Array.from(document.querySelectorAll(s));
const header=q('.site-header'),line=q('.reading-line'),menu=q('#mobileMenu'),menuToggle=q('#menuToggle'),aura=q('.cursor-aura');
root.classList.add('js-ready');
// Global scroll position, active navigation and a subtle hero/photo parallax.
let scrollTick=false;
function handleScroll(){
 const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),y=scrollY;
 if(line)line.style.width=Math.min(100,y/max*100)+'%';
 header?.classList.toggle('is-scrolled',y>45);
 // Hero 3D scene is driven by the dedicated scroll engine below.

 scrollTick=false;
}
addEventListener('scroll',()=>{if(!scrollTick){requestAnimationFrame(handleScroll);scrollTick=true;}},{passive:true});handleScroll();
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
 let mx=0,my=0,ax=0,ay=0,raf=0;const draw=()=>{ax+=(mx-ax)*.12;ay+=(my-ay)*.12;if(aura){aura.style.transform=`translate(${ax-256}px,${ay-256}px)`;aura.style.opacity='.9';}raf=requestAnimationFrame(draw)};
 addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(!raf)draw()},{passive:true});
 qa('.magnet').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.11}px,${(e.clientY-r.top-r.height/2)*.13}px)`});el.addEventListener('pointerleave',()=>el.style.transform='');});
 qa('.tilt-card').forEach(el=>{let pending=0;el.addEventListener('pointermove',e=>{if(pending)return;pending=requestAnimationFrame(()=>{const r=el.getBoundingClientRect(),dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1000px) rotateX(${-dy*3.5}deg) rotateY(${dx*3.5}deg) translateY(-4px)`;pending=0})});el.addEventListener('pointerleave',()=>{if(pending)cancelAnimationFrame(pending);pending=0;el.style.transform=''});});
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

// V5 scroll engine follows below.
// Scroll-linked camera and 3D architecture. Every scene has a job: explain a real step.
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;
const frameProgress=(element)=>{
 if(!element)return 0;
 const r=element.getBoundingClientRect();
 const travel=Math.max(1,r.height-innerHeight);
 return clamp(-r.top/travel);
};
const heroTrack=q('#heroTrack'),heroPhoto=q('.hero-photo img'),heroCopy=q('.hero-copy'),heroBottom=q('.hero-bottom'),heroDepth=q('.hero-depth'),heroDark=q('.hero-darkening'),heroPlanes=qa('[data-hero-plane]'),heroCamera=q('#heroCameraProgress');
const depthSection=q('.depth-scroll'),depthPhoto=q('.depth-photo img'),depthCards=qa('.depth-plate'),depthButtons=qa('.depth-nav'),depthHead=q('#depthHeading'),depthDesc=q('#depthDescription'),depthCount=q('#depthCounter'),depthReadout=q('#depthReadout'),depthMeter=q('#depthMeterFill'),depthWorld=q('#depthWorld');
const noirTrack=q('#noirTrack'),noirPhoto=q('.editorial-image img'),noirCurtain=q('.noir-curtain'),noirHeading=q('.editorial-content h2'),noirText=q('.editorial-content > p');
const workArt=qa('.project-art');
const sceneCopy=[
 {title:'The website<br><em>starts the journey.</em>',desc:'A page is useful only when someone can take the next step. Scroll to see what happens after a visitor submits a request.'},
 {title:'The lead finds<br><em>its destination.</em>',desc:'The form sends a contact to the right pipeline. Routing, booking and follow-up need to work together.'},
 {title:'The details<br><em>get checked.</em>',desc:'I verify the submission, contact details, calendar connection and ownership before calling a handoff complete.'},
 {title:'Three parts.<br><em>One working system.</em>',desc:'A usable experience, connected automation, and a clear QA handoff. That is the kind of implementation I work on.'}
];
// Each position is a genuine plane in 3D space: x/y/z, pitch, yaw and alpha.
// The state interpolates continuously as the user scrolls, rather than using timed slides.
const states=[
 [{x:-12,y:8,z:245,ry:-12,rx:3,a:1},{x:175,y:-13,z:-180,ry:32,rx:4,a:.47},{x:255,y:40,z:-430,ry:39,rx:5,a:.19}],
 [{x:-207,y:-10,z:-132,ry:-34,rx:4,a:.56},{x:48,y:0,z:257,ry:5,rx:-4,a:1},{x:228,y:35,z:-288,ry:38,rx:4,a:.3}],
 [{x:-259,y:-28,z:-265,ry:-39,rx:5,a:.29},{x:-167,y:42,z:-118,ry:-18,rx:2,a:.63},{x:56,y:-8,z:254,ry:10,rx:-3,a:1}],
 [{x:-215,y:-10,z:10,ry:-22,rx:3,a:.92},{x:5,y:16,z:84,ry:0,rx:0,a:1},{x:223,y:-19,z:28,ry:22,rx:-3,a:.92}]
];
let lastDepthStage=-1;
function updateDepthCopy(stage){
 if(stage===lastDepthStage)return;
 lastDepthStage=stage;
 if(depthHead)depthHead.innerHTML=sceneCopy[stage].title;
 if(depthDesc)depthDesc.textContent=sceneCopy[stage].desc;
 if(depthCount)depthCount.textContent=String(stage+1).padStart(2,'0')+' / 04';
 depthButtons.forEach((button,i)=>{const active=i===stage;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
}
function setPlane(el,state,size){
 if(!el)return;
 const k=size;
 el.style.transform=`translate(-50%,-50%) translate3d(${(state.x*k).toFixed(1)}px,${(state.y*k).toFixed(1)}px,${(state.z*k).toFixed(1)}px) rotateY(${state.ry.toFixed(1)}deg) rotateX(${state.rx.toFixed(1)}deg)`;
 el.style.opacity=state.a.toFixed(3);
 el.style.zIndex=String(Math.round(state.z+500));
}
// Stage buttons and cards control the scroll scene itself, not an unrelated slideshow.
function goDepthStage(stage){
 if(!depthSection)return;
 if(reduce){updateDepthCopy(stage);depthCards[stage]?.scrollIntoView({block:'center',behavior:'instant'});return;}
 const top=depthSection.getBoundingClientRect().top+scrollY;
 const distance=Math.max(1,depthSection.offsetHeight-innerHeight);
 const targets=[.01,.335,.668,.987];
 scrollTo({top:top+distance*targets[stage],behavior:reduce?'instant':'smooth'});
}
depthButtons.forEach((button,i)=>button.addEventListener('click',()=>goDepthStage(i)));
depthCards.forEach((plate,i)=>plate.addEventListener('click',()=>goDepthStage(i)));

let motionQueued=false;
function updateMotion(){
 motionQueued=false;
 if(reduce){ updateDepthCopy(lastDepthStage<0?0:lastDepthStage);return; }
 const vh=innerHeight;
 const mobile=innerWidth<=690;
 const mid=innerWidth<=950;
 if(heroTrack){
   const rect=heroTrack.getBoundingClientRect();
   if(rect.bottom>0&&rect.top<vh){
     const p=frameProgress(heroTrack);
     const inCards=smooth(.25,.48,p)*(1-smooth(.81,.98,p));
     const exit=smooth(.12,.43,p);
     const frame=smooth(.0,1,p);
     heroCamera&&(heroCamera.style.height=(p*100).toFixed(1)+'%');
     if(heroPhoto){const scale=1.07+.34*p;const shift=mid?-3*p:-4.5*p;heroPhoto.style.transform=`translate3d(${shift.toFixed(2)}vw,${(-1.5*p).toFixed(2)}vh,0) scale(${scale.toFixed(4)}) rotateY(${(3.3*p).toFixed(2)}deg)`;}
     if(heroCopy){heroCopy.style.transform=`perspective(1100px) translate3d(${(exit*(mobile?70:140)).toFixed(1)}px,${(-exit*90).toFixed(1)}px,${(-exit*370).toFixed(1)}px) rotateY(${(exit*13).toFixed(1)}deg)`;heroCopy.style.opacity=(1-exit).toFixed(3);heroCopy.style.pointerEvents=exit>.8?'none':'';}
     if(heroBottom)heroBottom.style.opacity=(1-smooth(.08,.35,p)).toFixed(3);
     if(heroDark)heroDark.style.opacity=(1+.18*p).toFixed(3);
     if(heroDepth)heroDepth.style.opacity=inCards.toFixed(3);
     const spread=smooth(.29,.55,p);const k=mobile?.54:(mid?.73:1);
     heroPlanes.forEach((el,i)=>{
        const side=i-1;
        const x=side*(mobile?188:335)*spread*k;
        const y=(1-spread)*125 + Math.abs(side)*13*spread;
        const z=-560+600*spread;
        const ry=side*(32-18*spread);
        el.style.transform=`translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${((1-spread)*25).toFixed(1)}deg)`;
        el.style.opacity=inCards.toFixed(3);
     });
   }
 }
 if(depthSection){
   const rect=depthSection.getBoundingClientRect();
   if(rect.bottom>0&&rect.top<vh){
     const p=frameProgress(depthSection);
     const scaled=p*3;const idx=Math.min(2,Math.floor(scaled));const t=smooth(0,1,scaled-idx);
     const focused=clamp(Math.round(scaled),0,3);
     updateDepthCopy(focused);
     if(depthReadout)depthReadout.textContent=String(Math.round(p*100)).padStart(2,'0')+'%';
     if(depthMeter)depthMeter.style.width=(p*100).toFixed(1)+'%';
     const size=mobile?.49:(mid?.74:1);
     depthCards.forEach((card,i)=>{
       const from=states[idx][i],to=states[idx+1][i],state={};
       for(const key of ['x','y','z','ry','rx','a'])state[key]=mix(from[key],to[key],t);
       setPlane(card,state,size);
       card.classList.toggle('is-front',i===Math.min(2,focused));
     });
     if(depthPhoto)depthPhoto.style.transform=`translate3d(${(p*20-10).toFixed(1)}px,${(-40*p).toFixed(1)}px,0) scale(${(1.1-.08*p).toFixed(3)})`;
     if(depthWorld)depthWorld.style.transform=`rotateY(${(p*8-4).toFixed(2)}deg) rotateX(${(Math.sin(Math.PI*p)*3).toFixed(2)}deg)`;
   }
 }
 if(noirTrack){
   const rect=noirTrack.getBoundingClientRect();
   if(rect.bottom>0&&rect.top<vh){
     const p=frameProgress(noirTrack);const reveal=smooth(.05,.88,p);
     if(noirCurtain)noirCurtain.style.clipPath=`inset(0 0 0 ${(reveal*103).toFixed(2)}%)`;
     if(noirPhoto)noirPhoto.style.transform=`translate3d(${(-5+8*p).toFixed(2)}%,${(-2*p).toFixed(2)}%,0) scale(${(1.24-.19*p).toFixed(4)})`;
     const words=smooth(.22,.66,p);
     if(noirHeading){noirHeading.style.opacity=String(.28+.72*words);noirHeading.style.transform=`translate3d(${((1-words)*110).toFixed(1)}px,0,0)`;}
     if(noirText){noirText.style.opacity=String(.3+.7*words);noirText.style.transform=`translate3d(${((1-words)*60).toFixed(1)}px,0,0)`;}
   }
 }
 // Project artwork turns in depth as it enters; the actual project links stay clickable.
 for(const art of workArt){
   const r=art.getBoundingClientRect();
   if(r.bottom<0||r.top>vh)continue;
   const phase=clamp((vh-r.top)/(vh+r.height));
   const turn=(.5-phase)*15;
   const lift=Math.sin(Math.PI*phase)*15;
   art.style.transform=`perspective(1300px) rotateX(${turn.toFixed(2)}deg) translate3d(0,${((.5-phase)*23).toFixed(2)}px,${lift.toFixed(2)}px)`;
 }
}
function queueMotion(){if(!motionQueued){motionQueued=true;requestAnimationFrame(updateMotion);}}
addEventListener('scroll',queueMotion,{passive:true});addEventListener('resize',queueMotion,{passive:true});
queueMotion();
// If the page opens directly at an anchor, allow layout and fonts to settle first.
addEventListener('load',queueMotion,{once:true});
// Keyboard users can reach and operate the stage buttons and individual planes.

})();