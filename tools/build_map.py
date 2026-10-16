#!/usr/bin/env python3
"""Draw the base map (land, beaches, roads, trail) of central Mossel Bay as an SVG.

Run from the project root:  python3 tools/build_map.py
Input:  tools/data/osm.json (OpenStreetMap via Overpass, query in tools/data/README.md)
Output: assets/img/map.svg. Pins and labels are added in the browser from assets/js/config.js,
using the bounding box written to the SVG's data-bbox attribute.
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "data" / "osm.json"
OUT = ROOT / "assets" / "img" / "map.svg"

WEST, SOUTH, EAST, NORTH = 22.1235, -34.1945, 22.1640, -34.1680
WIDTH = 1000
KX = WIDTH / (EAST - WEST)
KY = KX / math.cos(math.radians((NORTH + SOUTH) / 2))
HEIGHT = round((NORTH - SOUTH) * KY)

ROAD_CLASSES = {
    "secondary": "road-major",
    "tertiary": "road-major",
    "residential": "road",
    "unclassified": "road",
    "living_street": "road",
    "pedestrian": "road",
}


def xy(pt: dict) -> str:
    return f"{(pt['lon'] - WEST) * KX:.1f},{(NORTH - pt['lat']) * KY:.1f}"


def path(geom: list, close: bool = False) -> str:
    return "M" + " L".join(xy(p) for p in geom) + (" Z" if close else "")


def coastline(ways: list) -> list:
    """Stitch coastline ways end-to-start into one chain (land lies to the left of travel)."""
    by_start = {w["nodes"][0]: w for w in ways}
    ends = {w["nodes"][-1] for w in ways}
    first = next(w for w in ways if w["nodes"][0] not in ends)
    chain, way = [], first
    while way:
        chain.extend(way["geometry"] if not chain else way["geometry"][1:])
        way = by_start.get(way["nodes"][-1])
    return chain


def main() -> None:
    elements = json.loads(SRC.read_text())["elements"]
    tags = lambda e: e.get("tags", {})
    coast = coastline([e for e in elements if tags(e).get("natural") == "coastline"])

    layers = {"sand": [], "park": [], "pier": [], "road": [], "road-major": [], "trail": []}
    for e in elements:
        t, g = tags(e), e.get("geometry")
        if not g:
            continue
        if t.get("natural") in ("beach", "sand"):
            layers["sand"].append(path(g, close=True))
        elif t.get("leisure") == "park":
            layers["park"].append(path(g, close=True))
        elif t.get("man_made"):
            layers["pier"].append(path(g))
        elif t.get("name") == "Saint Blaize Hiking Trail":
            layers["trail"].append(path(g))
        elif t.get("highway") in ROAD_CLASSES:
            layers[ROAD_CLASSES[t["highway"]]].append(path(g))

    groups = "\n".join(
        f'  <path class="{name}" d="{" ".join(paths)}"/>' for name, paths in layers.items() if paths
    )
    scale = 500 / (111_320 * math.cos(math.radians((NORTH + SOUTH) / 2))) * KX  # 500 m in map units
    notes = f"""  <text class="sea-label" x="800" y="150">Mossel Bay</text>
  <text class="sea-label" x="790" y="740">Indian Ocean</text>
  <text class="trail-label" x="610" y="650" text-anchor="end">St Blaize Trail</text>
  <g class="scale" transform="translate(30 {HEIGHT - 80})">
    <path d="M0 0 H{scale:.0f} M0 -8 V0 M{scale:.0f} -8 V0"/>
    <text x="{scale / 2:.0f}" y="-14">500 m</text>
  </g>
  <g class="north" transform="translate({WIDTH - 44} 52)">
    <path d="M0 -26 L12 14 L0 6 L-12 14 Z"/>
    <text y="40">N</text>
  </g>"""
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" class="map-svg" data-bbox="{WEST},{SOUTH},{EAST},{NORTH}" role="img" aria-labelledby="map-title">
  <title id="map-title">Map of central Mossel Bay showing the house and nearby beaches, restaurants and sights</title>
  <defs>
    <pattern id="waves" width="48" height="22" patternUnits="userSpaceOnUse">
      <path d="M2 14 q10 -8 20 0 t20 0" class="wave"/>
    </pattern>
    <clipPath id="frame"><rect width="{WIDTH}" height="{HEIGHT}" rx="0"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
  <rect class="sea" width="{WIDTH}" height="{HEIGHT}"/>
  <rect class="sea-texture" width="{WIDTH}" height="{HEIGHT}" fill="url(#waves)"/>
  <path class="land" d="{path(coast, close=True)}"/>
{groups}
{notes}
  </g>
  <g class="pins"></g>
</svg>
"""
    OUT.write_text(svg)
    print(f"{OUT.relative_to(ROOT)}  {WIDTH}x{HEIGHT}  {len(svg) // 1024} KB")


if __name__ == "__main__":
    main()
