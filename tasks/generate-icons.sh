#!/usr/bin/env bash
# Copyright 2026 the Operaton contributors. Licensed under the MIT license.
set -euo pipefail

cd "$(dirname "$0")/.."

# Requires librsvg, ImageMagick and the macOS iconutil command.
for tool in rsvg-convert magick iconutil; do
  command -v "$tool" >/dev/null || { echo "Missing icon generation tool: $tool" >&2; exit 1; }
done

icon_tmp_dir=$(mktemp -d)
trap 'rm -rf "$icon_tmp_dir"' EXIT
icon_set="$icon_tmp_dir/Operaton.iconset"
mkdir "$icon_set"

# Render each size directly from the vector source, including small desktop icons.
for size in 16 24 32 48 64 128 256 512 1024; do
  rsvg-convert --width "$size" --height "$size" resources/icon.svg \
    --output "$icon_tmp_dir/$size.png"
done

cp "$icon_tmp_dir/1024.png" build/icon.png
cp "$icon_tmp_dir/256.png" app/resources/favicon.png
for size in 16 48 128; do
  cp "$icon_tmp_dir/$size.png" "resources/platform/linux/support/icon_$size.png"
done

magick "$icon_tmp_dir/16.png" "$icon_tmp_dir/24.png" "$icon_tmp_dir/32.png" \
  "$icon_tmp_dir/48.png" "$icon_tmp_dir/64.png" "$icon_tmp_dir/128.png" \
  "$icon_tmp_dir/256.png" build/icon.ico

for size in 16 32 128 256 512; do
  cp "$icon_tmp_dir/$size.png" "$icon_set/icon_${size}x${size}.png"
  cp "$icon_tmp_dir/$((size * 2)).png" "$icon_set/icon_${size}x${size}@2x.png"
done
iconutil --convert icns --output build/icon.icns "$icon_set"

# Retain the existing macOS SVG entry point with the same Operaton artwork.
cp resources/icon.svg resources/icon.osx.svg

echo 'Updated Operaton PNG, ICO, ICNS and SVG application icons.'
