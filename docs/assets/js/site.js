/* Peptides for Pets: site behaviour. No dependencies. */
(function () {
  'use strict';

  var PRODUCTS = {
    'dogs-cats': { name: 'Skin & Coat for Dogs & Cats', meta: 'Spray Gel · 30 mL', price: 499, img: 'assets/svg/bottle-30.svg', url: 'skin-coat-dogs-cats.html' },
    'horses': { name: 'Skin & Coat for Horses', meta: 'Spray Gel · 50 mL', price: 749, img: 'assets/svg/bottle-50.svg', url: 'skin-coat-horses.html' }
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rand = function (n) { return 'R' + n.toLocaleString('en-ZA').replace(/ |,/g, ' '); };

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  /* ---------- Toast ---------- */
  var toastEl = $('[data-toast]'), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>' + msg;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add('is-on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
  }

  /* ---------- Drawers ---------- */
  var scrim = $('[data-scrim]'), openDrawer = null, lastFocus = null;
  function open(el) {
    if (!el) return;
    if (openDrawer) close();
    lastFocus = document.activeElement;
    el.hidden = false; scrim.hidden = false;
    requestAnimationFrame(function () { el.classList.add('is-open'); scrim.classList.add('is-open'); });
    openDrawer = el;
    document.body.style.overflow = 'hidden';
    var t = $('[data-menu-open]'); if (el.id === 'menu' && t) t.setAttribute('aria-expanded', 'true');
    setTimeout(function () { var f = el.querySelector('button, a'); if (f) f.focus(); }, 60);
  }
  function close() {
    if (!openDrawer) return;
    var el = openDrawer; openDrawer = null;
    el.classList.remove('is-open'); scrim.classList.remove('is-open');
    document.body.style.overflow = '';
    var t = $('[data-menu-open]'); if (t) t.setAttribute('aria-expanded', 'false');
    setTimeout(function () { el.hidden = true; scrim.hidden = true; }, 380);
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-menu-open]')) open($('#menu'));
    else if (e.target.closest('[data-cart-open]')) { renderCart(); open($('#cart')); }
    else if (e.target.closest('[data-drawer-close]') || e.target === scrim) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  /* ---------- Cart ---------- */
  function getCart() { return store('pfp-cart') || {}; }
  function setCart(c) { store('pfp-cart', c); renderCount(); renderCart(); }
  function renderCount(bump) {
    var n = 0, c = getCart();
    Object.keys(c).forEach(function (k) { n += c[k]; });
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = n; el.hidden = n === 0;
      if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
  }
  function renderCart() {
    var body = $('[data-cart-body]'), foot = $('[data-cart-foot]');
    if (!body) return;
    var c = getCart(), keys = Object.keys(c).filter(function (k) { return PRODUCTS[k] && c[k] > 0; }), total = 0;
    if (!keys.length) {
      body.innerHTML = '<div class="cart__empty"><svg aria-hidden="true"><use href="#i-paw"/></svg><p>Your cart is empty.</p>' +
        '<div class="btn-row"><a class="btn btn--sm" href="skin-coat-dogs-cats.html">For dogs &amp; cats</a><a class="btn btn--sm btn--ghost" href="skin-coat-horses.html">For horses</a></div></div>';
      foot.hidden = true; return;
    }
    foot.hidden = false;
    body.innerHTML = keys.map(function (k) {
      var p = PRODUCTS[k], q = c[k]; total += p.price * q;
      return '<div class="cart-item"><a class="cart-item__img" href="' + p.url + '"><img src="' + p.img + '" alt=""></a>' +
        '<div><p class="cart-item__name">' + p.name.replace('&', '&amp;') + '</p><p class="cart-item__meta">' + p.meta + '</p>' +
        '<div class="qty"><button type="button" data-qty="' + k + '" data-d="-1" aria-label="One less"><svg aria-hidden="true"><use href="#i-minus"/></svg></button>' +
        '<span aria-live="polite">' + q + '</span><button type="button" data-qty="' + k + '" data-d="1" aria-label="One more"><svg aria-hidden="true"><use href="#i-plus"/></svg></button></div></div>' +
        '<div class="cart-item__price">' + rand(p.price * q) + '</div></div>';
    }).join('');
    $('[data-cart-subtotal]').textContent = rand(total);
  }
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-qty]');
    if (q) {
      var c = getCart(), k = q.getAttribute('data-qty');
      c[k] = Math.max(0, (c[k] || 0) + parseInt(q.getAttribute('data-d'), 10));
      if (!c[k]) delete c[k];
      setCart(c); return;
    }
    var add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      var cart = getCart(), id = add.getAttribute('data-add');
      cart[id] = (cart[id] || 0) + 1;
      store('pfp-cart', cart); renderCount(true); renderCart();
      toast('Added: ' + PRODUCTS[id].name.replace('&', '&amp;'));
      if (window.matchMedia('(min-width: 900px)').matches) setTimeout(function () { open($('#cart')); }, 250);
    }
  });
  var checkout = $('[data-checkout]');
  if (checkout) checkout.addEventListener('click', function () { store('pfp-cart', {}); });
  renderCount();

  /* ---------- Header: slim on scroll ---------- */
  var header = $('[data-header]');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      header.classList.toggle('is-compact', y > 140);
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
    onScroll();
  }

  /* ---------- Review notes toggle ---------- */
  var nt = $('[data-notes-toggle]');
  function syncNotes() {
    var off = document.documentElement.classList.contains('hide-notes');
    if (nt) { nt.setAttribute('aria-pressed', String(!off)); nt.querySelector('strong').textContent = off ? 'off' : 'on'; }
  }
  if (nt) nt.addEventListener('click', function () {
    var off = document.documentElement.classList.toggle('hide-notes');
    try { localStorage.setItem('pfp-notes', off ? 'off' : 'on'); } catch (e) {}
    syncNotes();
    toast(off ? 'Review notes hidden' : 'Review notes shown');
  });
  syncNotes();

  /* ---------- FAQ numbering: runs 1, 2, 3… with no gaps, even when unapproved questions are hidden ---------- */
  function renumber() {
    $$('[data-numbered]').forEach(function (list) {
      var n = 0;
      $$('.acc', list).forEach(function (d) {
        var el = $('.acc__n', d);
        if (el && d.offsetParent !== null) el.textContent = (++n) + '.';
      });
    });
  }
  renumber();
  if (nt) nt.addEventListener('click', renumber);

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('is-in'); });

  /* ---------- Accordions: one open at a time where asked ---------- */
  $$('[data-accordion-single]').forEach(function (group) {
    group.addEventListener('toggle', function (e) {
      if (e.target.open) $$('details', group).forEach(function (d) { if (d !== e.target) d.open = false; });
    }, true);
  });

  /* Footer columns become accordions on mobile */
  var mq = window.matchMedia('(min-width: 900px)');
  function footerCols() { $$('.footer__col').forEach(function (d) { d.open = mq.matches; }); }
  footerCols();
  if (mq.addEventListener) mq.addEventListener('change', footerCols);

  /* ---------- Product gallery ---------- */
  $$('[data-gallery]').forEach(function (g) {
    var main = $('.gallery__main img', g);
    $$('.gallery__thumbs button', g).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.gallery__thumbs button', g).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var img = $('img', b);
        main.style.opacity = 0;
        setTimeout(function () {
          main.src = img.getAttribute('data-full') || img.src;
          main.alt = img.getAttribute('data-alt') || '';
          main.className = img.className;
          main.style.opacity = 1;
        }, 180);
      });
    });
  });

  /* ---------- Sticky Add to cart bar (mobile product pages) ---------- */
  var sticky = $('[data-sticky-buy]'), buy = $('[data-buy-main]');
  if (sticky && buy && 'IntersectionObserver' in window) {
    document.body.classList.add('has-sticky-buy');
    new IntersectionObserver(function (en) {
      var past = !en[0].isIntersecting && en[0].boundingClientRect.top < 0;
      sticky.classList.toggle('is-on', past);
    }).observe(buy);
  }

  /* ---------- Forms (demo only: nothing is sent) ---------- */
  $$('[data-signup]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); $('.signup__ok', f).hidden = false; f.reset(); });
  });
  $$('[data-demo-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = $('[data-form-ok]', f.parentNode); if (ok) { ok.hidden = false; ok.focus(); }
      f.hidden = true;
    });
  });
})();
