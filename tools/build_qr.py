#!/usr/bin/env python3
"""Rebuild the card's QR code from the page address in index.html (og:url).

Run from the project root after the address changes:  python3 tools/build_qr.py
Needs: pip install segno
"""
import re
from pathlib import Path

import segno

ROOT = Path(__file__).resolve().parent.parent
url = re.search(r'property="og:url" content="([^"]+)"', (ROOT / "index.html").read_text()).group(1)
segno.make(url, error="m").save(ROOT / "assets" / "img" / "qr.svg", scale=4, border=0, dark="#0F3442", light=None, xmldecl=False, omitsize=True)
print(f"assets/img/qr.svg -> {url}")
