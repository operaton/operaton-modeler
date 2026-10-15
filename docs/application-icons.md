# Operaton application icons

`resources/icon.svg` is the editable source for all application icons. It uses the
official Operaton logo from
[`operaton/operaton.org`](https://github.com/operaton/operaton.org/blob/dfd6356e83ece41e99a828816d5ab7fd5e78c1eb/assets/img/operaton-logo.svg),
with the original paths and color preserved on a white rounded tile. The tile
keeps the mark visible on light and dark desktop backgrounds.

Generate the committed assets on macOS with librsvg, ImageMagick and Apple's
`iconutil` installed:

```sh
bash tasks/generate-icons.sh
```

The script renders each resolution directly from the SVG and updates:

- `build/icon.png`: 1024-pixel icon used by Electron Builder.
- `build/icon.icns`: macOS app, Dock, Finder and DMG application icon, including Retina sizes.
- `build/icon.ico`: Windows executable and associated document icons, from 16 to 256 pixels.
- `app/resources/favicon.png`: 256-pixel Electron window icon, used on Linux.
- `resources/platform/linux/support/icon_{16,48,128}.png`: Linux desktop icons.
- `resources/icon.osx.svg`: the existing macOS SVG entry point.

Electron Builder discovers the `build/icon.*` assets automatically. Linux desktop
registration uses the `operaton-modeler` icon name. The generated assets are
committed, so regular application builds do not require the generation tools.

## Verification (2026-10-15)

- Generated PNG dimensions, all seven ICO resolutions, and ICNS/Retina entries verified.
- macOS x64/arm64 and Linux x64 builds and archive checks passed.
- Packaged macOS bundle icons, window icons inside ASARs and Linux desktop icons
  match the generated sources; Linux executable permissions are retained.
- Linux registration/unregistration checked with isolated xdg-utils stubs,
  including symlinks and installation paths with spaces.
- ESLint, shell syntax and diff checks passed. Windows ICO assets were checked;
  a Windows build and native Linux desktop launch were not performed.
