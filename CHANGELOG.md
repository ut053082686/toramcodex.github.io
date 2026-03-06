# Changelog — ToramCodex

Semua perubahan penting pada proyek ToramCodex dicatat di sini.

---

## [0.12.0] — 2026-03-06

### Fixed
- **XSS vulnerability pada Pet modal** — Data dari Google Sheet (emoji, support, act1–5) sekarang di-escape sebelum dimasukkan ke innerHTML modal. Sebelumnya, data dari Sheet bisa berisi tag HTML/script berbahaya yang langsung dieksekusi.
- **Double-escaping pada dataset** — Nilai dataset pet sekarang disimpan tanpa pre-escape (`esc()` hanya dilakukan saat render ke innerHTML). Mencegah munculnya `&amp;` atau `&lt;` di tampilan modal.
- **Pet modal image centering** — Tambah `margin:0 auto` pada gambar pet di modal. Global CSS `img { display: block }` membuat `text-align:center` tidak efektif untuk block element.
- **Body scroll lock pada Pet modal** — Tambah `body.overflow = 'hidden'` saat modal terbuka, mengembalikan saat modal ditutup (sebelumnya background bisa di-scroll saat modal Pet terbuka).

### Added
- **Preview label** di atas gambar pet modal — Teks kecil "Preview" dengan spacing atas 1rem agar gambar tidak terlalu mepet ke tombol close.

---

## [0.11.0] — 2026-03-06

### Changed
- **Pets page redesigned** — tabel list disederhanakan jadi 3 kolom ringan: Pet (gambar + nama), Level, Spawn At
- **Detail modal untuk Pets** — klik baris pet untuk melihat detail lengkap: Normal Magic, Support, Act 1–5, Color Info
- Data detail disimpan di `data-*` attribute dan ditampilkan dalam popup modal (reuse `.modal-overlay` CSS)
- Kolom Google Sheet Pets diperluas: Name, Icon, ImageURL, Level, SpawnAt, NormalMagic, Support, Act1–Act5, ColorInfo
- Row hover highlight pada tabel pets (mengindikasikan bisa diklik)

---

## [0.10.0] — 2026-03-06

### Added
- **Skema A — Collapsible grouped monsters** — Monster dengan nama sama dikelompokkan, variant tersembunyi bisa dibuka/tutup
- **Colored difficulty badges** di toggle — Badge warna mini (Easy hijau, Normal biru, Hard kuning, Nightmare merah, Ultimate ungu)
- **Home search category dropdown** — Pilih kategori (Items/Monsters/Skills/Maps/Quests/Pets) sebelum search di hero
- **Nav search Enter handler** — Tekan Enter di nav search: filter di halaman list, redirect dari homepage
- **Missing element filters** — Water, Earth, Neutral ditambahkan ke dropdown filter Monsters
- **Boss icon PNG** — Boss type pakai `boss_ico.png` dari `img/icons/` (bukan emoji 🐉)
- **Mobile card layout** — Tabel Monsters & Pets otomatis jadi grid card di layar ≤480px

### Changed
- Variant monster di-sort berdasarkan difficulty order (Easy → Ultimate)
- Toggle label berubah dari teks biasa ke colored mini badges, dipindah ke baris baru di bawah nama
- Monster name column `white-space: nowrap` di desktop
- Icon dan nama monster sejajar horizontal (`inline-flex`)
- Filter (`applyTableFilter` & `applyFilter`) sekarang menghormati collapsed variant rows
- Mobile card: CSS grid `1fr 1fr` — Diff|Type berdampingan, Element|HP berdampingan, Name/Level/Location/Drop full-width
- Drop tags di mobile ditumpuk vertikal

---

## [0.9.0] — 2026-03-06

### Added
- **Kolom Difficulty** pada Monsters — 5 tingkat kesulitan: Easy (hijau), Normal (biru), Hard (kuning), Nightmare (merah), Ultimate (ungu)
- **Drop tag badges** — Setiap item drop dipisahkan `;` dan ditampilkan sebagai tag terpisah
- **Collapsible drops** — Jika drop >3 item, tampilkan 3 + tombol "+N more" yang bisa diklik expand/collapse
- **Mini Boss tag** — Warna oranye khusus + no-wrap agar teks tidak terpotong

### Changed
- **Data display order** diubah dari FIFO ke **LIFO** — data terbaru (paling bawah di Sheet) tampil di paling atas website
- Tabel Monsters sekarang 8 kolom: Monster, Level, Difficulty, Type, Element, HP, Location, Main Drop

---

## [0.8.0] — 2026-03-05

### Changed
- **Rarity system** diganti dari Common/Rare/Epic/Legendary menjadi **Event / Non-Event**
- Badge `Event` tampil warna gold/oranye, `Non-Event` warna default abu-abu
- Filter dropdown di halaman Items sekarang: All / Event / Non-Event
- Update CSS: hapus rarity colors lama, tambah `.tag.event` dan `.tag.non-event`
- Update semua sample data dan dokumentasi

---

## [0.7.1] — 2026-03-05

### Changed
- **Pisahkan fungsi Icon vs ImageURL** — Icon = ikon kecil di card list, ImageURL = gambar besar di popup detail modal
- Card Items sekarang hanya pakai kolom Icon / auto-detect Type (tidak lagi pakai ImageURL)
- ImageURL khusus untuk gambar besar di detail modal popup
- Update dokumentasi SPREADSHEET_GUIDE.md menjelaskan perbedaan Icon vs ImageURL

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
