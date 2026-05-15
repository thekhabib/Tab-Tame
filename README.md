# Tab Tidy

> Keep your browser clean. All links open in the current tab — no tab clutter.

A lightweight Chrome (Manifest V3) extension that stops the new-tab spam by redirecting `target="_blank"` links and `window.open()` calls into the current tab. Includes per-site rules, focus mode, idle tab close, duplicate blocker, tab limit, and quick tab search.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-coming%20soon-lightgrey.svg)](#)

---

## Features

- **Same-tab navigation** — rewrites `target="_blank"` to `_self` so every link opens in the current tab.
- **`window.open` patch** — runs in the page's MAIN world to intercept JS-driven new-tab opens (works on SPAs like Angular/React apps).
- **Per-site rules** — force same-tab or skip the extension entirely on chosen domains.
- **Focus mode** — only redirect cross-domain links; same-domain links keep their original behavior.
- **Tab limit** — cap the number of tabs per window; new tabs above the limit are auto-closed.
- **Duplicate blocker** — opening a URL that's already open switches to the existing tab.
- **Idle close** — auto-close inactive tabs after N minutes (active and pinned tabs are exempt).
- **Tab search** — `Ctrl+Shift+F` opens a fuzzy search popup over your open tabs.
- **Quick tab switch** — `Ctrl+Shift+1` … `Ctrl+Shift+9` jumps to tabs by index.
- **Stats** — counts how many redirects the extension has performed.
- **Zero telemetry** — nothing leaves your browser. See [PRIVACY.md](PRIVACY.md).

---

## Install

### From Chrome Web Store

Coming soon.

### Manual install (developer mode)

1. Clone or [download a release](https://github.com/thekhabib/Tab-Tidy/releases) and unzip it.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `Tab-Tidy` folder.
5. Pin the Tab Tidy icon from the puzzle menu for quick access.

---

## Usage

### Popup

Click the Tab Tidy icon to:
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

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Alt+Shift+S` | Toggle extension on/off |
| `Ctrl+Shift+F` | Open tab search popup |
| `Ctrl+Shift+1` … `9` | Switch to tab N in current window |

Customize at `chrome://extensions/shortcuts`.

---

## Architecture

```
manifest.json       MV3 manifest, perms, commands
background.js       Service worker — alarms, tab listeners, stats, commands
content.js          ISOLATED content script — rewrites <a target="_blank">
inject.js           MAIN world content script — patches window.open
popup.html / .js    Toolbar popup
options.html / .js  Settings page
search.html / .js   Fuzzy tab search popup
icons/              Extension icons
```

**Why two content scripts?** Chrome content scripts run in an isolated world by default, so they cannot override the page's own `window.open`. SPAs (Angular, React) often open new tabs from JS click handlers, not HTML attributes. `inject.js` runs in the MAIN world to patch `window.open` directly; it gets settings from `content.js` over `window.postMessage`.

---

## Development

```bash
# clone
git clone git@github.com:thekhabib/Tab-Tidy.git
cd Tab-Tidy

# load into Chrome:
# chrome://extensions → Developer mode → Load unpacked → select this folder

# after edits to background.js or manifest.json, click the reload icon
# on the extension card. content/inject script changes need a page reload.
```

### Build a release zip

```bash
./scripts/build.sh
# produces dist/tab-tidy-v<version>.zip
```

### Releasing (maintainers)

1. Bump `version` in `manifest.json`.
2. Add a `## [X.Y.Z] — YYYY-MM-DD` section to [CHANGELOG.md](CHANGELOG.md).
3. Commit (`chore: release vX.Y.Z`) and push.
4. Tag and push: `git tag vX.Y.Z && git push --tags`.
5. The `release.yml` GitHub Action builds the zip and attaches it to a new GitHub Release.
6. Upload the same zip to the Chrome Web Store dashboard.

---

## Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and commit style.

For bugs and feature ideas, open an [issue](https://github.com/thekhabib/Tab-Tidy/issues).

For security reports, see [SECURITY.md](SECURITY.md) — please do not open a public issue.

---

## Roadmap

See [ROADMAP.md](ROADMAP.md).

---

## License

[MIT](LICENSE) © Khabib Toshev
