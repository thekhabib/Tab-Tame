# Contributing to TabTame

Thanks for your interest. PRs, bug reports, and feature requests are welcome.

## Quick start

1. Fork the repo on GitHub.
2. Clone your fork:
   ```bash
   git clone git@github.com:<your-username>/Tab-Tame.git
   cd Tab-Tame
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feat/short-description
   ```
4. Load the unpacked extension in Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** → select the cloned folder
5. Make your change, reload the extension (and any affected pages), and test.
6. Commit, push, and open a PR against `main`.

## Branch names

- `feat/<topic>` — new feature
- `fix/<topic>` — bug fix
- `docs/<topic>` — documentation only
- `chore/<topic>` — tooling, build, deps

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <subject>

[optional body]
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `style`.

Examples:
- `feat(content): patch window.open in MAIN world`
- `fix(background): debounce idle-close alarm`
- `docs(readme): clarify focus-mode behavior`

Keep the subject under 72 chars. The body should explain **why**, not what.

## Code style

- 2-space indent, single quotes, semicolons.
- No trailing whitespace.
- No `console.log` in shipped code (debug output only when actively debugging).
- Prefer `chrome.*` Promise-style APIs over callbacks where supported.
- Keep `manifest_version: 3` — no MV2 patterns.
- Don't introduce build steps or transpilation. The extension is plain JS by design.

## Testing

Automated:

```bash
npm install     # one-time
npm run lint    # eslint
npm test        # Playwright e2e (Chromium)
```

Both run in CI on every push and PR; the release workflow also runs them before publishing a tag.

Manual smoke test for any change to `content.js` / `inject.js` / `background.js`:

- [ ] Plain HTML page with `<a target="_blank">` → opens in current tab.
- [ ] SPA (e.g. an Angular/React app using `window.open`) → opens in current tab.
- [ ] iframe content respects the same rules.
- [ ] `Alt+Shift+S` toggle disables/enables redirect.
- [ ] `Ctrl+Shift+F` opens tab search.
- [ ] Per-site rule "New Tab" disables redirect on that domain.
- [ ] Focus mode keeps same-domain links untouched.
- [ ] No errors in DevTools console (page or service worker).

If you add a new permission, document **why** in the PR description.

## Pull request checklist

- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] CHANGELOG.md updated under `## [Unreleased]`.
- [ ] README updated if user-facing behavior changed.
- [ ] Manifest version **not** bumped (maintainers handle releases).
- [ ] Manual smoke checklist above passes for code changes.

## Reporting bugs

Open an issue using the **Bug report** template. Include:
- Chrome version
- TabTame version
- A URL or minimal reproduction
- DevTools console errors (page + service worker)

For security issues, see [SECURITY.md](SECURITY.md). Do not open a public issue.
