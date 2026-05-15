# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/thekhabib/Tab-Tidy/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/thekhabib/Tab-Tidy/releases/tag/v1.0.0
