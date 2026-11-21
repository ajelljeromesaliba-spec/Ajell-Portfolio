(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, {threshold: .1, rootMargin: '0px 0px -25px 0px'});
    reveal.forEach(item => observer.observe(item));
  } else { reveal.forEach(item => item.classList.add('visible')); }

  const progress = document.querySelector('.scroll-progress');
  let waitingForFrame = false;
  const updateProgress = () => {
    if (progress) {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (available > 0 ? (window.scrollY / available) * 100 : 0) + '%';
    }
    waitingForFrame = false;
  };
  window.addEventListener('scroll', () => { if (!waitingForFrame) { waitingForFrame = true; requestAnimationFrame(updateProgress); } }, {passive:true});
  updateProgress();

  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-nav');
  const closeMenu = () => { menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open navigation'); mobileMenu.hidden = true; };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    mobileMenu.hidden = open;
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.project-card');
  chips.forEach(chip => chip.addEventListener('click', () => {
    const value = chip.dataset.filter;
    chips.forEach(btn => { btn.classList.toggle('active', btn === chip); btn.setAttribute('aria-pressed', String(btn === chip)); });
    cards.forEach(card => card.classList.toggle('is-hidden', value !== 'all' && card.dataset.category !== value));
  }));

  const stageData = [
    { label:'01', title:'Know what success looks like.', description:'Confirm the audience, pages, lead journey, tools, owners, and anything needed from the client before the build starts.' },
    { label:'02', title:'Build with the real workflow in mind.', description:'Create responsive pages, reusable components, and practical user paths so visitors can understand the offer and take the next step.' },
    { label:'03', title:'Make the tools talk to each other.', description:'Connect lead forms, CRM pipelines, calendars, email routing, and third-party services through integrations, APIs, or webhooks.' },
    { label:'04', title:'Test the path end to end.', description:'Check responsive layouts, form submissions, CRM records, confirmation emails, calendars, DNS/SSL, and handoff notes before launch.' }
  ];
  const stageButtons = document.querySelectorAll('.stage-item');
  const panel = document.querySelector('#stage-panel');
  stageButtons.forEach((button, index) => button.addEventListener('click', () => {
    stageButtons.forEach(btn => { btn.classList.toggle('selected', btn === button); btn.setAttribute('aria-selected', String(btn === button)); btn.tabIndex = btn === button ? 0 : -1; });
    document.querySelector('.stage-label').textContent = 'CURRENT FOCUS / ' + stageData[index].label;
    document.querySelector('#stage-title').textContent = stageData[index].title;
    document.querySelector('#stage-description').textContent = stageData[index].description;
    panel.setAttribute('aria-labelledby', button.id);
  }));
  stageButtons.forEach((button,index) => {
    button.tabIndex = index === 0 ? 0 : -1;
    button.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const direction = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
        const target = stageButtons[(index + direction + stageButtons.length) % stageButtons.length];
        target.focus(); target.click();
      }
    });
  });

  const copyButton = document.querySelector('#copy-email');
  copyButton.addEventListener('click', async () => {
    const address = 'ajellsaliba@gmail.com';
    try {
      await navigator.clipboard.writeText(address);
      copyButton.innerHTML = 'Email copied <span>✓</span>';
      window.setTimeout(() => { copyButton.innerHTML = 'Copy email <span>⧉</span>'; }, 2500);
    } catch {
      window.location.href = 'mailto:' + address;
    }
  });

  // Tilt is visual only, never needed to use the site.
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const heroPanel = document.querySelector('.workflow-frame');
    const heroArea = document.querySelector('.hero-art');
    heroArea?.addEventListener('pointermove', e => {
      const r = heroArea.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      heroPanel.style.transform = `rotateY(${-11+x*13}deg) rotateX(${6-y*12}deg) rotateZ(-3deg)`;
    });
    heroArea?.addEventListener('pointerleave', () => { heroPanel.style.transform = ''; });
  }

  document.getElementById('year').textContent = String(new Date().getFullYear());
})();