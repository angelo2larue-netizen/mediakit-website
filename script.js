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

  function getProductData(id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (!card) return null;
    return {
      id,
      name: card.dataset.name,
      price: parseFloat(card.dataset.price),
      img: card.dataset.img,
      letter: card.querySelector('.drop-letter')?.textContent || '?'
    };
  }

  function addToCart(id) {
    const data = getProductData(id);
    if (!data) return;
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...data, qty: 1 });
    }
    saveCart();
    renderCart();
    showToast(`+ ${data.name} ADDED`);
    bumpCartIcon();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  }

  function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(id);
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
    cartItemsEl.innerHTML = cart.map(i => `
      <div class="cart-item" data-id="${i.id}">
        <div class="cart-item-img" style="background-image:url('${i.img}');">${i.letter}</div>
        <div class="cart-item-info">
          <h4>${i.name}</h4>
          <span class="mono">DROP 04</span>
          <span class="cart-item-price">€${i.price}</span>
          <div class="cart-item-qty">
            <button class="qty-btn" data-act="dec" data-id="${i.id}" aria-label="Decrease">−</button>
            <span class="qty-val">${i.qty}</span>
            <button class="qty-btn" data-act="inc" data-id="${i.id}" aria-label="Increase">+</button>
          </div>
        </div>
        <div class="cart-item-side">
          <button class="cart-item-remove" data-act="rm" data-id="${i.id}" aria-label="Remove">×</button>
          <span class="cart-item-price">€${(i.price * i.qty).toFixed(0)}</span>
        </div>
      </div>
    `).join('');

    // Bind item buttons
    cartItemsEl.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if (act === 'inc') updateQty(id, 1);
        else if (act === 'dec') updateQty(id, -1);
        else if (act === 'rm') removeFromCart(id);
      });
    });

    cartSubtotal.textContent = `€${subtotal.toFixed(0)}`;
    cartTotal.textContent = `€${subtotal.toFixed(0)}`;
  }

  // Add-to-cart buttons on product cards
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.disabled) return;
      addToCart(btn.dataset.add);
      openCart();
    });
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
  const STRIPE_PK = 'pk_test_51TKKKVJvIpHNFex25QD9j65dachkXfJDvPYBbPYX037JRT9Pj0CggeG5PRdwY8q7n2KKuaZPgaRNK2XhpCbCGFz900LFSMJYwq';
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
            <span class="cs-price">€${(i.price * i.qty).toFixed(0)}</span>
          </div>
        `).join('')}
      </div>
      <div class="cs-total">
        <span class="mono">TOTAL</span>
        <span>€${subtotal.toFixed(0)}</span>
      </div>
    `;
    payBtnAmount.textContent = `€${subtotal.toFixed(0)}`;
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
      const resp = await fetch('/.netlify/functions/create-payment-intent', {
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

  // Detect product image load (so we can hide the letter placeholder when real image loads)
  document.querySelectorAll('.drop-card').forEach(card => {
    const url = card.dataset.img;
    if (!url) return;
    const img = new Image();
    img.onload = () => card.setAttribute('data-img-loaded', 'true');
    img.src = url;
  });

  renderCart();

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
