# Branch Changelog: Feature Updates & Bug Fixes

Dokumen ini merangkum seluruh pembaruan fitur dan perbaikan kutu (*bug fixes*) yang diterapkan pada *branch* ini, disiapkan untuk integrasi ke *public repository*.

## 🎯 Transformasi Peran Pengguna (User Paradigm Shift)
Pembaruan pada *branch* ini juga menandai pergeseran arah produk yang krusial. **Pasien (Patient)**, yang sebelumnya didesain sebagai salah satu dari sekian profil pengguna, kini diangkat menjadi **Pengguna Sentral (Primary Core User)** dari keseluruhan ekosistem aplikasi. Seluruh peran lain, seperti Dokter dan Administrator, kini secara hierarki diposisikan sebagai peran pendukung/pelengkap (*complementary roles*) yang memfasilitasi dan mengitari interaksi serta data milik pasien.

## 🚀 Fitur Baru
- **Mode Fisik (Physical ECG Calibration):** Menambahkan sistem kalibrasi piksel-ke-milimeter untuk memungkinkan dokter atau tenaga medis memvalidasi panjang gelombang EKG secara akurat di layar fisik monitor mereka.
  - Menambahkan profil kalibrasi perangkat spesifik (contoh: kompensasi *Display Scaling* pada layar laptop 15.6" FHD) di mana kalkulasi *Logical Pixels Per Milimeter* disesuaikan secara dinamis (hingga akurasi `1 mm = 4.4693 px`).
  - Mengimplementasikan jendela validasi referensi ukuran penggaris absolut (50 mm).

## 🧑‍⚕️ Skenario Penggunaan Utama (Main User Scenario)
Fitur "Mode Fisik" dirancang dengan alur penggunaan interaktif berikut:
1. **Inisiasi Mode:** Pengguna utama (Pasien/Tenaga Medis) membuka halaman *Patient Monitor* atau *History Detail*, lalu menekan tombol **Mode Fisik** pada panel kontrol.
2. **Penerapan Skala Dinamis:** Setelah pengguna mengonfirmasi dan menekan tombol **Terapkan Skala**, seluruh dimensi visual dari kanvas EKG (termasuk grid dan gelombang) akan otomatis mengecil atau membesar secara instan sehingga **1 kotak kecil grid mutlak berukuran 1 mm di dunia nyata**, siap untuk dianalisis secara akurat.

## 🛠️ Perbaikan Bug (Bug Fixes)
- **Real-time React State (ECG Canvas):** Memperbaiki anomali di mana *rendering* skala Zoom pada kanvas EKG tidak terpicu (tidak reaktif) saat *state* kalibrasi diubah. Penyelesaian dilakukan dengan merombak arsitektur ke pendekatan *Top-Down Data Flow* (Prop Drilling) sehingga kanvas EKG bersifat pasif dan selalu tersinkronisasi dengan perubahan *state* aplikasi.
- **Optimasi Layout UI/UX:** Memperbaiki tata letak (layout) komponen di `PatientHistoryDetailPage` dan `PatientMonitorPage`. Membuang ornamen teks berlebih pada *header* untuk tampilan laporan yang lebih profesional, serta menyesuaikan visibilitas dan proporsi panel samping (Kartu AI, Perangkat) agar ruang vertikal kertas EKG maksimal tanpa hambatan *scroll* yang tidak perlu.
