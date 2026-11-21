'use strict';
// The site is deliberately framework-free so it can be hosted as static files.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-nav');
if (menuButton && mobileMenu) {
  function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); mobileMenu.hidden = true; }
  menuButton.addEventListener('click', () => { const isOpen = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!isOpen)); menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu'); mobileMenu.hidden = isOpen; });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') closeMenu(); });
}
const scrollBar = document.querySelector('.reading-bar');
function updateScroll() {
  if (!scrollBar) return;
  const denominator = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  scrollBar.style.width = `${Math.min(100, (scrollY / denominator) * 100)}%`;
}
addEventListener('scroll', updateScroll, {passive:true}); updateScroll();
if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } });
  }, {threshold: 0.12, rootMargin: '0px 0px -30px 0px'});
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));
} else document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
if (reducedMotion) document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));

// Subtle pointer magnetics, disabled on touch.
if (!reducedMotion && matchMedia('(hover:hover) and (pointer:fine)').matches) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => { const b = el.getBoundingClientRect(); const x = (e.clientX - (b.left + b.width / 2)) * .16; const y = (e.clientY - (b.top + b.height / 2)) * .16; el.style.transform = `translate(${x}px,${y}px)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

// Animated metrics only run when they first enter the viewport.
const counts = document.querySelectorAll('[data-count]');
function formatCount(n) { return Math.round(n).toLocaleString('en-US'); }
const countObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => { if (!entry.isIntersecting) return; observer.unobserve(entry.target); const node = entry.target; const end = Number(node.dataset.count); const suffix = end === 6381 ? '' : '<span>+</span>'; if (reducedMotion) {node.innerHTML = formatCount(end) + suffix;return;}
    const startTime = performance.now(); const duration = 1600;
    function tick(t) { const fraction = Math.min(1, (t - startTime) / duration); const eased = 1 - Math.pow(1 - fraction, 4); node.innerHTML = formatCount(end * eased) + suffix; if (fraction < 1) requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  });
}, {threshold:.6}) : null;
counts.forEach(el => {if(countObserver) countObserver.observe(el);});

// WebGL: an original, real-time, rotatable chrome orbital sculpture.
// Uses WebGL 1 only; renders locally in the browser without external packages or assets.
(function initSculpture(){
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || reducedMotion) return;
  const wrapper = canvas.closest('.hero-scene');
  let gl;
  try { gl = canvas.getContext('webgl', {alpha:true, antialias:false, depth:false, stencil:false, preserveDrawingBuffer:false, powerPreference:'low-power'}); } catch {}
  if (!gl) return;
  const vert = `attribute vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}`;
  const frag = `precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;
  #define PI 3.14159265
  mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
  float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
  vec2 scene(vec3 p){
    vec3 q=p;
    q.yz*=r2(.26*sin(uTime*.34)+uMouse.y*.20);
    q.xz*=r2(uTime*.21+uMouse.x*.46);
    q.xy*=r2(.13*sin(uTime*.27));
    vec3 a=q;a.xy*=r2(.58);a.yz*=r2(.41);
    float d1=sdTorus(a,vec2(1.13,.215));
    vec3 b=q;b.xz*=r2(1.2);b.yz*=r2(.82);
    float d2=sdTorus(b,vec2(1.02,.128));
    vec3 c=q;c.xy*=r2(1.42);c.xz*=r2(.73);
    float d3=sdTorus(c,vec2(.85,.09));
    float d4=length(q)-.36+.022*sin(q.x*18.)*sin(q.y*16.)*sin(q.z*14.);
    vec2 res=vec2(d1,1.);
    if(d2<res.x) res=vec2(d2,2.);
    if(d3<res.x) res=vec2(d3,3.);
    if(d4<res.x) res=vec2(d4,4.);
    return res;
  }
  vec3 normalAt(vec3 p){vec2 h=vec2(.002,0.);return normalize(vec3(scene(p+h.xyy).x-scene(p-h.xyy).x,scene(p+h.yxy).x-scene(p-h.yxy).x,scene(p+h.yyx).x-scene(p-h.yyx).x));}
  void main(){
    vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
    vec3 ro=vec3(0.,0.,4.35);vec3 rd=normalize(vec3(uv,-1.78));
    float t=0.;float id=0.;float glow=0.;float hit=0.;
    for(int i=0;i<80;i++){
      vec3 p=ro+rd*t;
      vec2 m=scene(p);
      float d=m.x;
      glow+=.006/(.05+abs(d)*2.)*(1.-smoothstep(0.,6.5,t));
      if(d<.0018){hit=1.;id=m.y;break;}
      t+=clamp(d*.73,.009,.29);
      if(t>8.)break;
    }
    vec3 bg=vec3(.0);
    vec3 col=bg;
    float alpha=0.;
    if(hit>.5){
      vec3 p=ro+rd*t;vec3 n=normalAt(p);vec3 v=normalize(ro-p);
      vec3 l1=normalize(vec3(-.7,1.2,1.1));vec3 l2=normalize(vec3(.8,-.4,.9));
      float diffuse=max(dot(n,l1),0.);
      float diffuse2=max(dot(n,l2),0.);
      float fres=pow(1.-max(dot(n,v),0.),2.5);
      float spec=pow(max(dot(reflect(-l1,n),v),0.),28.);
      float spec2=pow(max(dot(reflect(-l2,n),v),0.),75.);
      vec3 mint=vec3(.62,1.0,.88);vec3 pearl=vec3(.77,.78,.91);vec3 metal=vec3(.17,.27,.35);
      float bands=.5+.5*sin(p.x*3.1+p.z*4.0+uTime*.13);
      vec3 base=mix(metal,mix(mint,pearl,bands),.64);
      if(id>1.5) base=mix(vec3(.13,.18,.29),pearl,.62);
      if(id>2.5) base=mix(vec3(.14,.25,.25),mint,.67);
      if(id>3.5) base=mix(vec3(.25,.29,.37),vec3(.7,.77,.99),.7);
      col=base*(.20+.74*diffuse+.34*diffuse2);
      col+=vec3(.76,1.,.88)*spec*1.20+vec3(.70,.61,1.)*spec2*.9;
      col+=fres*mix(mint,pearl,.4)*.82;
      col+=pow(max(dot(n,normalize(vec3(-.3,-.8,-.5))),0.),3.)*vec3(.18,.38,.36);
      col=pow(col,vec3(.84));
      alpha=1.;
    }
    vec3 glowTint=mix(vec3(.31,.75,.69),vec3(.65,.5,.92),.5+.5*sin(uTime*.18));
    col+=glowTint*min(.22,glow*.055);
    alpha=max(alpha,min(.36,glow*.052));
    // chromatic hint on the sculptural highlights
    gl_FragColor=vec4(col,alpha);
  }`;
  function compile(type, source) {let shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.warn('WebGL shader:',gl.getShaderInfoLog(shader));gl.deleteShader(shader);return null;}return shader;}
  const vShader=compile(gl.VERTEX_SHADER,vert), fShader=compile(gl.FRAGMENT_SHADER,frag);if(!vShader||!fShader)return;
  const prog=gl.createProgram();gl.attachShader(prog,vShader);gl.attachShader(prog,fShader);gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return;
  gl.useProgram(prog);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(prog,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const uRes=gl.getUniformLocation(prog,'uRes'),uTime=gl.getUniformLocation(prog,'uTime'),uMouse=gl.getUniformLocation(prog,'uMouse');
  const mouse={x:0,y:0,targetX:0,targetY:0};
  if(matchMedia('(pointer:fine)').matches) wrapper.addEventListener('pointermove',e=>{let r=wrapper.getBoundingClientRect();mouse.targetX=((e.clientX-r.left)/r.width-.5)*2.;mouse.targetY=((e.clientY-r.top)/r.height-.5)*2.;});
  wrapper.addEventListener('pointerleave',()=>{mouse.targetX=mouse.targetY=0;});
  let active=true,raf=0,lastTime=0,elapsed=0;
  if('IntersectionObserver' in window) new IntersectionObserver(entries=>{active=entries[0].isIntersecting; if(active && !raf) raf=requestAnimationFrame(draw);}, {threshold:.01}).observe(wrapper);
  function draw(now){raf=0;if(!active || document.hidden)return;
    const frameDelta=lastTime?Math.min((now-lastTime)/1000,.06):0;lastTime=now;elapsed+=frameDelta;
    const {width,height}=wrapper.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,1.25);const scale=innerWidth<700?.73:.90;
    const w=Math.max(2,Math.round(width*dpr*scale)),h=Math.max(2,Math.round(height*dpr*scale));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    mouse.x+=(mouse.targetX-mouse.x)*.06;mouse.y+=(mouse.targetY-mouse.y)*.06;
    gl.uniform2f(uRes,w,h);gl.uniform1f(uTime,elapsed);gl.uniform2f(uMouse,mouse.x,mouse.y);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);
    raf=requestAnimationFrame(draw);
  }
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(!document.hidden&&active&&!raf)raf=requestAnimationFrame(draw);});
  wrapper.classList.add('webgl-ready');raf=requestAnimationFrame(draw);
})();