/**
 * @fileoverview Komponen UI: NotificationPanel
 * Merender panel peringatan bahaya (floating toast alert) jika 1D-CNN
 * mendeteksi adanya gangguan aritmia kritis pada pasien.
 */

import React from 'react';

interface NotificationPanelProps {
    visible: boolean;
    title: string;
    message?: string;
    onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
    visible,
    title,
    message = "Segera lakukan tindakan evaluasi klinis atau siapkan intervensi defibrilasi.",
    onClose
}) => {
    // Jika tidak diperintahkan muncul oleh state, return null (tidak merender apapun di DOM)
    if (!visible) return null;

    return (
        <div 
            className="fixed top-20 right-4 md:right-10 w-[90%] md:w-[400px] bg-alert-red text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 border border-red-300 floating-alert z-[100] transition-all duration-300"
            style={{ animation: 'slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
        >
            {/* Icon Alarm Medis Berkedip */}
            <span 
                className="material-symbols-outlined text-[32px] animate-pulse flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
            >
                warning
            </span>
            
            <div className="pr-6 flex-1">
                <p className="font-bold text-base tracking-tight">{title}</p>
                <p className="text-sm opacity-90 mt-0.5 leading-snug">{message}</p>
            </div>

            {/* Tombol Tutup Manual */}
            <button 
                onClick={onClose}
                className="absolute top-2 right-2 p-1 text-white/70 hover:text-white transition-colors rounded-full hover:bg-red-800 outline-none flex items-center justify-center"
                title="Tutup Notifikasi"
            >
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    );
};