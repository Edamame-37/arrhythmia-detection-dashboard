import React from 'react';

interface AiCardProps {
    sessionId?: string | null;
    rawClassification?: string | null;
}

export const AiCard: React.FC<AiCardProps> = ({ rawClassification }) => {
    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-[0px_20px_40px_rgba(0,0,0,0.04)] border border-clinical-charcoal/5 relative overflow-hidden flex flex-col justify-center min-h-[160px] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] group">
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <h4 className="text-[12px] font-bold mb-4 text-clinical-charcoal/60 uppercase tracking-[0.2em] text-center w-full">
                    Klasifikasi AI
                </h4>

                <div className="text-center w-full">
                    {rawClassification ? (
                        <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-clinical-charcoal">
                            {rawClassification}
                        </h2>
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