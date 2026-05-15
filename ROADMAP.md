# Chrome Web Store — Chiqarish Roadmap

## Bosqich 1: Tayyor qilish (1-2 hafta)

### Kod sifati
- [ ] Barcha featurelarni sinash (whitelist, focus mode, gesture, duplicate blocker)
- [ ] Edge case'larni tekshirish (iframe, SPA saytlar, YouTube, Twitter)
- [ ] Memory leak yo'qligini tasdiqlash (MutationObserver, event listeners)
- [ ] `"use strict"` qo'shish barcha JS fayllariga
- [ ] Console.log'larni o'chirish

### Manifest tekshirish
- [ ] `version` to'g'ri (semver: 3.0.0)
- [ ] Faqat kerakli permission'lar (`storage`, `tabs`) — ortiqcha yo'q
- [ ] `description` 132 belgidan oshmasin (Chrome limit)
- [ ] `homepage_url` qo'shish (GitHub link)

### Icon'lar
- [ ] 128×128 — Store sahifasi uchun (asosiy)
- [ ] 16, 32, 48 — toolbar uchun
- [ ] Barcha icon'lar tiniq, professional ko'rinishi

---

## Bosqich 2: Store materiallari (3-5 kun)

### Screenshots (majburiy, min 1280×800 yoki 640×400)
- [ ] Screenshot 1 — Popup (enabled holat, whitelist ko'rsatilgan)
- [ ] Screenshot 2 — Options sahifasi (whitelist ro'yxati)
- [ ] Screenshot 3 — Gesture navigation demo (before/after)
- [ ] Screenshot 4 — Stats ko'rsatilgan holat
- Maksimum 5 ta screenshot

### Promotional images (ixtiyoriy lekin muhim)
- [ ] Small promo tile: 440×280 px
- [ ] Large promo tile: 920×680 px (featured bo'lish uchun)
- [ ] Marquee: 1400×560 px

### Store matn (inglizcha)
- [ ] **Nom** (45 belgi max): `Same Tab Link Opener`
- [ ] **Qisqa tavsif** (132 belgi max): tayyor ✓
- [ ] **To'liq tavsif** (markdown yo'q, oddiy matn):
  - Nima qiladi
  - Asosiy featurelar ro'yxati
  - Qanday ishlaydi
  - Privacy (hech qanday ma'lumot yig'ilmaydi)

### Privacy Policy (majburiy)
- [ ] Oddiy sahifa yoz (GitHub Pages yoki Notion)
- [ ] Mazmun: "Hech qanday ma'lumot yig'ilmaydi, serverga yuborilmaydi"
- [ ] URL tayyorlash

---

## Bosqich 3: Developer akkount (bir martalik)

- [ ] Google Developer akkount ochish
- [ ] **$5 bir martalik to'lov** (kredit karta kerak)
  - To'lov: https://chrome.google.com/webstore/devconsole
- [ ] Shaxsiy ma'lumotlar to'ldirish (ism, mamlakat)

---

## Bosqich 4: Yuklash va review

### ZIP tayyorlash
```bash
cd "Projects/Scripts"
zip -r same-tab-v3.0.zip "Open Same Tab" \
  --exclude "*.py" \
  --exclude "*.md" \
  --exclude ".git*"
```

### Developer Console
- [ ] https://chrome.google.com/webstore/devconsole ga kirish
- [ ] "New item" → ZIP yuklash
- [ ] Barcha maydonlarni to'ldirish
- [ ] Category: `Productivity`
- [ ] Language: `English`
- [ ] Privacy policy URL qo'shish
- [ ] Screenshot'larni yuklash

### Review jarayoni
- Birinchi marta: **3-7 ish kuni** (qo'lda review)
- Keyingi update'lar: **1-3 kun**
- Rad etilsa: sabab ko'rsatiladi, tuzatib qayta yuborsa bo'ladi

---

## Bosqich 5: Nashr va marketing

### Birinchi kun
- [ ] ProductHunt'ga post qo'yish
- [ ] Reddit: r/chrome, r/productivity, r/webdev
- [ ] Telegram dasturlash kanallariga yuborish

### Keyinchalik
- [ ] GitHub repo ochish (open source = ishonch)
- [ ] README yozish (screenshot'lar bilan)
- [ ] User review so'rash (popup'da "Rate us" qo'shish)

---

## Muhim cheklovlar

| Narsa | Limit |
|-------|-------|
| Extension size | Max 10 MB |
| Description | Max 16,000 belgi |
| Screenshots | Min 1, max 5 |
| Review vaqti | 3-7 kun |
| Developer to'lov | $5 (bir marta) |

---

## Taqriban jadval

| Hafta | Ish |
|-------|-----|
| 1 | Testing, bug fix, edge cases |
| 2 | Store materiallari (screenshot, matn, privacy) |
| 3 | Developer akkount, yuklash, review kutish |
| 4 | Nashr + marketing |
