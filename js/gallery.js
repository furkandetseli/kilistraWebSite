/**
 * KILISTRA — gallery.js
 * Masonry gallery with filter + lightbox
 */

'use strict';

let galleryItems = [];
let currentIndex = 0;

function initGallery(items) {
  galleryItems = items;
  renderGalleryGrid(items);
  initLightbox();
}

function renderGalleryGrid(items) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  grid.innerHTML = items.map((item, index) => `
    <div
      class="gallery-item"
      data-category="${item.category}"
      data-index="${index}"
      role="button"
      tabindex="0"
      aria-label="${item.alt}"
    >
      <img
        data-src="${item.src}"
        src="${window.KilistraUtils.placeholderSVG(item.alt)}"
        alt="${item.alt}"
        loading="lazy"
      >
      <div class="gallery-item-overlay">
        ${window.KilistraUtils.svgIcon('zoom-in', 28)}
      </div>
      <div class="gallery-caption">${item.caption}</div>
    </div>
  `).join('');

  // Click handlers
  grid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', () => openLightbox(parseInt(el.dataset.index)));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(parseInt(el.dataset.index));
      }
    });
  });

  window.KilistraUtils.initImages();
}

// ── Filter ───────────────────────────────────────────────────
function initFilters(categories, allItems) {
  const container = document.getElementById('gallery-filters');
  if (!container) return;

  container.innerHTML = categories.map(cat => `
    <button
      class="filter-btn ${cat === 'Tümü' ? 'active' : ''}"
      data-filter="${cat}"
    >${cat}</button>
  `).join('');

  container.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const filtered = filter === 'Tümü'
      ? allItems
      : allItems.filter(item => item.category === filter);

    // Update visible items with animation
    const grid = document.getElementById('gallery-grid');
    grid.style.opacity = '0';
    setTimeout(() => {
      renderGalleryGrid(filtered);
      galleryItems = filtered;
      grid.style.opacity = '1';
    }, 200);
  });
}

// ── Lightbox ──────────────────────────────────────────────────
function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  // Close
  lb.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => {
    if (e.target === lb) closeLightbox();
  });

  // Prev / Next
  lb.querySelector('.lightbox-prev')?.addEventListener('click', () => navigateLightbox(-1));
  lb.querySelector('.lightbox-next')?.addEventListener('click', () => navigateLightbox(1));

  // Keyboard
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(index) {
  currentIndex = index;
  updateLightboxImage();
  const lb = document.getElementById('lightbox');
  lb?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb?.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  const item = galleryItems[currentIndex];
  if (!item) return;

  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');

  if (img) {
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = item.src;
      img.alt = item.alt;
      img.onload = () => { img.style.opacity = '1'; };
      img.onerror = () => {
        img.src = window.KilistraUtils.placeholderSVG(item.alt);
        img.style.opacity = '1';
      };
    }, 150);
  }

  if (caption) {
    caption.textContent = item.caption;
  }

  // Counter
  const counter = document.getElementById('lightbox-counter');
  if (counter) {
    counter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
  }
}

window.KilistraGallery = { initGallery, initFilters };
