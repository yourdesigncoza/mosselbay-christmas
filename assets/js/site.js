/* Page behaviour: photo gallery, availability calendar, area map and places list. */
(function () {
  const S = window.SITE;
  const { DAY, season, isBooked, addDays, fmt } = window.Stay;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  /* ---------- Gallery + lightbox ---------- */
  const photoSrc = (p, w) => `assets/img/photos/${p.src}-${w}.webp`;
  const gallery = $('[data-gallery]');
  gallery.innerHTML = S.photos.map((p, i) => `
    <li class="${p.wide ? 'wide' : ''}">
      <button type="button" data-open="${i}" aria-label="Open photo: ${esc(p.caption)}">
        <img src="${photoSrc(p, 800)}" srcset="${photoSrc(p, 800)} 800w, ${photoSrc(p, 1600)} 1600w"
             sizes="(min-width: 900px) ${p.wide ? '50vw' : '25vw'}, ${p.wide ? '100vw' : '50vw'}"
             alt="${esc(p.caption)}" loading="lazy" decoding="async">
      </button>
    </li>`).join('');

  const lb = $('[data-lightbox]');
  const lbImg = $('[data-lb-img]', lb);
  let current = 0;
  function show(i) {
    current = (i + S.photos.length) % S.photos.length;
    const p = S.photos[current];
    lbImg.src = photoSrc(p, 1600);
    lbImg.alt = p.caption;
    $('[data-lb-caption]', lb).textContent = p.caption;
    $('[data-lb-count]', lb).textContent = `${current + 1} / ${S.photos.length}`;
  }
  gallery.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (!btn) return;
    show(+btn.dataset.open);
    lb.showModal();
  });
  $('[data-lb-prev]', lb).addEventListener('click', () => show(current - 1));
  $('[data-lb-next]', lb).addEventListener('click', () => show(current + 1));
  $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  let touchX = null;
  lb.addEventListener('pointerdown', (e) => { touchX = e.clientX; });
  lb.addEventListener('pointerup', (e) => {
    if (touchX === null) return;
    const dx = e.clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });

  /* ---------- Availability calendar: display only, guests send their own dates ---------- */
  const mondayOf = (t) => addDays(t, -((new Date(t).getUTCDay() + 6) % 7));
  const gridStart = mondayOf(season.start);
  const gridEnd = addDays(mondayOf(season.end), 6);
  let cells = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<span class="dow">${d}</span>`).join('');
  for (let t = gridStart; t <= gridEnd; t += DAY) {
    const d = new Date(t);
    const month = t === gridStart || d.getUTCDate() === 1 ? `<small>${fmt(t).split(' ')[1]}</small>` : '';
    const kind = t < season.start || t > season.end ? 'out' : isBooked(t) ? 'booked' : 'open';
    cells += `<span class="day ${kind}">${month}<span>${d.getUTCDate()}</span>${kind === 'booked' ? '<span class="sr-only"> booked</span>' : ''}</span>`;
  }
  $('[data-cal]').innerHTML = cells;

  /* ---------- Map + places ---------- */
  const mapsUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  $('[data-places]').innerHTML = S.places.map((p) => `
    <li class="place" id="place-${p.id}">
      <div class="place-head">
        <i class="dot dot-${p.kind}" aria-hidden="true"></i>
        <h3>${esc(p.name)}</h3>
        <span class="place-dist">${p.km} km · ${p.drive} min drive</span>
      </div>
      <p>${esc(p.about)}</p>
      ${p.picks ? `<ul class="picks">${p.picks.map((k) => `<li><strong>${esc(k.name)}</strong> ${esc(k.note)}</li>`).join('')}</ul>` : ''}
      <a class="place-link" href="${mapsUrl(p.query)}" target="_blank" rel="noopener">Open in Google Maps</a>
    </li>`).join('');

  const LABEL = { n: [0, -22, 'middle'], s: [0, 40, 'middle'], e: [20, 9, 'start'], w: [-20, 9, 'end'] };
  const EDGE = { x: 18, top: 46, bottom: 22 }; // keeps edge arrows and their labels inside the frame

  function drawPins(svg) {
    const [W, Sth, E, N] = svg.dataset.bbox.split(',').map(Number);
    const { width, height } = svg.viewBox.baseVal;
    const project = (p) => [(p.lng - W) * width / (E - W), (N - p.lat) * height / (N - Sth)];
    const label = (text, side, cls = '') => {
      const [dx, dy, anchor] = LABEL[side];
      return `<text class="pin-label ${cls}" x="${dx}" y="${dy}" text-anchor="${anchor}">${esc(text)}</text>`;
    };

    const pins = S.places.map((p) => {
      const [x, y] = project(p);
      const inside = x >= 0 && x <= width && y >= 0 && y <= height;
      if (inside) {
        return `<a class="pin pin-${p.kind}" href="#place-${p.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
          <circle r="11"/>${label(p.name, p.label)}</a>`;
      }
      // Off the map: an arrow on the nearest edge pointing towards it.
      const cx = Math.max(EDGE.x, Math.min(width - EDGE.x, x));
      const cy = Math.max(EDGE.top, Math.min(height - EDGE.bottom, y));
      const angle = Math.atan2(y - cy, x - cx) * 180 / Math.PI;
      const side = cx <= EDGE.x ? 'e' : cx >= width - EDGE.x ? 'w' : cy <= EDGE.top ? 's' : 'n';
      return `<a class="pin pin-edge pin-${p.kind}" href="#place-${p.id}" transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)})">
        <path d="M14 0 L-8 -11 L-3 0 L-8 11 Z" transform="rotate(${angle.toFixed(0)})"/>
        ${label(`${p.name} · ${p.drive} min`, side)}</a>`;
    });

    const [hx, hy] = project(S.home);
    pins.push(`<g class="pin pin-home" transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)})">
      <path d="M0 -20 L17 -4 V16 H-17 V-4 Z"/><path class="door" d="M-5 16 V5 H5 V16"/>${label(S.home.name, S.home.label, 'home-label')}</g>`);
    $('.pins', svg).innerHTML = pins.join('');
  }

  const mapFrame = $('[data-map]');
  fetch('assets/img/map.svg')
    .then((r) => r.text())
    .then((svg) => { mapFrame.innerHTML = svg; drawPins($('svg', mapFrame)); })
    .catch(() => { mapFrame.textContent = 'The map could not load. The places are listed below.'; });

  /* ---------- Bottom bar on phones: show between the hero and the booking section ---------- */
  const dock = $('[data-dock]');
  const seen = { hero: true, dates: false, contact: false };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { seen[en.target.dataset.watch] = en.isIntersecting; });
    dock.classList.toggle('show', !seen.hero && !seen.dates && !seen.contact);
  });
  [['hero', '.hero'], ['dates', '#dates'], ['contact', '#contact']].forEach(([key, sel]) => {
    const el = $(sel);
    el.dataset.watch = key;
    io.observe(el);
  });
})();
