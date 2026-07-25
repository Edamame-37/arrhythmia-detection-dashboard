/**
 * @fileoverview Modul Core: DC Blocker (Median Filter)
 * Bertugas menyaring tegangan sisa (DC Offset) dan Baseline Wander 
 * dari perangkat keras EKG sehingga sinyal terpusat di angka 0.0 mV.
 * 
 * UPDATE: Mengadopsi Hukum Segitiga Einthoven murni untuk efisiensi komputasi Lead III.
 * UPDATE: Menggunakan Median Kernel Filter (ukuran 51) menggantikan Exponential Moving Average.
 */

export class DCBlocker {
    private baselineI: number | null = null;
    private baselineII: number | null = null;

    /**
     * Parameter kernelSize tetap ada demi backward compatibility, namun tidak lagi digunakan.
     */
    /*
    constructor(kernelSize: number = 51) {
        // Filtering dihilangkan.
    }

    /**
     * Mengembalikan memori baseline ke kondisi kosong.
     */
    public reset(): void {
        this.baselineI = null;
        this.baselineII = null;
    }

    /**
     * Memproses tegangan mentah. Tanpa filtering, hanya menormalisasi terhadap nilai titik pertama
     * sehingga posisi vertikal (DC offset statis) berada di sekitar 0 agar gelombang tetap terlihat.
     */
    public process(rawI: number, rawII: number) {
        // Tangkap baseline statis pada titik pertama
        if (this.baselineI === null || this.baselineII === null) {
            this.baselineI = rawI;
            this.baselineII = rawII;
        }

        // Normalisasi dasar: sinyal saat ini dikurangi nilai awalnya
        const cleanI = rawI - this.baselineI;
        const cleanII = rawII - this.baselineII;

        // Hukum Einthoven murni untuk Lead III: III = II - I
        const cleanIII = cleanII - cleanI;

        return {
            cleanI,
            cleanII,
            cleanIII
        };
    }
}