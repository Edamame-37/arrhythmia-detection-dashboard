/**
 * @fileoverview Modul Core Business Logic: Deteksi R-Peak 
 * Mengimplementasikan pelacakan puncak gelombang R dengan algoritma adaptif.
 * Berfokus pada efisiensi O(1) per titik untuk performa di PWA Edge-Client.
 * Sesuai Spesifikasi PKM FRS FR-CORE-01 & FR-CORE-02.
 */

export class PanTompkins {
    private lastPeakIndex: number;
    private readonly refractoryPeriod: number;
    private threshold: number;

    /**
     * Inisialisasi mesin pendeteksi R-Peak.
     * @param samplingRate Frekuensi sampling data EKG (Default: 250Hz sesuai spesifikasi PKM)
     * @param baseThreshold Ambang batas voltase awal untuk deteksi puncak R (dalam mV)
     */
    constructor(samplingRate: number = 250, baseThreshold: number = 1.0) {
        // Periode refraktori absolut jantung normal adalah ~300ms.
        // Pada frekuensi 250Hz, 300ms setara dengan tepat 75 titik data.
        this.refractoryPeriod = Math.floor(samplingRate * 0.3);
        this.threshold = baseThreshold;
        
        // Diatur minus agar puncak EKG pertama di detik ke-0 dapat langsung terdeteksi
        this.lastPeakIndex = -this.refractoryPeriod; 
    }

    /**
     * Memproses satu titik data secara real-time (Mode Streaming per Chunk).
     * @param amplitude Nilai amplitudo EKG dari Lead II (dalam mV)
     * @param currentIndex Indeks waktu absolut dari titik data saat ini
     * @returns boolean (true jika titik ini adalah puncak R)
     */
    public detectRealTime(amplitude: number, currentIndex: number): boolean {
        // Evaluasi 1: Apakah voltase melewati ambang batas & jarak waktu > periode refraktori?
        if (amplitude >= this.threshold && (currentIndex - this.lastPeakIndex) > this.refractoryPeriod) {
            this.lastPeakIndex = currentIndex;
            
            // Evaluasi 2 (FR-CORE-02): Adaptive Threshold Update
            // Beradaptasi thd bentuk gelombang: 80% ambang batas lama + 20% tinggi puncak baru
            this.threshold = (this.threshold * 0.8) + (amplitude * 0.2);
            
            return true;
        }

        // Evaluasi 3: Peluruhan Ambang Batas (Threshold Decay)
        // Jika tidak ada puncak R ditemukan selama lebih dari 1.5 detik (bradikardia/sinyal melemah),
        // turunkan threshold perlahan agar tidak kehilangan gelombang R yang kerdil.
        if ((currentIndex - this.lastPeakIndex) > (this.refractoryPeriod * 5)) {
            this.threshold *= 0.99; // Turunkan threshold 1% setiap siklus iterasi
            if (this.threshold < 0.5) {
                this.threshold = 0.5; // Batas bawah mutlak (noise floor)
            }
        }

        return false;
    }

    /**
     * Memproses array data EKG secara instan (Mode Historical Review / Batch Rendering).
     * @param leadIIArray Array nilai amplitudo dari Lead II (umumnya 2500 titik / 10 detik)
     * @param startIndex Indeks awal dari segmen (default 0)
     * @returns Array berisi indeks-indeks di mana puncak R terjadi
     */
    public detectBatch(leadIIArray: number[], startIndex: number = 0): number[] {
        const rPeaks: number[] = [];
        
        for (let i = 0; i < leadIIArray.length; i++) {
            // Karena fungsi deteksi bersifat stateful, kita cukup memanggilnya di dalam loop
            const isPeak = this.detectRealTime(leadIIArray[i], startIndex + i);
            if (isPeak) {
                rPeaks.push(startIndex + i);
            }
        }
        
        return rPeaks;
    }

    /**
     * Me-reset mesin pelacakan. Wajib dipanggil saat tombol "Mulai Perekaman" 
     * ditekan agar tidak membawa riwayat pasien sebelumnya.
     */
    public reset(): void {
        this.lastPeakIndex = -this.refractoryPeriod;
        this.threshold = 1.0; 
    }
}