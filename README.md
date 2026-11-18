# Mossel Bay Christmas holiday let

A one-page site for letting the house over Christmas 2026, plus a printable A6 card with a QR code that links to it.

- Page: `index.html` → https://yourdesigncoza.github.io/mosselbay-christmas/
- Card: `card.html` (one A6 card) and `card.html?sheet=a4` (four on A4). Ready-made files are in `print/`: `kliper.pdf` (A6), `kliper.png` (the same card as an image for WhatsApp and social media) and `card-a4.pdf` (four to cut out).

## Changing dates, prices or bookings

Everything is in `assets/js/config.js`. The page and the card both read it.

- **Season:** `season.firstNight` (first arrival day), `season.lastCheckOut` (the day guests must leave by) and `season.maxNights` (the longest stay).
- **Rates:** each entry is "from this many nights, this price per night", up to the next entry (the last one up to `season.maxNights`). The smallest `minNights` is the minimum stay. The page shows one price box per rate.
- **Bookings:** add `{ from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }` (arrival day, departure day) to `booked`. Those nights show as booked on the calendar. The calendar is display only: guests send their dates by WhatsApp or email.
- **Fully booked:** set `fullyBooked: true` once the festive booking is confirmed. The page then says the season is booked, shows every day as booked, and hides the prices and the enquiry buttons. The contact details at the bottom stay. Set it back to `false` to take enquiries again.
- **Contact:** `contact.phone` (the WhatsApp and call links are built from this), `contact.email`, and `contact.ref` (added as a "Ref:" line at the end of every WhatsApp and email enquiry, so you know it came via the card).
- **Where a lead came from:** add `?ref=` to the page address to change that "Ref:" line for people who open that link, e.g. `https://yourdesigncoza.github.io/mosselbay-christmas/?ref=FB-GROUP` for Facebook group posts and `?ref=WA-REPLY` for links sent in WhatsApp replies. Letters, digits and hyphens only, up to 20 characters; anything else is ignored and `contact.ref` is used. The card's QR code has no ref, so card enquiries still say `KLIPPER-CARD`.
- **The same values in `index.html`:** the price, dates, nights, phone and email are also written into `index.html` as plain text (inside the tags the config fills, the price box, and the page title, description and `og:` tags that link previews in WhatsApp and Facebook show). That text is what people see without JavaScript and what link previews pick up, so change it there too whenever you change it in `config.js`. The browser console warns about any filled tag whose text no longer matches the config.
- **Photos and places:** `photos` sets the gallery order and captions. `places` sets the map pins and the list under the map.

Commit and push. GitHub Pages updates within a minute or two.

## Rebuilding generated files

Run these from the project root:

| What | Command | When |
|---|---|---|
| Web photos + `og.jpg` | `python3 tools/build_images.py` | after changing the photo choice (raw photos in `images_raw/`, not in git) |
| Base map | `python3 tools/build_map.py` | rarely; data in `tools/data/` |
| QR code | `python3 tools/build_qr.py` (needs `pip install segno`) | if the site address changes |
| Card PDFs + PNG | `./tools/build_card.sh` (needs Google Chrome and `pdftoppm` from poppler-utils) | after changing the card, config or QR |

The QR code encodes the `og:url` in `index.html`, so that's the one place the address lives.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/. The map is loaded with `fetch`, so it won't appear if you open the file directly from disk.

Map data © OpenStreetMap contributors (ODbL).
