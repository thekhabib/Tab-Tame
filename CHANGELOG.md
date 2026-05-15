# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] — 2026-05-15

### Changed
- Update popup logo, options page title/heading, and toggle command description from "Same Tab" to "TabTame" so the UI matches the new product name.

## [1.0.3] — 2026-05-15

### Fixed
- Correct GitHub repo URL in `manifest.json` `homepage_url` and all docs (`thekhabib/TabTame` → `thekhabib/Tab-Tame`).

## [1.0.2] — 2026-05-15

### Changed
- **Renamed extension to TabTame** (was Tab Tidy). The previous name conflicted with an existing Chrome Web Store listing.
- Internal `postMessage` source/target tags renamed from `tabtidy` / `tabtidy-iso` to `tabtame` / `tabtame-iso`.
- Build artifact renamed from `tab-tidy-vX.Y.Z.zip` to `tabtame-vX.Y.Z.zip`.
- Repository moved to `github.com/thekhabib/Tab-Tame`.

## [1.0.1] — 2026-05-15

### Fixed
- Shorten extension description to fit Chrome Web Store 132-char limit (was 138).

## [1.0.0] — 2026-05-15

### Added
- Same-tab redirect for `target="_blank"` links via ISOLATED content script.
- MAIN world `inject.js` patching `window.open` for SPA-style new-tab opens.
- Per-site rules: force same-tab or skip extension on chosen domains.
- Focus mode: only redirect cross-domain links.
- Tab limit per window with auto-close above the cap.
- Duplicate blocker: switches to existing tab instead of opening a duplicate.
- Idle close: auto-close inactive non-pinned tabs after N minutes (1-min alarm).
- Tab search popup (`Ctrl+Shift+F`).
- Quick tab switch (`Ctrl+Shift+1` … `9`).
- Toggle hotkey (`Alt+Shift+S`).
- Redirect counter stored in local storage.

[Unreleased]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.4...HEAD
[1.0.4]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/thekhabib/Tab-Tame/releases/tag/v1.0.0
