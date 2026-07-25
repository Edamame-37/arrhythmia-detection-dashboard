/**
 * @fileoverview Modul Core: Algoritma Pan-Tompkins Real-Time
 * Menerjemahkan logika Squared Derivative & Dynamic Thresholding
 * dari ekosistem Python lama ke TypeScript untuk pemrosesan streaming.
 */

export class PanTompkins {
    private fs: number;
    private refractoryPeriod: number;
    private lastPeakIndex: number;
    private prevValue: number;
    
    // Variabel Ambang Batas Adaptif (Menggantikan 95th Percentile statis)
    private signalPeak: number;
    private noisePeak: number;
    private threshold: number;
    private recentSquaredDerivatives: number[];
    private windowSize: number;

    constructor(fs: number = 250) {
        this.fs = fs;
        
        // Spasi minimum 0.30 detik sesuai standar klinis (research-grade v5.0)
        // Menerjemahkan: int(0.30 * fs) dari Python lama
        this.refractoryPeriod = Math.floor(0.30 * fs); 
        
        this.lastPeakIndex = -this.refractoryPeriod;
        this.prevValue = 0;
        
        this.signalPeak = 0;
        this.noisePeak = 0;
        this.threshold = 0;

        // Jendela sampel untuk pemanasan (menghindari deteksi acak di awal)
        this.windowSize = fs * 2; // 2 detik
        this.recentSquaredDerivatives = [];
    }

    /**
     * Membersihkan seluruh memori dan perhitungan.
     * Dipanggil setiap kali sesi perekaman baru dimulai.
     */
    public reset(): void {
        this.lastPeakIndex = -this.refractoryPeriod;
        this.prevValue = 0;
        this.signalPeak = 0;
        this.noisePeak = 0;
        this.threshold = 0;
        this.recentSquaredDerivatives = [];
    }

    /**
     * Memproses satu titik data EKG secara real-time.
     * Mengembalikan nilai `true` tepat saat gelombang QRS (R-Peak) terdeteksi.
     * 
     * @param currentValue Nilai milivolt (mV) saat ini
     * @param currentIndex Indeks x (waktu) dari data saat ini
     */
    public detectRealTime(currentValue: number, currentIndex: number): boolean {
        // 1. Diferensiasi (Derivative) & Pengkuadratan (Squared)
        // Menggantikan numpy: diff_sig = np.diff(signal_1d) ** 2
        const diff = currentValue - this.prevValue;
        const sqDiff = diff * diff;
        this.prevValue = currentValue;

        this.recentSquaredDerivatives.push(sqDiff);
        if (this.recentSquaredDerivatives.length > this.windowSize) {
            this.recentSquaredDerivatives.shift();
        }

        // 2. Fase Pemanasan (Warm-up)
        // Menunggu data terkumpul minimal 1 detik untuk membuat baseline
        if (currentIndex < this.fs) {
            if (sqDiff > this.signalPeak) {
                this.signalPeak = sqDiff;
                // Inisialisasi threshold di 30% dari puncak awal
                this.threshold = this.signalPeak * 0.3; 
            }
            return false;
        }

        let isPeak = false;

        // 3. Evaluasi Ambang Batas Dinamis
        // Cek apakah nilai menembus threshold DAN melewati batas spasi minimum 0.30s
        if (sqDiff > this.threshold && (currentIndex - this.lastPeakIndex) > this.refractoryPeriod) {
            isPeak = true;
            this.lastPeakIndex = currentIndex;

            // Update Signal Peak (Eksponensial Moving Average - lebih ringan dari percentile)
            this.signalPeak = 0.125 * sqDiff + 0.875 * this.signalPeak;
        } else {
            // Update Noise Peak jika berada di bawah threshold
            this.noisePeak = 0.125 * sqDiff + 0.875 * this.noisePeak;
        }

        // 4. Perhitungan Ulang Ambang Batas (Dynamic Thresholding)
        // Threshold akan terus beradaptasi mengikuti variasi amplitudo napas/gerak pasien
        this.threshold = this.noisePeak + 0.25 * (this.signalPeak - this.noisePeak);

        return isPeak;
    }
}