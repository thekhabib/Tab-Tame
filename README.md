# TabTame

> Keep your browser clean. All links open in the current tab — no tab clutter.

A lightweight Chrome (Manifest V3) extension that stops the new-tab spam by redirecting `target="_blank"` links and `window.open()` calls into the current tab. Includes per-site rules, focus mode, idle tab close, duplicate blocker, tab limit, quick tab search, quick switch hotkeys, redirect stats, and a dark UI that follows your system theme.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![CI](https://github.com/thekhabib/Tab-Tame/actions/workflows/ci.yml/badge.svg)](https://github.com/thekhabib/Tab-Tame/actions/workflows/ci.yml)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-coming%20soon-lightgrey.svg)](https://github.com/thekhabib/Tab-Tame/releases)

---

## Features

- **Same-tab navigation** — rewrites `target="_blank"` to `_self` so every link opens in the current tab. `rel="noopener"` / `rel="noreferrer"` are stripped on rewritten links so same-tab navigation works as expected; see [PRIVACY.md](PRIVACY.md) for the security note.
- **`window.open` patch** — runs in the page's MAIN world to intercept JS-driven new-tab opens (works on SPAs like Angular/React apps).
- **Per-site rules** — force same-tab or skip the extension entirely on chosen domains.
- **Focus mode** — only redirect cross-domain links; same-domain links keep their original behavior.
- **Tab limit** — cap the number of tabs per window; new tabs above the limit are auto-closed.
- **Duplicate blocker** — opening a URL that's already open switches to the existing tab.
- **Idle close** — auto-close inactive tabs after N minutes (active and pinned tabs are exempt). Timestamps reset on browser launch so a fresh session never triggers an immediate sweep.
- **Tab search** — `Ctrl+Shift+F` opens a fuzzy search popup over your open tabs.
- **Quick tab switch** — `Ctrl+Shift+1` … `Ctrl+Shift+9` jumps to tabs by index.
- **Stats** — counts how many redirects the extension has performed; reset any time from the options page.
- **Import / export settings** — JSON backup with schema-validated import (malformed files are rejected).
- **Dark mode** — popup, options, and tab-search popups follow the system `prefers-color-scheme` setting.
- **Zero telemetry** — nothing leaves your browser. See [PRIVACY.md](PRIVACY.md).

---

## Browser compatibility

Works on any Chromium-based browser that supports Manifest V3:

| Browser | Status |
|---|---|
| Google Chrome | ✓ tested |
| Microsoft Edge | ✓ supported (Chromium build) |
| Brave | ✓ supported |
| Opera | ✓ supported |
| Vivaldi | ✓ supported |
| Arc | ✓ supported |
| Firefox | not yet — MV3 service-worker port pending |

---

## Install

### From Chrome Web Store

Coming soon.

### Manual install (developer mode)

1. Download the latest release zip: [tabtame-v1.0.8.zip](https://github.com/thekhabib/Tab-Tame/releases/download/v1.0.8/tabtame-v1.0.8.zip) (or browse [all releases](https://github.com/thekhabib/Tab-Tame/releases)) and unzip it.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `TabTame` folder.
5. Pin the TabTame icon from the puzzle menu for quick access.

---

## Usage

### Popup

Click the TabTame icon to:
- Toggle the extension on/off.
- Set a per-site rule for the current domain (Same Tab / New Tab / Default).
- See your redirect stats.

### Options page

Right-click the icon → **Options**, or open it from the popup. Configure:

| Setting | Default | What it does |
|---|---|---|
| Enabled | `on` | Master switch. |
| Focus mode | `off` | Redirect only cross-domain links. |
| Tab limit | `0` (off) | Auto-close new tabs above this count. |
| Duplicate blocker | `off` | Switch to existing tab instead of opening a duplicate. |
| Idle close | `0` (off) | Minutes of inactivity before non-active, non-pinned tabs close. |
| Site rules | `{}` | Per-domain overrides. |
| Stats | — | Live redirect counter with a **Reset** button. |
| Backup | — | **Export** writes `tabtame-settings.json`; **Import** restores from a JSON file (unknown keys are silently dropped, malformed files are rejected). |

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Alt+Shift+S` | Toggle extension on/off |
| `Ctrl+Shift+F` | Open tab search popup |
| `Ctrl+Shift+1` … `9` | Switch to tab N in current window |

Customize at `chrome://extensions/shortcuts`.

---

## Screenshots

Screenshots for the popup, options page, dark mode, and the tab-search overlay live in [`store/screenshots/`](store/screenshots/) and are used for the Chrome Web Store listing.

---

## Permissions

TabTame asks for the minimum set of permissions it needs. Nothing is sent to a remote server — see [PRIVACY.md](PRIVACY.md).

| Permission | Why |
|---|---|
| `storage` | Save your settings and the redirect counter locally. |
| `tabs` | Power the tab limit, duplicate blocker, idle close, tab search, and quick switch. |
| `alarms` | Run the once-per-minute idle-close check from the service worker. |
| `<all_urls>` (host) | Inject the link-rewrite content script and the `window.open` patch on every site. |

---

## Limitations

Browser sandboxing prevents extensions from running on certain pages, so TabTame can't redirect links there:

- `chrome://`, `chrome-extension://`, `edge://`, `brave://` internal pages.
- The Chrome Web Store itself (`chromewebstore.google.com`).
- `file://` URLs unless you opt in at `chrome://extensions` → TabTame → **Allow access to file URLs**.
- The built-in PDF viewer and `view-source:` tabs.
- Sites with a strict Content Security Policy that blocks the MAIN world injection — link rewriting still works, but `window.open` interception may not.

If you find a site where TabTame should work but doesn't, please open an [issue](https://github.com/thekhabib/Tab-Tame/issues).

---

## Architecture

```
manifest.json         MV3 manifest, perms, commands
background.js         Service worker — alarms, tab listeners, stats, commands
settings-preload.js   ISOLATED document_start script — pushes settings before page scripts run
content.js            ISOLATED content script — rewrites <a target="_blank">
inject.js             MAIN world content script — patches window.open
popup.html / .js      Toolbar popup
options.html / .js    Settings page
search.html / .js     Fuzzy tab search popup
icons/                Extension icons
tests/e2e/            Playwright end-to-end tests
eslint.config.mjs     ESLint config (recommended + Chrome extension globals)
```

**Why two content scripts?** Chrome content scripts run in an isolated world by default, so they cannot override the page's own `window.open`. SPAs (Angular, React) often open new tabs from JS click handlers, not HTML attributes. `inject.js` runs in the MAIN world to patch `window.open` directly; it gets settings from `content.js` over `window.postMessage`.

---

## Development

```bash
# clone
git clone git@github.com:thekhabib/Tab-Tame.git
cd Tab-Tame

# install dev dependencies (Playwright + ESLint)
npm install

# load into Chrome:
# chrome://extensions → Developer mode → Load unpacked → select this folder

# after edits to background.js or manifest.json, click the reload icon
# on the extension card. content/inject script changes need a page reload.
```

### Lint

```bash
npm run lint
```

### Run tests

```bash
npm test
```

### Build a release zip

```bash
./scripts/build.sh
# produces dist/tabtame-v<version>.zip
```

### Releasing (maintainers)

1. Bump `version` in `manifest.json` and `package.json`.
2. Add a `## [X.Y.Z] — YYYY-MM-DD` section to [CHANGELOG.md](CHANGELOG.md) and update the compare links at the bottom of that file.
3. Commit (`chore: release vX.Y.Z`) and push.
4. Tag and push: `git tag vX.Y.Z && git push origin vX.Y.Z`.
5. `release.yml` runs lint + e2e tests, builds the zip, and publishes a GitHub Release with auto-generated notes.
6. Once TabTame is live on the Chrome Web Store, upload the same zip to the dashboard for review.

---

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and commit style.

For bugs and feature ideas, open an [issue](https://github.com/thekhabib/Tab-Tame/issues).

For security reports, see [SECURITY.md](SECURITY.md) — please do not open a public issue.

---

## Roadmap

Track planned work via [GitHub Issues](https://github.com/thekhabib/Tab-Tame/issues) and the [Unreleased section of CHANGELOG.md](CHANGELOG.md#unreleased).

---

## License

[MIT](LICENSE) © Khabib Toshev
