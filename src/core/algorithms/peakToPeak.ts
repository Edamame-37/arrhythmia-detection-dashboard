/**
 * @fileoverview Modul Core Business Logic: Kalkulator Peak-to-Peak 
 * Bertugas menghitung jarak waktu fisis antar puncak R (R-R Interval) 
 * dan mengonversinya menjadi detak jantung (Heart Rate / BPM) serta
 * metrik visual klinis (Kotak Besar).
 * Sesuai Spesifikasi PKM FRS FR-CORE-03 dan FR-CORE-04.
 */

// Interface untuk metrik visual interval tunggal
export interface RRMetrics {
    bpm: number;
    boxesText: string;
}

/**
 * Menghitung R-R interval tunggal (dalam detik) antara dua indeks puncak R.
 * Sangat efisien untuk perhitungan instan saat mode Live Streaming.
 * @param prevPeakIndex Indeks array dari puncak R sebelumnya
 * @param currentPeakIndex Indeks array dari puncak R saat ini
 * @param samplingRate Frekuensi sampling (Default: 250Hz sesuai spesifikasi alat)
 * @returns Jarak waktu dalam detik (contoh: 0.80)
 */
export const calculateSingleRRInterval = (
    prevPeakIndex: number,
    currentPeakIndex: number,
    samplingRate: number = 250
): number => {
    // FR-CORE-03: (Selisih Indeks) * (1 / 250) = Jarak Waktu Detik
    const interval = (currentPeakIndex - prevPeakIndex) / samplingRate;
    
    // Dibulatkan 2 angka di belakang koma (misal: 0.84s) untuk akurasi medis
    return Number(interval.toFixed(2));
};

/**
 * Mengkalkulasi metrik BPM instan dan jumlah kotak besar berdasarkan interval detik tunggal.
 * Digunakan untuk visualisasi langsung di atas garis kanvas.
 * @param secDist Jarak interval R-R dalam detik (contoh: 0.70)
 * @returns Objek berisi nilai bpm bulat dan teks jumlah kotak besar (contoh: "3,5 kotak")
 */
export const calculateRRMetrics = (secDist: number): RRMetrics => {
    if (secDist <= 0) {
        return { bpm: 0, boxesText: "0 kotak" };
    }

    // 1. Hitung BPM Instan (60 dibagi durasi detik)
    const bpm = Math.round(60 / secDist);

    // 2. Hitung jumlah kotak besar (1 kotak besar = 0.20 detik pada kecepatan 25 mm/s)
    const largeBoxes = secDist / 0.20;
    
    // Format ke string dengan 1 angka desimal dan koma khas Indonesia (misal: "3.5" menjadi "3,5 kotak")
    const boxesText = `${largeBoxes.toFixed(1).replace('.', ',')} kotak`;

    return { bpm, boxesText };
};

/**
 * Menghitung kumpulan R-R interval dari array yang berisi indeks letak puncak-puncak R.
 * Cocok untuk evaluasi segmen 10 detik penuh (Mode Historical Review).
 * @param peakIndices Array berisi indeks letak puncak R (contoh: [100, 350, 600])
 * @param samplingRate Frekuensi sampling (Default: 250Hz)
 * @returns Array berisi jarak waktu antar puncak dalam detik
 */
export const calculateBatchRRIntervals = (
    peakIndices: number[],
    samplingRate: number = 250
): number[] => {
    const rrIntervals: number[] = [];
    
    // Membutuhkan setidaknya 2 puncak untuk menghitung 1 interval
    if (peakIndices.length < 2) return rrIntervals;

    for (let i = 1; i < peakIndices.length; i++) {
        const interval = calculateSingleRRInterval(peakIndices[i - 1], peakIndices[i], samplingRate);
        rrIntervals.push(interval);
    }

    return rrIntervals;
};

/**
 * Menghitung nilai Heart Rate (BPM) rata-rata dari kumpulan R-R interval.
 * @param rrIntervals Array berisi jarak waktu R-R (dalam satuan detik)
 * @returns Detak jantung rata-rata (Beats Per Minute), atau 0 jika data kosong
 */
export const calculateHeartRate = (rrIntervals: number[]): number => {
    if (rrIntervals.length === 0) return 0;

    // Mencari rata-rata R-R interval dalam detik
    const sumRR = rrIntervals.reduce((sum, current) => sum + current, 0);
    const avgRR = sumRR / rrIntervals.length;

    // Mencegah error pembagian dengan nol jika terjadi anomali perhitungan
    if (avgRR === 0) return 0;

    // FR-CORE-04: Kalkulasi Instantaneous Heart Rate (HR = 60 / rata-rata R-R dalam detik)
    const heartRate = 60 / avgRR;

    // Output dibulatkan menjadi bilangan bulat sesuai standar penulisan BPM klinis
    return Math.round(heartRate);
};