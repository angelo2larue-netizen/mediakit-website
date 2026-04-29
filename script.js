/* ============================================================
   YÜKKI® — Premium Interactions
   ============================================================ */

(() => {

  /* -------- i18n helper (delegates to window.YUKIA_I18N) -------- */
  const i18n = (key, fallback) => {
    if (window.YUKIA_I18N && typeof window.YUKIA_I18N.t === 'function') {
      const v = window.YUKIA_I18N.t(key);
      if (v != null && v !== key) return v;
    }
    return fallback != null ? fallback : key;
  };

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

  /* ================================================
     CART SYSTEM
     ================================================ */
  const CART_KEY = 'yukia_cart_v1';
  let cart = [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) cart = JSON.parse(stored);
  } catch (e) { cart = []; }

  const cartBtn = document.getElementById('cartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFoot = document.getElementById('cartFoot');
  const cartCount = document.getElementById('cartCount');
  const cartCountBig = document.getElementById('cartCountBig');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTotal = document.getElementById('cartTotal');
  const cartCheckout = document.getElementById('cartCheckout');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutClose = document.getElementById('checkoutClose');
  const emptyShopBtn = document.getElementById('emptyShopBtn');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }

  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // Live product catalog (loaded from Stripe via Netlify Function)
  let CATALOG = [];

  // Format a price (in major units, eg. 39.99) — integer if no cents, else 2 decimals
  function fmtPrice(amount) {
    const n = Number(amount) || 0;
    return Number.isInteger(n) ? `€${n}` : `€${n.toFixed(2)}`;
  }

  function getProductData(id) {
    const p = CATALOG.find(x => x.id === id);
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      price: p.price / 100, // store in major units for display
      img: p.image || '',
      letter: (p.name || '?').charAt(0).toUpperCase(),
    };
  }

  function addToCart(id, color, size) {
    const data = getProductData(id);
    if (!data) return;
    // Build a unique cart key that encodes color + size variants
    let cartKey = id;
    if (color) cartKey += `__${color}`;
    if (size && size !== 'ONE SIZE') cartKey += `__${size}`;
    const existing = cart.find(i => i.cartKey === cartKey);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...data, cartKey, color: color || null, size: size || null, qty: 1 });
    }
    saveCart();
    renderCart();
    // Toast label
    const parts = [data.name];
    if (color) parts.push(color);
    if (size && size !== 'ONE SIZE') parts.push(size);
    showToast(`+ ${parts.join(' — ')} ${i18n('dyn.addedSuffix', 'ADDED')}`);
    bumpCartIcon();
  }

  function removeFromCart(cartKey) {
    cart = cart.filter(i => (i.cartKey || i.id) !== cartKey);
    saveCart();
    renderCart();
  }

  function updateQty(cartKey, delta) {
    const item = cart.find(i => (i.cartKey || i.id) === cartKey);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    saveCart();
    renderCart();
  }

  function bumpCartIcon() {
    cartBtn.style.transform = 'scale(1.15)';
    setTimeout(() => cartBtn.style.transform = '', 300);
  }

  function renderCart() {
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

    // Count badges
    cartCount.textContent = totalQty;
    cartCount.classList.toggle('visible', totalQty > 0);
    cartCountBig.textContent = `(${totalQty})`;

    // Empty vs filled
    if (cart.length === 0) {
      cartEmpty.classList.remove('hidden');
      cartItemsEl.style.display = 'none';
      cartFoot.classList.add('hidden');
    } else {
      cartEmpty.classList.add('hidden');
      cartItemsEl.style.display = 'flex';
      cartFoot.classList.remove('hidden');
    }

    // Items
    cartItemsEl.innerHTML = cart.map(i => {
      const key = i.cartKey || i.id;
      const colorTag = i.color
        ? `<span class="cart-item-color mono"><span class="cart-color-dot" data-color="${i.color.toLowerCase()}"></span>${i.color}</span>`
        : '';
      const sizeTag = i.size && i.size !== 'ONE SIZE'
        ? `<span class="cart-item-size mono">/ ${i.size}</span>`
        : '';
      return `
      <div class="cart-item" data-key="${key}">
        <div class="cart-item-img" style="background-image:url('${i.img}');">${i.letter}</div>
        <div class="cart-item-info">
          <h4>${i.name}</h4>
          <span class="mono">DROP 04</span>
          <div class="cart-item-variants">${colorTag}${sizeTag}</div>
          <span class="cart-item-price">${fmtPrice(i.price)}</span>
          <div class="cart-item-qty">
            <button class="qty-btn" data-act="dec" data-key="${key}" aria-label="Decrease">−</button>
            <span class="qty-val">${i.qty}</span>
            <button class="qty-btn" data-act="inc" data-key="${key}" aria-label="Increase">+</button>
          </div>
        </div>
        <div class="cart-item-side">
          <button class="cart-item-remove" data-act="rm" data-key="${key}" aria-label="Remove">×</button>
          <span class="cart-item-price">${fmtPrice(i.price * i.qty)}</span>
        </div>
      </div>
    `}).join('');

    // Bind item buttons
    cartItemsEl.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const act = btn.dataset.act;
        if (act === 'inc') updateQty(key, 1);
        else if (act === 'dec') updateQty(key, -1);
        else if (act === 'rm') removeFromCart(key);
      });
    });

    cartSubtotal.textContent = fmtPrice(subtotal);
    cartTotal.textContent = fmtPrice(subtotal);
  }

  /* ================================================
     LIVE DROP CATALOG (loaded from Stripe)
     ================================================ */
  const dropRail = document.getElementById('dropRail');
  const COLOR_CLASSES = ['drop-card-lime', 'drop-card-pink', 'drop-card-orange', 'drop-card-cyan', 'drop-card-purple'];

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderDrops() {
    if (!dropRail) return;
    if (CATALOG.length === 0) {
      dropRail.innerHTML = `<div class="drop-loading mono">${escapeHtml(i18n('dyn.noDrops', 'NO DROPS AVAILABLE — CHECK BACK SOON'))}</div>`;
      return;
    }
    dropRail.innerHTML = CATALOG.map((p, idx) => {
      const colorClass = `drop-card-${p.color}`;
      const num = `N° ${p.number}`;
      const priceStr = fmtPrice(p.price / 100);
      const letter = (p.name || '?').charAt(0).toUpperCase();
      const imgStyle = p.image ? `style="background-image:url('${escapeHtml(p.image)}');"` : '';
      const soldOutTxt = escapeHtml(i18n('dyn.soldOut', 'SOLD OUT'));
      const availableTxt = escapeHtml(i18n('dyn.available', 'AVAILABLE'));
      const addTxt = escapeHtml(i18n('dyn.add', '+ ADD'));
      const statusBadge = p.soldOut
        ? `<span class="drop-card-status sold">${soldOutTxt}</span>`
        : `<span class="drop-card-status live">${availableTxt}</span>`;
      const button = p.soldOut
        ? `<button class="add-cart-btn" data-add="${escapeHtml(p.id)}" disabled>${soldOutTxt}</button>`
        : `<button class="add-cart-btn" data-add="${escapeHtml(p.id)}">${addTxt}</button>`;
      return `
        <article class="drop-card ${colorClass}" data-id="${escapeHtml(p.id)}">
          <div class="drop-card-img" ${imgStyle}>
            <span class="drop-card-num mono">${escapeHtml(num)}</span>
            <div class="drop-card-img-inner"><span class="drop-letter">${escapeHtml(letter)}</span></div>
            ${statusBadge}
          </div>
          <div class="drop-card-info">
            <h3>${escapeHtml(p.name)}</h3>
            <p class="mono">${escapeHtml(p.subtitle || 'DROP 04')}</p>
            <div class="drop-card-row">
              <span class="drop-card-price">${priceStr}</span>
              ${button}
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Bind add-to-cart buttons
    dropRail.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (btn.disabled) return;
        addToCart(btn.dataset.add);
        openCart();
      });
    });

    // Click on the card itself opens the quick-view modal
    dropRail.querySelectorAll('.drop-card').forEach(card => {
      card.addEventListener('click', () => {
        openProductModal(card.dataset.id);
      });
    });

    // Re-attach hover targets to custom cursor
    dropRail.querySelectorAll('.drop-card, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // Preload images so the letter placeholder hides when ready
    dropRail.querySelectorAll('.drop-card').forEach(card => {
      const url = CATALOG.find(c => c.id === card.dataset.id)?.image;
      if (!url) return;
      const img = new Image();
      img.onload = () => card.setAttribute('data-img-loaded', 'true');
      img.src = url;
    });
  }

  async function loadCatalog() {
    try {
      const resp = await fetch('/api/list-products');
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to load catalog');
      CATALOG = data.products || [];
      // Drop any cart items that no longer match a real product
      const validIds = new Set(CATALOG.map(p => p.id));
      const before = cart.length;
      cart = cart.filter(i => validIds.has(i.id));
      if (cart.length !== before) saveCart();
      renderDrops();
      renderCart();
    } catch (err) {
      console.error('[YUKIA] Catalog load failed:', err);
      if (dropRail) {
        dropRail.innerHTML = `<div class="drop-loading mono">${escapeHtml(i18n('dyn.loadFail', 'COULD NOT LOAD DROPS'))} — ${escapeHtml(err.message)}</div>`;
      }
    }
  }
  loadCatalog();

  /* ================================================
     PRODUCT QUICK-VIEW MODAL
     ================================================ */
  const productModal = document.getElementById('productModal');
  const productModalClose = document.getElementById('productModalClose');
  const pmImage = document.getElementById('pmImage');
  const pmImageBackdrop = document.getElementById('pmImageBackdrop');
  const pmName = document.getElementById('pmName');
  const pmNumber = document.getElementById('pmNumber');
  const pmSubtitle = document.getElementById('pmSubtitle');
  const pmPrice = document.getElementById('pmPrice');
  const pmDescription = document.getElementById('pmDescription');
  const pmAdd = document.getElementById('pmAdd');
  const pmPrev = document.getElementById('pmPrev');
  const pmNext = document.getElementById('pmNext');
  const pmThumbs = document.getElementById('pmThumbs');
  const pmColorPicker = document.getElementById('pmColorPicker');
  const pmColorSwatches = document.getElementById('pmColorSwatches');
  const pmColorSelected = document.getElementById('pmColorSelected');
  const pmColorError = document.getElementById('pmColorError');
  const pmSizePicker = document.getElementById('pmSizePicker');
  const pmSizeBtns = document.getElementById('pmSizeBtns');
  const pmSizeSelected = document.getElementById('pmSizeSelected');
  const pmSizeError = document.getElementById('pmSizeError');
  const pmOneSize = document.getElementById('pmOneSize');

  let pmGalleryImages = [];
  let pmGalleryIndex = 0;
  let pmSelectedColor = null;
  let pmSelectedSize = null;

  // Products that have color variants — matched by name substring (case-insensitive)
  const COLOR_VARIANT_PRODUCTS = {
    'dragon zip hoodie':   ['BLACK', 'GREY'],
    'obsidian baggy jogger': ['BLACK', 'GREY'],
  };
  // map display label → swatch data-color
  const COLOR_MAP = { 'BLACK': 'black', 'GREY': 'grey' };

  // Size definitions: products with S/M/L/XL — oos:true = rupture de stock
  const SIZE_VARIANT_PRODUCTS = {
    'dragon zip hoodie':     [
      { label: 'S',  oos: false },
      { label: 'M',  oos: false },
      { label: 'L',  oos: true  },
      { label: 'XL', oos: false },
    ],
    'obsidian baggy jogger': [
      { label: 'S',  oos: false },
      { label: 'M',  oos: false },
      { label: 'L',  oos: true  },
      { label: 'XL', oos: false },
    ],
  };

  function getSizes(productName) {
    const lc = (productName || '').toLowerCase();
    for (const [key, sizes] of Object.entries(SIZE_VARIANT_PRODUCTS)) {
      const words = key.split(' ');
      if (lc.includes(words[0]) && lc.includes(words[words.length - 1])) {
        return sizes;
      }
    }
    return null; // null = taille unique
  }

  function renderSizePicker(sizes) {
    pmSelectedSize = null;
    pmSizeSelected.textContent = '';
    pmSizeError.classList.add('hidden');

    if (sizes === null) {
      // Taille unique — hide size picker, show one-size tag, auto-select
      pmSizePicker.classList.add('hidden');
      pmOneSize.classList.remove('hidden');
      // Apply i18n to the tag right away
      const tag = pmOneSize.querySelector('[data-i18n="pm.oneSize"]');
      if (tag) tag.textContent = i18n('pm.oneSize', 'TAILLE UNIQUE');
      pmSelectedSize = 'ONE SIZE';
      return;
    }

    pmOneSize.classList.add('hidden');
    pmSizePicker.classList.remove('hidden');
    pmSizeBtns.innerHTML = sizes.map(s => {
      const oosLabel = i18n('pm.outOfStock', 'OOS');
      return `<button
        class="pm-size-btn mono${s.oos ? ' is-oos' : ''}"
        data-size="${s.label}"
        ${s.oos ? 'disabled aria-disabled="true"' : ''}
        title="${s.oos ? oosLabel : s.label}"
        aria-label="${s.label}${s.oos ? ' — ' + oosLabel : ''}"
      >${s.label}${s.oos ? `<span class="pm-size-oos-badge">${oosLabel}</span>` : ''}</button>`;
    }).join('');

    pmSizeBtns.querySelectorAll('.pm-size-btn:not(.is-oos)').forEach(btn => {
      btn.addEventListener('click', () => {
        pmSizeBtns.querySelectorAll('.pm-size-btn').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        pmSelectedSize = btn.dataset.size;
        pmSizeSelected.textContent = pmSelectedSize;
        pmSizeError.classList.add('hidden');
      });
    });
  }

  function getVariants(productName) {
    const lc = (productName || '').toLowerCase();
    for (const [key, colors] of Object.entries(COLOR_VARIANT_PRODUCTS)) {
      if (lc.includes(key.split(' ')[0]) && lc.includes(key.split(' ')[key.split(' ').length - 1])) {
        return colors;
      }
    }
    return null;
  }

  function renderColorPicker(variants) {
    pmSelectedColor = null;
    pmColorSelected.textContent = '';
    pmColorError.classList.add('hidden');
    if (!variants || variants.length === 0) {
      pmColorPicker.classList.add('hidden');
      pmColorSwatches.innerHTML = '';
      return;
    }
    pmColorPicker.classList.remove('hidden');
    pmColorSwatches.innerHTML = variants.map(v =>
      `<button class="pm-swatch" data-color="${COLOR_MAP[v]}" data-label="${v}" title="${v}" aria-label="${v}"></button>`
    ).join('');
    pmColorSwatches.querySelectorAll('.pm-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        pmColorSwatches.querySelectorAll('.pm-swatch').forEach(s => s.classList.remove('is-selected'));
        sw.classList.add('is-selected');
        pmSelectedColor = sw.dataset.label;
        pmColorSelected.textContent = pmSelectedColor;
        pmColorError.classList.add('hidden');
      });
    });
  }

  function pmShowImage(idx) {
    if (pmGalleryImages.length === 0) {
      pmImage.style.backgroundImage = '';
      pmImageBackdrop.style.backgroundImage = '';
      return;
    }
    pmGalleryIndex = (idx + pmGalleryImages.length) % pmGalleryImages.length;
    const url = pmGalleryImages[pmGalleryIndex];
    pmImage.style.backgroundImage = `url('${url}')`;
    pmImageBackdrop.style.backgroundImage = `url('${url}')`;
    pmThumbs.querySelectorAll('.pm-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === pmGalleryIndex);
    });
  }

  function openProductModal(id) {
    const p = CATALOG.find(x => x.id === id);
    if (!p) return;
    pmName.textContent = p.name;
    pmNumber.textContent = `N° ${p.number}`;
    pmSubtitle.textContent = p.subtitle || 'DROP 04';
    pmPrice.textContent = fmtPrice(p.price / 100);
    pmDescription.textContent = p.description || '';
    pmDescription.style.display = p.description ? '' : 'none';

    // Color variants
    const variants = getVariants(p.name);
    renderColorPicker(variants);

    // Size variants
    const sizes = getSizes(p.name);
    renderSizePicker(sizes);

    // Gallery
    pmGalleryImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : []);
    pmThumbs.innerHTML = pmGalleryImages.length > 1
      ? pmGalleryImages.map((url, i) => `<button class="pm-thumb" data-idx="${i}" style="background-image:url('${url}')" aria-label="Image ${i + 1}"></button>`).join('')
      : '';
    pmThumbs.querySelectorAll('.pm-thumb').forEach(t => {
      t.addEventListener('click', () => pmShowImage(parseInt(t.dataset.idx, 10)));
    });
    const showNav = pmGalleryImages.length > 1;
    pmPrev.classList.toggle('hidden', !showNav);
    pmNext.classList.toggle('hidden', !showNav);
    pmShowImage(0);

    if (p.soldOut) {
      pmAdd.disabled = true;
      pmAdd.querySelector('span').textContent = i18n('pm.soldOut', 'SOLD OUT');
    } else {
      pmAdd.disabled = false;
      pmAdd.querySelector('span').textContent = i18n('pm.add', '+ ADD TO BAG');
      pmAdd.onclick = () => {
        // Require color if this product has color variants
        if (getVariants(p.name) && !pmSelectedColor) {
          pmColorError.classList.add('hidden');
          requestAnimationFrame(() => pmColorError.classList.remove('hidden'));
          pmColorPicker.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }
        // Require size if this product has size variants (getSizes !== null means real sizes, not one-size)
        if (getSizes(p.name) !== null && !pmSelectedSize) {
          pmSizeError.classList.add('hidden');
          requestAnimationFrame(() => pmSizeError.classList.remove('hidden'));
          pmSizePicker.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }
        addToCart(p.id, pmSelectedColor, pmSelectedSize);
        closeProductModal();
        openCart();
      };
    }
    productModal.classList.add('open');
    productModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  pmPrev.addEventListener('click', () => pmShowImage(pmGalleryIndex - 1));
  pmNext.addEventListener('click', () => pmShowImage(pmGalleryIndex + 1));

  function closeProductModal() {
    productModal.classList.remove('open');
    productModal.setAttribute('aria-hidden', 'true');
    if (!cartPanel.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  productModalClose.addEventListener('click', closeProductModal);
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });
  document.addEventListener('keydown', (e) => {
    if (!productModal.classList.contains('open')) return;
    if (e.key === 'Escape') closeProductModal();
    else if (e.key === 'ArrowLeft' && pmGalleryImages.length > 1) pmShowImage(pmGalleryIndex - 1);
    else if (e.key === 'ArrowRight' && pmGalleryImages.length > 1) pmShowImage(pmGalleryIndex + 1);
  });

  function openCart() {
    cartPanel.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  emptyShopBtn?.addEventListener('click', () => {
    closeCart();
    document.querySelector('#drops')?.scrollIntoView({ behavior: 'smooth' });
  });

  /* ================================================
     STRIPE CHECKOUT (TEST MODE)
     ================================================ */
  const STRIPE_PK = 'pk_live_51TKKKVJvIpHNFex2tusz21fiXisOOQO0F32ExAYrT1Tt1c5YoqqoG98LuA7mlPKGIgk6gFhxQU66bHW2Cap1JEkE00Ri0Ko4Mx';
  let stripe = null;
  let stripeCard = null;
  let stripeElements = null;

  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutSummary = document.getElementById('checkoutSummary');
  const checkoutSuccess = document.getElementById('checkoutSuccess');
  const successClose = document.getElementById('successClose');
  const cardError = document.getElementById('cardError');
  const payBtn = document.getElementById('payBtn');
  const payBtnAmount = document.getElementById('payBtnAmount');

  function initStripe() {
    if (stripe || typeof Stripe === 'undefined') return;
    stripe = Stripe(STRIPE_PK);
    stripeElements = stripe.elements();
    stripeCard = stripeElements.create('card', {
      style: {
        base: {
          color: '#ffffff',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '14px',
          fontSmoothing: 'antialiased',
          '::placeholder': { color: 'rgba(255,255,255,0.4)' }
        },
        invalid: { color: '#ff5470', iconColor: '#ff5470' }
      }
    });
    stripeCard.mount('#stripeCardEl');
    stripeCard.on('change', (e) => {
      cardError.textContent = e.error ? e.error.message : '';
    });
  }

  function renderCheckoutSummary() {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    checkoutSummary.innerHTML = `
      <div class="cs-list">
        ${cart.map(i => `
          <div class="cs-row">
            <span class="cs-name">${i.name} <span class="mono">×${i.qty}</span></span>
            <span class="cs-price">${fmtPrice(i.price * i.qty)}</span>
          </div>
        `).join('')}
      </div>
      <div class="cs-total">
        <span class="mono">${escapeHtml(i18n('dyn.total', 'TOTAL'))}</span>
        <span>${fmtPrice(subtotal)}</span>
      </div>
    `;
    payBtnAmount.textContent = fmtPrice(subtotal);
    return subtotal;
  }

  // Checkout modal open/close
  cartCheckout.addEventListener('click', () => {
    if (cart.length === 0) return;
    checkoutForm.classList.remove('hidden');
    checkoutSuccess.classList.add('hidden');
    renderCheckoutSummary();
    checkoutModal.classList.add('open');
    initStripe();
  });
  checkoutClose.addEventListener('click', () => {
    checkoutModal.classList.remove('open');
  });
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) checkoutModal.classList.remove('open');
  });

  // Submit handler — calls our Netlify Function to create a PaymentIntent on the
  // server (using the secret key from env vars), then confirms the card with Stripe.js.
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!stripe || !stripeCard) return;
    const formData = new FormData(checkoutForm);
    const customer = {
      name: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
      city: formData.get('city'),
      zip: formData.get('zip'),
    };
    payBtn.disabled = true;
    payBtn.classList.add('loading');
    cardError.textContent = '';

    try {
      // 1. Ask the server to create a PaymentIntent for our cart.
      const resp = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ id: i.id, qty: i.qty })),
          customer,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.clientSecret) {
        throw new Error(data.error || 'Could not start payment.');
      }

      // 2. Confirm the card payment with the client_secret.
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: stripeCard,
          billing_details: {
            name: customer.name,
            email: customer.email,
            address: {
              line1: customer.address,
              city: customer.city,
              postal_code: customer.zip,
              country: 'FR',
            },
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        checkoutForm.classList.add('hidden');
        checkoutSuccess.classList.remove('hidden');
        cart = [];
        saveCart();
        renderCart();
      } else {
        throw new Error('Payment did not complete. Status: ' + (result.paymentIntent?.status || 'unknown'));
      }
    } catch (err) {
      cardError.textContent = err.message;
    } finally {
      payBtn.disabled = false;
      payBtn.classList.remove('loading');
    }
  });

  successClose?.addEventListener('click', () => {
    checkoutModal.classList.remove('open');
    closeCart();
  });

  // Escape key closes panels
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (checkoutModal.classList.contains('open')) checkoutModal.classList.remove('open');
      else if (cartPanel.classList.contains('open')) closeCart();
    }
  });

  renderCart();

  /* -------- LIVE LANGUAGE SWAPPING -------- */
  document.addEventListener('yukia:langchange', () => {
    // Re-render dynamic surfaces so newly-translated strings appear immediately
    renderCart();
    if (CATALOG.length > 0) renderDrops();
    // If product modal is open, refresh its action label
    if (productModal.classList.contains('open')) {
      const span = pmAdd.querySelector('span');
      if (span) {
        span.textContent = pmAdd.disabled
          ? i18n('pm.soldOut', 'SOLD OUT')
          : i18n('pm.add', '+ ADD TO BAG');
      }
    }
    // If checkout summary is visible, refresh its TOTAL row
    if (checkoutModal.classList.contains('open') && !checkoutForm.classList.contains('hidden')) {
      renderCheckoutSummary();
    }
  });

  /* -------- DROP RAIL HORIZONTAL SCROLL WITH WHEEL -------- */
  const rail = document.querySelector('.drop-rail');
  if (rail && window.matchMedia('(pointer: fine)').matches) {
    rail.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const rect = rail.getBoundingClientRect();
        const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (fullyVisible) {
          const maxScroll = rail.scrollWidth - rail.clientWidth;
          const scrollingRight = e.deltaY > 0;
          const scrollingLeft  = e.deltaY < 0;
          // Only intercept if there is still horizontal content to scroll through
          const canScrollRight = scrollingRight && rail.scrollLeft < maxScroll - 1;
          const canScrollLeft  = scrollingLeft  && rail.scrollLeft > 1;
          if (canScrollRight || canScrollLeft) {
            e.preventDefault();
            rail.scrollLeft += e.deltaY;
          }
          // Otherwise fall through → browser scrolls the page naturally
        }
      }
    }, { passive: false });
  }

})();
