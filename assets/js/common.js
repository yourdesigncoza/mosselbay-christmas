/* Shared by the page and the printable card: dates, prices, contact links, and filling
   [data-fill] / [data-link] elements from config.js. */
(function () {
  const S = window.SITE;
  const DAY = 86400000;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const parse = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  const addDays = (t, n) => t + n * DAY;
  // "15 Dec", or "15 December 2026" with { long: true, year: true }.
  const fmt = (t, { weekday = false, year = false, long = false } = {}) => {
    const d = new Date(t);
    const month = MONTHS[d.getUTCMonth()];
    return [weekday && DAYS[d.getUTCDay()], d.getUTCDate(), long ? month : month.slice(0, 3), year && d.getUTCFullYear()]
      .filter(Boolean).join(' ');
  };
  const rand = (n) => 'R' + n.toLocaleString('en-ZA').replace(/,/g, ' ');

  const rates = [...S.rates].sort((a, b) => b.minNights - a.minNights);
  const minNights = rates[rates.length - 1].minNights;
  const maxNights = S.season.maxNights;
  // "12–13 nights" or "14 nights": a rate runs up to the next one, the longest up to maxNights.
  const rateNights = (r) => {
    const hi = (rates[rates.indexOf(r) - 1]?.minNights ?? maxNights + 1) - 1;
    return r.minNights === hi ? `${hi} nights` : `${r.minNights}–${hi} nights`;
  };

  const season = { start: parse(S.season.firstNight), end: parse(S.season.lastCheckOut) };
  const booked = S.booked.map((b) => ({ start: parse(b.from), end: parse(b.to) }));
  // fullyBooked marks every day of the season as booked.
  const isBooked = (t) => Boolean(S.fullyBooked) || booked.some((b) => t >= b.start && t < b.end);
  const year = new Date(season.start).getUTCFullYear();

  const phoneDigits = S.contact.phone.replace(/\D/g, '');
  const intlPhone = '27' + phoneDigits.replace(/^0/, '');
  // Every WhatsApp and email enquiry ends with the reference, so the owner knows where it came from.
  // ?ref=FB-GROUP on the page address overrides the config ref; anything but A-Z, 0-9 and "-" (max 20) is ignored.
  const urlRef = (new URLSearchParams(location.search).get('ref') || '').toUpperCase();
  const ref = /^[A-Z0-9-]{1,20}$/.test(urlRef) ? urlRef : S.contact.ref;
  const withRef = (body) => (ref ? `${body}\n\nRef: ${ref}` : body);
  const links = {
    whatsapp: (text) => `https://wa.me/${intlPhone}?text=${encodeURIComponent(withRef(text))}`,
    email: (subject, body) => `mailto:${S.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(withRef(body))}`,
    tel: () => `tel:+${intlPhone}`,
  };
  // The message every WhatsApp and email link opens with. Once fully booked it no longer asks about dates.
  const generic = () => ({
    subject: `Mossel Bay holiday home, Christmas ${year}`,
    body: S.fullyBooked
      ? 'Hi, I have a question about your Mossel Bay holiday home.'
      : `Hi, I'm interested in your Mossel Bay holiday home for Christmas (${fmt(season.start)} – ${fmt(season.end)}). Which dates are still open?`,
  });

  // Red-ink postmark with the season dates, as franked at the Post Office Tree.
  let stamps = 0;
  function postmark() {
    const id = `pm${++stamps}`;
    const waves = [62, 84, 106, 128, 150].map((y) => `<path d="M8 ${y} q12 -9 24 0 t24 0 t24 0 t24 0 t24 0"/>`).join('');
    return `<svg class="postmark-svg" viewBox="0 0 320 200" aria-hidden="true">
      <g class="pm-waves">${waves}</g>
      <g transform="translate(228 104)">
        <circle class="pm-ring-line" r="86"/><circle class="pm-ring-line pm-thin" r="56"/>
        <path id="${id}t" d="M-67 0 A67 67 0 0 1 67 0" fill="none"/>
        <path id="${id}b" d="M-78 0 A78 78 0 0 0 78 0" fill="none"/>
        <text class="pm-ring"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">Mossel Bay</textPath></text>
        <text class="pm-ring"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">Christmas ${year}</textPath></text>
        <text class="pm-date" y="-8" text-anchor="middle">${fmt(season.start)}</text>
        <text class="pm-to" y="12" text-anchor="middle">to</text>
        <text class="pm-date" y="40" text-anchor="middle">${fmt(season.end)}</text>
      </g>
    </svg>`;
  }

  // rateFrom is the cheapest (longest-stay) price, rateStd the price for the shortest stay. With one rate they match.
  const values = {
    rateFrom: rand(rates[0].perNight),
    rateStd: rand(rates[rates.length - 1].perNight),
    minNights,
    maxNights,
    seasonStart: fmt(season.start, { year: true }),
    seasonEnd: fmt(season.end, { year: true }),
    seasonStartLong: fmt(season.start, { year: true, long: true }),
    seasonEndLong: fmt(season.end, { year: true, long: true }),
    seasonShort: `${fmt(season.start)} – ${fmt(season.end)}`,
    seasonYear: year,
    phone: S.contact.phone,
    email: S.contact.email,
  };

  // Markup may carry fallback text for no-JS visitors and link previews; a stale one is flagged in the console.
  function fill(root = document) {
    root.querySelectorAll('[data-fill]').forEach((el) => {
      const text = String(values[el.dataset.fill]);
      if (el.textContent && el.textContent !== text) console.warn(`Fallback text for ${el.dataset.fill} is "${el.textContent}", config.js gives "${text}"`);
      el.textContent = text;
    });
    root.querySelectorAll('[data-postmark]').forEach((el) => { el.innerHTML = postmark(); });
    root.querySelectorAll('[data-link]').forEach((el) => {
      const kind = el.dataset.link;
      const m = generic();
      el.href = kind === 'email' ? links.email(m.subject, m.body) : kind === 'whatsapp' ? links.whatsapp(m.body) : links.tel();
    });
  }

  // <html class="is-booked"> swaps the [data-when="open"] parts of the page for the [data-when="booked"] ones.
  document.documentElement.classList.toggle('is-booked', Boolean(S.fullyBooked));

  window.Stay = { DAY, parse, addDays, fmt, rand, rates, rateNights, minNights, maxNights, season, isBooked, links, generic, values, fill };
  fill();
})();
