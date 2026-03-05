# Changelog — ToramCodex

Semua perubahan penting pada proyek ToramCodex dicatat di sini.

---

## [0.7.0] — 2026-03-05

### Added
- **Custom PNG icons** — Default icon per Type sekarang pakai gambar PNG dari `img/icons/` (bukan emoji)
- 22 icon file: 1h_ico, 2h_ico, bow_ico, bwg_ico, stf_ico, md_ico, knu_ico, hb_ico, ktn_ico, dagger_ico, arrow_ico, shield_ico, armor_ico, scroll_ico, add_ico, special_ico + 6 Crysta icons
- **6 Crysta types** baru: Additional Crysta, Ring Crysta, Armor Crysta, Weapon Crysta, Special Crysta, Normal Crysta
- `ICON_BASE` auto-detect — path otomatis menyesuaikan apakah halaman di root atau `pages/`
- `iconHTML()` mendukung icon gambar (path relatif & URL) selain emoji
- **SPREADSHEET_GUIDE.md** — Dokumentasi lengkap pengisian 8 tab Google Sheet dengan contoh data
- Folder `img/icons/` untuk hosting gambar icon di repo

### Changed
- `TYPE_ICONS` map: emoji diganti PNG path untuk semua equipment/weapon type (Material, Consumable, Quest Item tetap emoji)
- `resolveIcon()` sekarang resolve path relatif via `ICON_BASE`
- Fallback default dari emoji 🗡️ ke `img/icons/1h_ico.png`
- SPREADSHEET_GUIDE.md diupdate: tabel Type→Icon pakai gambar, section Crysta, tips hosting gambar

---

## [0.6.0] — 2026-03-05

### Added
- **Pets page** — Halaman baru `pages/pets.html` dengan database pet companion Toram Online (format tabel seperti Monsters)
- 10 sample pets: Cerberus Pup, Frost Owl, Spirit Fox, Stone Golem, Shadow Bat, Wind Sprite, Crystal Turtle, Thunder Wolf, Phoenix Chick, Ice Dragon
- Kolom tabel default: Pet, Level, Spawn At (3 kolom)
- **Element auto-toggle** — Kolom Element + filter otomatis muncul jika diisi di Google Sheet, hidden jika kosong
- `renderPets()` renderer di sheets.js untuk Google Sheet tab `Pets`
- Sheet tab `Pets` dengan kolom: Name, Icon, ImageURL, Element (opsional), Level, SpawnAt
- Link navigasi "Pets" ditambahkan ke semua halaman (navbar, mobile menu, footer)

### Changed
- README.md diperbarui dengan pets.html di struktur proyek dan kolom Pets sheet
- sheets.js HOW TO SET UP documentation diperbarui dengan Pets tab

---

## [0.5.0] — 2026-03-05

### Added
- **Homepage Google Sheets integration** — Kategori, featured item, dan hero stats bisa diupdate dari Google Sheet
- Sheet tab baru: `Homepage` dengan kolom `Section` (category / featured / stat)
- `loadHomepage()` function di sheets.js — render categories grid, spotlight card, dan hero stats dari Sheet
- CSS: `.cat-icon img` dan `.spotlight-icon img` styling untuk gambar dari Sheet
- `window.animateCounters` exposed globally untuk re-trigger counter animation setelah stats di-load

### Changed
- `categories-grid`, `spotlight-card`, `hero-stats` sekarang punya ID untuk dynamic update
- main.js: Counter animation di-refactor ke `setupCounters()` function yang bisa dipanggil ulang
- README.md diperbarui dengan dokumentasi Homepage sheet

---

## [0.4.0] — 2026-03-05

### Added
- **Smart icon mapping** — Icon otomatis berdasarkan tipe equipment Toram Online (1-Handed Sword → 🗡️, Bow → 🏹, Staff → 🪄, dll.)
- Mendukung 17 tipe equipment + material, consumable, dan quest item
- Fallback 3 level: `ImageURL` > `Icon` (dari Sheet) > auto-detect dari `Type`
- `resolveIcon(type)` di-expose sebagai public API di `ToramSheets`
- Modal popup juga menggunakan smart icon fallback

### Changed
- `iconHTML()` sekarang menerima `type` sebagai parameter ke-3 (bukan hardcoded default emoji)
- Monster renderer: Boss → 🐉 default, Normal → 👾 default
- README.md diperbarui dengan struktur proyek lengkap, dokumentasi Google Sheets, dan tabel default icon

---

## [0.3.0] — 2026-03-05

### Added
- **Google Sheets `ImageURL` support** — Semua section (Items, Monsters, Skills, Maps, Quests) bisa menampilkan gambar dari Google Sheet
- Jika `ImageURL` kosong, gunakan emoji `Icon` dari Sheet; jika keduanya kosong, gunakan default emoji
- `loadLatest()` function untuk homepage — load X item pertama dari Sheet
- CSS `overflow: hidden` + `img` styling pada `.data-card-icon`

### Changed
- Semua renderer di sheets.js mendukung kolom `ImageURL` baru
- index.html: Latest Items & Popular Monsters grid pakai ID (`latestItemsGrid`, `popularMonstersGrid`) untuk dynamic loading
- Item cards di homepage pakai event delegation untuk click handler
- Dokumentasi kolom Sheet ditambah `ImageURL` untuk semua tab

---

## [0.2.0] — 2026-03-05

### Added
- **Popup modal** untuk item detail — klik card untuk lihat detail tanpa reload halaman
- `js/modal.js` — IIFE module `ItemModal` dengan `open(name)` / `close()`
- Modal CSS: fade-in, slide-up animation, bottom-sheet pattern di mobile
- Tab: Stats/Effects, Obtain, Recipe di dalam modal
- Close via: tombol ✕, klik overlay, tekan Escape
- Body scroll lock saat modal terbuka
- `data-name` attribute pada semua item cards
- `pages/detail.html` + `js/detail.js` sebagai fallback detail page

### Changed
- `pages/items.html`: Click handler → `ItemModal.open()` bukan redirect ke detail.html
- `index.html`: Item cards clickable → popup modal
- `js/sheets.js`: Expose `fetchSheet`, `parseCSV`, `esc` sebagai public API; tambah config `itemdetails`

---

## [0.1.1] — 2026-03-05

### Changed
- **Tema warna**: Dari dark blue RPG → warm amber/gold → **soft gray-white light theme**
- Background: `#f4f5f7` (off-white), card: `#ffffff`, accent: goldenrod `#b8860b`
- Element color system: Fire, Ice, Wind, Earth, Dark, Light, Water
- Rarity color system: Common, Uncommon, Rare, Epic, Legendary
- Semua halaman diupdate dengan tag class baru

---

## [0.1.0] — 2026-03-05

### Added
- **Initial release** — Project setup
- Homepage dengan hero section, kategori grid, spotlight, latest items & monsters
- 5 halaman database: Items, Monsters, Skills, Maps, Quests
- `js/sheets.js` — Google Sheets CSV integration
- `js/main.js` — Hamburger menu, search sync, filter, back-to-top, counter animation
- `css/style.css` — Mobile-first responsive design
- GitHub Pages deployment
