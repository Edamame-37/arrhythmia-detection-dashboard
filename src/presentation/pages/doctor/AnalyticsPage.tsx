/**
 * @fileoverview Halaman UI: Analytics & History Page
 * Berfungsi untuk meninjau ulang rekaman EKG pasien dari masa lalu (Historical Review).
 * Dokter dapat menavigasi segmen 10-detik spesifik menggunakan Timeline Bar.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ECGCanvas } from '../../components/canvas/ECGCanvas';
import { TimelineBar } from '../../components/shared/TimelineBar';
import type { ECGPaths, RPeakMarker, TimelineEvent } from '../../../core/types/ecgTypes';

// ============================================================================
// GENERATOR DATA SIMULASI (Hanya untuk keperluan UI sebelum Backend DB Siap)
// ============================================================================
const generateMockHistory = () => {
    const events: TimelineEvent[] = [];
    const mockSegments: Record<number, { paths: ECGPaths, rPeaks: RPeakMarker[], isAnomaly: boolean, diagnosis: string }> = {};

    for (let i = 0; i < 20; i++) {
        const isAnomaly = i === 4 || i === 12; // Segmen ke-4 dan ke-12 dibuat error
        let diagnosis = "Normal Sinus Rhythm. Variasi R-R stabil.";
        if (i === 4) diagnosis = "AFIB Terdeteksi. Interval R-R ireguler tanpa gelombang P yang jelas.";
        if (i === 12) diagnosis = "PVC Terdeteksi. Kompleks QRS prematur dan melebar.";

        events.push({
            index: i,
            timeStr: `${Math.floor(i / 6).toString().padStart(2, '0')}:${((i % 6) * 10).toString().padStart(2, '0')}`,
            isAnomaly,
            classResult: isAnomaly ? (i === 4 ? "AFIB" : "PVC") : "NORM"
        });

        // Membuat garis lurus datar (Simulasi)
        const flatLine = ["0,60", "2000,60"];
        
        mockSegments[i] = {
            paths: { I: flatLine, II: flatLine, III: flatLine, aVR: flatLine, aVL: flatLine, aVF: flatLine, V1: flatLine },
            rPeaks: isAnomaly 
                ? [{ x: 500, y: 20, rrText: "0.6s" }, { x: 1200, y: 20, prevX: 500, rrText: "0.4s" }] 
                : [{ x: 400, y: 20, rrText: "0.8s" }, { x: 1200, y: 20, prevX: 400, rrText: "0.8s" }],
            isAnomaly,
            diagnosis
        };
    }
    return { events, mockSegments };
};

export const AnalyticsPage: React.FC = () => {
    // State Navigasi Riwayat
    const [speed, setSpeed] = useState<25 | 50>(25);
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Memuat Data Simulasi
    const { events, mockSegments } = useMemo(() => generateMockHistory(), []);

    useEffect(() => {
        // Simulasi penarikan data dari server (Loading 1 detik)
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const currentSegment = mockSegments[selectedIdx];
    const currentEvent = events.find(e => e.index === selectedIdx);

    return (
        <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
            
            {/* --- HEADER KOMPONEN (Mirip Monitor, tapi dengan tombol Kembali) --- */}
            <header className="fixed top-0 left-0 w-full h-16 bg-surface-container-lowest z-50 flex justify-between items-center px-4 md:px-margin-desktop shadow-sm border-b border-outline-variant">
                
                <div className="flex items-center gap-4">
                    {/* Tombol Kembali ke Monitor/Dashboard */}
                    <button 
                        onClick={() => window.history.back()}
                        className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant flex items-center justify-center"
                        title="Kembali"
                    >
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>

                    <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                        <img src="/icons/logo.png" alt="Logo" className="h-8 w-8 md:h-9 md:w-9 object-contain drop-shadow-sm" />
                        <span className="text-[1.3rem] md:text-2xl font-extrabold tracking-tighter flex items-center">
                            <span className="text-brand-red">ecg</span>
                            <span className="text-brand-navy">rhythmia <span className="text-sm font-medium text-outline ml-2 hidden sm:inline-block">| Analytics</span></span>
                        </span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-3 px-6 py-2 bg-surface-container-low rounded-full border border-outline-variant/60 shadow-inner">
                    <span className="material-symbols-outlined text-charcoal text-[20px]">folder_managed</span>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Arsip Medis:</span>
                    <span className="text-sm font-bold text-charcoal">Tn. Ahmad Hidayat (ID: 88291A)</span>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    <button className="bg-medical-teal hover:bg-primary-container text-white font-bold text-[10px] md:text-xs px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm outline-none">
                        <span className="material-symbols-outlined text-[16px] md:text-[18px]">picture_as_pdf</span>
                        <span className="hidden sm:inline">CETAK PDF</span>
                    </button>
                </div>
            </header>

            {/* --- KONTEN UTAMA --- */}
            <main className="pt-20 md:pt-24 pb-12 mx-auto w-full max-w-container-max px-4 md:px-margin-desktop flex flex-col lg:flex-row gap-6 flex-1">
                
                {/* KOLOM KIRI: GRAFIK & TIMELINE */}
                <section className="w-full lg:w-9/12 flex flex-col gap-4">
                    
                    {/* Control Bar (Speed & Info Segmen) */}
                    <div className="bg-surface border border-outline-variant rounded-xl p-3 flex flex-wrap justify-between items-center shadow-sm gap-3">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-medical-teal hidden sm:block">history</span>
                            <span className="text-sm font-bold text-charcoal flex items-center gap-2">
                                Waktu Rekaman: 
                                <span className="px-2 py-1 bg-surface-container-high rounded text-medical-teal font-mono-data text-xs">
                                    {currentEvent?.timeStr || "00:00"} - {events[selectedIdx + 1]?.timeStr || "00:10"}
                                </span>
                            </span>
                        </div>
                        
                        <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant/50 ml-auto sm:ml-0">
                            <button 
                                onClick={() => setSpeed(25)} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all outline-none ${speed === 25 ? 'bg-medical-teal text-white shadow-sm' : 'text-on-surface-variant hover:text-charcoal hover:bg-surface-container-high'}`}
                            >
                                25 mm/s
                            </button>
                            <button 
                                onClick={() => setSpeed(50)} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all outline-none ${speed === 50 ? 'bg-medical-teal text-white shadow-sm' : 'text-on-surface-variant hover:text-charcoal hover:bg-surface-container-high'}`}
                            >
                                50 mm/s
                            </button>
                        </div>
                    </div>

                    {/* Pembungkus Kanvas 7-Lead (Menggunakan Fix Tinggi Absolut) */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm relative h-[880px] flex flex-col">
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-50">
                                <span className="material-symbols-outlined text-medical-teal text-4xl animate-spin">sync</span>
                                <p className="mt-2 text-sm font-bold text-charcoal">Menarik Arsip Segmen...</p>
                            </div>
                        ) : (
                            <ECGCanvas 
                                paths={currentSegment.paths} 
                                rPeaks={currentSegment.rPeaks} 
                                speed={speed} 
                                isAnomaly={currentSegment.isAnomaly}
                                classResult={currentEvent?.classResult} 
                                timeOffset={selectedIdx * 10} // Kalkulasi waktu riwayat
                            />
                        )}
                    </div>

                    {/* Timeline Multi-Aritmia (Klik untuk melompat ke waktu tertentu) */}
                    <TimelineBar 
                        events={events} 
                        currentIdx={selectedIdx} 
                        onSegmentSelect={(idx: number) => {
                            setIsLoading(true);
                            setTimeout(() => {
                                setSelectedIdx(idx);
                                setIsLoading(false);
                            }, 300); // Simulasi jeda tarik data
                        }} 
                    />
                    
                </section>

                {/* KOLOM KANAN: DETAIL ANALISIS HISTORIS */}
                <aside className="w-full lg:w-3/12 flex flex-col gap-6">
                    
                    {/* Kartu Ringkasan Sesi */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-charcoal mb-4 border-b border-outline-variant/50 pb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">info</span> Informasi Rekaman
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-on-surface-variant">Tanggal:</span>
                                <span className="text-xs font-bold text-charcoal">12 Okt 2024</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-on-surface-variant">Waktu Mulai:</span>
                                <span className="text-xs font-bold text-charcoal">08:15:00 WIB</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-on-surface-variant">Durasi Sesi:</span>
                                <span className="text-xs font-bold text-charcoal">03:20 (Menit)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-on-surface-variant">Total Anomali:</span>
                                <span className="text-xs font-bold text-alert-red bg-red-50 px-2 py-0.5 rounded">2 Kejadian</span>
                            </div>
                        </div>
                    </div>

                    {/* Kartu Hasil Diagnosis Segmen Terpilih */}
                    <div className={`rounded-xl p-5 shadow-xl flex-1 flex flex-col transition-colors duration-500 ${currentSegment?.isAnomaly ? 'bg-alert-red text-white' : 'bg-charcoal text-white'}`}>
                        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">
                                {currentSegment?.isAnomaly ? 'warning' : 'verified_user'}
                            </span> 
                            AI Review (Segmen {currentEvent?.timeStr})
                        </h4>
                        
                        <div className="bg-white/10 rounded-lg p-3 border border-white/20 mb-4 flex-1">
                            <div className="mb-2">
                                <span className="text-[10px] uppercase tracking-wider text-white/70">Klasifikasi Utama:</span>
                                <p className="text-lg font-extrabold tracking-wide">
                                    {currentEvent?.classResult === "NORM" ? "NORMAL" : currentEvent?.classResult}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-white/70">Catatan Klinis:</span>
                                <p className="text-xs text-white/90 leading-relaxed mt-1">
                                    {currentSegment?.diagnosis}
                                </p>
                            </div>
                        </div>
                        
                        {currentSegment?.isAnomaly && (
                            <button className="w-full py-2.5 bg-white text-alert-red rounded-lg font-bold text-sm transition-all shadow-md active:scale-95 flex justify-center items-center gap-2 mt-auto outline-none">
                                Tambahkan ke Laporan
                                <span className="material-symbols-outlined text-[16px]">note_add</span>
                            </button>
                        )}
                    </div>

                </aside>
            </main>
        </div>
    );
};