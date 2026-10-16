# Map data

`osm.json` is OpenStreetMap data (© OpenStreetMap contributors, ODbL), fetched from Overpass on 2026-10-16:

```bash
Q='[out:json][timeout:60];(way["natural"="coastline"](-34.200,22.115,-34.160,22.170);way["highway"~"^(primary|secondary|tertiary|residential|unclassified|living_street|pedestrian|footway|path)$"](-34.196,22.120,-34.164,22.166);way["man_made"~"^(pier|breakwater|groyne)$"](-34.196,22.120,-34.164,22.166);way["leisure"~"^(golf_course|park)$"](-34.196,22.120,-34.164,22.166);way["natural"~"^(beach|sand)$"](-34.196,22.120,-34.164,22.166););out geom;'
curl -s --data-urlencode "data=$Q" https://overpass-api.de/api/interpreter -o tools/data/osm.json
python3 tools/build_map.py
```
