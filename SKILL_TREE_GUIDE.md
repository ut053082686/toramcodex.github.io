# 📖 Panduan Update Data Skill Simulator (Via Google Sheets)

Mulai **v0.65.0**, data Skill Simulator ditarik *secara real-time* langsung dari file **Google Sheets ToramDB** (Tab: `SkillTrees`). Anda tidak perlu lagi mengedit ratusan/ribuan baris kode Javascript secara manual.

---

## 🏗️ 1. Struktur Tabel (Kolom)

Pastikan *header* (baris pertama) di tab **SkillTrees** persis seperti ini:

| Kategori | Nama Kolom | Contoh Pengisian | Deskripsi |
| :--- | :--- | :--- | :--- |
| **TREE (Pohon)** | `tree_id` | `blade` | ID unik pohon skill (huruf kecil semua) |
| | `tree_label` | `Blade Skills` | Nama tampilan pohon |
| | `tree_width` | `980` | Lebar standar area canvas |
| | `tree_height` | `730` | (Opsional) Tinggi maksimal canvas. Sistem bisa menghitung otomatis jika Anda mengosongkannya. |
| | `tree_bg_color` | `#ffffff` | Kode warna Hex latar belakang (`#ffffff` = putih terang, `#000000` = hitam gelap) |
| | `tree_icon` | `sk_sword_mastery` | Nama file icon *tanpa* spasi atau akhiran `.png` |
| | `tree_visible` | `TRUE` | Menentukan apakah pohon (misal: Event Skills) disembunyikan sementara (`FALSE`) |
| | `tree_star_gem_usable` | `TRUE` | Apakah tree ini mendukung elemen Star Gem? |
| **SKILL (Ranting)** | `skill_id` | `hammer_slam` | ID unik untuk skill tersebut |
| | `skill_name` | `Hammer Slam` | Nama tombol skill yang tampil |
| | `skill_x` | `100` | Koordinat sumbu Horizontal (Samping) dalam Piksel |
| | `skill_y` | `40` | Koordinat sumbu Vertikal (Atas/Bawah) dalam Piksel |
| | `skill_prerequisite` | `hammer_slam, cleaving_attack` | ID dari skill "Induk/Prasyarat" sebelumnya (pisahkan dengan koma). **Sangat vital untuk menggambar garis sambungan!** Kosongkan jika berada di ujung akar pertama. |
| | `skill_star_gem_usable`| `TRUE` | `TRUE`/`FALSE` apakah skill tersebut ada drop versi star gem-nya. |
| | `skill_star_gem_cost` | `1` | Beban cost pemasangan star gem. |
| | `skill_star_gem_level`| `1` | Maksimal level awal star gem. |

*(Khusus data **TREE**, isinya harus disalin berulang-ulang kembar ke bawah pada baris-baris skill yang bersangkutan)*

---

## 🎯 2. Tutorial Menentukan Koordinat `X` dan `Y` (Grid System)

Akar masalah terbesar dalam mendesain pohon simulasi adalah mengetahui di mana posisi meletakkan _node_ skill tersebut agar rapi dan tidak saling tumpuk. Semua skill diposisikan berdasarkan titik tengah (Center) *node*.

Berdasarkan *layout engine* ToramDB, jarak antar satu *Skill Node* idealnya adalah **120 Piksel**.

### 📐 Sistem Koordinat `X` (Kiri ke Kanan)
Ini menentukan letak **Kolom** skill. Aturan bakunya:

| Kolom Ke- | Nilai `skill_x` Ideal | Deskripsi |
| :--- | :--- | :--- |
| **Kolom 1** | `100` | Ranting/Akar paling kiri. Mulainya selalu di sini. |
| **Kolom 2** | `220` | Bergeser satu blok ke kanan (+120px dari kolom 1). |
| **Kolom 3** | `340` | Bergeser satu blok ke kanan (+120px dari kolom 2). |
| **Kolom 4** | `460` | Terus ditambah 120px... |
| **Kolom 5** | `580` | ...dan seterusnya. |
| **Kolom 6** | `700` | ... |
| **Kolom 7** | `820` | ... |

*(Rumusnya: $X = 100 + (KolomKe - 1) * 120$)*

### 📏 Sistem Koordinat `Y` (Atas ke Bawah)
Ini menentukan letak **Baris** skill. Jarak ideal ke bawah bergantung pada jenis garis penghubung. Jarak ideal paling aman adalah **70p hingga 120px**. 

| Baris Ke- | Nilai `skill_y` Ideal | Deskripsi |
| :--- | :--- | :--- |
| **Baris 1** | `40` | Skill tingkat dasar paling menempel ke plafon/atap kelompoknya. |
| **Baris 2** | `110` / `160` | Normalnya turun sekitar `120` piksel, menjadi `160`. Kadang turun `70` piksel ke `110` jika skill bawahnya sangat berdekatan dan horizontal. |
| **Baris 3** | `250` / `280` | Terus berlanjut turun. Sesuaikan berdasarkan kekompakan visual yang diinginkan. |
| **Baris ...**| `...` | Semakin tinggi ke bawah, semakin besar nilainya. |

### 🛠️ Contoh Studi Kasus: Blade Skills
Misakan Anda ingin membuat 2 *Path* (Jalur) awal dari pohon Pedang:

**Jalur Hard Hit:**
1. **Hard Hit** (Akar - Kolom 1, Agak ke bawah rata-rata) 
   → Posisi: `X = 100`, `Y = 220`
2. **Astute** (Anak dari Hard Hit - Kolom 2, Naik sedikit ke atas Hard Hit) 
   → Posisi: `X = 220`, `Y = 150`
3. **Trigger Slash** (Anak dari Astute - Kolom 3, Lurus ke kanan dari Astute) 
   → Posisi: `X = 340`, `Y = 150`

**Jalur Sword Mastery (Darat):**
1. **Sword Mastery** (Akar - Kolom 1, Sangat ke bawah) 
   → Posisi: `X = 100`, `Y = 420`
2. **Quick Slash** (Anak dari Sword Mastery - Kolom 2, Lurus ke kanan dari pusat) 
   → Posisi: `X = 220`, `Y = 420`

Sistem *Javascript* simulator kitalah yang membaca `skill_prerequisite` (siapa induk siapa anak) tersebut lalu otomatis menggambar *elbow line* (garis siku vertikal dulu, lalu ditarik horizontal secara cerdas membelah area di antaranya) seperti grafik asli di dalam antarmuka Game Toram!

> [!TIP]
> Tinggi (`tree_height`) secara otomatis dihitung menyesuaikan atribut `skill_y` terjauh dari semua skill yang ada. Tingkap/Plafon *tree_height* di Sheet bisa dikosongkan.

---

## ⚡ 3. Cara Mengecek Update
1. Masukkan data ke Sheet. Pastikan tidak ada "Typo" di `tree_id` dan `skill_id`.
2. Halaman *Skill Simulator* akan otomatis memuat ulang versi terbaru ketika *browser cache* di-refresh. Tidak perlu mendorong perubahan (*push commit*) ke Github lagi untuk sekadar menambah stat skill baru!
