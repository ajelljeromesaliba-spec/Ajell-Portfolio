/* V24 continuous scroll camera, all eight chapters, CSS transform only. */
(() => {
 'use strict';
 const root = document.documentElement;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const phone = matchMedia('(max-width: 690px)');
 const ids = ['home','about','the-thread','selected-work','rain-scene','experience','voices','contact'];
 const chapters = ids.map((id,index) => ({id,index,el:document.getElementById(id)})).filter(c=>c.el);
 const canvas = document.getElementById('cinematicContinuity');
 if (!canvas || chapters.length < 6) return;
 const ctx = canvas.getContext('2d', {alpha:true});
 if (!ctx) return;
 const $ = selector => document.querySelector(selector);
 const $$ = selector => Array.from(document.querySelectorAll(selector));
 const work = $$('.work-visual');
 const reviews = $$('.voice');
 const jobs = $$('.experience-item');
 const portrait = $('.experience-portrait img');
 const hero = $('.hero-image img');
 const story = $('.story-image img');
 const storyFrame = $('.story-image');
 const thread = $('.thread-cinema');
 const noir = $('.noir-image img');
 const orbit = $('.closing-orbit');
 const chapterIndicator = $('#cineChapterName');
 const chapterCount = $('#cineChapterCount');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const ease=t=>{const x=clamp(t);return x*x*(3-2*x)};
 const mix=(a,b,t)=>a+(b-a)*t;
 let w=1,h=1,dpr=1, maxScroll=1, bounds=[], y=0, lastIndex=-1, raf=0;
 function measure(){
   y=window.scrollY||0; w=Math.max(1,window.innerWidth);h=Math.max(1,window.innerHeight);
   maxScroll=Math.max(1,document.documentElement.scrollHeight-h);
   bounds=chapters.map(c=>{
     const box=c.el.getBoundingClientRect();
     return {...c,top:box.top+y,end:box.bottom+y,height:box.height};
   });
   dpr=Math.min(window.devicePixelRatio||1,phone.matches?1.35:1.6);
   canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
   ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 const local=(b)=>clamp((y-b.top)/Math.max(1,b.height-h));
 function elementProgress(el){
   if(!el)return 0;
   const r=el.getBoundingClientRect();
   return ease((h*.85-r.top)/(h*.75+r.height*.53));
 }
 function setCamera(el,p,a,b,lite){
   if(!el)return;
   const cfg=lite?b:a;
   const [y0,y1,r0,r1,s0,s1]=cfg;
   el.style.setProperty('--cin-y',mix(y0,y1,p).toFixed(2)+'px');
   el.style.setProperty('--cin-rotate',mix(r0,r1,p).toFixed(2)+'deg');
   el.style.setProperty('--cin-scale',mix(s0,s1,p).toFixed(4));
   el.style.setProperty('--film-p',p.toFixed(4));
 }
 const title=['ORIGIN','MY STORY','THE SIGNAL','SELECTED WORK','THE HUMAN SIDE','EXPERIENCE','PEOPLE','NEXT CHAPTER'];
 function updateDOM(){
   const center=y+h*.55;
   let index=0;
   for(let i=0;i<bounds.length;i++)if(center>=bounds[i].top)index=i;
   const b=bounds[index],p=local(b),lite=root.dataset.motion!=='full'||phone.matches;
   root.style.setProperty('--film-page',(y/maxScroll).toFixed(4));
   root.style.setProperty('--film-act-p',p.toFixed(4));
   if(index!==lastIndex){lastIndex=index;root.dataset.filmChapter=String(index);if(chapterCount)chapterCount.textContent=String(index+1).padStart(2,'0');if(chapterIndicator)chapterIndicator.textContent=title[index]||title.at(-1);}
   const heroBounds=bounds.find(x=>x.id==='home');
   const storyBounds=bounds.find(x=>x.id==='about');
   const noirBounds=bounds.find(x=>x.id==='rain-scene');
   setCamera(hero,heroBounds?local(heroBounds):0,[0,-94,0,0,1.05,1.28],[0,-54,0,0,1.04,1.17],lite);
   setCamera(story,storyBounds?local(storyBounds):0,[-65,65,0,0,1.16,1.05],[-42,42,0,0,1.10,1.05],lite);
   setCamera(storyFrame,storyBounds?local(storyBounds):0,[-45,45,-11,11,1,1],[-23,23,-5,5,1,1],lite);
   setCamera(noir,noirBounds?local(noirBounds):0,[-74,74,0,0,1.22,1.06],[-50,50,0,0,1.20,1.08],lite);
   setCamera(thread,elementProgress(thread),[43,-43,-12,12,.91,1.07],[28,-28,-6,6,.95,1.04],lite);
   setCamera(portrait,elementProgress(portrait),[-27,27,0,0,1.13,1.05],[-15,15,0,0,1.09,1.04],lite);
   setCamera(orbit,elementProgress(orbit),[0,0,0,105,.78,1.30],[0,0,0,65,.9,1.15],lite);
   work.forEach(el=>setCamera(el,elementProgress(el),[67,-67,-16,14,.93,1.07],[37,-37,-8,7,.95,1.04],lite));
   reviews.forEach(el=>setCamera(el,elementProgress(el),[29,-29,-3,3,1,1],[12,-12,0,0,1,1],lite));
   jobs.forEach(el=>setCamera(el,elementProgress(el),[0,0,0,0,1,1],[0,0,0,0,1,1],lite));
   return {index,p,overall:y/maxScroll};
 }
 function drawTunnel(t){
   const lite=root.dataset.motion!=='full';
   ctx.clearRect(0,0,w,h);
   if(reduced.matches)return;
   const v=t.overall;
   const x=w*(phone.matches?.72:.735)+Math.sin(v*11.5)*w*.075;
   const cy=h*(.43+.055*Math.cos(v*13));
   const hue=t.index===4?192:t.index===6?156:t.index===7?174:146;
   const high=phone.matches?1.04:1.08;
   const count=phone.matches?5:7;
   // One continuous perspective corridor. The camera travels with the entire page, not by section.
   ctx.save();
   ctx.lineWidth=lite?1.35:1.85;
   const phase=(v*15)%1;
   for(let i=count-1;i>=0;i--){
     const depth=(i+phase)/count;
     const scale=.10+Math.pow(depth,1.75)*1.60;
     const rw=w*.57*scale,rh=h*.56*scale;
     const skew=Math.sin(v*19+depth*3.5)*w*.035;
     const mx=x+skew, yy=cy+Math.cos(v*10+depth*2)*h*.032;
     let fade=(.18+.33*Math.pow(depth,.7))*high;
     if(depth>.85)fade*=1-(depth-.85)*1.55;
     ctx.strokeStyle=`hsla(${hue},85%,77%,${fade.toFixed(3)})`;
     ctx.beginPath();
     ctx.moveTo(mx-rw,yy-rh);ctx.lineTo(mx+rw,yy-rh*.76);ctx.lineTo(mx+rw*.94,yy+rh);ctx.lineTo(mx-rw*1.03,yy+rh*.72);ctx.closePath();ctx.stroke();
   }
   // Connected camera rays, tapering from a single vanishing point.
   const endpoints=[[-.19,-.15],[1.16,-.19],[1.18,1.2],[-.17,1.1]];
   for(const [ex,ey] of endpoints){
     const grad=ctx.createLinearGradient(x,cy,w*ex,h*ey);
     grad.addColorStop(0,`hsla(${hue},95%,83%,.34)`);
     grad.addColorStop(1,`hsla(${hue},95%,83%,0)`);
     ctx.strokeStyle=grad;ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(w*ex,h*ey);ctx.stroke();
   }
   // The white moving signal always follows the same page-global timeline.
   const pointY=h*(.14+v*.75);
   const pointX=w*(.75+.05*Math.sin(v*17));
   const rg=ctx.createRadialGradient(pointX,pointY,1,pointX,pointY,phone.matches?57:105);
   rg.addColorStop(0,`hsla(${hue},90%,88%,.32)`);rg.addColorStop(1,`hsla(${hue},90%,80%,0)`);
   ctx.fillStyle=rg;ctx.beginPath();ctx.arc(pointX,pointY,phone.matches?57:105,0,Math.PI*2);ctx.fill();
   // Cross-section transition: bright scanner blooms as next chapter reaches viewport midpoint.
   let boundary=0;
   for(let i=1;i<bounds.length;i++){
     const dist=Math.abs(bounds[i].top-y-h*.55);
     boundary=Math.max(boundary,1-clamp(dist/(h*.46)));
   }
   const bright=ease(boundary);
   if(bright>.025){
     const lineY=h*(.50+Math.sin(v*9)*.11);
     const g=ctx.createLinearGradient(0,lineY-60,0,lineY+60);
     g.addColorStop(0,'rgba(148,255,196,0)');g.addColorStop(.50,`rgba(150,255,202,${(.14*bright).toFixed(3)})`);g.addColorStop(1,'rgba(148,255,196,0)');
     ctx.fillStyle=g;ctx.fillRect(0,lineY-60,w,120);
     ctx.strokeStyle=`rgba(214,255,231,${(.65*bright).toFixed(3)})`;
     ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,lineY);ctx.lineTo(w,lineY);ctx.stroke();
   }
   ctx.restore();
 }
 function render(){raf=0;y=window.scrollY||0;
   const state=updateDOM();drawTunnel(state);
 }
 function schedule(){if(raf)return;raf=requestAnimationFrame(render);}
 const resize=()=>{measure();schedule()};
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',resize,{passive:true});
 window.addEventListener('load',resize,{once:true});
 if('ResizeObserver' in window){const ro=new ResizeObserver(()=>{measure();schedule();});chapters.forEach(c=>ro.observe(c.el));}
 document.querySelectorAll('details').forEach(el=>el.addEventListener('toggle',()=>{measure();schedule();}));
 reduced.addEventListener?.('change',schedule);
 const motionObserver=new MutationObserver(schedule);motionObserver.observe(root,{attributes:true,attributeFilter:['data-motion']});
 document.fonts?.ready.then(resize).catch(()=>{});
 measure();schedule();
})();