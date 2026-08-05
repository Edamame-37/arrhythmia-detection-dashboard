import React, { useState } from 'react';
import type { ClinicalExplanation } from '../../../core/clinical/ruleBasedEngine';

interface AiCardProps {
    sessionId?: string | null;
    clinicalStatus: ClinicalExplanation | null;
    aiProbabilities?: Record<string, number> | null;
}

export const AiCard: React.FC<AiCardProps> = ({ sessionId, clinicalStatus, aiProbabilities }) => {
    const [confirmation, setConfirmation] = useState<boolean | null>(null);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const diagnosisOptions = ["Normal", "Takikardia", "Bradikardia", "Atrial Fibrillation", "Other"];

    const handleSubmit = async () => {
        if (confirmation === null) return;
        if (!sessionId) {
            alert("Sesi tidak valid atau belum dimulai. Silakan mulai sesi terlebih dahulu.");
            return;
        }
        
        let docClassification = "";
        if (confirmation) {
            // Jika benar, simpan string klasifikasi AI
            docClassification = clinicalStatus?.fullExplanation || "AI_APPROVED"; 
        } else {
            // Jika salah, wajib memilih dari dropdown
            if (!selectedDiagnosis) {
                alert("Harap pilih klasifikasi yang benar dari menu dropdown.");
                return;
            }
            docClassification = selectedDiagnosis;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`http://127.0.0.1:8080/api/sessions/${sessionId}/confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirmation: confirmation ? 1 : 0,
                    doc_classification: docClassification
                })
            });

            if (res.ok) {
                setIsSubmitted(true);
            } else {
                alert("Gagal menyimpan konfirmasi.");
            }
        } catch (e) {
            console.error(e);
            alert("Terjadi kesalahan jaringan saat menyimpan konfirmasi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-charcoal text-white rounded-xl p-5 shadow-xl relative overflow-hidden flex flex-col">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-medical-teal/30 rounded-full blur-2xl"></div>
            <div className="relative z-10 h-full flex flex-col">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary-fixed">
                    <span className="material-symbols-outlined text-[18px]">psychology</span> Hasil Klasifikasi
                </h4>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4">
                    <div className="space-y-2">
                        {diagnosisOptions.map((label) => {
                            // Coba dapatkan nilai dari aiProbabilities (asumsi key-nya mirip)
                            // AI biasanya mengembalikan Normal, dll.
                            const value = aiProbabilities ? (aiProbabilities[label] ?? 0) : null;
                            const displayValue = value !== null ? `${value.toFixed(1)}%` : '--';
                            const width = value !== null ? `${value}%` : '0%';

                            return (
                                <div key={label} className="flex flex-col gap-1.5 mt-1">
                                    <div className="flex justify-between text-xs font-sans items-center">
                                        <span className="text-slate-100 font-medium tracking-wide">{label}</span>
                                        <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded text-[11px]">{displayValue}</span>
                                    </div>
                                    <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-300 ${label === 'Normal' ? 'bg-medical-teal' : 'bg-alert-red'}`} 
                                            style={{ width: width, opacity: value !== null ? 1 : 0 }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bagian Konfirmasi Diagnosis */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                    {isSubmitted ? (
                        <div className="bg-medical-teal/20 text-medical-teal text-xs p-3 rounded-lg flex items-center justify-center gap-2 font-bold border border-medical-teal/30">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            Diagnosis Telah Dikonfirmasi
                        </div>
                    ) : (
                        <>
                            <p className="text-[11px] text-slate-300 text-center font-bold">Apakah diagnosis AI di atas sudah benar?</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setConfirmation(true)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                                        confirmation === true 
                                        ? 'bg-medical-teal text-white border-medical-teal shadow-md' 
                                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    Benar
                                </button>
                                <button 
                                    onClick={() => setConfirmation(false)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                                        confirmation === false 
                                        ? 'bg-alert-red text-white border-alert-red shadow-md' 
                                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    Salah
                                </button>
                            </div>

                            {confirmation === false && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <select 
                                        value={selectedDiagnosis}
                                        onChange={(e) => setSelectedDiagnosis(e.target.value)}
                                        className="w-full bg-surface-container-highest text-charcoal font-medium text-sm rounded-lg p-2.5 border border-white/10 outline-none appearance-none"
                                    >
                                        <option value="" disabled>-- Pilih Diagnosis Sebenarnya --</option>
                                        {diagnosisOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button 
                                onClick={handleSubmit}
                                disabled={confirmation === null || (confirmation === false && !selectedDiagnosis) || isSubmitting}
                                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all shadow-md flex justify-center items-center gap-2 outline-none ${
                                    confirmation === null || (confirmation === false && !selectedDiagnosis)
                                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                    : 'bg-medical-teal text-white hover:bg-teal-600 active:scale-95'
                                }`}
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Submit Diagnosa'}
                                {!isSubmitting && <span className="material-symbols-outlined text-[16px]">send</span>}
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};