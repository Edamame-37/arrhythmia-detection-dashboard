/**
 * @fileoverview Halaman UI: Analytics & History Page
 * Berfungsi untuk meninjau ulang rekaman EKG pasien dari masa lalu (Historical Review).
 * Dokter dapat menavigasi segmen 10-detik spesifik menggunakan Timeline Bar.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ECGCanvas } from '../../components/canvas/ECGCanvas';
import { TimelineBar } from '../../components/shared/TimelineBar';
import type { ECGPaths, RPeakMarker, TimelineEvent } from '../../../core/types/ecgTypes';
import { calculateEinthovenPoint } from '../../../core/algorithms/einthoven';
import { DoctorSidebar } from '../../components/layout/DoctorSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { VitalCard } from '../../components/dashboard/VitalCard';
import { AiCard } from '../../components/dashboard/AiCard';
import { DeviceCard } from '../../components/dashboard/DeviceCard';
import type { ClinicalExplanation } from '../../../core/clinical/ruleBasedEngine';
import { API_URL } from '../../../config/env';

const useQuery = () => new URLSearchParams(useLocation().search);

export const AnalyticsPage: React.FC = () => {
    const query = useQuery();
    const sessionId = query.get('sessionId') || '';

    const [speed, setSpeed] = useState<25 | 50>(25);
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showPatientSelector, setShowPatientSelector] = useState(!sessionId);

    const { isOpen, toggleSidebar } = useSidebar();

    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [segments, setSegments] = useState<Record<number, any>>({});

    useEffect(() => {
        if (!sessionId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetch(`${API_URL}/api/records/${sessionId}`)
            .then(res => res.json())
            .then(data => {
                const loadedEvents: TimelineEvent[] = [];
                const loadedSegments: Record<number, any> = {};

                data.forEach((payload: any, i: number) => {
                    const isAnomaly = payload.anomaly_indices && payload.anomaly_indices.length > 0;
                    loadedEvents.push({
                        index: i,
                        timeStr: `${Math.floor(i / 6).toString().padStart(2, '0')}:${((i % 6) * 10).toString().padStart(2, '0')}`,
                        isAnomaly,
                        classResult: payload.classification_result || "NORM"
                    });

                    let xIndex = 0;
                    const TOTAL_POINTS = 2500;
                    const X_STEP = 2000 / TOTAL_POINTS;
                    const ch1 = payload.raw?.ch1 || [];
                    const ch2 = payload.raw?.ch2 || [];
                    const ch3 = payload.raw?.ch3 || [];

                    const paths: ECGPaths = { I: [], II: [], III: [], aVR: [], aVL: [], aVF: [], V1: [] };

                    for (let j = 0; j < ch1.length; j++) {
                        const finalI = ch1[j];
                        const finalII = ch2[j];
                        const finalIII = ch3[j];
                        const calculated = calculateEinthovenPoint(finalI, finalII);
                        const currentX = Number((xIndex * X_STEP).toFixed(2));

                        paths.I.push(`${currentX},${(240 - finalI * 80).toFixed(2)}`);
                        paths.II.push(`${currentX},${(240 - finalII * 80).toFixed(2)}`);
                        paths.III.push(`${currentX},${(240 - finalIII * 80).toFixed(2)}`);
                        paths.aVR.push(`${currentX},${(240 - calculated.aVR * 80).toFixed(2)}`);
                        paths.aVL.push(`${currentX},${(240 - calculated.aVL * 80).toFixed(2)}`);
                        paths.aVF.push(`${currentX},${(240 - calculated.aVF * 80).toFixed(2)}`);
                        paths.V1.push(`${currentX},240.00`);
                        xIndex++;
                    }

                    loadedSegments[i] = {
                        paths,
                        rPeaks: [], // Peak detection history will be added later
                        isAnomaly,
                        diagnosis: isAnomaly ? "Anomali Terdeteksi pada rekaman." : "Normal Sinus Rhythm. Variasi stabil.",
                        heartRate: payload.validation?.hr || payload.heart_rate || "--",
                        frameId: payload.message_id || payload.frame_id || "---",
                        deviceId: payload.device_id || "---",
                        createdAt: payload.created_at || "---",
                        aiProbabilities: payload.prediction?.probabilities || null,
                        aiMetrics: {
                            latency_ms: payload.prediction?.latency_ms || null,
                            runtime: payload.prediction?.runtime || "---"
                        },
                        stressTest: payload.stress_test || null,
                        system: payload.system || null,
                        network: payload.network || null,
                    };
                });

                setEvents(loadedEvents);
                setSegments(loadedSegments);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching session records:", err);
                setIsLoading(false);
            });
    }, [sessionId]);

    const currentSegment = segments[selectedIdx];
    const currentEvent = events.find(e => e.index === selectedIdx);

    // Data Pasien dan Sesi diambil dari Dashboard, AnalyticsPage difokuskan untuk viewer

    // Derive props for the cards from currentSegment
    const clinicalStatus: ClinicalExplanation | null = currentSegment ? {
        isAnomaly: currentSegment.isAnomaly,
        fullExplanation: `${currentSegment.isAnomaly ? 'Anomali Terdeteksi' : 'Normal'} - ${currentEvent?.classResult}. ${currentSegment.diagnosis}`,
        severity: currentSegment.isAnomaly ? "CRITICAL" : "NORMAL"
    } : null;

    const heartRate = currentSegment?.heartRate || "--";
    const stressTest = currentSegment?.stressTest || null;
    let createdAt = currentSegment?.createdAt || null;
    const aiProbabilities = currentSegment?.aiProbabilities || null;
    const deviceId = currentSegment?.deviceId || "---";
    const aiMetrics = currentSegment?.aiMetrics || null;
    const system = currentSegment?.system || null;
    const network = currentSegment?.network || null;

    return (
        <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen">
            <DoctorSidebar />



            <main className={`flex flex-col transition-all duration-300 min-h-screen pb-12 w-full ${isOpen ? 'md:ml-[260px] md:w-[calc(100%-260px)]' : 'ml-0'}`}>
                {/* --- HEADER KOMPONEN --- */}
                <header className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 z-40 px-4 md:px-6 py-4 flex justify-between items-center w-full">

                    <div className="flex items-center gap-3">
                        <button onClick={toggleSidebar} className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-charcoal">Riwayat Klinis</h1>
                            <p className="text-xs text-on-surface-variant mt-0.5">Peninjauan rekam historis EKG dan AI Analytics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <button className="bg-medical-teal hover:bg-primary-container text-white font-bold text-[10px] md:text-xs px-3 md:px-5 py-2 md:py-2.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm outline-none">
                            <span className="material-symbols-outlined text-[16px] md:text-[18px]">picture_as_pdf</span>
                            <span className="hidden sm:inline">CETAK PDF</span>
                        </button>
                    </div>
                </header>

                {/* --- TOOLBAR INFORMASI --- */}
                <div className="bg-surface border-b border-outline-variant/30 w-full px-4 md:px-6 py-3 shadow-sm z-30 relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-medical-teal/10 p-2 rounded-lg text-medical-teal">
                            <span className="material-symbols-outlined text-[20px]">folder_managed</span>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-charcoal">Mode Peninjauan Sesi</h2>
                            <p className="text-[11px] text-on-surface-variant">Menampilkan detail rekaman EKG untuk Sesi: {sessionId ? sessionId : 'Tidak Ada'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => window.history.back()} className="text-xs font-bold text-on-surface-variant hover:text-medical-teal border border-outline-variant px-4 py-2 rounded-lg hover:border-medical-teal transition-all">
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>

                {/* --- KONTEN UTAMA --- */}
                <div className="mt-6 mx-auto w-full px-4 md:px-6 flex flex-col lg:flex-row gap-6 flex-1">

                    {/* KOLOM KIRI: GRAFIK & TIMELINE */}
                    <section className="w-full lg:w-9/12 flex flex-col gap-4">

                        {/* Control Bar (Speed & Info Segmen) */}
                        <div className="bg-surface border border-outline-variant rounded-xl p-3 flex flex-wrap justify-between items-center shadow-sm gap-3">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-medical-teal hidden sm:block">history</span>
                                <span className="text-sm font-bold text-charcoal flex items-center gap-2">
                                    Waktu Rekaman:
                                    <span className="px-2 py-1 bg-surface-container-high rounded text-medical-teal font-mono-data text-xs">
                                        {currentEvent ? `${currentEvent.timeStr} - ${events[selectedIdx + 1]?.timeStr || 'Akhir'}` : '--'}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Pembungkus Kanvas 7-Lead */}
                        <div className="relative flex-1 min-h-[400px]">
                            <div className="absolute inset-0 z-0 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-y-auto overflow-x-hidden shadow-sm flex flex-col">
                                <ECGCanvas
                                    paths={currentSegment?.paths || { I: [], II: [], III: [], aVR: [], aVL: [], aVF: [], V1: [] }}
                                    rPeaks={currentSegment?.rPeaks || []}
                                    speed={speed}
                                    isAnomaly={currentSegment?.isAnomaly || false}
                                    classResult={currentEvent?.classResult}
                                    timeOffset={selectedIdx * 10} // Kalkulasi waktu riwayat
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-50">
                                        <span className="material-symbols-outlined text-medical-teal text-4xl animate-spin">sync</span>
                                        <p className="mt-2 text-sm font-bold text-charcoal">Menarik Arsip Segmen...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline Multi-Aritmia (Klik untuk melompat ke waktu tertentu) */}
                        {events.length > 0 && (
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
                        )}

                    </section>

                    {/* KOLOM KANAN: DETAIL ANALISIS HISTORIS */}
                    <aside className="w-full lg:w-3/12 flex flex-col gap-6">

                        <VitalCard heartRate={heartRate} clinicalStatus={clinicalStatus} stressTest={stressTest} createdAt={createdAt} />
                        <AiCard sessionId={sessionId} rawClassification={currentEvent?.classResult || null} />
                        <div className="mt-auto">
                            <DeviceCard deviceId={deviceId} aiMetrics={aiMetrics} isLive={false} />
                        </div>

                    </aside>
                </div>
            </main>
        </div>
    );
};