import React from 'react';

interface HeaderProps {
    deviceId?: string;
    sessionId?: string;
}

export const Header: React.FC<HeaderProps> = ({ deviceId = "UNDIP-ECG-01", sessionId = "Sesi Aktif" }) => {
    return (
        <header className="fixed top-0 left-0 w-full h-16 bg-surface-container-lowest z-50 flex justify-between items-center px-4 md:px-margin-desktop shadow-sm border-b border-outline-variant">
            <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <img src="/icons/logo.png" alt="Logo" className="h-8 w-8 md:h-9 md:w-9 object-contain drop-shadow-sm" />
                <span className="text-[1.3rem] md:text-2xl font-extrabold tracking-tighter flex items-center">
                    <span className="text-brand-red">ecg</span><span className="text-brand-navy">rhythmia</span>
                </span>
            </a>
            <div className="hidden md:flex items-center gap-3 px-6 py-2 bg-surface-container-low rounded-full border border-outline-variant/60 shadow-inner">
                <span className="material-symbols-outlined text-medical-teal text-[20px]">monitor_heart</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Sesi Aktif:</span>
                <span className="text-sm font-bold text-charcoal">{sessionId} ({deviceId})</span>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
                <div className="hidden sm:flex gap-2 mr-1">
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-medical-teal transition-colors p-1 text-[22px]">notifications</span>
                    <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-medical-teal transition-colors p-1 text-[22px]">settings</span>
                </div>
                <button className="bg-alert-red hover:bg-red-700 text-white font-bold text-[10px] md:text-xs px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm outline-none">
                    <span className="material-symbols-outlined text-[16px] md:text-[18px]">eject</span>
                    <span className="hidden sm:inline">UNBIND DEVICE</span>
                </button>
            </div>
        </header>
    );
};