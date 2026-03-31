/**
 * KILISTRA — main.js
 * Central data loader, navbar/footer injector, shared utilities
 */

'use strict';

// ── Global data store ────────────────────────────────────────
let KilistraData = null;

// ── Load data.json once, then fire page init ─────────────────
async function loadData() {
  try {
    const res = await fetch('data/data.json');
    if (!res.ok) throw new Error('data.json yüklenemedi');
    KilistraData = await res.json();
    return KilistraData;
  } catch (e) {
    console.error('Veri yüklenirken hata:', e);
    return null;
  }
}

// ── Navbar ───────────────────────────────────────────────────
function renderNavbar(data) {
  const currentPage = location.pathname.split('/').pop() || 'index.html';

  const linksHTML = data.nav.links.map(link => {
    const isActive = currentPage === link.href ? 'active' : '';
    return `<a href="${link.href}" class="${isActive}">${link.label}</a>`;
  }).join('');

  const mobileLinksHTML = data.nav.links.map(link => {
    const isActive = currentPage === link.href ? 'active' : '';
    return `<a href="${link.href}" class="${isActive}">${link.label}</a>`;
  }).join('');

  const navbarHTML = `
    <nav id="navbar" class="transparent">
      <div class="container">
        <div class="navbar-inner">
          <a href="index.html" class="navbar-logo">
            <div>
              <span class="navbar-logo-text">Kilistra</span>
              <span class="navbar-logo-sub">Gökyurt Köyü</span>
            </div>
          </a>
          <div class="navbar-links">${linksHTML}</div>
          <button class="navbar-toggle" id="nav-toggle" aria-label="Menüyü aç/kapat">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
    <div class="navbar-mobile" id="nav-mobile">${mobileLinksHTML}</div>
  `;

  const placeholder = document.getElementById('navbar-placeholder');
  if (placeholder) {
    placeholder.outerHTML = navbarHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
  }

  initNavbar();
}

function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('nav-toggle');
  const mobile  = document.getElementById('nav-mobile');

  if (!navbar) return;

  // Scroll behavior
  const heroHeight = document.querySelector('.hero')?.offsetHeight || 300;

  function updateNavbar() {
    const scrolled = window.scrollY > 60;
    navbar.classList.toggle('scrolled', scrolled);
    navbar.classList.toggle('transparent', !scrolled);
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // Mobile toggle
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const isOpen = mobile.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobile.classList.remove('open');
        toggle.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target) && !mobile.contains(e.target)) {
        mobile.classList.remove('open');
        toggle.classList.remove('open');
      }
    });
  }
}

// ── Footer ───────────────────────────────────────────────────
function renderFooter(data) {
  const { footer } = data;

  const linksHTML = footer.links.map(l =>
    `<a href="${l.href}">${l.label}</a>`
  ).join('');

  const footerHTML = `
    <footer id="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="footer-logo">Kilistra</span>
            <span class="footer-tagline">Gökyurt Köyü — Konya</span>
            <p>${footer.description}</p>
          </div>

          <div>
            <p class="footer-col-title">Sayfalar</p>
            <div class="footer-links">${linksHTML}</div>
          </div>

          <div>
            <p class="footer-col-title">Konumu</p>
            <p style="font-size:0.88rem;color:var(--clr-text-muted);line-height:1.7;max-width:22ch;">
              Gökyurt Köyü, Hatunsaray Beldesi<br>Meram, Konya
            </p>
            <a
              href="https://maps.google.com/?q=37.6482,32.3869"
              target="_blank"
              rel="noopener"
              class="btn btn-outline"
              style="margin-top:1rem;font-size:0.7rem;"
            >
              ${svgIcon('map-pin', 14)} Haritada Aç
            </a>
          </div>
        </div>

        <div class="footer-bottom">
          <p>${footer.copyright}</p>
          <p>${footer.credits}</p>
        </div>
      </div>
    </footer>
  `;

  const placeholder = document.getElementById('footer-placeholder');
  if (placeholder) {
    placeholder.outerHTML = footerHTML;
  } else {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }
}

// ── Page loader ──────────────────────────────────────────────
function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 600);
  }
}

// ── Scroll to top button ─────────────────────────────────────
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── AOS init ─────────────────────────────────────────────────
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
    });
  }
}

// ── Image lazy loading with placeholder fallback ─────────────
function initImages() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImage(img);
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    images.forEach(img => observer.observe(img));
  } else {
    images.forEach(loadImage);
  }
}

function loadImage(img) {
  const src = img.getAttribute('data-src');
  if (!src) return;

  const tempImg = new Image();
  tempImg.onload = () => {
    img.src = src;
    img.removeAttribute('data-src');
    img.closest('.img-placeholder')?.classList.remove('img-placeholder');
  };
  tempImg.onerror = () => {
    img.src = placeholderSVG(img.getAttribute('alt') || '');
    img.removeAttribute('data-src');
  };
  tempImg.src = src;
}

// ── Inline SVG placeholder ────────────────────────────────────
function placeholderSVG(label = '') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <rect width="400" height="300" fill="#252018"/>
    <rect x="160" y="100" width="80" height="80" rx="4" fill="none" stroke="#C9A84C" stroke-width="1.5" opacity="0.3"/>
    <circle cx="185" cy="125" r="8" fill="none" stroke="#C9A84C" stroke-width="1.5" opacity="0.3"/>
    <path d="M160 170 L190 140 L215 160 L230 145 L240 155 L240 180Z" fill="#C9A84C" opacity="0.15"/>
    <text x="200" y="220" text-anchor="middle" fill="#5A5040" font-family="serif" font-size="11" letter-spacing="2">${label.substring(0,30)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ── SVG icon helper ───────────────────────────────────────────
function svgIcon(name, size = 18) {
  const icons = {
    'map-pin':     `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    'calendar':    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    'church':      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 22V6l-6-4-6 4v16"/><path d="M2 22h20"/><path d="M12 2v6"/><path d="M9 8h6"/></svg>`,
    'layers':      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    'arrow-right': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    'x':           `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    'chevron-left': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
    'chevron-right':`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
    'chevron-up':   `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
    'zoom-in':     `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
    'route':       `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>`,
    'sun':         `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    'shoe':        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18l2-6 4 3 4-8 4 4 4-3 2 4-16 6z"/></svg>`,
    'droplets':    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
    'smartphone':  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    'info':        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    'clock':       `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    'mail':        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    'phone':       `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.6 4.56 2 2 0 0 1 3.57 2.4h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 17z"/></svg>`,
    'globe':       `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    'star':        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  };
  return icons[name] || icons['info'];
}

// ── Image tag builder (lazy + placeholder) ────────────────────
function imgTag({ src, alt, className = '', style = '' }) {
  if (src) {
    return `<img data-src="${src}" src="${placeholderSVG(alt)}" alt="${alt}" class="${className}" style="${style}" loading="lazy">`;
  }
  return `<img src="${placeholderSVG(alt)}" alt="${alt}" class="${className}" style="${style}">`;
}

// ── Active nav link ───────────────────────────────────────────
function setActiveNav() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#navbar a, #nav-mobile a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === currentPage);
  });
}

// ── Smooth counter animation ──────────────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = el.getAttribute('data-counter');
      const num = parseInt(target.replace(/\D/g, ''), 10);
      const suffix = target.replace(/[\d]/g, '');
      const duration = 1500;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * num) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ── Expose helpers globally ───────────────────────────────────
window.KilistraUtils = {
  svgIcon,
  imgTag,
  placeholderSVG,
  loadData,
  renderNavbar,
  renderFooter,
  initImages,
  initAOS,
  hideLoader,
  initScrollTop,
  animateCounters,
};

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const data = await loadData();
  if (!data) return;

  renderNavbar(data);
  renderFooter(data);
  setActiveNav();
  initScrollTop();
  initAOS();

  // Page-specific init (each page calls its own init)
  if (typeof pageInit === 'function') {
    await pageInit(data);
  }

  initImages();
  animateCounters();
  hideLoader();
});
