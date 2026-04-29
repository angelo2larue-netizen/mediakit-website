/* ============================================================
   YUKIA® — Legal pages: cursor, scroll-spy TOC, nav scroll
   ============================================================ */
(() => {
  /* -------- CUSTOM CURSOR (lite version) -------- */
  const cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    (function tick() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dot) dot.style.transform = `translate(${mx}px, ${my}px)`;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(tick);
    })();

    document.querySelectorAll('a, button, .legal-toc-link').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  /* -------- NAV SCROLL STATE -------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------- SCROLL-SPY TOC -------- */
  // Only spy on the visible language block (others are display:none)
  function getActiveSections() {
    return Array.from(document.querySelectorAll('.legal-body section.legal-section'))
      .filter((el) => el.offsetParent !== null);
  }
  function getTocLinks() {
    return Array.from(document.querySelectorAll('.legal-toc ol li a'));
  }

  function updateActive() {
    const sections = getActiveSections();
    if (sections.length === 0) return;
    const scrollPos = window.scrollY + 160; // offset for sticky nav
    let currentIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= scrollPos) currentIdx = i;
      else break;
    }
    const links = getTocLinks();
    links.forEach((a, i) => a.classList.toggle('is-active', i === currentIdx));
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  document.addEventListener('yukia:langchange', () => {
    // rebind TOC anchors to the newly visible section ids
    setTimeout(updateActive, 50);
  });

  // Smooth scroll on TOC click — target the currently visible section by index
  document.querySelectorAll('.legal-toc ol li a').forEach((a, idx) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const sections = getActiveSections();
      const target = sections[idx];
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // First paint
  setTimeout(updateActive, 100);

  /* -------- SCROLL-REVEAL for collab pages -------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length > 0) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObs.observe(el));
  }

  /* -------- BENTO CARD mouse glow (collab pages) -------- */
  document.querySelectorAll('.feature-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();
