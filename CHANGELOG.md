# Changelog — ToramDB

Semua perubahan penting pada proyek ToramDB dicatat di sini.

## [0.46.0] - 2026-03-25
### Added
- **Custom Icon Assets**: Integrated official `quest_ico.png`, `pets_ico.png`, and `fee_ico.png` across the entire platform.
- **Visual Overhaul**: Replaced Quest and Pet emojis with high-quality icon assets in the homepage categories, mobile menus, and page headers.
- **Default Fallback Logic**: Refactored `sheets.js` and `modal.js` to use these new icons as the default representation for Quest items, Pets, and Crafting Fees if no specific icon is provided in the Sheet.

## [0.45.0] - 2026-03-25
### Added
- **Featured Showcase (Homepage)**: Redesigned the "Featured" section from a single large card to a responsive **3-column Grid**.
- **Multi-Featured Support**: Users can now highlight up to 3 different entries (Items, Monsters, Pets) simultaneously via the Google Sheets `Homepage` tab.
- **Showcase Cards**: New vertical card design with large icons and accent borders for highlighted content.

## [0.44.1] - 2026-03-25
### Fixed
- **Pet Event Highlighting**: Forced the "Spawn At" tags to display as **Orange** for events and **Grey** for standard maps using direct inline styling, ensuring a consistent premium look regardless of CSS caching.

## [0.44.0] - 2026-03-25
### Added
- **Pet Database Modernization**: Completely overhauled the Pet page from a legacy table to a modern, responsive **Data Grid** layout.
- **Event-Aware Tagging**: Pet locations now feature smart categorization: orange "Event" tags for limited-time pets and blue "Info" tags for standard spawns.
- **Improved Card Scaling**: Standardized pet avatars to the platform's `.data-card` spec (44x44px), resolving oversized and pixelated image issues.

### Fixed
- **Pet Modal Icon Fallback**: Resolved a bug where icons were missing in the Pet detail modal. Integrated the `ToramSheets.iconHTML` helper to ensure the standard 💰 icon (or other fallbacks) appears when no `ImageURL` is available.
- **Grid Layout Alignment**: Corrected the Pet grid's CSS targeting to use the robust `.data-grid` system, providing a professional multi-column experience across all devices.
- **Modal Visual Polish**: Refined the Pet detail modal header with a centered, styled preview container for a more premium and "neat" feel.

## [0.43.0] - 2026-03-19
### Added
- **Monster Modal Overhaul**: Completely redesigned the monster detail modal with a Compare tab for difficulty variants (Easy, Normal, Hard, Nightmare, Ultimate).
- **Smart Drop Icon Mapping**: Drop items in the monster modal now automatically fetch their specific icons from the `ItemDetails` sheet, with a fall-back to category-specific `items_ico.png`.
- **Search Debouncing**: Implemented 300ms debouncing for all search inputs to optimize performance and prevent lag on large datasets.
- **Unified Monster Element Filter**: Fixed the element filter logic to correctly target the `Element` column for monsters and standardizing the elements to the canonical 7 Toram elements.

### Fixed
- **Monster Modal Sync**: Resolved race conditions where drop icons would intermittently fail to load or show placeholders when data was cached.
- **Image Scaling**: Standardized `object-fit: contain` for monster images to prevent awkward zooming/cropping.
- **Error Feedback**: Improved the "No Data" message in `sheets.js` to distinguish between a missing database and an empty filter result.

## [0.42.2] - 2026-03-18
### Fixed
- **Monster Variant Grouping**: Fixed a critical visual bug on the Monsters page where monster variants (Normal, Hard, Nightmare, Ultimate) were being split across different pages. The `paginate()` logic now intelligently groups rows by monster name before pagination, guaranteeing that all variants of a monster stay harmoniously together on the same page.

## [0.42.1] - 2026-03-18
### Fixed
- **Level Cap Constraint**: Removed the hardcoded `LV_CAP` (315) limit within the EXP simulator loop. The calculator can now accurately simulate runs to future target levels (e.g., 330 or 350) without artificially stopping at 315.

## [0.42.0] - 2026-03-18
### Fixed
- **EXP Calculator Precision**: Fixed a mathematical discrepancy in `calculator.js` where fractional percentages were truncated during simulated runs, ensuring 100% alignment with ToramTools logic.
- **Venena Boss XP Detection**: Corrected the logic that grants 12.5M bonus XP for the "Venena Meta Coenubia" fight. The system now accurately checks both the Boss Name and Quest Name variables.

## [0.41.1] - 2026-03-18
### Added
- **Quest Data Recovery**: Restored `Quests_Import.csv` using live Google Sheets data as a reliable offline backup.
- **Unified Monster Schema**: Developed a technical proposal to map Monster data into the Item/ItemDetail format, paving the way for universal search and a standardized UI.

## [0.41.0] - 2026-03-18
### Added
- **Multi-Boss Support**: Quest cards now support multiple bosses (e.g., "Boss A & Boss B"). Each name is automatically split and turned into an independent clickable link that opens the monster detail modal.
- **Smart Link Delimiters**: Supports various separators like `&`, `,`, and `and` to ensure clean lookups in the monster database.

## [0.40.3] - 2026-03-18
### Fixed
- **Modal Data Persistence**: Explicitly clearing all modal fields when a monster is not found, preventing stale data from the previous monster from being displayed.
### Added
- **Conditional Quest Description**: Restored the `Description` field to Quest cards. Descriptions are now intelligently hidden if empty or containing placeholder values (`-`).
- **Description Styling**: Added a dedicated style for quest descriptions to maintain a clean visual hierarchy.

## [0.40.2] - 2026-03-18
### Added
- **Premium Quest Header**: Merged Chapter and Quest Type into a "Double Badge" header (Icon | Chapter | Type) for a cleaner, more professional look.
- **Interactive Boss Modal**: Fully integrated Monster Modal into the Quests page, enabling Boss links to work correctly.
- **Boss Link Indicator**: Added a distinct underline and hover effect on Boss names to clearly indicate they are interactive links.

## [0.40.1] - 2026-03-18
### Fixed
- **Quest Display Fix**: Resolved a `ReferenceError` that was preventing Quest cards from being rendered. All quests now correctly appear with the new 4-row layout.

## [0.40.0] - 2026-03-18
### Added
- **Quest UI Redesign**: Completely overhauled the Quest card layout into a 4-row structure:
  1. Icon | Chapter info
  2. Quest Category (Main/Side)
  3. Episode XX : Quest Name
  4. Boss info (Clickable link to Monster Modal)
- **Interactive Bosses**: Quest boss names are now interactive links that open the monster detail popup when clicked.
- **EXP Calculator Safety**: Verified and ensured that UI changes do not interfere with the EXP calculator logic.

## [0.39.0] - 2026-03-18
### Fixed
- **Item Badge Layout**: Resolved the issue where item badges (Rarity, Drop, Stats) were stacked vertically. Implemented a horizontal `.tag-row` container to ensure cards look cleaner and badges are aligned 'Event | Drop' style.
- **Homepage Polish**: Applied the horizontal tag logic to the "Featured Item" section on the homepage for visual consistency.

## [0.38.0] - 2026-03-18
### Fixed
- **Popular Monsters UI**: Refined monster cards on the homepage to match the detail modal aesthetic. Added "HP " prefix, improved tag padding, and increased font weight for a premium look.
- **Consistent Tag Layout**: Implemented a flexible container for monster tags to ensure they are consistently aligned at the bottom of the card.

## [0.37.0] - 2026-03-18
### Fixed
- **Quest Card Consistency**: Implemented Flexbox layout for all quest cards to ensure uniform heights in the grid and consistent alignment for titles and rewards.
- **Loading UI Polish**: Standardized skeleton placeholder heights in `quests.html` to eliminate layout shifting during data fetch.

## [0.36.0] - 2026-03-18
### Fixed
- **Quest Page Display**: Resolved the issue where the Quest list was stuck in a loading state (skeletons) by replacing incompatible `.includes()` calls with `.indexOf()` in `main.js`.
- **Robust Rendering**: Improved `renderQuests` in `sheets.js` to handle missing or undefined data more gracefully, ensuring the database always displays available content.
- **UI Cleanup**: Removed legacy hardcoded quest cards from `quests.html` to prevent layout flickering and ensure a clean dynamic loading experience.

## [0.35.0] - 2026-03-18
### Fixed
- **Items Filter Logic**: Updated the filtering for "Drop", "Craft NPC", and "Craft Player" to correctly use the **Rarity** column from Google Sheets, resolving the "No data found" issue.
- **Quest List Polish**: Refined the visual design of Quest cards for the light theme, including a cleaner `tag-ch` badge and an enhanced `reward-box` for better readability.
- **Schema Update**: Synchronized the technical mapping documentation to reflect the latest data structure requirements.

## [0.34.0] - 2026-03-17
### Fixed
- **UI Revert**: Restored the light theme (v0.32.1) for Quests and Items pages as requested by the user.
- **Items Filter Stability**: Refactored `main.js` filtering logic to resolve errors on the Items page, ensuring accurate category matching.
- **Robust Data Loading**: Improved synchronization between `sheets.js` and `main.js` using a custom event signal for reliable rendering.
- **Quest Chronology Fix**: Maintained the chronological quest order (CH1 to CH15) despite the UI revert.
- **Compatibility**: Replaced modern `.includes()` with broader-supported `.indexOf()` for better script reliability.

## [0.33.0] - 2026-03-17
### Added
- **Premium UI Redesign**: Completely overhauled the Quests and Items pages with a modern, glassmorphism-inspired "Hero Search" section and enhanced cards.
- **Dynamic Quest Categories**: Quest cards now feature colored border accents based on category (Main, Side, Daily, Event).
### Fixed
- **Quest Chronology**: Restored chronological order (CH1 to CH15) for Quests in `sheets.js`, fixing the simulation sequence and dropdown order in the calculator.
- **Robust Pagination**: Completely refactored the pagination logic in `main.js` to ensure visibility across all database pages and handle dynamic data loading correctly.
- **Selective Data Reversing**: Implemented logic to keep Quests chronological while keeping Items/Monsters reversed (latest first).

## [0.32.1] - 2026-03-17
### Fixed
- Missing pagination styles in `style.css`: Pagination controls are now visible and beautifully styled.
- MQ Calculator "Final Chapter" format: Now correctly shows "CH XX - [Quest Name]" (e.g., CH12 - Ark Crisis).
- Robust pagination element selection in `main.js`.

## [0.32.0] - 2026-03-17
### Added
- "Partial Run" logic in MQ Calculator simulation: The simulation now stops accurately at the quest where the target level is reached, showing the correct final chapter and percentage.
- Diagnostic logging to `main.js` to help troubleshoot data loading and pagination issues.
### Fixed
- Calculator percentage overflow (e.g., 545%) at level cap.
- Improved Quest category matching in `main.js` to ensure pagination controls appear reliably.

## [0.31.0] - 2026-03-17
### Added
- Pagination to Quests page (20 items per page).
- Deep search for Quests (now searches in Reward, Description, and Chapter columns).
- Generalized filtering logic in `main.js` to support all database pages (Items, Quests, etc.) with consistent category mapping.

## [0.30.0] — 2026-03-17
### Added
- **MQ Calculator Redesign**: Perombakan total UI dan logika kalkulator MQ.
  - **Advanced Logic**: Menggunakan formula EXP murni Toram Tools (`xp.js`) untuk hasil yang sangat akurat.
  - **Quest-to-Quest Selection**: User kini bisa memilih rentang quest secara spesifik ( From - Until) langsung dari data Google Sheets.
  - **Venena Logic Support**: Penanganan otomatis bonus EXP 12.5M dari "Pre-Venena Meta Coenubia Fight".
  - **Diary Simulation**: Tabel simulasi level per "Run" (Diary) untuk perencanaan leveling jangka panjang.
  - **Lvl + Pct Prediction**: Hasil kalkulasi kini menunjukkan Level dan Persentase (%) akhir yang akan dicapai.

---

## [0.29.0] — 2026-03-17
### Added
- **Quest UI Enhancements**: Tampilan halaman Quests yang lebih premium dan informatif.
  - **Chapter Badges**: Marker chapter otomatis pada setiap kartu quest.
  - **Reward Highlighting**: Kotak Reward khusus untuk menonjolkan jumlah EXP dan item.
  - **Quick Calculator Link**: Tombol "Use Calculator" pada kartu Main Quest untuk akses instan.
- **Dynamic Loading**: Halaman Quests kini sepenuhnya mengambil data dari Google Sheets (mendukung 120+ data MQ).

---

## [0.28.0] — 2026-03-17
### Added
- **MQ EXP Calculator**: Alat baru untuk menghitung kebutuhan EXP Main Quest (MQ) berdasarkan formula Toram Tools.
  - Data quest diambil secara dinamis dari tab **Quests** di Google Sheets.
  - Mendukung simulasi "Run" atau "Spam" quest untuk mencapai target level.
- **Other Tools Dropdown**: Penambahan menu dropdown "Other Tools" pada navigasi utama untuk akses fitur-fitur baru di masa depan.
- **Mobile Navigation Update**: Menu kalkulator baru juga tersedia di navigasi mobile.

---

## [0.27.0] — 2026-03-17

## [0.26.0] — 2026-03-16

---

## [0.25.0] — 2026-03-16
### Added
- **Pet Act Tooltips**: Menambahkan informasi tambahan dalam Bahasa Inggris pada panah ↑ dan ↓ di Modal Pet.
  - ↑: "Extra effect / Enhanced support"
  - ↓: "Reduced stability for physical/magic attacks"
### Fixed
- **Modal Crash Fix**: Menghapus logika "Favorite" yang usang di `modal.js` untuk memperbaiki error `TypeError` saat membuka modal item.
### Changed
- **Code Cleanup**: Menghapus semua debug log (`console.log`) pada modul Sheets dan Pet untuk performa yang lebih bersih.

---

## [0.24.9] — 2026-03-16
### Fixed
- **Literal Data Fetching (Pet Data Fix)**: Solusi final untuk masalah karakter `>` dan `<` yang hilang. Sistem kini menggunakan **GID-based Literal CSV Export** untuk melewati penyaringan otomatis Google.
- **Robust Data Handling**: Meningkatkan akurasi pembacaan kolom di Sheet, lebih toleran terhadap perbedaan spasi atau huruf kapital pada header kolom (misal: "Act1" vs "Act 1").
### Added
- **Multi-Value Pet Acts**: Mendukung multiple skema dalam satu kolom (misal: `>200;<150`). Tiap bagian akan diwarnai dan diberi panah secara otomatis.

---

## [0.24.0] — 2026-03-16
### Changed
- **Pet Modal UI Enhancements** — Pembaruan informasi detail pada modal Pet:
  - **Support Label**: Menambahkan indikator `(rate up ↑)` berwarna merah pada label Support.
  - **Act Labels**: Menambahkan teks `Damage Rate %` pada label Act 1 hingga Act 5.
### Added
- **Dynamic Value Markers**:
  - Simbol `>` di Sheet kini otomatis menampilkan panah `↑` dan warna **Merah**.
  - Simbol `<` di Sheet kini otomatis menampilkan panah `↓` dan warna **Cyan**.

---

## [0.23.7] — 2026-03-16
### Added
- **Virtual Material Items** — Menambahkan informasi detail untuk bahan dasar:
  - **Educational Tooltips**: Mengeklik Metal, Mana, dsb. kini menampilkan deskripsi fungsi dan cara mendapatkannya (Process Materials) alih-alih pesan error.
  - **No More "Not Found"**: Menghilangkan kebingungan pengguna saat berinteraksi dengan kategori poin material di tab Recipe.
  - **Native Content**: Konten bantuan ditulis dalam bahasa Indonesia agar lebih mudah dipahami.

---

## [0.23.6] — 2026-03-16
### Fixed
- **Flexible Material Detection** — Memperbaiki deteksi ikon bahan dasar (Metal, Mana, dsb):
  - **Support Multiple Formats**: Sistem kini mendukung format "Nama xJumlah" maupun "Nama: Poin" (seperti di Google Sheet Anda).
  - **Improved Extraction**: Memperbaiki logika pemisahan teks agar nama bahan terdeteksi dengan akurat meskipun menggunakan tanda titik dua (`:`).
  - **Accurate Quantity**: Memperbaiki pembacaan angka jumlah/poin untuk kedua format tersebut.

---

## [0.23.5] — 2026-03-16
### Added
- **Basic Material Icons** — Peningkatan visual pada tab Recipe & Used For di modal Detail Item:
  - **Specific PNG Icons**: Menambahkan ikon `.png` kustom untuk bahan dasar: **Metal**, **Wood**, **Cloth**, **Mana** (`mana_ico.png`), **Beast**, dan **Medicine**.
  - **Fee Icon**: Menambahkan emoji 💰 untuk entri biaya (Fee) agar lebih mudah dikenali.
  - **Shared Icon Logic**: Mengoptimalkan kode internal modal untuk pembagian path ikon yang lebih efisien.

---

## [0.23.4] — 2026-03-16
### Added
- **Modal Icon Customization** — Peningkatan visual pada modal Detail Item:
  - **Custom PNG Icons**: Mengganti emoji standar dengan ikon `.png` yang lebih premium untuk kategori **Map** (`maps_ico.png`) dan **Drop** (`monsters_ico.png`).
  - **Smart Location Detection**: Mendeteksi secara otomatis informasi lokasi (tanpa awalan kata kunci) dan memberikan ikon peta.
  - **Improved Icon Consistency**: Menambahkan dukungan ikon untuk variasi kata kunci seperti "smith", "npc", dan "npc smith".

---

## [0.23.3] — 2026-03-16
### Fixed
- **Filter Stability Update** — Memperkuat sistem filter agar benar-benar akurat dalam mendeteksi data:
  - **Case-Insensitive Matching**: Filter kini mengabaikan perbedaan huruf besar/kecil secara total (Drop vs drop vs DROP).
  - **Whitespace Trim**: Menangani spasi tersembunyi yang mungkin terbawa dari Google Sheets.
  - **Empty Results Fix**: Memperbaiki logika pesan "No results found" agar tidak muncul keliru saat hanya filter Source yang digunakan.
  - **Robust Hypothesis**: Mengatasi kemungkinan isu cache browser dengan pembaruan logika internal.

---

## [0.23.2] — 2026-03-16

### Fixed
- **Filter Logic v2 (Deep Search)** — Memperbaiki sistem filter agar lebih toleran terhadap format pengisian data:
  - **Hybrid Search**: Kata kunci pencarian (Drop, Craft, Event, dsb) kini dicari di **kedua kolom sekaligus** (Rarity & Source).
  - **Smart Normalization**: Otomatis menyelaraskan perbedaan spasi/strip (misal: `Non Event` di Sheet akan tetap cocok dengan filter `Non-Event` di web).
  - **Robustness**: Menangani kasus di mana info cara mendapatkan item diletakkan di kolom Rarity.

---

## [0.23.1] — 2026-03-16

### Fixed
- **Item Source Logic** — Memperbaiki sistem filter sumber agar lebih akurat:
  - **Multi-Tag Support**: Satu item kini bisa dideteksi memiliki lebih dari satu sumber (misal: Drop sekaligus Craft). Menghilangkan konflik yang membuat item hilang di salah satu filter.
  - **Keyword Flexibility**: Memperbaiki deteksi untuk format data gabungan seperti `Non Event | Drop`.
  - **Craft NPC Detection**: Memperluas deteksi kata kunci untuk include "Smith" dan "NPC" secara otomatis.

---

## [0.23.0] — 2026-03-14

### Added
- **Advanced Item Filtering** — Filter item di menu Items kini jauh lebih detail:
  - **Granular Categories**: Katana, Bowgun, Dagger, Halberd, Ninjutsu Scroll, dan berbagai tipe Crysta kini memiliki kategori sendiri-sendiri.
  - **Source Search**: Menambahkan dropdown filter baru untuk membedakan item dari **Drop**, **Craft NPC (Blacksmith)**, atau **Craft Player**.
  - **Auto-Icons**: Penyesuaian icon default sistem untuk kategori baru agar tetap konsisten dengan data Sheet.

### Changed
- **Filter Logic**: Mengupdate `main.js` untuk mendukung 3 filter sekaligus (Category + Rarity + Source).

---

## [0.22.2] — 2026-03-14

### Fixed
- **Item Not Found on First Click (Network Error fix)** — Memperbaiki bug yang disebabkan oleh kecepatan limitasi API Google Sheets di klik pertama. Menambahkan fitur **Auto-Retry** (otomatis mencoba mengunduh ulang hingga 3 kali) sehingga meminimalisir kegagalan.
- Logika nomor baris (*index*) dikembalikan dan dipertahankan persis seperti versi v0.21.11.

---

## [0.21.10] — 2026-03-14
### Fixed
- **Anti-"Ghost Data"** — Reset modal sebelum populating data baru (mencegah error "Item Not Found" bertumpuk).
- **Logika Trim Total** — Mengabaikan spasi kosong di awal/akhir nama item di database.

---

## [0.21.9] — 2026-03-14
### Fixed
- **Header Overwrite Fix** — Memperbaiki bug di mana judul modal menimpa tombol varian ("View Version").
- **Double Safety Index** — Jika nomor baris tidak cocok, sistem otomatis fallback ke pencarian nama.

---

## [0.21.8] — 2026-03-14
### Added
- **Smart Recipe Icons** — Ikon bahan resep/used-for kini dinamis sesuai ikon asli itemnya.
- **View Version Link** — Tombol untuk berpindah antar varian item (Craft/Drop).

---

## [0.21.7] — 2026-03-14

### Added
- **Ambiguous Item Logic (Unique ID)** — Sistem untuk membedakan item dengan nama yang sama (misal: "Colon Met" versi Craft vs Drop).
  - Modal kini membuka baris data yang tepat berdasarkan index unik di spreadsheet, bukan lagi sekadar mencocokkan nama.
  - Menjamin statistik yang ditampilkan akurat sesuai kartu yang diklik.
- **Variant Detector (Other Versions)** — Menambahkan indikator "Other Version Available" di dalam modal jika ditemukan item lain dengan nama yang sama.
  - Memungkinkan user berpindah antar versi item (Craft/Drop/Event) langsung dari dalam modal.

---

## [0.21.6] — 2026-03-14

### Added
- **Reverse Recipe Search (Used For)** — Fitur otomatis yang melacak penggunaan Material.
  - Tab "Recipe" pada Material kini berubah menjadi **"Used For"**.
  - Sistem otomatis menscan seluruh database dan menampilkan item apa saja yang membutuhkan material tersebut sebagai bahan crafting.
  - Menampilkan jumlah yang dibutuhkan (contoh: *Requires: x15*) dan nama item hasil craft bisa langsung diklik.

---

## [0.21.5] — 2026-03-14

### Changed
- **Item Modal UI (Materials)** — Menyesuaikan label tab agar lebih kontekstual untuk kategori Material (`Beast`, `Cloth`, `Mana`, `Wood`, `Metal`, `Medicine`, `Teleport`).
  - Tab "Stats/Effects" berubah menjadi **"Details"**.
  - Tab "Obtain" tetap tersedia untuk rute farming.

---

## [0.21.4] — 2026-03-14

### Added
- **Intelligent Icon Detector** — Sistem pendeteksi konten pintar pada kolom `Icon` Google Sheets.
  - Jika kolom berisi teks path (`img/icons/`), sistem otomatis merendernya sebagai gambar `<img>` di semua modal dan tabel.
  - Tetap mendukung Emoji jika kolom berisi teks biasa.

---

## [0.21.3] — 2026-03-14

### Added
- **Image Fallback System** — Menambahkan sistem penanganan gambar rusak (broken image). Jika link gambar di Google Sheets mati atau salah ketik, website otomatis menampilkan ikon placeholder `no_image.png` yang rapi daripada ikon gambar retak bawaan browser.
- **Security Audit (Anti-XSS)** — Memperkuat keamanan seluruh jalur render data dari Google Sheets.
  - Seluruh data teks (Nama, Icon, Stats) sekarang melalui proses *escaping* yang ketat sebelum dimasukkan ke dalam HTML.
  - Menutup celah keamanan di mana kolom `Icon` sebelumnya bisa disalahgunakan untuk menjalankan script berbahaya.

### Fixed
- **Pet Modal Safety** — Merombak total logika inline script pada `pets.html` agar data dari atribut `dataset` selalu disaring dengan aman sebelum ditampilkan di modal.

---

## [0.21.2] — 2026-03-10

### Fixed
- **Monsters Table UI** — Memperbaiki bug visual dimana ikon monster, panah varian (↳), dan teks nama monster tidak sejajar secara vertikal setelah update tautan nama yang bisa diklik.

---

## [0.21.1] — 2026-03-10

### Removed
- **Item Modal UI** — Menghapus tombol "Favorite" (☆) yang tidak terpakai dari modal item, yang sebelumnya menyebabkan tumpang tindih visual (bertabrakan) dengan letak tombol "Close" (×).

---

## [0.21.0] — 2026-03-10

### Added
- **Clickable Monster Names (Difficulty Specific)** — Nama Monster di tabel (termasuk varian stat spesifik per tingkat kesulitan `Difficulty`) sekarang bisa diklik.
  - Mengeklik baris "Nightmare" dari "Minotaur", akan secara otomatis membuka Modal Monster dan merender HP, Element, serta deskripsi spesifik untuk versi Nightmare tersebut.
  - Sistem UI `MonsterModal` sekarang mendukung `open(name, difficulty)` untuk penarikan data cache yang jauh lebih presisi.

---

## [0.20.1] — 2026-03-10

### Fixed
- **Monster Modal Drop Icons** — Memperbaiki bug tampilan text *pathname* (`/img/icons/...`) yang bocor ke daftar material drop dikarenakan kesalahan render HTML. Sekarang memunculkan gambar icon yang semestinya.

---

## [0.20.0] — 2026-03-10

### Added
- **Dynamic Drop Icons (Monster Modal)** — Daftar drop item pada Modal Monster sekarang menampilkan icon asli masing-masing item (menggantikan icon default 🎁).
  - Mengambil data secara *asynchronous* (di belakang layar) memanfaatkan cache `ItemModal`.
  - Icon akan menyesuaikan dengan Type item secara otomatis, termasuk support penuh untuk material spesifik (Beast, Cloth, dsb).

---

## [0.19.1] — 2026-03-10

### Added
- **Material Filters** — Menambahkan opsi Beast, Cloth, Mana, Wood, Metal, Medicine, dan Teleport ke dropdown kategori di halaman Items.

### Fixed
- **Filter Rarity Bug** — Memperbaiki bug di mana filter Rarity (Event/Non-Event) tidak berfungsi jika item memiliki lebih dari satu badge Rarity (efek samping dari update `v0.19.0`).

---

## [0.19.0] — 2026-03-10

### Added
- **Multi-Badge Rarity** — Kolom Rarity di Sheet Items sekarang mendukung pemisahan menggunakan titik koma (`;`). 
  - Contoh: `Event;Drop` akan dirender menjadi dua badge terpisah (`<span class="tag event">Event</span> <span class="tag">Drop</span>`).
  - Berlaku untuk tampilan grid Items biasa maupun Featured/Spotlight item.

---

## [0.18.0] — 2026-03-10

### Added
- **Favicon** — Ditambahkan `favicon.ico` ke semua halaman HTML pengganti placeholder base64 SVG
- **Material Icons** — Ikon PNG spesial untuk material/item khusus (`beast_ico`, `cloth_ico`, `mana_ico`, `wood_ico`, `metal_ico`, `medicine_ico`, `tele_ico`)
- *Auto-detect mapping* di `TYPE_ICONS` (`sheets.js`) sekarang mendukung tipe Beast, Cloth, Mana, Wood, Metal, Medicine, dan Teleport.

---

## [0.17.0] — 2026-03-10

### Added
- **Enhancement Path** — Crysta items: tab "Recipe" berubah jadi "Enhancement Path"
- Tampilan vertikal: icon → arrow → icon → arrow → icon
- Item yang sedang dilihat di-highlight biru dengan badge "Current"
- **Clickable Enhancement steps** — klik crysta lain langsung buka modal detail
- **Clickable drops (Monster Modal)** — klik drop item di tab Drops → buka ItemModal
- **Clickable drops (Monsters page)** — tag drop di tabel Monsters → klik → buka ItemModal popup
- **Clickable recipe items** — klik bahan recipe di ItemModal → buka ItemModal item tersebut (strip quantity `x3`)
- **Clickable obtain "Drop:"** — klik obtain Drop di ItemModal → buka MonsterModal (extract nama monster)
- CSS: `.enhancement-*`, `.drop-link`, `.drop-arrow`, `.drop-tag-link`
- `monster-modal.js` + `<div id="monsterModal">` ditambahkan ke `items.html` dan `monsters.html`

---
## [0.16.0] — 2026-03-07

### Added
- **Monster detail modal** — Klik card Popular Monsters di homepage → popup detail (Info + Drops)
- File baru `js/monster-modal.js` — modul `MonsterModal` dengan sample data dan integrasi Google Sheets
- Section `popular_monster` di Homepage Sheet — kelola Popular Monsters dari spreadsheet
- `<div id="monsterModal">` container di `index.html`

### Changed
- **Popular Monsters cards** — sekarang clickable (`data-name` + `cursor:pointer`)
- **Column mapping** — Homepage sheet: Stats=Element, Source=HP, Description=Location
- **Category grid** — Equipment diganti Pets (Equipment link sebelumnya tidak berfungsi)
- **Semua referensi "ToramCodex"** diganti "ToramDB" di JS, CSS, README, SPREADSHEET_GUIDE

### Fixed
- **Mobile menu icon alignment** — icon sejajar dengan teks (`display:flex`)
- **Page hero icon** — icon centered inline dengan h1 (`inline-flex`)
- **Footer brand icon** — emoji ⚔️ diganti `brand_ico.png` di semua 9 halaman

---

## [0.15.0] — 2026-03-07

### Changed
- **Brand icon** — Emoji ⚔️ diganti `brand_ico.png` (mascot biru) di navbar semua halaman
- **Category grid** (index.html) — Emoji diganti icon PNG: Items, Monsters, Skills, Maps, Equipment
- **Mobile menu** — Emoji diganti icon PNG untuk Items, Monsters, Skills, Maps
- **Page hero h1** — Emoji diganti icon PNG di halaman Items, Monsters, Skills, Maps

### Added
- CSS rules: `.brand-icon img`, `.cat-icon img`, `.menu-icon`, `.hero-icon` untuk sizing icon PNG
- 6 file icon baru: `brand_ico.png`, `items_ico.png`, `monsters_ico.png`, `skills_ico.png`, `maps_ico.png`, `equip_ico.png`

---

## [0.14.0] — 2026-03-07

### Changed
- **Rebrand ToramCodex → ToramDB** — Nama brand diganti di semua halaman (navbar, footer, title)
- **Dual-color brand** — "Toram" warna gold, "DB" warna biru (`--accent-cyan`)
- **Footer disclamer baru** — "ToramDB is an independent fan-made project. Content is updated gradually..."
- **Developer credit** — "Developed by No! I'm Failing!" di semua footer
- Footer link "About" & "Contribute" diganti "Terms & Disclaimer"
- README.md diupdate ke ToramDB + developer credit

### Added
- **`pages/terms.html`** — Halaman Terms & Disclaimer dengan 7 section:
  Disclaimer, No Affiliation, Intellectual Property, Data Accuracy,
  Limitation of Liability, Fair Use Statement, Contact, Developer

---

## [0.13.0] — 2026-03-07

### Fixed
- **Category filter broken** — Tambah `typeToCategory()` di sheets.js untuk normalisasi tipe (e.g. "One-Hand Sword" → "sword") agar cocok dengan dropdown filter
- **Pagination jump** — Reset `currentPage = 1` saat event `sheetsrendered` di main.js
- **Modal aria-selected** — Tab click di modal.js sekarang update `aria-selected` (accessibility fix)
- **`rarityClass()`** — Sekarang return class `'non-event'` selain `'event'`
- **Homepage static cards** — Ganti tag `Rare`/`Epic` yang sudah deprecated ke `Non-Event`
- **Duplicate `aria-label`** — filterSelect2 di items.html diubah ke "Filter by rarity"
- **SPREADSHEET_GUIDE URL** — Fix GitHub Pages URL pattern (*.github.io serve dari root)
- **SPREADSHEET_GUIDE column order** — Fix instruksi salah "urutan kolom harus sesuai" → "boleh ditukar"
- **SPREADSHEET_GUIDE example** — Fix Rarity `Common` → `Event` di contoh homepage

### Added
- **localStorage caching** — `fetchSheet()` di sheets.js sekarang cache CSV 5 menit di localStorage
- **`.tag.gold` CSS** — Rule baru untuk badge level monster ≥240
- **Pets fallback** — 3 sample pet rows di pets.html (Cerberus Pup, Frost Owl, Spirit Fox)
- **SPREADSHEET_GUIDE link** — Ditambahkan di README.md
- **README icon table** — Update tabel icon dengan nama file PNG (sejak v0.7.0)
- **detail.html** — Ditandai sebagai legacy/fallback di README

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
