import React from 'react';
import type { ClinicalExplanation } from '../../../core/clinical/ruleBasedEngine';

interface AiCardProps {
    clinicalStatus: ClinicalExplanation | null;
    aiProbabilities?: Record<string, number> | null;
}

export const AiCard: React.FC<AiCardProps> = ({ clinicalStatus, aiProbabilities }) => {
    return (
        <div className="bg-charcoal text-white rounded-xl p-5 shadow-xl relative overflow-hidden flex-1 flex flex-col">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-medical-teal/30 rounded-full blur-2xl"></div>
            <div className="relative z-10 h-full flex flex-col">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary-fixed">
                    <span className="material-symbols-outlined text-[18px]">psychology</span> Penjelasan AI Klinis
                </h4>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4 flex-1">
                    <p className="text-xs text-slate-200 leading-relaxed transition-all">
                        {clinicalStatus 
                            ? clinicalStatus.fullExplanation 
                            : "Tekan tombol Mulai Perekaman untuk memulai analisis cerdas secara real-time. Algoritma 1D-CNN dan Rule-Based akan memantau variasi R-R."
                        }
                    </p>
                    
                    {/* Render Probabilitas Multikelas */}
                    {aiProbabilities && (
                        <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                            <p className="text-[10px] text-primary-fixed font-bold uppercase tracking-widest mb-1">Rincian Deteksi AI</p>
                            {Object.entries(aiProbabilities).map(([label, value]) => (
                                <div key={label} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-[10px] font-mono-data">
                                        <span className="text-slate-300">{label}</span>
                                        <span className="text-white font-bold">{value.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${label === 'Normal' ? 'bg-medical-teal' : 'bg-alert-red'}`} 
                                            style={{ width: `${value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button className="w-full py-3 bg-medical-teal hover:bg-primary-container text-white rounded-lg font-bold text-sm transition-all shadow-md active:scale-95 flex justify-center items-center gap-2 mt-auto outline-none">
                    Konfirmasi Diagnosis
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </button>
            </div>
        </div>
    );
};