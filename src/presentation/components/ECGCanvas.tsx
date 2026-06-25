/**
 * @fileoverview Komponen UI: ECG Canvas
 * Bertugas merender grid kertas medis standar (1mm = 0.04s, 1mV = 10mm)
 * dan menggambar 7 jalur gelombang (Lead I, II, III, aVR, aVL, aVF, V1).
 * REFACTOR FINAL: Absolute Mathematical Positioning untuk Sumbu-Y (Anti-Drift).
 */

import React, { useState, useRef } from 'react';
import type { ECGPaths, RPeakMarker } from '../../application/useECGStream';

interface ECGCanvasProps {
    paths: ECGPaths;
    rPeaks: RPeakMarker[];
    isAnomaly?: boolean;
    classResult?: string;
    speed?: 25 | 50; // mm/s
    timeOffset?: number; // Untuk mode Analytics (detik awal dari segmen yang dipilih)
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

    // Lebar mutlak untuk menolak kompresi layar HP (25mm/s = 2000px, 50mm/s = 1000px)
    const canvasWidth = speed === 25 ? 2000 : 1000;
    const viewBoxStr = `0 0 ${canvasWidth} 120`;
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

    // Render Penanda Detik Sumbu-X
    const renderXAxisLabels = () => {
        const labels = [];
        const totalBoxes = speed === 25 ? 50 : 25; 
        for (let i = 0; i <= totalBoxes; i++) {
            const label = (i % 5 === 0) ? `${i / 5}s` : `.${(i % 5) * 2}`;
            labels.push(
                <span 
                    key={i} 
                    className="absolute text-[9px] font-mono-data font-bold text-red-600 pl-1 border-l border-pink-300/50 h-[40px] flex items-center" 
                    style={{ left: `${i * 40}px` }}
                >
                    {label}
                </span>
            );
        }
        return labels;
    };

    let tooltipX = (pointerX || 0) + 20;
    if (pointerX && pointerX > (canvasWidth - 200)) tooltipX = pointerX - 190;
    
    const absoluteSecs = timeOffset + ((pointerX || 0) / (speed === 25 ? 200 : 100));
    const mStr = Math.floor(absoluteSecs / 60).toString().padStart(2, '0');
    const sStr = Math.floor(absoluteSecs % 60).toString().padStart(2, '0');
    const msStr = Math.floor((absoluteSecs % 1) * 100).toString().padStart(2, '0');

    return (
        <div className="flex-1 overflow-auto custom-scrollbar relative flex flex-col bg-[#FFF9FA]" id="ecg-scroll-container">
            
            {/* WADAH ANTI-SQUISH (Bisa digeser horizontal di HP) */}
            <div className="flex flex-col relative" style={{ minWidth: `${canvasWidth + 64}px` }}>
                
                {/* --- SUMBU X (WAKTU) --- */}
                <div className="sticky top-0 h-[40px] flex z-30 pointer-events-none bg-white/90 backdrop-blur-sm border-b border-pink-300">
                    <div className="sticky left-0 w-16 flex-shrink-0 bg-white/95 border-r border-pink-300 z-40"></div>
                    <div className="relative flex-1" style={{ width: `${canvasWidth}px` }}>
                        {renderXAxisLabels()}
                    </div>
                </div>

                {/* --- AREA KANVAS & SUMBU Y --- */}
                <div className="relative flex flex-row">
                    
                    {/* =================================================================== */}
                    {/* SOLUSI FINAL POIN 5: Sumbu-Y diposisikan secara absolut dengan matematika pasti (i * 120) */}
                    {/* =================================================================== */}
                    <div className="sticky left-0 w-16 h-[840px] flex-shrink-0 bg-white/95 backdrop-blur z-40 shadow-[2px_0_5px_rgba(0,0,0,0.03)] border-r border-pink-300 relative">
                        {Array.from({ length: 7 }).map((_, idx) => (
                            <div key={idx} className="absolute w-full h-[120px]" style={{ top: `${idx * 120}px` }}>
                                {/* Garis Pemisah (Kecuali elemen terakhir) */}
                                {idx < 6 && <div className="absolute bottom-0 left-0 w-full border-b-[2px] border-pink-300/80"></div>}
                                
                                {/* Label Voltase */}
                                <span className="absolute top-[20px] left-1.5 md:left-2 text-[9px] font-mono-data font-bold text-red-600 leading-none -translate-y-1/2">+1mV</span>
                                <span className="absolute top-[60px] left-1.5 md:left-2 text-[9px] font-mono-data font-bold text-red-600 leading-none -translate-y-1/2">0</span>
                                <span className="absolute top-[100px] left-1.5 md:left-2 text-[9px] font-mono-data font-bold text-red-600 leading-none -translate-y-1/2">-1mV</span>
                            </div>
                        ))}
                    </div>

                    {/* KANVAS EKG UTAMA */}
                    <div 
                        className="relative z-10 flex flex-col cursor-crosshair" 
                        style={{ width: `${canvasWidth}px`, height: '840px' }}
                        ref={canvasRef}
                        onMouseMove={handlePointerMove}
                        onTouchMove={handlePointerMove}
                        onMouseEnter={() => setPointerX(0)}
                        onMouseLeave={hidePointer}
                        onTouchStart={() => setPointerX(0)}
                        onTouchEnd={hidePointer}
                    >
                        {/* POLA KERTAS EKG BACKGROUND */}
                        <svg className="absolute top-0 left-0 pointer-events-none z-0" width={canvasWidth} height={840} xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#FFD1DC" strokeWidth="0.5" />
                                </pattern>
                                <pattern id="largeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <rect width="40" height="40" fill="url(#smallGrid)" />
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFA6C9" strokeWidth="1.2" />
                                </pattern>
                            </defs>
                            <rect width={canvasWidth} height={840} fill="url(#largeGrid)" />
                            
                            {/* Garis Pemisah Lead Digambar di SVG agar tersinkronisasi 100% dengan Sumbu-Y di kiri */}
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <line key={i} x1="0" y1={i * 120} x2={canvasWidth} y2={i * 120} stroke="rgba(255, 166, 201, 0.8)" strokeWidth="2" />
                            ))}
                        </svg>

                        {/* CROSSHAIR & TOOLTIP */}
                        <div 
                            className="absolute top-0 bottom-0 border-l border-dashed border-outline pointer-events-none z-20 transition-opacity duration-100"
                            style={{ transform: `translateX(${pointerX || 0}px)`, opacity: pointerX !== null ? 1 : 0 }}
                        />
                        <div 
                            className="absolute top-1/4 z-30 pointer-events-none transition-transform duration-75 bg-charcoal/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-xl border border-white/20 min-w-[170px]"
                            style={{ transform: `translateX(${tooltipX}px)`, opacity: pointerX !== null ? 1 : 0 }}
                        >
                            <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
                                <span className="font-bold text-medical-teal text-xs flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">psychology</span> AI Review
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${isAnomaly ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                    {isAnomaly ? classResult.substring(0, 10).toUpperCase() : 'NORMAL'}
                                </span>
                            </div>
                            <div className="flex justify-between py-0.5 text-[11px]">
                                <span className="text-slate-400">Time:</span> 
                                <span className="font-mono-data font-bold">{`${mStr}:${sStr}.${msStr}s`}</span>
                            </div>
                        </div>

                        {/* 1. LEAD I */}
                        <div className="relative w-full h-[120px]">
                            <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm pointer-events-none">Lead I</div>
                            <svg width={canvasWidth} height={120} className="overflow-visible transition-all duration-500 ease-out" viewBox={viewBoxStr}>
                                <path d={`M${paths.I.join(' L')}`} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* 2. LEAD II */}
                        <div className="relative w-full h-[120px]">
                            <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm pointer-events-none">Lead II (R-Peak Interactive)</div>
                            <svg width={canvasWidth} height={120} className="overflow-visible transition-all duration-500 ease-out" viewBox={viewBoxStr}>
                                <path d={`M${paths.II.join(' L')}`} fill="none" stroke={lead2Stroke} strokeWidth="1.5" strokeLinejoin="round" />
                                {rPeaks.map((peak, idx) => (
                                    <g key={idx} className="group cursor-crosshair">
                                        <rect x={peak.x - 15} y="0" width="30" height="120" fill="transparent" style={{ pointerEvents: 'all' }} />
                                        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                            <line x1={peak.x} y1={peak.y} x2={peak.x} y2="0" stroke="#2ECC71" strokeWidth="1.5" strokeDasharray="3,3" />
                                            <circle cx={peak.x} cy={peak.y} r="3" fill="#2ECC71" />
                                            {peak.prevX !== undefined && peak.rrText && (
                                                <>
                                                    <line x1={peak.prevX} y1="20" x2={peak.x} y2="20" stroke="#2ECC71" strokeWidth="1.5" />
                                                    <text x={(peak.prevX + peak.x) / 2} y="15" fill="#2ECC71" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{peak.rrText}</text>
                                                </>
                                            )}
                                        </g>
                                    </g>
                                ))}
                            </svg>
                        </div>

                        {/* 3. LEAD III */}
                        <div className="relative w-full h-[120px]">
                            <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm pointer-events-none">Lead III (Calculated)</div>
                            <svg width={canvasWidth} height={120} className="overflow-visible transition-all duration-500 ease-out" viewBox={viewBoxStr}>
                                <path d={`M${paths.III.join(' L')}`} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* 4. aVR */}
                        <div className="relative w-full h-[120px]">
                            <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm pointer-events-none">aVR (Calculated)</div>
                            <svg width={canvasWidth} height={120} className="overflow-visible scale-y-[-1] transition-all duration-500 ease-out" viewBox={viewBoxStr}>
                                <path d={`M${paths.aVR.join(' L')}`} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* 5. aVL */}
                        <div className="relative w-full h-[120px]">
                            <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm pointer-events-none">aVL (Calculated)</div>
                            <svg width={canvasWidth} height={120} className="overflow-visible transition-all duration-500 ease-out" viewBox={viewBoxStr}>
                                <path d={`M${paths.aVL.join(' L')}`} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* 6. aVF */}
                        <div className="relative w-full h-[120px]">
                            <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm pointer-events-none">aVF (Calculated)</div>
                            <svg width={canvasWidth} height={120} className="overflow-visible transition-all duration-500 ease-out" viewBox={viewBoxStr}>
                                <path d={`M${paths.aVF.join(' L')}`} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* 7. V1 */}
                        <div className="relative w-full h-[120px]">
                            <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur px-2 py-0.5 rounded border border-pink-200 font-mono-data font-bold text-brand-navy text-[10px] shadow-sm pointer-events-none">Lead V1</div>
                            <svg width={canvasWidth} height={120} className="overflow-visible transition-all duration-500 ease-out" viewBox={viewBoxStr}>
                                <path d={`M${paths.V1.join(' L')}`} fill="none" stroke="#001F54" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};