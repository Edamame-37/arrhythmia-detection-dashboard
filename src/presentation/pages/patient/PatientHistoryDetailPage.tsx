import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { ECGCanvas } from '../../components/canvas/ECGCanvas';
import { TimelineBar } from '../../components/shared/TimelineBar';
import { VitalCard } from '../../components/dashboard/VitalCard';
import { AiCard } from '../../components/dashboard/AiCard';
import { DeviceCard } from '../../components/dashboard/DeviceCard';
import type { ECGPaths, TimelineEvent } from '../../../core/types/ecgTypes';
import { calculateEinthovenPoint } from '../../../core/algorithms/einthoven';
import type { ClinicalExplanation } from '../../../core/clinical/ruleBasedEngine';
import { useTranslation } from '../../../application/hooks/useTranslation';
import { APP_CONFIG } from '../../../core/config';


interface PatientProfile {
    patient: {
        first_name: string;
        last_name: string;
        profile_photo: string | null;
    }
}

export const PatientHistoryDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams<{ sessionId: string }>();
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const { t } = useTranslation();
    
    // Analytics states
    const [speed, setSpeed] = useState<25 | 50>(25);
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [segments, setSegments] = useState<Record<number, any>>({});

    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName && !lastName) return '';
        return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
    };

    useEffect(() => {
        const userId = localStorage.getItem('user_id') || '1';
        fetch(`${APP_CONFIG.API_URL}/api/patients/${userId}`)
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(console.error);

        setIsLoading(true);
        fetch(`${APP_CONFIG.API_URL}/api/records/${sessionId}`)
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
                        
                        paths.I.push(`${currentX},${(120 - finalI * 80).toFixed(2)}`);
                        paths.II.push(`${currentX},${(120 - finalII * 80).toFixed(2)}`);
                        paths.III.push(`${currentX},${(120 - finalIII * 80).toFixed(2)}`);
                        paths.aVR.push(`${currentX},${(120 - calculated.aVR * 80).toFixed(2)}`);
                        paths.aVL.push(`${currentX},${(120 - calculated.aVL * 80).toFixed(2)}`);
                        paths.aVF.push(`${currentX},${(120 - calculated.aVF * 80).toFixed(2)}`);
                        paths.V1.push(`${currentX},120.00`);
                        xIndex++;
                    }
                    
                    loadedSegments[i] = {
                        paths,
                        rPeaks: [],
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
                console.error("Error fetching mock records:", err);
                setIsLoading(false);
            });
    }, [sessionId]);

    const patientName = profile ? `${profile.patient.first_name} ${profile.patient.last_name}` : t('profile.loading');

    const currentSegment = segments[selectedIdx];
    const currentEvent = events.find(e => e.index === selectedIdx);

    const clinicalStatus: ClinicalExplanation | null = currentSegment ? {
        isAnomaly: currentSegment.isAnomaly,
        fullExplanation: `${currentSegment.isAnomaly ? 'Anomali Terdeteksi' : 'Normal'} - ${currentEvent?.classResult}. ${currentSegment.diagnosis}`,
        severity: currentSegment.isAnomaly ? "CRITICAL" : "NORMAL"
    } : null;

    const heartRate = currentSegment?.heartRate || "--";
    const stressTest = currentSegment?.stressTest || null;
    let createdAt = currentSegment?.createdAt || new Date().toISOString();
    const aiProbabilities = currentSegment?.aiProbabilities || null;
    const deviceId = currentSegment?.deviceId || "---";
    const aiMetrics = currentSegment?.aiMetrics || null;

    return (
        <div className="bg-surface-gray text-on-surface font-body-md min-h-screen w-full flex flex-col">
            {/* Top Navigation Bar */}
            <PatientHeader />

            {/* Action Toolbar */}
            <div className="bg-surface-container-lowest border-b border-outline-variant/50 w-full px-4 md:px-6 py-4 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-medical-teal/10 p-2.5 rounded-xl text-medical-teal">
                        <span className="material-symbols-outlined text-[24px]">monitor_heart</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-extrabold text-charcoal tracking-tight">{t('history.detailTitle')}</h2>
                            <span className="bg-surface-gray px-2 py-0.5 rounded text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border border-outline-variant/50">
                                {t('history.sessionPrefix')}{sessionId}
                            </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5 font-medium">{t('history.detailDesc')}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-sm font-bold text-charcoal hover:bg-surface-gray hover:text-medical-teal transition-all shadow-sm active:scale-95 outline-none">
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        {t('history.printReport')}
                    </button>
                </div>
            </div>

            {/* Main Canvas Content */}
            <main className="flex-1 w-full px-4 md:px-6 py-4">
                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-150px)]">
                    
                    {/* KOLOM KIRI: GRAFIK & TIMELINE */}
                    <section className="w-full lg:w-9/12 flex flex-col gap-4 h-full">
                        
                        {/* Control Bar */}
                        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 flex flex-wrap justify-between items-center shadow-sm gap-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-medical-teal/10 p-2 rounded-lg text-medical-teal">
                                    <span className="material-symbols-outlined block text-[20px]">schedule</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{t('history.recordingTime')}</p>
                                    <p className="text-sm font-bold text-charcoal mt-0.5">
                                        {currentEvent ? `${currentEvent.timeStr} - ${events[selectedIdx + 1]?.timeStr || t('history.end')}` : '--'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pembungkus Kanvas 7-Lead */}
                        <div className="relative flex-1 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">
                                <ECGCanvas 
                                    paths={currentSegment?.paths || { I: [], II: [], III: [], aVR: [], aVL: [], aVF: [], V1: [] }} 
                                    rPeaks={currentSegment?.rPeaks || []} 
                                    speed={speed} 
                                    isAnomaly={currentSegment?.isAnomaly || false}
                                    classResult={currentEvent?.classResult} 
                                    timeOffset={selectedIdx * 10}
                                />
                            </div>
                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-lowest/60 backdrop-blur-md z-50 transition-all duration-300">
                                    <span className="material-symbols-outlined text-medical-teal text-4xl animate-spin">sync</span>
                                    <p className="mt-3 text-sm font-bold text-charcoal">{t('history.loadingSegment')}</p>
                                </div>
                            )}
                        </div>

                        {/* Timeline Multi-Aritmia */}
                        {events.length > 0 && (
                            <div className="flex-shrink-0 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 shadow-sm">
                                <TimelineBar 
                                    events={events} 
                                    currentIdx={selectedIdx} 
                                    onSegmentSelect={(idx: number) => {
                                        setIsLoading(true);
                                        setTimeout(() => {
                                            setSelectedIdx(idx);
                                            setIsLoading(false);
                                        }, 300);
                                    }} 
                                />
                            </div>
                        )}
                        
                    </section>

                    {/* KOLOM KANAN: DETAIL ANALISIS HISTORIS */}
                    <aside className="w-full lg:w-3/12 flex flex-col gap-5 h-full overflow-y-auto pb-4 custom-scrollbar pr-2">
                        <VitalCard heartRate={heartRate} clinicalStatus={clinicalStatus} stressTest={stressTest} createdAt={createdAt} hideTechnicalDetails={true} />
                        
                        {/* Kesimpulan Analisis (Patient Friendly) */}
                        <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-medical-teal text-[20px]">psychiatry</span>
                                <h3 className="font-bold text-charcoal text-sm">{t('history.conclusion')}</h3>
                            </div>
                            
                            {!clinicalStatus ? (
                                <p className="text-sm text-on-surface-variant italic">{t('history.processing')}</p>
                            ) : clinicalStatus.severity === 'NORMAL' ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-charcoal leading-relaxed">
                                        {t('history.normalDesc')}<strong className="text-signal-green">{t('history.normalStatus')}</strong>{t('history.normalDesc2')}
                                    </p>
                                    <p className="text-sm text-charcoal leading-relaxed mt-2 bg-green-50 p-3 rounded-lg border border-green-100">
                                        {t('history.normalTip')}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-alert-red/10 p-3 rounded-lg border border-alert-red/20 mb-2">
                                        <p className="text-sm text-alert-red font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">warning</span>
                                            {t('history.anomalyDetected')}
                                        </p>
                                    </div>
                                    <p className="text-sm text-charcoal leading-relaxed">
                                        {t('history.anomalyDesc1')}<strong className="text-alert-red">{currentEvent?.classResult || 'Aritmia'}</strong>{t('history.anomalyDesc2')}
                                    </p>
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-2">
                                        <p className="text-sm text-charcoal leading-relaxed font-bold">
                                            {t('history.anomalyTip')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                </div>
            </main>

            {/* Bottom Navigation Shell */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 bg-surface border-t border-outline-variant z-50">
                <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors" to="/patient/dashboard">
                    <span className="material-symbols-outlined" data-icon="home">home</span>
                    <span className="font-label-md text-label-md">Home</span>
                </Link>
                <Link className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-colors" to="/patient/history">
                    <span className="material-symbols-outlined" data-icon="ecg_heart" style={{ fontVariationSettings: '"FILL" 1' }}>ecg_heart</span>
                    <span className="font-label-md text-label-md">Readings</span>
                </Link>
                <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors" to="/patient/qr-sync">
                    <span className="material-symbols-outlined" data-icon="monitoring">monitoring</span>
                    <span className="font-label-md text-label-md">Vitals</span>
                </Link>
                <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors" to="/patient/settings">
                    <span className="material-symbols-outlined" data-icon="person">person</span>
                    <span className="font-label-md text-label-md">Settings</span>
                </Link>
            </nav>
        </div>
    );
};
