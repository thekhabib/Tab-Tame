# TabTame

> Keep your browser clean. All links open in the current tab — no tab clutter.

A lightweight Chrome (Manifest V3) extension that redirects `target="_blank"` links and `window.open()` calls into the current tab. Per-site rules, focus mode, idle close, duplicate blocker, tab limit, tab search, quick switch, stats, dark UI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![CI](https://github.com/thekhabib/Tab-Tame/actions/workflows/ci.yml/badge.svg)](https://github.com/thekhabib/Tab-Tame/actions/workflows/ci.yml)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-coming%20soon-lightgrey.svg)](https://github.com/thekhabib/Tab-Tame/releases)

Works on any Chromium-based browser with MV3: Chrome, Edge, Brave, Opera, Vivaldi, Arc. Firefox port pending.

---

## Features

- **Same-tab navigation** — rewrites `target="_blank"` to `_self`. `rel="noopener"` / `noreferrer"` are stripped on rewritten links (see [PRIVACY.md](PRIVACY.md)).
- **`window.open` patch** — MAIN-world script intercepts JS-driven new-tab opens; works on SPAs (Angular, React).
- **Per-site rules** — force same-tab or skip the extension on chosen domains.
- **Focus mode** — only redirect cross-domain links.
- **Tab limit** — cap tabs per window; new tabs above the cap auto-close.
- **Duplicate blocker** — focus an existing tab instead of opening a duplicate URL.
- **Idle close** — auto-close inactive non-pinned tabs after N minutes; timestamps reset on browser launch.
- **Park tabs** — close other tabs in the current window and save them to a named session; restore any session with one click (current window or a new window).
- **Tab search** — `Ctrl+Shift+F` opens a fuzzy search popup.
- **Quick switch** — `Ctrl+Shift+1` … `9` jump to tabs by index.
- **Stats + Import/Export** — redirect counter with reset; JSON backup with schema-validated restore.
- **Dark mode** — follows the system `prefers-color-scheme` setting.
- **Lighter on RAM** — fewer tabs mean less memory; tab limit and idle close help further.
- **Zero telemetry** — see [PRIVACY.md](PRIVACY.md).

---

## Install

**Chrome Web Store:** coming soon.

**Manual:** download [tabtame-v1.1.0.zip](https://github.com/thekhabib/Tab-Tame/releases/download/v1.1.0/tabtame-v1.1.0.zip), unzip, open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, select the folder.

---

## Usage

**Popup** (click the icon): master toggle, per-site rule, stats.

**Park tabs:** in the popup, click **Save** to close every non-pinned tab in the current window and save them to a session named with today's timestamp. The latest 3 sessions appear inline in the popup with a ↻ button that restores into the current window. The Options page hosts the full list, with per-tab open/remove, **Restore here**, **New window**, rename, and delete. A secondary **Save all N and clear →** link in the popup also parks the active tab and opens a fresh new tab.

**Options** (right-click icon → Options):

| Setting | Default | What it does |
|---|---|---|
| Enabled | `on` | Master switch |
| Focus mode | `off` | Redirect only cross-domain links |
| Tab limit | `0` | Auto-close new tabs above this count (`0` = disabled) |
| Duplicate blocker | `off` | Switch to existing tab instead of opening a duplicate |
| Idle close | `0` | Minutes of inactivity before non-active, non-pinned tabs close (`0` = disabled) |
| Site rules | `{}` | Per-domain overrides |
| Saved Sessions | `[]` | Parked tab sessions — restore here / in a new window, rename, delete; up to 100 retained |
| Stats | — | Redirect counter + **Reset** |
| Backup | — | **Export** writes `tabtame-settings.json`; **Import** restores a JSON file (malformed files rejected) |

**Shortcuts** (customize at `chrome://extensions/shortcuts`):

| Shortcut | Action |
|---|---|
| `Alt+Shift+S` | Toggle extension |
| `Ctrl+Shift+F` | Open tab search |
| `Ctrl+Shift+1` … `9` | Switch to tab N |

---

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save settings + counter locally |
| `tabs` | Tab limit, duplicate blocker, idle close, search, switch |
| `alarms` | Once-per-minute idle-close check |
| `<all_urls>` | Inject link-rewrite + `window.open` patch on every site |

Nothing leaves your browser. See [PRIVACY.md](PRIVACY.md).

## Limitations

Browser sandboxing prevents extensions from running on `chrome://`, `chrome-extension://`, the Chrome Web Store, `view-source:`, the built-in PDF viewer, and `file://` URLs (unless you opt in at `chrome://extensions` → TabTame → **Allow access to file URLs**). On sites with strict CSP, link rewriting still works but `window.open` interception may not.

---

## Architecture

```
manifest.json         MV3 manifest, perms, commands
background.js         Service worker — alarms, tab listeners, stats, commands
settings-preload.js   ISOLATED document_start script — pushes settings before page scripts run
content.js            ISOLATED content script — rewrites <a target="_blank">
inject.js             MAIN world content script — patches window.open
popup / options / search  HTML + JS for the three UIs
tests/e2e/            Playwright end-to-end tests
eslint.config.mjs     ESLint (recommended + Chrome extension globals)
```

**Why two content scripts?** Chrome content scripts run in an isolated world and cannot override the page's own `window.open`. SPAs open new tabs from JS handlers, not HTML attributes. `inject.js` runs in the MAIN world to patch `window.open`; it receives settings from `content.js` over `window.postMessage`.

---

## Development

```bash
git clone git@github.com:thekhabib/Tab-Tame.git
cd Tab-Tame
npm install                 # Playwright + ESLint
# chrome://extensions → Developer mode → Load unpacked → select this folder

npm run lint                # eslint
npm test                    # playwright e2e
./scripts/build.sh          # produces dist/tabtame-v<version>.zip
```

After edits to `background.js` or `manifest.json`, click the reload icon on the extension card. Content/inject script changes need a page reload.

### Releasing (maintainers)

1. Bump `version` in `manifest.json` and `package.json`.
2. Add a `## [X.Y.Z] — YYYY-MM-DD` section to [CHANGELOG.md](CHANGELOG.md) + update compare links.
3. Commit and push.
4. `git tag vX.Y.Z && git push origin vX.Y.Z` — `release.yml` runs lint + e2e, builds the zip, publishes a GitHub Release.
5. Once on the Chrome Web Store, upload the same zip to the dashboard.

---

## Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Bugs and ideas: [open an issue](https://github.com/thekhabib/Tab-Tame/issues). Security reports: [SECURITY.md](SECURITY.md) (do not file a public issue).

Planned work: [Unreleased section of CHANGELOG.md](CHANGELOG.md#unreleased) + [GitHub Issues](https://github.com/thekhabib/Tab-Tame/issues).

---

## License

[MIT](LICENSE) © Khabib Toshev
