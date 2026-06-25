/**
 * @fileoverview Halaman UI: Monitor Page
 * Halaman utama untuk pengawasan EKG Live 10-menit. Mengorkestrasi
 * Custom Hook (useECGStream) dengan komponen presentasi visual.
 */

import React, { useState, useEffect } from 'react';
import { useECGStream } from '../../application/useECGStream';
import { ECGCanvas } from '../components/ECGCanvas';
import { TimelineBar } from '../components/TimelineBar';
import { NotificationPanel } from '../components/NotificationPanel';

export const MonitorPage: React.FC = () => {
    // 1. Inisialisasi Hook Utama (Application Layer)
    const {
        isRecording,
        paths,
        rPeaks,
        heartRate,
        clinicalStatus,
        timeline,
        startStream,
        stopStream
    } = useECGStream('/ws/ecg/1');

    // 2. Local UI State
    const [speed, setSpeed] = useState<25 | 50>(25);
    const [showNotification, setShowNotification] = useState<boolean>(false);

    // 3. Efek Samping: Tampilkan Pop-up jika AI mendeteksi anomali baru
    useEffect(() => {
        if (clinicalStatus?.isAnomaly) {
            setShowNotification(true);
        } else {
            setShowNotification(false);
        }
    }, [clinicalStatus]);

    // 4. Handler Interaksi Tombol
    const handleToggleRecord = () => {
        if (isRecording) {
            stopStream();
        } else {
            startStream();
        }
    };

    // Aman dari Null / Undefined
    const alertTitle = clinicalStatus ? clinicalStatus.fullExplanation.split('.')[0] : 'Anomali Terdeteksi';
    const aiClassResult = clinicalStatus ? clinicalStatus.fullExplanation.split(' ')[2] : 'NORM';

    return (
        <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
            
            {/* ========================================================= */}
            {/* PERBAIKAN 1: HEADER FLEXBOX & LOGO BERDAMPINGAN           */}
            {/* ========================================================= */}
            <header className="fixed top-0 left-0 w-full h-16 bg-surface-container-lowest z-50 flex justify-between items-center px-4 md:px-margin-desktop shadow-sm border-b border-outline-variant">
                
                {/* WADAH KIRI: LOGO GAMBAR & TEKS BERDAMPINGAN */}
                <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    {/* Gambar dibatasi ukurannya agar tidak mendominasi layar */}
                    <img 
                        src="/icons/logo.png" 
                        alt="Logo" 
                        className="h-8 w-8 md:h-9 md:w-9 object-contain drop-shadow-sm" 
                    />
                    {/* Teks Judul tetap dipertahankan dan disandingkan */}
                    <span className="text-[1.3rem] md:text-2xl font-extrabold tracking-tighter flex items-center">
                        <span className="text-brand-red">ecg</span>
                        <span className="text-brand-navy">rhythmia</span>
                    </span>
                </a>

                {/* WADAH TENGAH: INFO PASIEN (Hanya tampil di Desktop/Tablet) */}
                <div className="hidden md:flex items-center gap-3 px-6 py-2 bg-surface-container-low rounded-full border border-outline-variant/60 shadow-inner">
                    <span className="material-symbols-outlined text-medical-teal text-[20px]">monitor_heart</span>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Sesi Aktif:</span>
                    <span className="text-sm font-bold text-charcoal">Tn. Ahmad Hidayat (UNDIP-ECG-01)</span>
                </div>

                {/* WADAH KANAN: NAVIGASI & TOMBOL */}
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="hidden sm:flex gap-2 mr-1">
                        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-medical-teal transition-colors p-1 text-[22px]">notifications</span>
                        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-medical-teal transition-colors p-1 text-[22px]" title="Pengaturan Klinis">settings</span>
                    </div>
                    <button className="bg-alert-red hover:bg-red-700 text-white font-bold text-[10px] md:text-xs px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm outline-none">
                        <span className="material-symbols-outlined text-[16px] md:text-[18px]">eject</span>
                        <span className="hidden sm:inline">UNBIND DEVICE</span>
                    </button>
                </div>
            </header>

            {/* --- NOTIFICATION PANEL PUSH --- */}
            <NotificationPanel 
                visible={showNotification}
                title={`KRITIS: ${alertTitle}`}
                onClose={() => setShowNotification(false)}
            />

            {/* --- KONTEN UTAMA --- */}
            <main className="pt-20 md:pt-24 pb-12 mx-auto w-full max-w-container-max px-4 md:px-margin-desktop flex flex-col lg:flex-row gap-6 flex-1">
                
                {/* KOLOM KIRI: GRAFIK & TIMELINE */}
                <section className="w-full lg:w-9/12 flex flex-col gap-4">
                    
                    {/* Control Bar (Speed & Record) */}
                    <div className="bg-surface border border-outline-variant rounded-xl p-3 flex flex-wrap justify-between items-center shadow-sm gap-3">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-medical-teal hidden sm:block">tune</span>
                            <span className="text-sm font-bold text-charcoal hidden sm:block">
                                Kecepatan: <span className="font-mono-data text-medical-teal ml-1">{speed} mm/s</span>
                            </span>

                            <button 
                                onClick={handleToggleRecord} 
                                className={`${isRecording ? 'bg-alert-red' : 'bg-medical-teal hover:brightness-110'} text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 outline-none`}
                            >
                                {isRecording ? (
                                    <><span className="material-symbols-outlined text-[16px] animate-pulse">stop_circle</span> Menghentikan...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[16px]">play_circle</span> Mulai Perekaman</>
                                )}
                            </button>
                        </div>
                        
                        <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant/50 ml-auto sm:ml-0">
                            <button 
                                onClick={() => setSpeed(25)} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all outline-none ${speed === 25 ? 'bg-medical-teal text-white shadow-sm' : 'text-on-surface-variant hover:text-charcoal hover:bg-surface-container-high'}`}
                            >
                                25
                            </button>
                            <button 
                                onClick={() => setSpeed(50)} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all outline-none ${speed === 50 ? 'bg-medical-teal text-white shadow-sm' : 'text-on-surface-variant hover:text-charcoal hover:bg-surface-container-high'}`}
                            >
                                50
                            </button>
                        </div>
                    </div>

                    {/* Pembungkus Kanvas 7-Lead */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm relative h-[50vh] lg:h-[850px] flex flex-col">
                        <ECGCanvas 
                            paths={paths} 
                            rPeaks={rPeaks} 
                            speed={speed} 
                            isAnomaly={clinicalStatus?.isAnomaly}
                            classResult={aiClassResult} 
                        />
                    </div>

                    {/* Timeline Multi-Aritmia */}
                    <TimelineBar events={timeline} />
                    
                </section>

                {/* KOLOM KANAN: PANEL KLINIS & PERANGKAT */}
                <aside className="w-full lg:w-3/12 flex flex-col gap-6">
                    
                    {/* Kartu Status Medis Vital */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[11px] font-bold text-outline uppercase tracking-widest">Heart Rate</p>
                                <h2 className={`text-5xl font-extrabold leading-none mt-1 tracking-tighter transition-colors duration-300 ${clinicalStatus?.severity === 'CRITICAL' ? 'text-alert-red' : 'text-charcoal'}`}>
                                    <span>{heartRate}</span> <span className="text-base font-bold tracking-normal ml-0.5">BPM</span>
                               </h2>
                            </div>
                            
                            {/* Lencana Status Dinamis */}
                            <div className={`px-2 py-1 rounded font-bold text-[10px] border flex items-center gap-1.5 transition-all ${
                                !clinicalStatus ? 'bg-surface-container text-outline border-outline-variant' :
                                clinicalStatus.severity === 'CRITICAL' ? 'bg-red-50 text-alert-red border-red-200 pulse-animation' :
                                'bg-green-50 text-green-700 border-green-200'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${!clinicalStatus ? 'bg-outline' : clinicalStatus.severity === 'CRITICAL' ? 'bg-alert-red' : 'bg-signal-green'}`}></span>
                                {!clinicalStatus ? 'Tunggu Data' : clinicalStatus.severity === 'CRITICAL' ? 'Anomali Deteksi' : 'Normal'}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-outline-variant/60">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-on-surface-variant">Status Irama:</span>
                                <span className={`text-sm font-bold transition-colors ${!clinicalStatus ? 'text-outline' : clinicalStatus.severity === 'CRITICAL' ? 'text-alert-red' : 'text-signal-green'}`}>
                                    {!clinicalStatus ? 'Menunggu AI...' : clinicalStatus.severity === 'CRITICAL' ? 'Aritmia Terdeteksi' : 'Normal Sinus Rhythm'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-on-surface-variant">Oksimetri (SpO2):</span>
                                <span className="text-sm font-bold text-signal-green">98%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-on-surface-variant">Stabilitas Alat:</span>
                                <span className="text-sm font-bold text-medical-teal">Tinggi</span>
                            </div>
                        </div>
                    </div>

                    {/* Kartu Penjelasan Rule-Based AI */}
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
                            </div>
                            
                            <button className="w-full py-3 bg-medical-teal hover:bg-primary-container text-white rounded-lg font-bold text-sm transition-all shadow-md active:scale-95 flex justify-center items-center gap-2 mt-auto outline-none">
                                Konfirmasi Diagnosis
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            </button>
                        </div>
                    </div>

                    {/* Kartu Info Perangkat Fisik */}
                    <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface border border-outline-variant/60 flex items-center justify-center">
                            <span className="material-symbols-outlined text-charcoal text-[20px]">developer_board</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Device ID</p>
                            <p className="text-sm font-mono-data text-charcoal font-bold mt-0.5">UNDIP-ECG-01</p>
                        </div>
                        <div className="ml-auto flex flex-col items-end">
                            <span className="material-symbols-outlined text-signal-green text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>battery_full</span>
                            <span className="text-xs font-bold text-signal-green mt-0.5">92%</span>
                        </div>
                    </div>

                </aside>
            </main>
        </div>
    );
};  