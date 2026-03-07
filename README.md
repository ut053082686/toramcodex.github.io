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
- ✅ Filter real-time (nama + kategori + rarity) tanpa reload
- ✅ **Popup modal** untuk detail item (tanpa reload halaman)
- ✅ **Google Sheets integration** — data auto-update dari spreadsheet
- ✅ **Smart icon system** — ImageURL dari Sheet > Icon emoji dari Sheet > auto-detect dari tipe equipment
- ✅ Animated counter stats di hero
- ✅ Soft gray-white light theme — zero external CSS dependency
- ✅ **Detail modal untuk Pets** — klik baris pet untuk lihat detail lengkap (Normal Magic, Support, Act 1–5, Color Info)
- ✅ **Pet modal Preview** — Gambar besar pet (120×120) dengan label "Preview" di atas, centered
- ✅ **XSS protection** — Semua data dari Google Sheet di-sanitize sebelum render ke HTML
- ✅ **Monster grouping** — Skema A collapsible: monster sama dikelompokkan, variant di-toggle
- ✅ **Mobile card layout** — Tabel Monsters & Pets jadi grid card di layar kecil (≤480px)
- ✅ **Home search category** — Dropdown kategori di hero search
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
| Knuckles | 🥊 | `knu_ico.png` | | Special | ⭐ | `special_ico.png` |
| Magic Device | 🔮 | `md_ico.png` | | Ring | 💍 | `special_ico.png` |
| Staff | 🪄 | `stf_ico.png` | | Material | ⛏️ | _(emoji)_ |
| Halberd | 🔱 | `hb_ico.png` | | Monster (Boss) | 🐉 | `boss_ico.png` |
| Katana | ⚔️ | `ktn_ico.png` | | Monster (Normal) | 👾 | _(emoji)_ |
| Dagger | 🔪 | `dagger_ico.png` | | Skill | ✨ | _(emoji)_ |
| Arrow | 🎯 | `arrow_ico.png` | | Map | 🗺️ | _(emoji)_ |
| | | | | Pet | 🐾 | _(emoji)_ |

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

> **Disclaimer:** ToramCodex adalah proyek fan-made dan tidak berafiliasi dengan Asobimo, Inc.  
> Toram Online™ adalah merek dagang milik Asobimo, Inc.
