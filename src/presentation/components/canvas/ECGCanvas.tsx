/**
 * @fileoverview Komponen UI: ECG Canvas
 * Bertugas merender grid kertas medis standar (1mm = 0.04s, 1mV = 10mm)
 * dan menggambar 7 jalur gelombang (Lead I, II, III, aVR, aVL, aVF, V1).
 * 
 * UPDATE VERSION: Unrestricted Wave Overlap & Single Canvas
 * 1. Menghapus batasan kotak per saluran (overflow-hidden) agar puncak
 *    gelombang tinggi dapat overlap dengan bebas layaknya kertas EKG fisik.
 * 2. Menyatukan seluruh gelombang ke dalam 1 layer SVG raksasa demi
 *    peningkatan performa (mengurangi jumlah node DOM).
 * 3. Menangani pembalikan aVR menggunakan matriks scale SVG matematis murni.
 */

import React, { useState, useRef } from 'react';
import type { ECGPaths, RPeakMarker } from '../../../core/types/ecgTypes';

interface ECGCanvasProps {
    paths: ECGPaths;
    rPeaks: RPeakMarker[];
    isAnomaly?: boolean;
    classResult?: string;
    speed?: 25 | 50; // mm/s
    timeOffset?: number; // Untuk mode Analytics
}

export const ECGCanvas: React.FC<ECGCanvasProps> = ({
    paths,
    rPeaks,
    isAnomaly = false,
    classResult = "NORM",
    speed = 25,
    timeOffset = 0
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [pointerX, setPointerX] = useState<number | null>(null);

    const canvasWidth = speed === 25 ? 2000 : 1000;
    const lead2Stroke = isAnomaly ? '#E71D36' : '#001F54';

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        let x = clientX - rect.left;

        if (x > canvasWidth) x = canvasWidth;
        if (x < 0) x = 0;
        setPointerX(x);
    };

    const hidePointer = () => setPointerX(null);

    let tooltipX = (pointerX || 0) + 20;
    if (pointerX && pointerX > (canvasWidth - 200)) tooltipX = pointerX - 190;
    
    const absoluteSecs = timeOffset + ((pointerX || 0) / (speed === 25 ? 200 : 100));
    const mStr = Math.floor(absoluteSecs / 60).toString().padStart(2, '0');
    const sStr = Math.floor(absoluteSecs % 60).toString().padStart(2, '0');
    const msStr = Math.floor((absoluteSecs % 1) * 100).toString().padStart(2, '0');

    const renderSVGTimeline = () => {
        const totalBoxes = speed === 25 ? 50 : 25;
        const elements = [];
        for (let i = 0; i <= totalBoxes; i++) {
            const xPos = i * 40;
            const isFullSecond = i % 5 === 0;
            const label = isFullSecond ? `${i / 5}s` : `.${(i % 5) * 2}`;
            elements.push(<line key={`line-${i}`} x1={xPos} y1="0" x2={xPos} y2="40" stroke="rgba(255, 166, 201, 0.5)" strokeWidth="1" />);
            elements.push(<text key={`text-${i}`} x={xPos + 4} y="25" fill="#DC2626" fontSize="10" fontFamily="monospace" fontWeight="bold">{label}</text>);
        }
        return elements;
    };

    // Fungsi helper dinamis untuk merender marker di dalam koordinat grup SVG
    const renderMarkers = (leadKey: 'yI' | 'yII' | 'yIII' | 'yaVR' | 'yaVL' | 'yaVF' | 'yV1', showMetrics: boolean = false) => {
        return rPeaks.map((peak, idx) => {
            const yPos = peak[leadKey];
            if (yPos === undefined) return null;

            return (
                <g key={idx}>
                    {/* Titik Lingkaran Puncak QRS */}
                    <circle cx={peak.x} cy={yPos} r="2.5" fill="#3B82F6" />
                    
                    {/* Render teks metrik (Hanya diaktifkan pada Lead II) */}
                    {showMetrics && peak.prevX !== undefined && peak.bpm !== undefined && peak.boxesText && (
                        <>
                            <line 
                                x1={peak.prevX} y1="12" 
                                x2={peak.x} y2="12" 
                                stroke="#3B82F6" strokeWidth="1" strokeDasharray="3,3" opacity="0.6"
                            />
                            <line x1={peak.prevX} y1="8" x2={peak.prevX} y2="16" stroke="#3B82F6" strokeWidth="1.5" opacity="0.6" />
                            <line x1={peak.x} y1="8" x2={peak.x} y2="16" stroke="#3B82F6" strokeWidth="1.5" opacity="0.6" />

                            <text 
                                x={peak.prevX + (peak.x - peak.prevX) / 2} 
                                y="22" 
                                fill="#1E3A8A" 
                                fontSize="9" 
                                fontFamily="sans-serif" 
                                fontWeight="bold" 
                                textAnchor="middle"
                            >
                                {peak.bpm} BPM
                            </text>
                            <text 
                                x={peak.prevX + (peak.x - peak.prevX) / 2} 
                                y="32" 
                                fill="#64748B" 
                                fontSize="8" 
                                fontFamily="sans-serif" 
                                textAnchor="middle"
                            >
                                ({peak.boxesText})
                            </text>
                        </>
                    )}
                </g>
            );
        });
    };

    return (
        <div className="flex-1 overflow-auto custom-scrollbar relative flex flex-col bg-[#FFF9FA]" id="ecg-scroll-container">
            <div className="flex flex-col relative" style={{ minWidth: `${canvasWidth + 64}px` }}>
                
                {/* Header Batas Scroll Kiri */}
                <div className="sticky top-0 h-[40px] flex z-40 pointer-events-none bg-white/90 backdrop-blur-sm border-b border-pink-300">
                    <div className="sticky left-0 w-16 flex-shrink-0 bg-white/95 border-r border-pink-300 z-50"></div>
                </div>

                <div className="relative flex flex-row">
                    {/* Y-Axis Skala Garis Tepi (Kiri) */}
                    <div className="sticky left-0 w-16 h-[1680px] flex-shrink-0 bg-white/95 backdrop-blur z-40 shadow-[2px_0_5px_rgba(0,0,0,0.03)] border-r border-pink-300 relative">
                        {Array.from({ length: 7 }).map((_, idx) => (
                            <div key={idx} className="absolute w-full h-[240px]" style={{ top: `${idx * 240}px` }}>
                                {idx < 6 && <div className="absolute bottom-0 left-0 w-full border-b-[2px] border-pink-300/80"></div>}
                                <span className="absolute top-[40px] left-1.5 md:left-2 text-[9px] font-mono-data font-bold text-red-600 leading-none -translate-y-1/2">+1.0mV</span>
                                <span className="absolute top-[80px] left-1.5 md:left-2 text-[9px] font-mono-data font-bold text-red-600 leading-none -translate-y-1/2">+0.5mV</span>
                                <span className="absolute top-[120px] left-1.5 md:left-2 text-[9px] font-mono-data font-bold text-red-600 leading-none -translate-y-1/2">0</span>
                                <span className="absolute top-[160px] left-1.5 md:left-2 text-[9px] font-mono-data font-bold text-red-600 leading-none -translate-y-1/2">-0.5mV</span>
                                <span className="absolute top-[200px] left-1.5 md:left-2 text-[9px] font-mono-data font-bold text-red-600 leading-none -translate-y-1/2">-1.0mV</span>
                            </div>
                        ))}
                    </div>

                    {/* Area Canvas Interaktif Utama */}
                    <div 
                        className="relative z-10 flex flex-col cursor-crosshair -mt-[40px]" 
                        style={{ width: `${canvasWidth}px`, height: '1720px' }}
                        ref={canvasRef} onMouseMove={handlePointerMove} onTouchMove={handlePointerMove}
                        onMouseEnter={() => setPointerX(0)} onMouseLeave={hidePointer} onTouchStart={() => setPointerX(0)} onTouchEnd={hidePointer}
                    >
                        {/* Garis Waktu Atas */}
                        <svg className="sticky top-0 left-0 z-50 pointer-events-none" width={canvasWidth} height={40} xmlns="http://www.w3.org/2000/svg">
                            {renderSVGTimeline()}
                        </svg>

                        {/* SATU CANVAS RAKSASA (GRID + GELOMBANG EKG TERINTEGRASI) */}
                        <svg className="absolute top-[40px] left-0 pointer-events-none z-10 overflow-visible" width={canvasWidth} height={1680} viewBox={`0 0 ${canvasWidth} 1680`} xmlns="http://www.w3.org/2000/svg">
                            {/* Layer 1: Definisi & Latar Belakang Grid */}
                            <defs>
                                <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="#FFD1DC" strokeWidth="0.5" /></pattern>
                                <pattern id="largeGrid" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="url(#smallGrid)" /><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFA6C9" strokeWidth="1.2" /></pattern>
                            </defs>
                            <rect width={canvasWidth} height={1680} fill="url(#largeGrid)" />
                            
                            {/* Garis Pemisah Antar Baris */}
                            {[1, 2, 3, 4, 5, 6].map(i => <line key={i} x1="0" y1={i * 240} x2={canvasWidth} y2={i * 240} stroke="rgba(255, 166, 201, 0.8)" strokeWidth="2" />)}
                            
                            {/* Kotak Latar Redup untuk Lead V1 (Offline) */}
                            <rect x="0" y="1440" width={canvasWidth} height="240" fill="#F9FAFB" opacity="0.6" />

                            {/* Layer 2: Saluran Gelombang (Digeser otomatis dengan transform-translate) */}
                            {/* 1. Lead I */}
                            <g transform="translate(0, 0)">
                                <path d={paths.I.length > 0 ? `M${paths.I.join(' L')}` : ""} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                                {renderMarkers('yI')}
                            </g>

                            {/* 2. Lead II */}
                            <g transform="translate(0, 240)">
                                <path d={paths.II.length > 0 ? `M${paths.II.join(' L')}` : ""} fill="none" stroke={lead2Stroke} strokeWidth="1.5" strokeLinejoin="round" />
                                {renderMarkers('yII', true)}
                            </g>

                            {/* 3. Lead III */}
                            <g transform="translate(0, 480)">
                                <path d={paths.III.length > 0 ? `M${paths.III.join(' L')}` : ""} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                                {renderMarkers('yIII')}
                            </g>

                            {/* 4. aVR (Menggunakan matriks skala matematika murni untuk pembalikan) */}
                            <g transform="translate(0, 960) scale(1, -1)">
                                <path d={paths.aVR.length > 0 ? `M${paths.aVR.join(' L')}` : ""} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                                {renderMarkers('yaVR')}
                            </g>

                            {/* 5. aVL */}
                            <g transform="translate(0, 960)">
                                <path d={paths.aVL.length > 0 ? `M${paths.aVL.join(' L')}` : ""} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                                {renderMarkers('yaVL')}
                            </g>

                            {/* 6. aVF */}
                            <g transform="translate(0, 1200)">
                                <path d={paths.aVF.length > 0 ? `M${paths.aVF.join(' L')}` : ""} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                                {renderMarkers('yaVF')}
                            </g>

                            {/* 7. V1 */}
                            <g transform="translate(0, 1440)">
                                <path d={paths.V1.length > 0 ? `M${paths.V1.join(' L')}` : ""} fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4,4" />
                                {renderMarkers('yV1')}
                            </g>
                        </svg>

                        {/* Layer 3: Label Nama Saluran (Floating / Absolute Position) */}
                        <div className="absolute top-[40px] left-0 w-full h-[1680px] pointer-events-none z-20">
                            <div className="absolute left-2 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm" style={{ top: '8px' }}>Lead I</div>
                            <div className="absolute left-2 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm" style={{ top: '248px' }}>Lead II</div>
                            <div className="absolute left-2 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-blue-700 text-[10px] shadow-sm" style={{ top: '488px' }}>Lead III (Sensor Asli)</div>
                            <div className="absolute left-2 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm" style={{ top: '728px' }}>aVR (Calculated)</div>
                            <div className="absolute left-2 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm" style={{ top: '968px' }}>aVL (Calculated)</div>
                            <div className="absolute left-2 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm" style={{ top: '1208px' }}>aVF (Calculated)</div>
                            <div className="absolute left-2 bg-gray-200/90 backdrop-blur px-2 py-0.5 rounded border border-gray-300 font-mono-data font-bold text-gray-500 text-[10px] shadow-sm" style={{ top: '1448px' }}>Lead V1 (Offline / No Data)</div>
                        </div>

                        {/* Layer 4: Interaksi Pointer Mouse & Tooltip AI (Paling Atas) */}
                        <div className="absolute top-[40px] bottom-0 border-l border-dashed border-outline pointer-events-none z-30 transition-opacity duration-100" style={{ transform: `translateX(${pointerX || 0}px)`, opacity: pointerX !== null ? 1 : 0 }} />
                        <div className="absolute top-[20%] z-40 pointer-events-none transition-transform duration-75 bg-charcoal/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-xl border border-white/20 min-w-[170px]" style={{ transform: `translateX(${tooltipX}px)`, opacity: pointerX !== null ? 1 : 0 }}>
                            <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
                                <span className="font-bold text-medical-teal text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">psychology</span> AI Review</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${isAnomaly ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>{isAnomaly ? classResult.substring(0, 10).toUpperCase() : 'NORMAL'}</span>
                            </div>
                            <div className="flex justify-between py-0.5 text-[11px]"><span className="text-slate-400">Time:</span> <span className="font-mono-data font-bold">{`${mStr}:${sStr}.${msStr}s`}</span></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};