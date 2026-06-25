/**
 * @fileoverview Modul Core Business Logic: Segitiga Einthoven
 * Mengkalkulasi 4 Augmented Leads (Lead III, aVR, aVL, aVF) 
 * berdasarkan data mentah dari 2 Bipolar Leads (Lead I dan Lead II).
 * Sesuai Spesifikasi PKM FRS FR-CORE-06.
 */

// Interface untuk tipe data pengembalian per titik (Live Stream)
export interface EinthovenPointResult {
    leadIII: number;
    aVR: number;
    aVL: number;
    aVF: number;
}

// Interface untuk tipe data pengembalian array (Batch History)
export interface EinthovenArrayResult {
    leadIII: number[];
    aVR: number[];
    aVL: number[];
    aVF: number[];
}

/**
 * Mengkalkulasi 4 Lead tambahan untuk satu titik data (Real-time).
 * @param valI Nilai voltase (mV) dari Lead I
 * @param valII Nilai voltase (mV) dari Lead II
 * @returns Objek berisi nilai Lead III, aVR, aVL, dan aVF
 */
export const calculateEinthovenPoint = (valI: number, valII: number): EinthovenPointResult => {
    return {
        leadIII: valII - valI,
        aVR: -(valI + valII) / 2,
        aVL: valI - (valII / 2),
        aVF: valII - (valI / 2)
    };
};

/**
 * Mengkalkulasi 4 Lead tambahan untuk array/batch data (Historical Review).
 * Sangat efisien untuk memproses 2500 titik (10 detik) sekaligus.
 * @param arrI Array nilai voltase (mV) dari Lead I
 * @param arrII Array nilai voltase (mV) dari Lead II
 * @returns Objek berisi array Lead III, aVR, aVL, dan aVF
 */
export const calculateEinthovenArray = (arrI: number[], arrII: number[]): EinthovenArrayResult => {
    // Memastikan panjang array sama untuk menghindari error Index Out of Bounds
    const length = Math.min(arrI.length, arrII.length);
    
    // Pre-alokasi memori array untuk performa maksimal (menghindari array.push)
    const leadIII = new Array<number>(length);
    const aVR = new Array<number>(length);
    const aVL = new Array<number>(length);
    const aVF = new Array<number>(length);

    for (let i = 0; i < length; i++) {
        const valI = arrI[i];
        const valII = arrII[i];

        leadIII[i] = valII - valI;
        aVR[i] = -(valI + valII) / 2;
        aVL[i] = valI - (valII / 2);
        aVF[i] = valII - (valI / 2);
    }

    return { leadIII, aVR, aVL, aVF };
};