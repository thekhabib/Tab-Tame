# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] — 2026-05-15

### Fixed
- Idle close now checks all windows, not just the current one.
- Duplicate tab blocker uses exact JS string comparison instead of `chrome.tabs.query({ url })` match patterns, which mishandled URLs with query strings and fragments.
- `popup.js`: suppress `runtime.lastError` when sending `settings_updated` to tabs where the content script is not loaded (e.g. email views, iframes, pages mid-navigation). Uses callback form with `void chrome.runtime.lastError`.
- `content.js`: same `runtime.lastError` suppression fix in `flushStats`. Stats counter is now saved before the async send, not after, preventing double-count on retry.
- `content.js`: extension re-enable now immediately processes existing links and resumes observing DOM mutations. Previously, if the extension was disabled when a page loaded, toggling it back on had no effect until the next page load.
- `content.js`: settings changes (enable/disable, focus mode, site rules) now re-run `processLinks` on the current page.
- Settings import now validates keys against the known schema and rejects files with no recognised keys, preventing storage corruption from malformed JSON.

### Added
- `settings-preload.js`: new ISOLATED content script injected at `document_start` that pushes stored settings to `inject.js` via `postMessage` before page scripts run, closing the race window where `window.open` calls made before `document_end` used hardcoded defaults.
- Playwright e2e test suite (`tests/e2e/`) with 5 tests covering same-tab redirect, `window.open` interception, master toggle, and per-site rules.
- GitHub Actions CI workflow: runs e2e tests and build check on every push and pull request.
- GitHub Actions release workflow: runs tests, builds zip, and publishes a GitHub Release on version tags.

## [1.0.6] — 2026-05-15

### Performance
- Filter `MutationObserver` callbacks so DOM changes that do not add anchor elements are ignored. Previously every mutation on heavy SPAs (Gmail, Twitter, YouTube) triggered the debounce timer, which caused noticeable browser slowdown on those sites.
- Increase processing debounce from 150ms to 300ms.
- Observe `document.body` instead of `document.documentElement` to skip `<head>` and viewport meta churn.

## [1.0.5] — 2026-05-15

### Changed
- Rename internal `SameTabLinkOpener` class to `TabTameLinkOpener` for consistency.
- Settings export filename is now `tabtame-settings.json` (was `same-tab-settings.json`).
- `search.html` window title is now `TabTame — Search`.

### Added
- PRIVACY.md note explaining that `rel="noopener"` / `rel="noreferrer"` are stripped from rewritten links and why this is safe.

### Fixed
- `.gitignore` now excludes `.claude/` so local Claude Code settings are not accidentally committed.

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

[Unreleased]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.6...HEAD
[1.0.6]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/thekhabib/Tab-Tame/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/thekhabib/Tab-Tame/releases/tag/v1.0.0
