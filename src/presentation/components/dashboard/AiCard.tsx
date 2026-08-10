import React, { useState } from 'react';
import { API_URL } from '../../../config/env';

interface AiCardProps {
    sessionId?: string | null;
    rawClassification?: string | null;
    isDoctorReview?: boolean;
    timeInterval?: string;
}

export const AiCard: React.FC<AiCardProps> = ({ sessionId, rawClassification, isDoctorReview, timeInterval }) => {
    const [verificationState, setVerificationState] = useState<'correct' | 'incorrect' | null>(null);
    const [selectedCorrection, setSelectedCorrection] = useState<string>('Normal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleConfirm = async () => {
        if (!sessionId || !timeInterval) return;
        
        setIsSubmitting(true);
        
        const confirmation = verificationState === 'correct' ? 1 : 0;
        const docClassification = verificationState === 'correct' ? (rawClassification || 'Unclassified') : selectedCorrection;
        
        try {
            const res = await fetch(`${API_URL}/api/sessions/${sessionId}/confirmation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    confirmation,
                    doc_classification: docClassification,
                    time_interval: timeInterval
                })
            });
            
            if (res.ok) {
                setSubmitSuccess(true);
                setTimeout(() => {
                    setSubmitSuccess(false);
                    // Optional: reset verification state if needed
                }, 3000);
            } else {
                console.error("Gagal menyimpan konfirmasi");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-[0px_20px_40px_rgba(0,0,0,0.04)] border border-clinical-charcoal/5 relative overflow-hidden flex flex-col justify-center min-h-[160px] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] group">
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[16px] text-clinical-blue">auto_awesome</span>
                    <h4 className="text-[12px] font-bold text-clinical-charcoal/60 uppercase tracking-[0.2em]">
                        Klasifikasi AI
                    </h4>
                </div>

                <div className="text-center w-full px-2">
                    {rawClassification ? (
                        <>
                            <h2 className="text-3xl md:text-4xl font-headline-lg tracking-tight text-clinical-charcoal mb-6 break-words leading-tight">
                                {rawClassification}
                            </h2>
                            
                            {isDoctorReview && (
                                <div className="mt-4 pt-6 border-t border-clinical-charcoal/10 flex flex-col items-center w-full">
                                    <p className="text-sm font-headline-md text-clinical-charcoal mb-4">Apakah klasifikasi AI ini akurat?</p>
                                    
                                    <div className="grid grid-cols-2 gap-3 w-full max-w-[240px] mb-5">
                                        <button 
                                            onClick={() => setVerificationState('correct')}
                                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-label-md text-sm border transition-all ${verificationState === 'correct' ? 'bg-signal-green text-white border-signal-green shadow-md shadow-signal-green/20' : 'bg-white border-outline-variant text-clinical-charcoal/70 hover:border-signal-green/50 hover:text-signal-green'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                            Benar
                                        </button>
                                        <button 
                                            onClick={() => setVerificationState('incorrect')}
                                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-label-md text-sm border transition-all ${verificationState === 'incorrect' ? 'bg-alert-red text-white border-alert-red shadow-md shadow-alert-red/20' : 'bg-white border-outline-variant text-clinical-charcoal/70 hover:border-alert-red/50 hover:text-alert-red'}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                            Salah
                                        </button>
                                    </div>

                                    {verificationState === 'incorrect' && (
                                        <div className="w-full max-w-[240px] mb-5">
                                            <label className="block text-[10px] text-clinical-charcoal/60 uppercase tracking-widest mb-1.5 text-left font-label-md">Seharusnya:</label>
                                            <div className="relative">
                                                <select 
                                                    value={selectedCorrection}
                                                    onChange={(e) => setSelectedCorrection(e.target.value)}
                                                    className="w-full appearance-none text-sm font-headline-md border border-outline-variant rounded-xl px-3 py-2.5 bg-white text-clinical-charcoal focus:ring-2 focus:ring-clinical-blue/20 focus:border-clinical-blue outline-none transition-all shadow-sm"
                                                >
                                                    <option value="Normal">Normal</option>
                                                    <option value="Bradikardia">Bradikardia</option>
                                                    <option value="Takikardia">Takikardia</option>
                                                    <option value="Atrial Fibrillation">Atrial Fibrillation</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-clinical-charcoal/40 pointer-events-none">expand_more</span>
                                            </div>
                                        </div>
                                    )}

                                    {verificationState && (
                                        <button 
                                            onClick={handleConfirm}
                                            disabled={isSubmitting || !timeInterval}
                                            className="w-full max-w-[240px] bg-clinical-blue text-white flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-label-md text-sm hover:bg-clinical-blue/90 active:scale-[0.98] transition-all shadow-md shadow-clinical-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {submitSuccess ? 'check_circle' : 'save'}
                                                </span>
                                            )}
                                            {isSubmitting ? 'Menyimpan...' : submitSuccess ? 'Tersimpan ✓' : 'Konfirmasi & Simpan'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <h2 className="text-base font-medium tracking-wide text-clinical-charcoal/40">
                            Menunggu Data...
                        </h2>
                    )}
                </div>
            </div>
        </div>
    );
};