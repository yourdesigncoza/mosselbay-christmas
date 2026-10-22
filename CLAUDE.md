# CLAUDE.md

Static one-page holiday-let site (`index.html`) plus a printable A6 QR card (`card.html`) for a house on Klipper Street, Mossel Bay. Plain HTML/CSS/JS: no package manager, no bundler, no tests, no linter. GitHub Pages serves the repo root from `main` (`https://yourdesigncoza.github.io/mosselbay-christmas/`), so every file committed at the root is public.

`README.md` is the owner-facing guide: how to edit `assets/js/config.js` (season, rates, bookings, contact, photos, places) and the table of rebuild commands. Read it before changing either.

## Commands

```bash
python3 -m http.server 8000      # preview at http://localhost:8000/ (the map needs HTTP; file:// won't load it)
```

Card preview: `http://localhost:8000/card.html` (A6) and `card.html?sheet=a4` (four-up). Python tools need Pillow (`build_images.py`) and segno (`build_qr.py`); `build_card.sh` needs `google-chrome` and `pdftoppm`.

Verification is manual: load the page in a browser and check the console, the calendar, the map pins and the card.

## Architecture

**Script chain.** Both pages load `config.js` → `common.js`; `index.html` then loads `site.js`. Order matters:
- `config.js` sets `window.SITE`, the single source for anything date-, price-, contact-, photo- or place-related.
- `common.js` derives everything from it, exposes `window.Stay`, and on load fills `[data-fill="<key>"]` (keys = the `values` object), `[data-link="whatsapp|email|tel"]` and `[data-postmark]`. New config-driven text goes into `values`, then into markup as `data-fill`.
- `card.html` clones its `<template>` in an inline script *before* `common.js` runs, so `fill()` reaches every card copy.
- `site.js` builds the gallery, lightbox, availability calendar, map pins, places list and the phone-only bottom dock. Every WhatsApp/email button uses `data-link`, so they all open the same `generic()` message.

**Dates.** Everything is a UTC-midnight millisecond timestamp (`Stay.parse` uses `Date.UTC`; arithmetic is `DAY` steps; formatting uses `getUTC*`). Never mix in local-time `Date`. A booking `{from, to}` blocks nights `from` up to but not including `to`. The calendar is display only (no date picking): season days show open or booked, and guests send their own dates.

**Rates.** `common.js` sorts `rates` by `minNights` descending. `values.rateFrom`/`rateLongNights` come from the longest tier, `rateStd`/`rateStdNights` from the shortest. The rates `<dl>` in `index.html` shows exactly those two, so a third tier in config won't appear on the page without a markup change.

**Map.** `tools/build_map.py` turns `tools/data/osm.json` into `assets/img/map.svg` (base layers only) and writes its lat/lng bounds to the SVG's `data-bbox`. `site.js` fetches the SVG and projects `SITE.places` and `SITE.home` onto it linearly from that bbox. Places outside the bbox become edge arrows. `label: n|s|e|w` sets which side of the pin the name sits.

**Photos.** Files follow `assets/img/photos/<slug>-<width>.webp` (800 and 1600; the hero `stoep-view` also 2400). `tools/build_images.py` maps slugs to raw files (`SOURCES`) and redacts the house number (`COVER`) and a number plate (`BLUR`). `config.js` `photos` sets gallery order and captions. A new photo needs an entry in both. `images_raw/` is gitignored and only exists locally. Gallery layout rule (in the `config.js` comment): plain photos between `wide` ones come in multiples of 4.

**Card and print files.** `print/kliper.pdf`, `print/kliper.png` and `print/card-a4.pdf` are committed build outputs from `./tools/build_card.sh` (headless Chrome against a temporary server on port 8799). Regenerate them after changing `card.html`, `config.js` values the card shows, or the QR code. The QR (`assets/img/qr.svg`) encodes the `og:url` in `index.html`, which is the one place the site address lives.

**Styles.** `assets/css/tokens.css` holds the colour/font tokens and the postmark styles shared by both pages; `assets/css/site.css` is page-only. The card's own styles are inline in `card.html` (sized in mm). Breakpoints: 600, 720, 900px.

## Gotchas

- House copy (description, beds, amenities, "Sleeps 8", meta/OG description) is hard-coded in `index.html`, and partly repeated in `card.html`. It is not in `config.js`.
- Privacy is deliberate: no street number or exact address anywhere. The `home` pin is approximate, and photos are redacted at build time. Keep it that way.
- Copy is South African English (`en-ZA`: stoep, braai, favourite). Prices are formatted by `Stay.rand` (`R3 000`).
- Commit messages follow conventional commits with a scope, e.g. `feat(content): …`, `style(mobile): …`, `chore(card): …`.
