# Mossel Bay Christmas holiday let

A one-page site for letting the house over Christmas 2026, plus a printable A6 card with a QR code that links to it.

- Page: `index.html` → https://yourdesigncoza.github.io/mosselbay-christmas/
- Card: `card.html` (one A6 card) and `card.html?sheet=a4` (four on A4). Ready-made PDFs are in `print/`.

## Changing dates, prices or bookings

Everything is in `assets/js/config.js`. The page and the card both read it.

- **Season:** `season.firstNight` (first arrival day), `season.lastCheckOut` (the day guests must leave by) and `season.maxNights` (the longest stay).
- **Rates:** each entry is "from this many nights, this price per night", up to the next entry (the last one up to `season.maxNights`). The smallest `minNights` is the minimum stay.
- **Bookings:** add `{ from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }` (arrival day, departure day) to `booked`. Those nights show as booked. When no arrival day is left, the page says Christmas is fully booked.
- **Contact:** `contact.phone` (the WhatsApp and call links are built from this) and `contact.email`.
- **Photos and places:** `photos` sets the gallery order and captions. `places` sets the map pins and the list under the map.

Commit and push. GitHub Pages updates within a minute or two.

## Rebuilding generated files

Run these from the project root:

| What | Command | When |
|---|---|---|
| Web photos + `og.jpg` | `python3 tools/build_images.py` | after changing the photo choice (raw photos in `images_raw/`, not in git) |
| Base map | `python3 tools/build_map.py` | rarely; data in `tools/data/` |
| QR code | `python3 tools/build_qr.py` (needs `pip install segno`) | if the site address changes |
| Card PDFs | `./tools/build_card.sh` (needs Google Chrome) | after changing the card, config or QR |

The QR code encodes the `og:url` in `index.html`, so that's the one place the address lives.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/. The map is loaded with `fetch`, so it won't appear if you open the file directly from disk.

Map data © OpenStreetMap contributors (ODbL).
