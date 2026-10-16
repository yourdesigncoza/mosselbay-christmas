#!/usr/bin/env bash
# Print the card: print/kliper.pdf (one A6 card), print/kliper.png (the same card as a shareable image)
# and print/card-a4.pdf (four on A4, for cutting). Needs Google Chrome and pdftoppm (poppler-utils).
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m http.server 8799 --bind 127.0.0.1 >/dev/null 2>&1 &
server=$!
trap 'kill $server' EXIT
sleep 1
for job in "kliper|card.html" "card-a4|card.html?sheet=a4"; do
  google-chrome --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 \
    --print-to-pdf="print/${job%%|*}.pdf" "http://127.0.0.1:8799/${job#*|}" 2>/dev/null
done
pdftoppm -r 300 -png -singlefile print/kliper.pdf print/kliper
ls -la print/
