# Chrome Web Store Listing — TabTame

## Name (max 45 chars)
TabTame — Same Tab Link Opener

## Short description (max 132 chars)
All links open in the current tab — no tab clutter. Per-site rules, focus mode, tab search, idle close, and more.

## Category
Productivity

## Language
English

## Detailed description

TabTame keeps your browser clean by stopping the new-tab spam.

Every link that would open in a new tab — whether from `target="_blank"` or a JavaScript `window.open()` call — gets redirected into your current tab instead. Works on plain HTML sites and on modern single-page apps (Angular, React, Vue) where most extensions fail.

KEY FEATURES

• Same-tab navigation — every link opens in the current tab.
• Works on SPAs — patches `window.open` in the page context, not just HTML attributes.
• Per-site rules — force same-tab or skip TabTame entirely on chosen domains.
• Focus mode — only redirect cross-domain links; same-domain links keep their original behavior.
• Tab limit — cap the number of tabs per window; new tabs above the limit auto-close.
• Duplicate blocker — opening a URL that's already open switches to the existing tab.
• Idle close — auto-close inactive tabs after N minutes (active and pinned tabs are exempt).
• Tab search — Ctrl+Shift+F opens a fuzzy search popup over your open tabs.
• Quick switch — Ctrl+Shift+1 to 9 jumps to tabs by index.
• Stats — counts redirects so you can see how much clutter you've avoided.

PRIVACY

TabTame collects nothing. No telemetry, no analytics, no remote servers. All data stays on your device. The full source is open at https://github.com/thekhabib/TabTame.

PERMISSIONS

• storage — save your settings locally.
• tabs — needed for tab limit, duplicate blocker, idle close, search, and switch.
• alarms — run the idle-close check once per minute.
• host permissions (all sites) — inject the tiny content script that rewrites links and patches window.open.

OPEN SOURCE

MIT licensed. Source, issues, and contributions: https://github.com/thekhabib/TabTame

## Privacy policy URL

https://github.com/thekhabib/TabTame/blob/main/PRIVACY.md

## Support URL

https://github.com/thekhabib/TabTame/issues

## Homepage URL

https://github.com/thekhabib/TabTame
