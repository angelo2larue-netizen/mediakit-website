/* ============================================================
   YÜKKI® — Premium Interactions
   ============================================================ */

(() => {

  /* -------- LOADER -------- */
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderPct = document.getElementById('loader-pct');
  let pct = 0;
  const loaderInt = setInterval(() => {
    pct += Math.random() * 8 + 2;
    if (pct >= 100) {
      pct = 100;
      clearInterval(loaderInt);
      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.add('loaded');
      }, 350);
    }
    loaderFill.style.width = pct + '%';
    loaderPct.textContent = String(Math.floor(pct)).padStart(3, '0');
  }, 80);

  /* -------- CUSTOM CURSOR -------- */
  const cursor = document.getElementById('cursor');
  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let dx = mx, dy = my;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  document.addEventListener('mousedown', () => cursor.classList.add('click'));
  document.addEventListener('mouseup', () => cursor.classList.remove('click'));

  function tick() {
    dx += (mx - dx) * 0.9;
    dy += (my - dy) * 0.9;
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();

  // hover targets
  const hoverTargets = document.querySelectorAll('a, button, input, [data-magnetic], .drop-card, .lb, .bento-card, .kit-card, .pillar');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });

  /* -------- MAGNETIC BUTTONS -------- */
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  /* -------- BENTO CARD MOUSE GLOW -------- */
  document.querySelectorAll('.bento-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* -------- NAV SCROLL -------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* -------- MOBILE MENU -------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* -------- COUNTDOWN -------- */
  const dropDate = new Date();
  dropDate.setDate(dropDate.getDate() + 14);
  dropDate.setHours(20, 0, 0, 0);

  const cdD = document.getElementById('cd-d');
  const cdH = document.getElementById('cd-h');
  const cdM = document.getElementById('cd-m');
  const cdS = document.getElementById('cd-s');
  const navCd = document.getElementById('nav-cd');
  const releaseDate = document.getElementById('release-date');

  function pad(n) { return String(n).padStart(2, '0'); }

  function fmtDate(d) {
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  }

  if (releaseDate) releaseDate.textContent = fmtDate(dropDate);

  function updateCountdown() {
    const now = new Date();
    const diff = dropDate - now;
    if (diff <= 0) {
      [cdD, cdH, cdM, cdS].forEach(el => el && (el.textContent = '00'));
      if (navCd) navCd.textContent = '00D 00H';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    const s = Math.floor((diff / 1000) % 60);
    if (cdD) cdD.textContent = pad(d);
    if (cdH) cdH.textContent = pad(h);
    if (cdM) cdM.textContent = pad(m);
    if (cdS) cdS.textContent = pad(s);
    if (navCd) navCd.textContent = `${pad(d)}D ${pad(h)}H`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* -------- REVEAL TEXT (gradient sweep) -------- */
  const revealTexts = document.querySelectorAll('.reveal-text');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
  revealTexts.forEach(el => revealObs.observe(el));

  /* -------- COUNTER -------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const dur = 2200;
        const t0 = performance.now();
        function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(el => counterObs.observe(el));

  /* -------- NEWSLETTER FORM -------- */
  const form = document.getElementById('newsletterForm');
  const success = document.getElementById('signupSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.style.display = 'none';
      success.classList.add('show');
    });
  }

  /* -------- SMOOTH ANCHOR SCROLL -------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length > 1) {
        const t = document.querySelector(href);
        if (t) {
          e.preventDefault();
          t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* -------- HERO BG TYPE PARALLAX -------- */
  const heroBg = document.querySelector('.hero-bg-type');
  if (heroBg && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroBg.style.transform = `translateX(-50%) translateY(${y * 0.25}px)`;
      }
    }, { passive: true });
  }

  /* -------- DROP RAIL HORIZONTAL SCROLL WITH WHEEL -------- */
  const rail = document.querySelector('.drop-rail');
  if (rail && window.matchMedia('(pointer: fine)').matches) {
    rail.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const rect = rail.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) {
          // only hijack if rail is fully visible
          const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (fullyVisible) {
            e.preventDefault();
            rail.scrollLeft += e.deltaY;
          }
        }
      }
    }, { passive: false });
  }

})();
