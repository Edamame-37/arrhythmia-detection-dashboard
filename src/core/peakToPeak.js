/**
 * Layer       : Core Business Logic Layer
 * File Name   : peakToPeak.js
 * Description : Modul kalkulasi fisis untuk menghitung jarak temporal antar-detak
 * (R-R Interval) dalam satuan milidetik serta menghitung laju
 * detak jantung instan (Instantaneous Heart Rate) dalam satuan BPM.
 */

/**
 * @function calculatePeakToPeak
 * @description Menghitung jarak fisis antar-puncak R dan mengonversinya menjadi nilai Heart Rate instan.
 * @param {number[]} rPeakIndices - Array berisi daftar indeks koordinat puncak R hasil deteksi algoritma Pan-Tompkins
 * @param {number} [samplingRate=250] - Frekuensi penarikan data perangkat (default 250 Hz)
 * @returns {Object} Objek berisi array jarak fisis R-R interval dan nilai rata-rata Heart Rate dalam satuan BPM.
 * @mechanism
 * 1. Melakukan validasi jumlah puncak R; diperlukan minimal 2 puncak untuk menghitung jarak fisis
 * 2. Melakukan iterasi sekuensial untuk mencari selisih indeks antara `rPeakIndices[i]` dan `rPeakIndices[i-1]`
 * 3. Mengalikan selisih indeks dengan konstanta resolusi waktu ($1 / \text{samplingRate} = 0.004\text{ s}$ atau $4\text{ ms}$) untuk mendapatkan jarak waktu fisis riil
 * 4. Menghitung Heart Rate sesaat per detak dengan rumus: $HR = 60 / (\Delta t \text{ dalam detik})$
 * 5. Mengakumulasikan seluruh nilai HR instan untuk menghasilkan rata-rata Heart Rate agregat di dalam frame terkait.
 */
export const calculatePeakToPeak = (rPeakIndices, samplingRate = 250) => {
  // Array untuk menampung nilai jarak R-R interval dalam satuan milidetik (ms)
  const rrIntervalsMs = [];

  // Nilai agregat Heart Rate rata-rata dalam satu frame (BPM)
  let averageHeartRateBpm = 0;

  /**
   * @function convertIndexToTime
   * @description Fungsi internal untuk mengonversi selisih indeks biner menjadi satuan waktu fisis milidetik
   * @private
   * @param {number} indexDiff - Selisih angka indeks antar-puncak R
   * @returns {number} Durasi waktu fisis nyata dalam satuan milidetik (ms)
   */
  const convertIndexToTime = (indexDiff) => {
    // Skeleton function untuk perkalian konstanta resolusi sampling rate fisis (0.004s)
    return 0;
  };

  /**
   * @function computeInstantaneousHR
   * @description Fungsi internal untuk menghitung detak jantung per denyut fisis
   * @private
   * @param {number} rrIntervalSeconds - Jarak waktu R-R dalam satuan detik.
   * @returns {number} Nilai Heart Rate instan dalam satuan Denyut Per Menit (BPM)
   */
  const computeInstantaneousHR = (rrIntervalSeconds) => {
    // Skeleton function untuk eksekusi rumus fisis HR = 60 / R-R(s)
    return 0;
  };

  return {
    rrIntervalsMs,
    averageHeartRateBpm,
  };
};

export default calculatePeakToPeak;
