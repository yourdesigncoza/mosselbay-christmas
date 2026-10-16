/* Shared by the page and the printable card: dates, prices, contact links, and filling
   [data-fill] / [data-link] elements from config.js. */
(function () {
  const S = window.SITE;
  const DAY = 86400000;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const parse = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  const addDays = (t, n) => t + n * DAY;
  const nightsBetween = (a, b) => Math.round((b - a) / DAY);
  const fmt = (t, { weekday = false, year = false } = {}) => {
    const d = new Date(t);
    return [weekday && DAYS[d.getUTCDay()], d.getUTCDate(), MONTHS[d.getUTCMonth()], year && d.getUTCFullYear()]
      .filter(Boolean).join(' ');
  };
  const rand = (n) => 'R' + n.toLocaleString('en-ZA').replace(/,/g, ' ');

  const rates = [...S.rates].sort((a, b) => b.minNights - a.minNights);
  const minNights = rates[rates.length - 1].minNights;
  const maxNights = S.season.maxNights;
  const rateFor = (nights) => rates.find((r) => nights >= r.minNights);
  // "12–13 nights" or "14 nights": a rate runs up to the next one, the longest up to maxNights.
  const rateNights = (r) => {
    const hi = (rates[rates.indexOf(r) - 1]?.minNights ?? maxNights + 1) - 1;
    return r.minNights === hi ? `${hi} nights` : `${r.minNights}–${hi} nights`;
  };

  const season = { start: parse(S.season.firstNight), end: parse(S.season.lastCheckOut) };
  const booked = S.booked.map((b) => ({ start: parse(b.from), end: parse(b.to) }));
  const isBooked = (t) => booked.some((b) => t >= b.start && t < b.end);
  const year = new Date(season.start).getUTCFullYear();

  const phoneDigits = S.contact.phone.replace(/\D/g, '');
  const intlPhone = '27' + phoneDigits.replace(/^0/, '');
  const links = {
    whatsapp: (text) => `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`,
    email: (subject, body) => `mailto:${S.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    tel: () => `tel:+${intlPhone}`,
  };
  // The message used when no dates have been picked yet.
  const generic = () => ({
    subject: `Mossel Bay holiday home, Christmas ${year}`,
    body: `Hi, I'm interested in your Mossel Bay holiday home for Christmas (${fmt(season.start)} – ${fmt(season.end)}). Which dates are still open?`,
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

  const values = {
    rateFrom: rand(rates[0].perNight),
    rateLongNights: rateNights(rates[0]),
    rateStd: rand(rates[rates.length - 1].perNight),
    rateStdNights: rateNights(rates[rates.length - 1]),
    minNights,
    maxNights,
    seasonStart: fmt(season.start, { year: true }),
    seasonEnd: fmt(season.end, { year: true }),
    seasonShort: `${fmt(season.start)} – ${fmt(season.end)}`,
    seasonYear: year,
    phone: S.contact.phone,
    email: S.contact.email,
  };

  function fill(root = document) {
    root.querySelectorAll('[data-fill]').forEach((el) => { el.textContent = values[el.dataset.fill]; });
    root.querySelectorAll('[data-postmark]').forEach((el) => { el.innerHTML = postmark(); });
    root.querySelectorAll('[data-link]').forEach((el) => {
      const kind = el.dataset.link;
      const m = generic();
      el.href = kind === 'email' ? links.email(m.subject, m.body) : kind === 'whatsapp' ? links.whatsapp(m.body) : links.tel();
    });
  }

  window.Stay = { DAY, parse, addDays, nightsBetween, fmt, rand, rateFor, rates, minNights, maxNights, season, isBooked, links, generic, values, fill };
  fill();
})();
