# 📌 PKM-KC 2026: PWA Dashboard Task Management (TODO)

Papan pantau ini digunakan untuk melacak sirkuit pengerjaan kode pemrograman dashboard PWA, koordinasi artifak bersama tim, serta milestone eksperimen kecerdasan buatan (Edge AI).

---

## 🟥 KELOMPOK 1: Inisialisasi Repositori & Kontrak Kode Boilerplate

_Target Penyelesaian: Minggu Ini (Selesai Pasca-Pengadaan Barang Kloter 1)_

- [x] Merancang cetak biru arsitektur folder berbasis Clean Layered Architecture (`src/presentation`, `src/application`, `src/core`, `src/data`, `src/workers`).
- [x] Mengunci identitas file terstandardisasi (Layer, File Name, Description).
- [x] Menyusun dokumentasi kontrak _Docstring Skeleton Function_ JSDoc pada file utama:
  - [x] `presentation/pages/DashboardPage.tsx`
  - [x] `application/useECGStream.ts`
  - [x] `application/useDeviceBinding.ts`
  - [x] `core/einthoven.js`
  - [x] `core/panTompkins.js`
  - [x] `core/peakToPeak.js`
  - [x] `core/ruleBasedEngine.js`
  - [x] `presentation/components/ECGCanvas.tsx`
  - [x] `presentation/components/ECGTooltip.tsx`
  - [x] `presentation/components/DeviceManager.tsx`
  - [x] `presentation/components/NotificationPanel.tsx`
  - [x] `presentation/styles/ecg-grid.css`
  - [x] `workers/dbWorker.js`
  - [x] `data/websocketClient.js`
  - [x] `data/indexedDBStore.js`
  - [x] `data/syncManager.js`
- [ ] Push seluruh berkas skeleton ke GitHub branch `main` untuk dijadikan acuan kerja tim.

---

## 🟨 KELOMPOK 2: Alokasi Tugas Pengembangan UI (Fokus Kerja: Rafa Azlan)

_Target Penyelesaian: 22 Juni – 30 Juni 2026 (Paralel Saat Logistik Sirkuit Datang & Assembly)_

### 1. Presentation & Styling Layer

- [ ] Mengimplementasikan formula CSS `linear-gradient` dua lapis pada `.ecg-grid-canvas` di file `ecg-grid.css` untuk menghasilkan motif kertas grafik pink-salmon yang presisi (1 kotak kecil = 0.04s).
- [ ] Menyusun layout responsif makro pada `DashboardPage.tsx` menggunakan Flexbox/Grid agar muat sempurna di layar tablet dan mobile nakes.
- [ ] Menyusun animasi pulsing biner pada `.timeline-box.status-arrhythmia` menggunakan keyframes untuk indikator visual darurat.

### 2. Komponen Interaktif (Dumb Components)

- [ ] Menyelesaikan implementasi UI `DeviceManager.tsx` termasuk form validasi input masking PIN fisik 6-digit angka (`^\d{6}$`).
- [ ] Menyelesaikan komponen `ECGTooltip.tsx` menggunakan CSS absolute positioning (`top`/`left`) agar jendela mengambang mengikuti titik hover kursor di atas kanvas.
- [ ] Melengkapi DOM interior `NotificationPanel.tsx` untuk menampilkan daftar tumpukan kartu log peringatan berdasarkan parameter keparahan warna (`CRITICAL` vs `WARNING`).

---

## 🟦 KELOMPOK 3: AI Model Training & Data Science Experiment (Fokus Kerja: Fikri)

_Target Penyelesaian: Juni – Awal Juli 2026 (Sebelum Fase Penelitian Utama & Uji Klinis)_

### 1. Eksplorasi Dataset & Prapemrosesan Sinyal

- [ ] Melakukan kloning dan ekstraksi dataset ECG standar (PTB-XL / MIT-BIH) ke lingkungan Google Colab/Kaggle Notebook.
- [ ] Melakukan analisis sebaran data untuk mengonfirmasi rasio ketidakseimbangan kelas (_class imbalance_).
- [ ] Menyesuaikan dimensi keluaran _Output Layer_ (apakah tetap mengunci `Dense(4)` untuk taksonomi NORM, AFIB, PVC, SVT atau beralih ke 5 kelas konvensi AAMI EC57).

### 2. Arsitektur Model & Pelatihan (Training Pipeline)

- [ ] Membangun sruktur arsitektur 1D-CNN menggunakan TensorFlow/Keras sesuai spesifikasi:
  - 3 Blok Konvolusi (Total 6 Layer `Conv1D`, ukuran filter konstan 32, fungsi aktivasi `ReLU`, dan `Batch Normalization`).
  - `GlobalAveragePooling1D` untuk reduksi dimensi temporal tanpa merusak informasi fitur.
  - `Dropout(0.5)` pada Dense Layer sebelum masuk ke Output Softmax.
- [ ] Menyusun fungsi kompilasi loss menggunakan fusi **Class-Weighting** (inverse frequency) dan **Focal Loss** ($\gamma = 2, \alpha = 0.25$) untuk memitigasi dominasi sampel irama normal.
- [ ] Mengevaluasi kestabilan konvergensi akurasi model serta nilai _Sensitivity_/_Recall_ khusus untuk kelas patologis kritis (AFIB & SVT).

### 3. Ekspor & Deployment Edge Runtime

- [ ] Mengonversi model final `.h5`/`.keras` menjadi format ringkas `.tflite` menggunakan TensorFlow Lite Converter.
- [ ] Melakukan uji coba waktu inferensi (_stresstest latency_) pada runtime lokal di Raspberry Pi 4 untuk memastikan komputasi satu frame 10 detik selesai dalam batas waktu toleransi karsa cipta (< 2 detik).

---

## 🟩 KELOMPOK 4: Integrasi Sistem & Pengujian Lapangan (Milestones Validasi)

_Target Penyelesaian: 15 Juli – September 2026_

- [ ] **Milestone 1 (Awal Juli):** Uji fusi sirkuit penuh di atas _breadboard_ pribadi menggunakan data dummy atau generator sinyal lokal.
- [ ] **Milestone 2 (Pertengahan Juli):** Kalibrasi dan validasi sinyal menggunakan alat _ECG Simulator_ fisik di RSUP Dr. Kariadi Semarang.
- [ ] **Milestone 3 (25 Juli - Target Monev 2):** Alat sudah terpasang rapi di casing 3D dan aktif digunakan untuk mengambil sampel pasien nyata di lapangan (Dashboard PWA sukses menampilkan visualisasi online via WebSocket).
- [ ] **Milestone 4 (22 Agustus - Target Monev 3):** Target 70 data sampel klinis selesai dikumpulkan, divalidasi oleh dokter spesialis pendiagnosa, dan tim berfokus pada penyusunan draft artikel ilmiah nasional.
- [ ] **Milestone 5 (September):** Finalisasi dokumen Laporan Kemajuan, latihan _pitching_ presentasi bersama dosen pendamping, dan eksekusi penilaian PKP2 Belmawa.
