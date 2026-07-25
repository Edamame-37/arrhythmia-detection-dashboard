/**
 * @fileoverview Halaman UI: Monitor Page
 * Mengorkestrasi Custom Hook (useECGStream) dan mendistribusikan
 * state ke komponen-komponen UI modular (Clean Architecture).
 * 
 * UPDATE: Penambahan fitur Bypass Filter (ON/OFF) untuk komparasi sinyal mentah.
 */

import React, { useState, useEffect } from 'react';
import { useECGStream } from '../../../application/hooks/useECGStream';
import { ECGCanvas } from '../../components/canvas/ECGCanvas';
import { TimelineBar } from '../../components/shared/TimelineBar';
import { AlertPanel } from '../../components/shared/AlertPanel';
import { Header } from '../../components/layout/Header';
import { VitalCard } from '../../components/dashboard/VitalCard';
import { AiCard } from '../../components/dashboard/AiCard';
import { DeviceCard } from '../../components/dashboard/DeviceCard';

export const MonitorPage: React.FC = () => {
    // Destructure isFilterOn dan toggleFilter dari useECGStream
    const {
        isRecording, paths, rPeaks, heartRate, clinicalStatus, timeline,
        startStream, stopStream, isFilterOn, toggleFilter,
        aiProbabilities, aiMetrics, deviceId, sessionId
    } = useECGStream(import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8080');

    const [speed, setSpeed] = useState<25 | 50>(25);
    const [showAlert, setShowAlert] = useState<boolean>(false);

    useEffect(() => {
        setShowAlert(clinicalStatus?.isAnomaly || false);
    }, [clinicalStatus]);

    const handleToggleRecord = () => {
        isRecording ? stopStream() : startStream();
    };

    const alertTitle = clinicalStatus ? clinicalStatus.fullExplanation.split('.')[0] : 'Anomali Terdeteksi';
    const aiClassResult = clinicalStatus ? clinicalStatus.fullExplanation.split(' ')[2] : 'NORM';

    return (
        <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
            
            <Header deviceId={deviceId} sessionId={sessionId} />

            <AlertPanel 
                visible={showAlert}
                title={`KRITIS: ${alertTitle}`}
                onClose={() => setShowAlert(false)}
            />

            <main className="pt-20 md:pt-24 pb-12 mx-auto w-full max-w-container-max px-4 md:px-margin-desktop flex flex-col lg:flex-row gap-6 flex-1">
                
                <section className="w-full lg:w-9/12 flex flex-col gap-4">
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

                            {/* TOMBOL BYPASS FILTER BARU */}
                            <button 
                                onClick={toggleFilter} 
                                className={`${isFilterOn ? 'bg-surface text-medical-teal border-medical-teal' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'} border px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 outline-none hover:brightness-95`}
                                title="Matikan untuk melihat sinyal mentah asli (Raw Data) dari perangkat"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {isFilterOn ? 'filter_alt' : 'filter_alt_off'}
                                </span>
                                Filter: {isFilterOn ? 'ON' : 'OFF'}
                            </button>

                        </div>
                        <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant/50 ml-auto sm:ml-0">
                            <button onClick={() => setSpeed(25)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all outline-none ${speed === 25 ? 'bg-medical-teal text-white shadow-sm' : 'text-on-surface-variant'}`}>25</button>
                            <button onClick={() => setSpeed(50)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all outline-none ${speed === 50 ? 'bg-medical-teal text-white shadow-sm' : 'text-on-surface-variant'}`}>50</button>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm relative h-[60vh] lg:h-[880px] flex flex-col">
                        <ECGCanvas 
                            paths={paths} 
                            rPeaks={rPeaks} 
                            speed={speed} 
                            isAnomaly={clinicalStatus?.isAnomaly}
                            classResult={aiClassResult} 
                        />
                    </div>

                    <TimelineBar events={timeline} />
                </section>

                <aside className="w-full lg:w-3/12 flex flex-col gap-6">
                    <VitalCard heartRate={heartRate} clinicalStatus={clinicalStatus} />
                    <AiCard clinicalStatus={clinicalStatus} aiProbabilities={aiProbabilities} />
                    <DeviceCard deviceId={deviceId} aiMetrics={aiMetrics} />
                </aside>
            </main>
        </div>
    );
};