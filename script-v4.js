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
 if(!reduce && innerWidth>950){const p=q('.hero-photo img');if(p&&y<innerHeight+150)p.style.transform=`translateY(${Math.min(125,y*.16)}px) scale(1.08)`;}
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
// True interactive example: stage selection changes text and progress.
const stages=[
 {title:'Start with the outcome.',description:'Define who the experience is for, what needs to happen next, and which systems must support it.',output:'A clear path from visitor to action.'},
 {title:'Make the experience real.',description:'Build responsive pages, configure domains and SSL, and connect the right form or calendar to the right destination.',output:'A website that is usable and ready to launch.'},
 {title:'Connect the moving parts.',description:'Route submitted leads into the CRM, set booking and follow-up rules, and handle handoffs through workflows and webhooks.',output:'An end-to-end connected journey.'},
 {title:'Test before the handoff.',description:'Check forms, integrations, inbox routing, calendar connections, edge cases, and ownership of unresolved tasks.',output:'A tested flow with clear next steps.'}
];
const tabs=qa('.flow-step');let active=0;
function selectStage(i,{focus=false}={}){active=(i+stages.length)%stages.length;const st=stages[active];q('#stageNo').textContent=String(active+1).padStart(2,'0');q('#stageTitle').textContent=st.title;q('#stageDesc').textContent=st.description;q('#stageOutput').textContent=st.output;q('#flowProgress').style.width=(active+1)/stages.length*100+'%';tabs.forEach((t,j)=>{const on=j===active;t.classList.toggle('active',on);t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1});if(focus)tabs[active]?.focus();}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>selectStage(i));t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();selectStage(i+(e.key==='ArrowRight'?1:-1),{focus:true})}if(e.key==='Home'||e.key==='End'){e.preventDefault();selectStage(e.key==='Home'?0:3,{focus:true})}})});
q('#nextStage')?.addEventListener('click',()=>selectStage(active+1));selectStage(0);
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
})();