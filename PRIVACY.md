# Privacy Policy

**Effective date:** 2026-05-15

TabTame is a browser extension that runs entirely on your device. It does not collect, transmit, sell, or share any personal data.

## Data TabTame stores

All data is stored locally via `chrome.storage.local` and never leaves your browser:

- **Settings** — your toggles, focus mode, tab limit, idle timeout, duplicate blocker.
- **Site rules** — per-domain overrides you configure.
- **Tab activity timestamps** — last-active time for each open tab, used by the idle-close feature. Cleared when the tab closes.
- **Stats** — a single counter of how many links TabTame has redirected.

This data stays on your machine. There is no cloud sync, no analytics, no telemetry, no remote server.

## Permissions and why they exist

| Permission | Why |
|---|---|
| `storage` | Save your settings and stats locally. |
| `tabs` | Read tab metadata for tab limit, duplicate blocker, idle close, tab search, and tab switching. |
| `alarms` | Run the idle-close check once per minute. |
| `<all_urls>` (host permissions) | Inject the content scripts that rewrite links and patch `window.open` on every page. The scripts only modify navigation behavior — they do not read page content or transmit data. |

## Third parties

None. TabTame does not use third-party services, SDKs, or analytics.

## Open source

The full source is available at <https://github.com/thekhabib/TabTame>. You can audit exactly what the extension does.

## Contact

Questions about privacy: **khabibtoshev@gmail.com**

## Changes

Material changes to this policy will be noted in [CHANGELOG.md](CHANGELOG.md) and the effective date above.
