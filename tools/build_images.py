#!/usr/bin/env python3
"""Turn the chosen raw photos into web-sized WebP files plus the social preview image.

Run from the project root:  python3 tools/build_images.py
Captions and gallery order live in assets/js/config.js; this file only maps raw files to slugs.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "images_raw" / "drive-download-20261016T091642Z-1-001"
OUT = ROOT / "assets" / "img" / "photos"

HERO = "stoep-view"
SOURCES = {
    "stoep-view": "20261016_134242.jpg",
    "lounge-dining": "20261016_112818.jpg",
    "study": "20260915_112608.jpg",
    "kitchen": "20260915_111741.jpg",
    "back-stoep": "20261016_133537.jpg",
    "braai": "20260915_111945.jpg",
    "dining": "20260915_112740.jpg",
    "tv-lounge": "20260915_112731.jpg",
    "bedroom-1": "20260915_112516.jpg",
    "bedroom-2": "20260915_112812.jpg",
    "bathroom": "20260915_112806.jpg",
    "front": "20260915_111602.jpg",
    "entrance": "20260915_111700.jpg",
    "hallway": "20260915_111709.jpg",
    "bathroom-2": "20260915_112543.jpg",
    "bedroom-1b": "20260915_112554.jpg",
    "stoep": "20260915_112628.jpg",
    "tv-lounge-2": "20260915_112717.jpg",
    "bedroom-2b": "20260915_112815.jpg",
}
# Left out: IMG-20260915-WA0078.jpg, a smaller WhatsApp copy of the tv-lounge photo.

# Hidden before resizing. Boxes are pixels in the upright original.
# COVER pastes the plain door panel dx pixels to the side over the house number on the garage door.
COVER = {"front": [((2035, 920, 2120, 985), -148)]}
# BLUR hides the car's number plate.
BLUR = {"front": [(570, 1185, 800, 1255)]}
WIDTHS = (800, 1600)
HERO_WIDTHS = WIDTHS + (2400,)
OG_SIZE = (1200, 630)


def load(name: str) -> Image.Image:
    return ImageOps.exif_transpose(Image.open(RAW / name)).convert("RGB")


def redact(img: Image.Image, slug: str) -> Image.Image:
    for (left, top, right, bottom), dx in COVER.get(slug, []):
        patch = img.crop((left + dx, top, right + dx, bottom))
        mask = Image.new("L", patch.size, 0)
        ImageDraw.Draw(mask).rectangle((6, 6, patch.width - 7, patch.height - 7), fill=255)
        img.paste(patch, (left, top), mask.filter(ImageFilter.GaussianBlur(4)))
    for box in BLUR.get(slug, []):
        img.paste(img.crop(box).filter(ImageFilter.GaussianBlur(18)), box[:2])
    return img


def save_webp(img: Image.Image, slug: str, width: int) -> None:
    w = min(width, img.width)
    out = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    out.save(OUT / f"{slug}-{width}.webp", "WEBP", quality=78, method=6)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, name in SOURCES.items():
        img = redact(load(name), slug)
        for width in HERO_WIDTHS if slug == HERO else WIDTHS:
            save_webp(img, slug, width)
        print(f"{slug:14} {img.width}x{img.height}")
    og = ImageOps.fit(load(SOURCES[HERO]), OG_SIZE, Image.LANCZOS, centering=(0.6, 0.45))
    og.save(ROOT / "assets" / "img" / "og.jpg", "JPEG", quality=82, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
