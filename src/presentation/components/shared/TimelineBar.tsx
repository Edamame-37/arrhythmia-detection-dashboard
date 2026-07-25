/**
 * @fileoverview Komponen UI: TimelineBar
 * Menampilkan baris navigasi segmen waktu perekaman 10 detik (00:00 - 10:00).
 * Mengubah warna tombol berdasarkan hasil evaluasi AI klinis (Normal vs Aritmia).
 */

import React, { useEffect, useRef } from 'react';
import type { TimelineEvent } from '../../../core/types/ecgTypes';

interface TimelineBarProps {
    events: TimelineEvent[];
    currentIdx?: number;
    onSegmentSelect?: (index: number) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
    events,
    currentIdx,
    onSegmentSelect
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll ke kanan saat ada segmen baru masuk (Simulasi Live Monitor)
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            container.scrollTo({
                left: container.scrollWidth,
                behavior: 'smooth'
            });
        }
    }, [events.length]);

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">history</span> Navigasi Segmen Perekaman (AI Timeline)
                </h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                        <div className="w-3 h-3 rounded bg-signal-green shadow-sm"></div> Normal
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                        <div className="w-3 h-3 rounded bg-alert-red shadow-sm"></div> Anomali (AFIB/PVC/SVT)
                    </div>
                </div>
            </div>

            {/* WADAH TOMBOL TIMELINE DENGAN SCROLL HORIZONTAL */}
            <div 
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x scroll-smooth w-full"
            >
                {events.length === 0 ? (
                    <div className="text-xs text-outline italic py-2">
                        Menunggu inisialisasi stream data untuk menyusun timeline AI...
                    </div>
                ) : (
                    events.map((event) => {
                        const isSelected = currentIdx === event.index;
                        
                        // Menentukan awalan teks berdasarkan klasifikasi multi-aritmia TFLite
                        let prefix = "";
                        if (event.isAnomaly) {
                            if (event.classResult.includes("AFIB")) prefix = "AFIB ";
                            else if (event.classResult.includes("PVC")) prefix = "PVC ";
                            else if (event.classResult.includes("SVT")) prefix = "SVT ";
                            else prefix = "ANOM ";
                        }

                        return (
                            <button
                                key={event.index}
                                onClick={() => onSegmentSelect && onSegmentSelect(event.index)}
                                className={`flex-shrink-0 h-10 px-4 rounded-lg text-white font-mono-data font-bold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all snap-center outline-none border-2 ${
                                    event.isAnomaly 
                                        ? 'bg-alert-red hover:bg-red-700' 
                                        : 'bg-signal-green hover:bg-green-600'
                                } ${
                                    isSelected 
                                        ? 'border-charcoal ring-2 ring-offset-2 ring-medical-teal scale-105' 
                                        : 'border-transparent'
                                }`}
                            >
                                {prefix}{event.timeStr}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};