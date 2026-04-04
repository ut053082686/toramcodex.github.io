# ToramDB — Toram Online Database

Fan-made database untuk game **Toram Online**, dihosting lewat GitHub Pages.
Developed by **No! I'm Failing!**

## 🗂️ Struktur Proyek

```
/
├── index.html            # Homepage — hero, kategori, spotlight, item & monster terbaru
├── css/style.css         # Mobile-first stylesheet (soft gray-white light theme)
├── js/
│   ├── main.js           # Hamburger menu, filter, search, back-to-top, animasi angka
│   ├── sheets.js         # Google Sheets CSV integration + auto icon mapping
│   └── modal.js          # Popup detail card (tanpa reload halaman)
├── pages/
│   ├── items.html        # Database item (senjata, armor, aksesori, material)
│   ├── monsters.html     # Database monster (boss, mini-boss, mob) + tabel drop
│   ├── skills.html       # Database skill (aktif, pasif, combo)
│   ├── maps.html         # Database map / area
│   ├── quests.html       # Database quest (main story, side, daily, event)
│   ├── pets.html         # Database pet (tame, raise, evolve companion pets)
│   └── detail.html       # Item detail page (legacy — fallback untuk direct link)
└── CHANGELOG.md          # Catatan perubahan
```

> **📋 Panduan pengisian Google Sheet:** Lihat [SPREADSHEET_GUIDE.md](SPREADSHEET_GUIDE.md) untuk dokumentasi lengkap semua tab dan kolom.

## 🎨 Tema & Desain

| Aspek | Detail |
|---|---|
| **Palet warna** | Soft gray-white light theme, aksen goldenrod `#b8860b` |
| **Element colors** | Fire `#d94b1a` · Ice `#2e8bc0` · Wind `#3a9d5e` · Earth `#8b6914` · Dark `#6a0dad` · Light `#d4a017` · Water `#1e7ca8` |
| **Rarity tags** | Event (gold/oranye) · Non-Event (default) |
| **Typography** | Segoe UI / system-ui, sans-serif |
| **Layout** | Mobile-first CSS Grid & Flexbox |
| **Navigasi** | Sticky navbar + hamburger drawer di mobile |
| **Komponen** | Card grid, data table, filter bar, pagination, breadcrumb, back-to-top, popup modal |

## ✨ Fitur

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Search bar tersinkron di navbar, mobile drawer, dan hero
- ✅ **Popup modal** untuk detail item & monster (tanpa reload halaman)
- ✅ **Google Sheets integration** — data auto-update dari spreadsheet
- ✅ **Smart icon system** — Mencari ikon spesifik dari `ItemDetails`, auto-detect tipe equipment, dan fallback premium (`items_ico.png`, `monsters_ico.png`)
- ✅ **Search Debouncing** — Pencarian responsif tanpa lag (jeda 300ms) untuk database besar
- ✅ **Monster Compare** — Tabel perbandingan stats (HP/Element) untuk semua tingkat kesulitan di dalam satu popup
- ✅ **Linked Drops** — Item drop di modal monster bisa diklik untuk langsung melihat detail item tersebut
- ✅ **Modernized Featured Showcase** — Spotlight item dengan grouping stat kondisional, limit badge otomatis (`+X more`), dan layout premium.
- ✅ **Grouped Modal Stats** — Detail item di modal kini terorganisir per kategori (Mastery/Requirement) dengan indentasi rapi.
- ✅ **Robust Stat Parsing** — Deteksi marker stat pintar yang toleran terhadap kesalahan pengetikan di spreadsheet.
- ✅ **Mobile UI Optimization** — Menu navigasi dan icon quest/pet yang lebih konsisten di tampilan mobile.
- ✅ Animated counter stats di hero
- ✅ Soft gray-white light theme — zero external CSS dependency
- ✅ **Detail modal untuk Pets** — klik baris pet untuk lihat detail lengkap (Normal Magic, Support, Act 1–5, Color Info)
- ✅ **Monster grouping** — Monster dengan nama sama dikelompokkan secara otomatis, variant (Hard/Nightmare/Ultimate) di-toggle
- ✅ **XSS protection** — Semua data dari Google Sheet di-sanitize sebelum render ke HTML
- ✅ **Universal Branching Tree** — Tampilan pohon peningkatan (Crysta) bercabang yang otomatis menyesuaikan di Web & Mobile dengan dukungan horizontal scroll.
- ✅ Aksesibilitas: ARIA labels, roles, `aria-expanded`, semantic HTML

## 📊 Google Sheets Setup

1. Buat Google Spreadsheet dengan tab: `Items`, `ItemDetails`, `Monsters`, `Skills`, `Maps`, `Quests`, `Pets`
2. **File → Share → Publish to web** → format CSV
3. Copy Sheet ID dari URL
4. Paste ke `js/sheets.js` → `SHEET_ID`

### Kolom yang diharapkan

| Sheet | Kolom |
|---|---|
| **Items** | Name, Icon, ImageURL, Type, Level, Stats, Rarity, Source |
| **ItemDetails** | Name, Icon, Type, Level, ImageURL, SellSpina, SellOther, Stats, Obtain, Recipe |
| **Monsters** | Name, Icon, ImageURL, Level, Difficulty, Type, Element, HP, Location, Drop |
| **Skills** | Name, Icon, ImageURL, Type, Category, Damage, MP Cost, Description |
| **Maps** | Name, Icon, ImageURL, Zone, LevelRange, Boss, Description |
| **Quests** | Name, Icon, ImageURL, Type, MinLevel, Reward, Description |
| **Pets** | Name, Icon, ImageURL, Level, SpawnAt, NormalMagic, Support, Act1–Act5, ColorInfo |
| **Homepage** | Section, Name, Icon, ImageURL, Link, Count, Description, Type, Level, Rarity, Stats, Source |

> **Note:** `Icon` dan `ImageURL` opsional di semua sheet. Jika kosong, sistem otomatis memilih emoji berdasarkan tipe equipment.

### Homepage Sheet — Section Values

| Section | Fungsi | Kolom yang dipakai |
|---|---|---|
| `category` | Card kategori di homepage | Name, Icon, ImageURL, Link, Count |
| `featured` | Spotlight / featured item | Name, Icon, ImageURL, Type, Level, Rarity, Stats, Description, Link |
| `popular_monster` | Card monster populer + detail popup | Name, Icon, ImageURL, Type, Level, Stats (=Element), Source (=HP), Description (=Location) |
| `stat` | Counter angka di hero section | Name (label), Count (angka), Icon (suffix, misal "+") |

### Default Icon per Equipment Type

> **Note:** Sejak v0.7.0, icon weapon dan armor di card menggunakan **file PNG** dari `img/icons/`,
> bukan emoji. Tabel di bawah menampilkan emoji hanya sebagai referensi visual.
> Lihat `js/sheets.js` → `TYPE_ICONS` untuk mapping lengkap.

| Type | Icon (visual) | File | | Type | Icon (visual) | File |
|---|---|---|---|---|---|---|
| 1-Handed Sword | 🗡️ | `1h_ico.png` | | Shield | 🛡️ | `shield_ico.png` |
| 2-Handed Sword | ⚔️ | `2h_ico.png` | | Armor | 🛡️ | `armor_ico.png` |
| Bow | 🏹 | `bow_ico.png` | | Ninjutsu Scroll | 📜 | `scroll_ico.png` |
| Bowgun | 🔫 | `bwg_ico.png` | | Additional | 💍 | `add_ico.png` |
| Knuckles | 🥊 | `knu_ico.png` | | Special / Ring | ⭐ | `special_ico.png` |
| Magic Device | 🔮 | `md_ico.png` | | Beast | 🐾 | `beast_ico.png` |
| Staff | 🪄 | `stf_ico.png` | | Cloth | 🎽 | `cloth_ico.png` |
| Halberd | 🔱 | `hb_ico.png` | | Mana | 💧 | `mana_ico.png` |
| Katana | ⚔️ | `ktn_ico.png` | | Wood | 🪵 | `wood_ico.png` |
| Dagger | 🔪 | `dagger_ico.png` | | Metal | ⚙️ | `metal_ico.png` |
| Arrow | 🎯 | `arrow_ico.png` | | Medicine | 💊 | `medicine_ico.png` |
| Monster (Boss) | 🐉 | `boss_ico.png`| | Teleport | 🪶 | `tele_ico.png` |
| Monster (Normal) | 👾 | _(emoji)_ | | Material (Other)| ⛏️ | _(emoji)_ |
| Skill | ✨ | _(emoji)_ | | Pet | 🐾 | _(emoji)_ |
| Map | 🗺️ | _(emoji)_ | | | | |

### Rekomendasi Ukuran Gambar (ImageURL)

Semua gambar dari Google Sheet otomatis di-resize. Berikut ukuran yang direkomendasikan:

| Komponen | Display Size | Upload (2×) | Rasio | Maks File |
|---|---|---|---|---|
| Monster / Pet table icon | 24×24 px | **48×48 px** | 1:1 | 50 KB |
| Data card icon (Items, Skills, dll) | 44×44 px | **88×88 px** | 1:1 | 80 KB |
| Category card (homepage) | 48×48 px | **96×96 px** | 1:1 | 80 KB |
| Spotlight / featured item | 64×64 px | **128×128 px** | 1:1 | 100 KB |
| Detail modal image | max 200px | **400×400 px** | 1:1 / bebas | 200 KB |

> **Tips:**
> - Upload 2× display size supaya tajam di layar retina (MacBook, iPhone, dll)
> - Format: **WebP** (terkecil) / PNG (transparansi) / JPEG (foto)
> - Selalu gunakan rasio **1:1 (square)** — gambar non-square akan di-crop atau di-shrink otomatis
> - Kolom `ImageURL` opsional — jika kosong, sistem otomatis pakai emoji

### Google Sheets Rate Limit

| Limit | Detail |
|---|---|
| Per-menit | ~300 request per Sheet |
| Cache | Google cache CSV ~5 menit (perubahan tidak langsung terlihat) |
| Bandwidth | Tidak ada hard limit |

> Untuk traffic normal (~ratusan visitor/hari) tidak akan kena limit. Jika traffic tinggi, pertimbangkan cache ke JSON file.

## 🚀 GitHub Pages

Aktifkan di **Settings → Pages → Deploy from branch `main`** (root `/`).

---

> **Disclaimer:** ToramDB adalah proyek fan-made dan tidak berafiliasi dengan Asobimo, Inc.  
> Toram Online™ adalah merek dagang milik Asobimo, Inc.
