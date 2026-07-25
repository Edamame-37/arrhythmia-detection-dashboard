/**
 * @fileoverview Modul Core: Z-Score Normalization & Clipping
 * Menerjemahkan logika pre-processing input model AI dari Python (preprocessing.py)
 * ke TypeScript. Memastikan distribusi sinyal EKG seragam sebelum 
 * dikonsumsi oleh model Jaringan Saraf Tiruan (TensorFlow.js / AI Inference).
 */

const DEFAULT_CLIP_MIN = -5.0;
const DEFAULT_CLIP_MAX = 5.0;
const EPSILON = 1e-8;

/**
 * Mengaplikasikan Z-Score Normalization dan Clipping pada array sinyal EKG.
 * Mengubah distribusi data menjadi mean = 0 dan standard deviation = 1,
 * lalu memotong (clip) outlier/noise ekstrem.
 * 
 * @param signal Array nilai EKG mentah (milivolt)
 * @param clipMin Batas bawah clipping (default: -5.0)
 * @param clipMax Batas atas clipping (default: 5.0)
 * @returns Array EKG yang telah dinormalisasi dan di-clip
 */
export function applyZScoreAndClip(
    signal: number[],
    clipMin: number = DEFAULT_CLIP_MIN,
    clipMax: number = DEFAULT_CLIP_MAX
): number[] {
    if (!signal || signal.length === 0) return [];

    // 1. Hitung Mean (Rata-rata)
    let sum = 0;
    for (let i = 0; i < signal.length; i++) {
        sum += signal[i];
    }
    const mean = sum / signal.length;

    // 2. Hitung Standard Deviation (Standar Deviasi)
    let sqDiffSum = 0;
    for (let i = 0; i < signal.length; i++) {
        const diff = signal[i] - mean;
        sqDiffSum += diff * diff;
    }
    // Menggunakan populasi variance (N) sesuai perilaku standar np.std
    const variance = sqDiffSum / signal.length;
    const std = Math.sqrt(variance);

    // 3. Terapkan Z-Score Normalization & Clipping Titik-demi-Titik
    const normalizedSignal = new Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
        
        // Z-Score: (x - mean) / (std + epsilon)
        let zScore = (signal[i] - mean) / (std + EPSILON);

        // Clipping: Membatasi nilai ekstrem untuk mencegah gradien meledak di CNN
        if (zScore < clipMin) {
            zScore = clipMin;
        } else if (zScore > clipMax) {
            zScore = clipMax;
        }

        normalizedSignal[i] = zScore;
    }

    return normalizedSignal;
}