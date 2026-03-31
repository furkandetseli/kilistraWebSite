/**
 * KILISTRA — map.js
 * Leaflet.js interactive map for kesfet and iletisim pages
 */

'use strict';

function initExploreMap(mapData, places) {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map('map', {
    center: [mapData.center_lat, mapData.center_lng],
    zoom: mapData.zoom,
    zoomControl: true,
    attributionControl: true,
  });

  // Dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  // Custom marker icon
  function createIcon(color = '#C9A84C') {
    return L.divIcon({
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: rgba(255,255,255,0.9);
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -36],
    });
  }

  const categoryColors = {
    'Dini Yapı':     '#C9A84C',
    'Antik Yol':     '#8B5E3C',
    'Savunma Yapısı':'#6B8E6B',
    'Altyapı':       '#5B7FA8',
    'default':       '#C9A84C',
  };

  const markers = {};

  places.forEach(place => {
    if (!place.lat || !place.lng) return;

    const color = categoryColors[place.category] || categoryColors.default;
    const marker = L.marker([place.lat, place.lng], { icon: createIcon(color) });

    const popup = L.popup({
      maxWidth: 240,
      className: 'kilistra-popup',
    }).setContent(`
      <div class="map-popup">
        <h4>${place.name}</h4>
        <span style="
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #C9A84C;
          display: block;
          margin-bottom: 6px;
        ">${place.category}</span>
        <p>${place.description.substring(0, 100)}…</p>
        <a href="#${place.id}" onclick="document.getElementById('${place.id}')?.scrollIntoView({behavior:'smooth'});return false;">
          Detayları gör →
        </a>
      </div>
    `);

    marker.bindPopup(popup);
    marker.addTo(map);
    markers[place.id] = marker;
  });

  // Highlight place on card hover
  document.querySelectorAll('.place-card').forEach(card => {
    const id = card.dataset.placeId;
    if (!id || !markers[id]) return;

    card.addEventListener('mouseenter', () => {
      markers[id].openPopup();
      map.setView(markers[id].getLatLng(), Math.max(map.getZoom(), 16), { animate: true });
    });
  });

  return map;
}

function initContactMap(lat, lng, zoom = 13) {
  const mapEl = document.getElementById('contact-map');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map('contact-map', {
    center: [lat, lng],
    zoom,
    zoomControl: false,
    scrollWheelZoom: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  const icon = L.divIcon({
    html: `<div style="width:16px;height:16px;background:#C9A84C;border-radius:50%;border:3px solid rgba(201,168,76,0.3);box-shadow:0 0 0 6px rgba(201,168,76,0.1);"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  L.marker([lat, lng], { icon })
    .addTo(map)
    .bindPopup('<div class="map-popup"><h4>Kilistra Antik Kenti</h4><p>Gökyurt Köyü, Meram, Konya</p></div>')
    .openPopup();

  return map;
}

window.KilistraMap = { initExploreMap, initContactMap };
