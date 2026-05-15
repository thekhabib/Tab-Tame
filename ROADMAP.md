# TabTame — Shaxsiy Roadmap

> **Eslatma:** Bu fayl `.gitignore` da, faqat lokal. Public roadmap `CHANGELOG.md` + GitHub Issues orqali ko'rsatiladi.

**Joriy holat (2026-05-15):**
- ✅ v1.0.1 GitHub Release published
- ✅ MAIN world `inject.js` orqali `window.open` patch (eskiz.uz Angular tasdiqladi)
- ✅ MIT, README, CHANGELOG, CONTRIBUTING, PRIVACY, SECURITY
- ✅ GitHub Actions: lint + release (tag push da avtomat zip)
- ❌ Chrome Web Store — yuklash kutilmoqda

---

## Bosqich 1 — Chrome Web Store ga chiqish

### Screenshots (majburiy)
- [ ] **Screenshot 1** — Popup (toggle, per-site rule, stat counter)
- [ ] **Screenshot 2** — Options sahifasi (barcha sozlamalar)
- [ ] **Screenshot 3** — Tab search (`Ctrl+Shift+F`) filter natijasi
- [ ] **Screenshot 4** — Before/after: 30 tab vs 5 tab brauzer
- Format: PNG 1280×800, transparent emas, 1-5 dona
- Joy: `store/screenshots/`

### Promo (ixtiyoriy, lekin featured uchun)
- [ ] Small promo tile 440×280
- [ ] Marquee 1400×560

### Developer akkount
- [ ] Google Developer akkount: https://chrome.google.com/webstore/devconsole
- [ ] $5 bir martalik to'lov (kredit karta)

### Yuklash
- [ ] `tabtame-v1.0.2.zip` upload (yoki yangiroq)
- [ ] Listing: `store/description.md` dan ko'chirish
- [ ] Privacy URL: `https://github.com/thekhabib/Tab-Tame/blob/main/PRIVACY.md`
- [ ] Category: Productivity, Language: English
- [ ] Screenshot lar yuklash
- [ ] Submit → 3-7 ish kuni review

### Publish bo'lgach
- [ ] README badge URL ni real CWS link ga yangilash (`https://chromewebstore.google.com/detail/<id>`)
- [ ] Manual install bo'limini "Web Store dan o'rnatish" + "yoki manual" tarzida qayta yozish

---

## Bosqich 2 — v1.1.x improvements

### Bugfix / polish
- [ ] iframe lar ichida `inject.js` test qilish (cross-origin frame edge case)
- [ ] YouTube, Twitter, Reddit kabi heavy SPA larda regression test
- [ ] `noopener`/`noreferrer` removal — security implications hujjatlash
- [ ] Service worker restart edge case (idle close timer)

### Yangi feature lar
- [ ] **Whitelist/blacklist UX** — domen ro'yxatini import/export
- [ ] **Stats dashboard** — vaqt bo'yicha grafik (kunlik redirect)
- [ ] **Undo redirect** — agar yanglish redirect bo'lsa, popup orqali "Open in new tab anyway"
- [ ] **Modifier override** — `Cmd/Ctrl+click` bilan vaqtinchalik new tab ochish (chrome o'zi qiladi-ku, lekin tekshir)
- [ ] **Group tabs** — duplicate blocker yoniga "group similar URLs" optsiyasi
- [ ] **Dark mode** — popup/options uchun

### Tech debt
- [ ] `actions/checkout@v4` → v5 yangilash (Node 20 deprecation 2026-06-02)
- [ ] `web-ext lint` ni `|| true` dan olib tashlab strict qilish
- [ ] Unit test (yoq hozir) — Vitest yoki Playwright bilan e2e

---

## Bosqich 3 — Marketing (Web Store live bo'lgach)

- [ ] ProductHunt launch
- [ ] Reddit: r/chrome, r/productivity, r/webdev
- [ ] Telegram dasturchi kanallar (uz)
- [ ] Twitter/X — qisqa demo video (window.open SPA fix vs raqobat)
- [ ] Hacker News Show HN
- [ ] Popup ga "Rate us" linki (CWS published bo'lgach)

---

## Bosqich 4 — v2 g'oyalar

- [ ] Firefox port (web-ext orqali, manifest v2/v3 hybrid)
- [ ] Edge Add-ons store (Chromium build qayta ishlatiladi)
- [ ] Tab snapshot/restore — group olarni saqlash va keyin tiklash
- [ ] Cross-device sync (chrome.storage.sync)
- [ ] AI: smart tab grouping (ixtiyoriy, on-device)

---

## Cheklovlar va eslatmalar

| Narsa | Limit |
|---|---|
| Extension size | 10 MB max (hozir 28K) |
| Description | 132 char max |
| Screenshots | 1-5 dona |
| Review (1-marta) | 3-7 ish kuni |
| Update review | 1-3 kun |
| Dev fee | $5 (bir martalik) |

**Release jarayoni** (har gal):
1. `manifest.json` → version bump
2. `CHANGELOG.md` → yangi `## [X.Y.Z]` bo'lim
3. `git commit -m "chore: release vX.Y.Z"` + push
4. `git tag vX.Y.Z && git push origin vX.Y.Z`
5. Workflow zip yasab Release ga ilovalaydi
6. CWS dashboard ga zip qo'lda upload
