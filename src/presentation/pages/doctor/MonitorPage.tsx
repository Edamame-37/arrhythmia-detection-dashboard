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
import { DoctorSidebar } from '../../components/layout/DoctorSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { VitalCard } from '../../components/dashboard/VitalCard';
import { AiCard } from '../../components/dashboard/AiCard';
import { DeviceCard } from '../../components/dashboard/DeviceCard';
import { APP_CONFIG } from '../../../core/config';


interface DeviceRecord {
    id: string;
    name: string;
}

export const MonitorPage: React.FC = () => {
    // Destructure isFilterOn dan toggleFilter dari useECGStream
    const {
        isRecording, paths, rPeaks, heartRate, clinicalStatus, timeline,
        startStream, stopStream, fetchSegment, isFilterOn, toggleFilter,
        prediction, deviceId, sessionId, stressTest, createdAt
    } = useECGStream(APP_CONFIG.WS_URL);

    const [isLoading, setIsLoading] = useState(true);

    const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number | undefined>(undefined);

    const handleSegmentSelect = (index: number) => {
        setCurrentSegmentIndex(index);
        fetchSegment(index);
    };

    const { isOpen } = useSidebar();

    const aiProbabilities = prediction?.probabilities || null;
    const aiMetrics = { latency_ms: prediction?.latency_ms, runtime: prediction?.runtime };

    const [speed] = useState<25 | 50>(25);
    const [showAlert, setShowAlert] = useState<boolean>(false);

    useEffect(() => {
        setShowAlert(clinicalStatus?.isAnomaly || false);
    }, [clinicalStatus]);

    const [onlineDevices, setOnlineDevices] = useState<DeviceRecord[]>([]);
    const [patients, setPatients] = useState<{id: string, name: string}[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetch(`${APP_CONFIG.API_URL}/api/patients`).then(res => res.json()),
            fetch(`${APP_CONFIG.API_URL}/api/devices`).then(res => res.json()),
            fetch(`${APP_CONFIG.API_URL}/api/sessions`).then(res => res.json())
        ])
        .then(([patientsData, devicesData, sessionsData]) => {
            setPatients(Array.isArray(patientsData) ? patientsData : []);
            
            const online = devicesData.filter((d: any) => d.status === 'Online');
            setOnlineDevices(online);
            if (online.length > 0 && online[0].assigned_to && online[0].assigned_to !== 'Unassigned') {
                setSelectedPatientId(prev => prev ? prev : online[0].assigned_to);
            }

            const activeSessions = sessionsData.sessions ? sessionsData.sessions.filter((s: any) => !s.ended_at) : [];
            if (activeSessions.length > 0) {
                startStream(); // Only reconnect WebSocket, do not send START command
            }
        })
        .catch(err => console.error("Error fetching monitor data:", err))
        .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const displayDeviceId = deviceId !== "MENUNGGU PERANGKAT..." 
        ? deviceId 
        : (onlineDevices.length > 0 ? onlineDevices[0].name : "MENUNGGU PERANGKAT...");

    const [isCommandLoading, setIsCommandLoading] = useState(false);

    const handleToggleRecord = async () => {
        if (displayDeviceId === "MENUNGGU PERANGKAT...") {
            alert("Tidak ada perangkat yang terhubung.");
            return;
        }
        
        if (!isRecording && !selectedPatientId) {
            alert("Harap pilih pasien terlebih dahulu sebelum memulai perekaman.");
            return;
        }

        setIsCommandLoading(true);
        try {
            const command = isRecording ? "STOP" : "START";
            const response = await fetch(`${APP_CONFIG.API_URL}/api/devices/${displayDeviceId}/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command, patient_id: selectedPatientId })
            });

            if (response.ok) {
                isRecording ? stopStream() : startStream();
            } else {
                console.error("Gagal mengirim perintah:", await response.text());
                alert("Gagal mengirim perintah ke alat EKG. Periksa koneksi alat.");
            }
        } catch (e) {
            console.error("Error toggle record:", e);
            alert("Terjadi kesalahan jaringan saat menghubungi server.");
        } finally {
            setIsCommandLoading(false);
        }
    };

    const alertTitle = clinicalStatus ? clinicalStatus.fullExplanation.split('.')[0] : 'Anomali Terdeteksi';
    const aiClassResult = clinicalStatus ? clinicalStatus.fullExplanation.split(' ')[2] : 'NORM';

    if (isLoading) {
        return (
            <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
                <DoctorSidebar />
                <Header deviceId="Memuat..." sessionId="Memuat..." />
                <main className={`pt-[120px] md:pt-24 pb-12 mx-auto w-full px-4 md:px-margin-desktop flex flex-col lg:flex-row gap-6 flex-1 transition-all duration-300 ${isOpen ? 'md:ml-[260px] md:w-[calc(100%-260px)]' : 'ml-0'}`}>
                    <section className="w-full lg:w-9/12 flex flex-col gap-4 flex-1">
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 border border-outline-variant/30 rounded-xl p-3 h-14 animate-pulse"></div>
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 border border-outline-variant/30 rounded-xl h-[400px] animate-pulse flex-grow"></div>
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 border border-outline-variant/30 rounded-xl h-14 animate-pulse"></div>
                    </section>
                    <aside className="w-full lg:w-3/12 flex flex-col gap-6">
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 border border-outline-variant/30 rounded-xl p-5 h-44 animate-pulse"></div>
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 border border-outline-variant/30 rounded-xl p-5 h-44 animate-pulse"></div>
                        <div className="bg-slate-200/50 dark:bg-slate-800/50 border border-outline-variant/30 rounded-xl p-5 h-44 animate-pulse"></div>
                    </aside>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
            
            <DoctorSidebar />
            <Header deviceId={displayDeviceId} sessionId={sessionId} />

            <AlertPanel 
                visible={showAlert}
                title={`KRITIS: ${alertTitle}`}
                onClose={() => setShowAlert(false)}
            />

            <main className={`pt-[120px] md:pt-24 pb-12 mx-auto w-full px-4 md:px-margin-desktop flex flex-col lg:flex-row gap-6 flex-1 transition-all duration-300 ${isOpen ? 'md:ml-[260px] md:w-[calc(100%-260px)]' : 'ml-0'}`}>
                
                <section className="w-full lg:w-9/12 flex flex-col gap-4 flex-1">
                    <div className="bg-surface border border-outline-variant rounded-xl p-3 flex flex-wrap justify-between items-center shadow-sm gap-3">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-medical-teal hidden sm:block">tune</span>
                            <span className="text-sm font-bold text-charcoal hidden sm:block">
                                Kecepatan: <span className="font-mono-data text-medical-teal ml-1">{speed} mm/s</span>
                            </span>
                            <button 
                                disabled={isCommandLoading || displayDeviceId === "MENUNGGU PERANGKAT..."}
                                onClick={handleToggleRecord} 
                                className={`${isRecording ? 'bg-alert-red' : 'bg-medical-teal hover:brightness-110'} text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 outline-none ${(isCommandLoading || displayDeviceId === "MENUNGGU PERANGKAT...") ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isCommandLoading ? (
                                    <><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> <span className="hidden sm:inline">Mengirim...</span></>
                                ) : isRecording ? (
                                    <><span className="material-symbols-outlined text-[16px] animate-pulse">stop_circle</span> <span className="hidden sm:inline">Menghentikan...</span></>
                                ) : (
                                    <><span className="material-symbols-outlined text-[16px]">play_circle</span> <span className="hidden sm:inline">Mulai Perekaman</span></>
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
                                <span className="hidden sm:inline">Filter: {isFilterOn ? 'ON' : 'OFF'}</span>
                            </button>

                        </div>

                        {/* DROPDOWN PEMILIHAN PASIEN (RATA KANAN) */}
                        <select
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            disabled={isRecording}
                            className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-bold text-charcoal outline-none cursor-pointer"
                        >
                            <option value="" disabled>Pilih Pasien</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex-1 min-h-[400px]">
                        <div className="absolute inset-0 z-0 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-y-auto overflow-x-hidden shadow-sm flex flex-col">
                            <ECGCanvas 
                                paths={paths} 
                                rPeaks={rPeaks} 
                                speed={speed} 
                                isAnomaly={clinicalStatus?.isAnomaly}
                                classResult={aiClassResult} 
                            />
                        </div>
                    </div>

                    <TimelineBar events={timeline} currentIdx={currentSegmentIndex} onSegmentSelect={handleSegmentSelect} />
                </section>

                <aside className="w-full lg:w-3/12 flex flex-col gap-6">
                    <VitalCard heartRate={heartRate} clinicalStatus={clinicalStatus} stressTest={stressTest} createdAt={createdAt} />
                    <AiCard sessionId={sessionId} clinicalStatus={clinicalStatus} aiProbabilities={aiProbabilities} />
                    <div className="mt-auto">
                        <DeviceCard deviceId={displayDeviceId} aiMetrics={aiMetrics} />
                    </div>
                </aside>
            </main>
        </div>
    );
};