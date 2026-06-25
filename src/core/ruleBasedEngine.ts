/**
 * @fileoverview Modul Core Business Logic: Rule-Based Explanation Engine
 * Mengevaluasi ireguleritas interval R-R dan menggabungkannya dengan hasil AI
 * untuk menghasilkan penjelasan klinis yang transparan bagi tenaga medis.
 * Sesuai Spesifikasi PKM FRS FR-CORE-05.
 */

export interface RuleBasedEvaluation {
    isIrregular: boolean;
    maxRR: number;
    minRR: number;
    deltaRR: number;
}

export interface ClinicalExplanation {
    isAnomaly: boolean;
    ruleText: string;
    fullExplanation: string;
    severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

/**
 * Mengevaluasi apakah terdapat variasi interval R-R yang melampaui batas wajar.
 * Dalam standar klinis, variasi > 120ms (0.12 detik) dianggap ireguler (sinus aritmia dsb).
 * * @param rrIntervals Array dari jarak antar puncak R dalam satuan detik
 * @param threshold Ambang batas ireguleritas dalam detik (Default: 0.12s atau 120ms)
 * @returns Objek hasil evaluasi ireguleritas
 */
export const evaluateIrregularity = (
    rrIntervals: number[], 
    threshold: number = 0.12
): RuleBasedEvaluation => {
    if (rrIntervals.length < 2) {
        return { isIrregular: false, maxRR: 0, minRR: 0, deltaRR: 0 };
    }

    const maxRR = Math.max(...rrIntervals);
    const minRR = Math.min(...rrIntervals);
    const deltaRR = Number((maxRR - minRR).toFixed(3));

    return {
        isIrregular: deltaRR > threshold,
        maxRR,
        minRR,
        deltaRR
    };
};

/**
 * Menghasilkan teks penjelasan klinis cerdas dengan menggabungkan hasil Deep Learning
 * (1D-CNN) dan hasil kalkulasi matematika dari Rule-Based Engine.
 * * @param classResult String hasil klasifikasi AI (contoh: "Normal (NORM)", "Atrial Fibrillation (AFIB)")
 * @param isAnomaly Boolean penanda apakah AI mendeteksi kelainan
 * @param irregularityEvaluation Objek hasil dari fungsi evaluateIrregularity()
 * @returns Objek berisi teks klinis dan tingkat bahaya (severity)
 */
export const generateClinicalExplanation = (
    classResult: string,
    isAnomaly: boolean,
    irregularityEvaluation: RuleBasedEvaluation
): ClinicalExplanation => {
    
    const { isIrregular, deltaRR } = irregularityEvaluation;
    let ruleText = "";
    let fullExplanation = "";
    let severity: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';

    if (isAnomaly) {
        severity = 'CRITICAL';
        // Teks untuk kondisi Aritmia Kritis (AFIB / PVC / SVT)
        ruleText = isIrregular 
            ? `Terdapat variasi interval R-R yang tinggi (Δ ${deltaRR}s > 0.12s) yang mengindikasikan ireguleritas ritme secara fatal.` 
            : `Morfologi gelombang QRS abnormal.`;
            
        fullExplanation = `Algoritma mengklasifikasikan ${classResult} pada segmen ini. ${ruleText} Direkomendasikan intervensi klinis segera.`;
    } else {
        // Teks untuk kondisi Normal Sinus
        if (isIrregular) {
            severity = 'WARNING';
            ruleText = `Terdapat variasi R-R (Δ ${deltaRR}s > 0.12s) yang mengindikasikan Sinus Aritmia ringan, namun secara morfologi tidak ditemukan aritmia kritis.`;
        } else {
            severity = 'NORMAL';
            ruleText = `Interval R-R stabil (Δ ${deltaRR}s) dan morfologi gelombang P-QRS-T normal.`;
        }

        fullExplanation = `Analisis AI menunjukkan ${classResult}. ${ruleText}`;
    }

    return {
        isAnomaly,
        ruleText,
        fullExplanation,
        severity
    };
};