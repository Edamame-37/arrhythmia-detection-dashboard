/**
 * @fileoverview Modul Application Layer: useECGStream Hook
 * Konduktor utama yang mengorkestrasi aliran data dari WebSocket, 
 * memprosesnya di Layer Core (Einthoven, Pan-Tompkins, Rule-Based), 
 * dan menyediakan state yang reaktif untuk Layer Presentation (React UI).
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { ECGWebSocketClient, type ServerMessage } from '../data/websocketClient';
import { calculateEinthovenPoint } from '../core/einthoven';
import { PanTompkins } from '../core/panTompkins';
import { calculateSingleRRInterval } from '../core/peakToPeak';
import { evaluateIrregularity, generateClinicalExplanation, type ClinicalExplanation } from '../core/ruleBasedEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ECGPaths {
    I: string[]; II: string[]; III: string[]; aVR: string[]; aVL: string[]; aVF: string[]; V1: string[];
}

export interface RPeakMarker {
    x: number;
    y: number;
    rrText?: string;
    prevX?: number;
}

export interface TimelineEvent {
    index: number;
    timeStr: string;
    isAnomaly: boolean;
    classResult: string;
}

export interface UseECGStreamReturn {
    isRecording: boolean;
    paths: ECGPaths;
    rPeaks: RPeakMarker[];
    heartRate: number | string;
    clinicalStatus: ClinicalExplanation | null;
    timeline: TimelineEvent[];
    startStream: () => void;
    stopStream: () => void;
    fetchSummary: () => void;
    fetchSegment: (index: number) => void;
}

// Konstanta Sistem Sesuai PKM (250Hz, 10 Detik)
const TOTAL_POINTS = 2500;
const X_STEP = 2000 / TOTAL_POINTS; // 0.8px per titik

// Helper Format Waktu (00:00)
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

// ============================================================================
// MAIN CUSTOM HOOK
// ============================================================================

export const useECGStream = (endpoint: string): UseECGStreamReturn => {
    // --- 1. REACT STATES (Untuk dirender ke Layar) ---
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [paths, setPaths] = useState<ECGPaths>({ I: [], II: [], III: [], aVR: [], aVL: [], aVF: [], V1: [] });
    const [rPeaks, setRPeaks] = useState<RPeakMarker[]>([]);
    const [heartRate, setHeartRate] = useState<number | string>('--');
    const [clinicalStatus, setClinicalStatus] = useState<ClinicalExplanation | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

    // --- 2. REACT REFS (Memori Cepat Tanpa Re-render) ---
    const clientRef = useRef<ECGWebSocketClient | null>(null);
    const ptRef = useRef<PanTompkins>(new PanTompkins(250, 1.0));
    
    // Menampung variabel mutasi per-titik EKG
    const dataRef = useRef({
        xIndex: 0,
        currentPaths: { I: [], II: [], III: [], aVR: [], aVL: [], aVF: [], V1: [] } as ECGPaths,
        peakBuffer: [] as { x: number; index: number }[],
        rrIntervals: [] as number[],
        timelineSeconds: 0,
        currentRPeaks: [] as RPeakMarker[]
    });

    // --- 3. FUNGSI PEMROSESAN DATA MENTAH ---
    const processDataChunk = useCallback((payload: any) => {
        // Tipe error 'confidence' tidak terpakai sudah dihapus dari destrukturisasi
        const { raw, classification_result, anomaly_indices } = payload;
        const isAnomaly = anomaly_indices && anomaly_indices.length > 0;
        
        let { xIndex, currentPaths, peakBuffer, rrIntervals, timelineSeconds, currentRPeaks } = dataRef.current;
        const ch1 = raw.ch1; const ch2 = raw.ch2; const ch3 = raw.ch3;

        // Loop untuk memproses setiap titik (Batching & Streaming)
        for (let i = 0; i < ch1.length; i++) {
            
            // RESET SIKLUS (Jika sudah mencapai 10 Detik / 2500 Titik)
            if (xIndex >= TOTAL_POINTS) {
                // 1. Evaluasi Klinis (Rule-Based + AI)
                const evalResult = evaluateIrregularity(rrIntervals, 0.12);
                const explanation = generateClinicalExplanation(classification_result, isAnomaly, evalResult);
                setClinicalStatus(explanation);

                // 2. Kalkulasi Heart Rate Final
                const avgRR = rrIntervals.length > 0 ? rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length : 0;
                setHeartRate(avgRR > 0 ? Math.round(60 / avgRR) : '--');

                // 3. Tambahkan ke Timeline
                setTimeline(prev => [...prev, {
                    index: timelineSeconds / 10,
                    timeStr: formatTime(timelineSeconds),
                    isAnomaly,
                    classResult: classification_result
                }]);

                // 4. Reset Memory Buffer
                xIndex = 0;
                timelineSeconds += 10;
                currentPaths = { I: [], II: [], III: [], aVR: [], aVL: [], aVF: [], V1: [] };
                peakBuffer = [];
                rrIntervals = [];
                currentRPeaks = [];
                ptRef.current.reset();
            }

            // --- EKSEKUSI LAYER CORE: EINTHOVEN & PAN-TOMPKINS ---
            const valI = ch1[i]; const valII = ch2[i]; const valV1 = ch3[i];
            const calculated = calculateEinthovenPoint(valI, valII);
            
            const currentX = Number((xIndex * X_STEP).toFixed(2));
            const pixelY = 60 - (valII * 40); // 1mV = 40px, Center = 60px

            // Build SVG Paths
            currentPaths.I.push(`${currentX},${(60 - valI * 40).toFixed(2)}`);
            currentPaths.II.push(`${currentX},${pixelY.toFixed(2)}`);
            currentPaths.III.push(`${currentX},${(60 - calculated.leadIII * 40).toFixed(2)}`);
            currentPaths.aVR.push(`${currentX},${(60 - calculated.aVR * 40).toFixed(2)}`);
            currentPaths.aVL.push(`${currentX},${(60 - calculated.aVL * 40).toFixed(2)}`);
            currentPaths.aVF.push(`${currentX},${(60 - calculated.aVF * 40).toFixed(2)}`);
            currentPaths.V1.push(`${currentX},${(60 - valV1 * 40).toFixed(2)}`);

            // Pelacakan Puncak R
            const isPeak = ptRef.current.detectRealTime(valII, xIndex);
            if (isPeak) {
                const marker: RPeakMarker = { x: currentX, y: pixelY };
                if (peakBuffer.length > 0) {
                    const prev = peakBuffer[peakBuffer.length - 1];
                    const secDist = calculateSingleRRInterval(prev.index, xIndex, 250);
                    rrIntervals.push(secDist);
                    marker.rrText = `${secDist}s`;
                    marker.prevX = prev.x;
                }
                currentRPeaks.push(marker);
                peakBuffer.push({ x: currentX, index: xIndex });
            }

            xIndex++;
        }

        // Simpan kembali mutasi ke dalam Ref
        dataRef.current = { xIndex, currentPaths, peakBuffer, rrIntervals, timelineSeconds, currentRPeaks };
        
        // Trigger Re-render React (DI LUAR LOOP untuk Performa Maksimal)
        setPaths({ ...currentPaths });
        setRPeaks([...currentRPeaks]);

    }, []);

    // --- 4. INIT & MANAJEMEN WEBSOCKET ---
    const initWebSocket = useCallback(() => {
        if (!clientRef.current) {
            clientRef.current = new ECGWebSocketClient(endpoint);
            
            clientRef.current.onMessage = (msg: ServerMessage) => {
                if (msg.type === 'summary' && msg.data) {
                    // Mapping data Ringkasan AI (Batch History)
                    const summaries = msg.data.map(seg => ({
                        index: seg.index,
                        timeStr: formatTime(seg.index * 10),
                        isAnomaly: seg.is_anomaly,
                        classResult: seg.class_result
                    }));
                    setTimeline(summaries);
                } 
                else if (msg.type === 'live_data' || msg.type === 'segment_data') {
                    if (msg.data_payload) {
                        // Jika Batch mode, paksa reset sebelum menggambar 2500 titik penuh
                        if (msg.type === 'segment_data') {
                            dataRef.current.xIndex = TOTAL_POINTS; // Memicu reset otomatis di awal loop
                            dataRef.current.timelineSeconds = (msg.data_payload as any).segment_index * 10;
                        }
                        processDataChunk(msg.data_payload);
                    }
                }
                else if (msg.type === 'status') {
                    setIsRecording(false);
                }
            };

            clientRef.current.onClose = () => setIsRecording(false);
        }
    }, [endpoint, processDataChunk]);

    // --- 5. EXPOSED ACTIONS (Untuk dipanggil oleh Tombol UI) ---
    const startStream = () => {
        if (isRecording) return;
        setIsRecording(true);
        setTimeline([]);
        setClinicalStatus(null);
        setHeartRate('--');
        
        // Reset Ref Internal
        dataRef.current = {
            xIndex: 0,
            currentPaths: { I: [], II: [], III: [], aVR: [], aVL: [], aVF: [], V1: [] },
            peakBuffer: [], rrIntervals: [], timelineSeconds: 0, currentRPeaks: []
        };
        ptRef.current.reset();
        
        initWebSocket();
        clientRef.current?.connect();
    };

    const stopStream = () => {
        setIsRecording(false);
        clientRef.current?.disconnect();
    };

    const fetchSummary = () => {
        initWebSocket();
        clientRef.current?.connect();
        // Server otomatis mengirim summary saat connect (berdasarkan main.py)
    };

    const fetchSegment = (index: number) => {
        clientRef.current?.sendCommand({ command: "get_segment", index });
    };

    // Cleanup saat komponen hancur (Unmount)
    useEffect(() => {
        return () => {
            clientRef.current?.disconnect();
        };
    }, []);

    return {
        isRecording,
        paths,
        rPeaks,
        heartRate,
        clinicalStatus,
        timeline,
        startStream,
        stopStream,
        fetchSummary,
        fetchSegment
    };
};