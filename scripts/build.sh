#!/usr/bin/env bash
# Build a Chrome Web Store / GitHub Release zip of TabTame.
# Output: dist/tabtame-v<version>.zip

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
OUT_DIR="dist"
ZIP_NAME="tabtame-v${VERSION}.zip"
ZIP_PATH="${OUT_DIR}/${ZIP_NAME}"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Files shipped to the Web Store.
FILES=(
  manifest.json
  background.js
  content.js
  inject.js
  settings-preload.js
  popup.html
  popup.js
  options.html
  options.js
  search.html
  search.js
  icons
)

for f in "${FILES[@]}"; do
  if [ ! -e "$f" ]; then
    echo "::error::Missing required file: $f"
    exit 1
  fi
done

zip -r "$ZIP_PATH" "${FILES[@]}" \
  --exclude '*.DS_Store' \
  --exclude '*Thumbs.db' \
  --exclude '*/.*'

echo
echo "Built: $ZIP_PATH"
echo "Size:  $(du -h "$ZIP_PATH" | cut -f1)"
