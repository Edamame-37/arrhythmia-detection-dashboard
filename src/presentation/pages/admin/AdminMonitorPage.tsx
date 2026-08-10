import React, { useState } from 'react';
import { useECGStream } from '../../../application/hooks/useECGStream';
import { ECGCanvas } from '../../components/canvas/ECGCanvas';
import { TimelineBar } from '../../components/shared/TimelineBar';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { WS_URL } from '../../../config/env';

export const AdminMonitorPage: React.FC = () => {
    const {
        isRecording, paths, rPeaks, timeline,
        startStream, stopStream, isFilterOn, toggleFilter,
        system, network, prediction, stressTest, createdAt, receivedAt, deviceId, sessionId
    } = useECGStream(WS_URL);

    const [speed, setSpeed] = useState<25 | 50>(25);
    const { isOpen, toggleSidebar } = useSidebar();

    const handleToggleRecord = () => {
        isRecording ? stopStream() : startStream();
    };

    const formatTime = (ts: string | null) => {
        if (!ts) return "--:--:--";
        const d = new Date(ts);
        // Extracts the time part nicely, e.g. 15:00:00.123
        const pad = (n: number, w: number = 2) => n.toString().padStart(w, '0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
    };

    return (
        <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen">
            <AdminSidebar />

            <main id="main-content" className={`flex flex-col transition-all duration-300 min-h-screen ${isOpen ? 'md:ml-[260px]' : 'ml-0'}`}>
                <header className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 z-40 px-6 py-4 flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                        <button onClick={toggleSidebar} id="toggle-sidebar-btn" className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-charcoal">Live Stream Monitor</h1>
                            <p className="text-xs text-on-surface-variant mt-0.5">Device: {deviceId} | Session: {sessionId}</p>
                        </div>
                    </div>
                    {stressTest?.enabled && (
                        <div className="bg-red-100 px-3 py-1 rounded border border-alert-red/30">
                            <span className="text-[10px] font-bold text-alert-red uppercase tracking-wider">STRESS TEST ON (F:{stressTest.frame_counter})</span>
                        </div>
                    )}
                </header>

                <div className="p-4 flex flex-col lg:flex-row gap-6 flex-1 max-w-[1600px] w-full mx-auto">
                    <section className="w-full lg:w-8/12 xl:w-9/12 flex flex-col gap-4">
                        <div className="bg-surface border border-outline-variant rounded-xl p-3 flex flex-wrap justify-between items-center shadow-sm gap-3">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleToggleRecord}
                                    className={`${isRecording ? 'bg-alert-red' : 'bg-medical-teal'} text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-2`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">{isRecording ? 'stop_circle' : 'play_circle'}</span>
                                    {isRecording ? "Hentikan Pemantauan" : "Mulai Pemantauan Data"}
                                </button>
                                <button onClick={toggleFilter} className={`border px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 ${isFilterOn ? 'bg-surface text-medical-teal border-medical-teal' : 'bg-surface-container text-on-surface-variant'}`}>
                                    <span className="material-symbols-outlined text-[16px]">{isFilterOn ? 'filter_alt' : 'filter_alt_off'}</span>
                                    Filter DSP: {isFilterOn ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className="flex bg-surface-container rounded-lg p-1">
                                <button onClick={() => setSpeed(25)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${speed === 25 ? 'bg-medical-teal text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>25 mm/s</button>
                                <button onClick={() => setSpeed(50)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${speed === 50 ? 'bg-medical-teal text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>50 mm/s</button>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm relative min-h-[60vh] flex flex-col flex-1">
                            <ECGCanvas paths={paths} rPeaks={rPeaks} speed={speed} isAnomaly={prediction?.label !== 'Normal'} classResult={prediction?.label || 'NORM'} />
                        </div>
                        <TimelineBar events={timeline} />
                    </section>

                    <aside className="w-full lg:w-4/12 xl:w-3/12 flex flex-col gap-4">

                        {/* Timestamp Card */}
                        <div className="bg-surface-container border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">device_thermostat</span> Created At (IoT)</span>
                                <span className="text-xs font-mono-data font-bold text-charcoal">{formatTime(createdAt)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">desktop_windows</span> Received At (UI)</span>
                                <span className="text-xs font-mono-data font-bold text-medical-teal">{formatTime(receivedAt)}</span>
                            </div>
                        </div>

                        {/* Edge AI Performance (Prediction) */}
                        <div className="bg-charcoal text-white rounded-xl p-5 shadow-xl flex flex-col gap-4">
                            <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/20 pb-2">
                                <span className="material-symbols-outlined text-[18px] text-brand-red">psychology</span>
                                Edge AI Prediction
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                                    <p className="text-[9px] text-white/60 uppercase">Validation</p>
                                    <p className={`text-sm font-bold ${prediction?.status === 'PASS' ? 'text-green-400' : 'text-alert-red'}`}>{prediction?.status || '--'}</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                                    <p className="text-[9px] text-white/60 uppercase">Confidence</p>
                                    <p className="text-sm font-bold text-brand-red">{prediction?.confidence_percent ? `${prediction.confidence_percent.toFixed(2)}%` : '--'}</p>
                                </div>
                                <div className="col-span-2 bg-white/10 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] text-white/60 uppercase">Result Label</p>
                                        <p className="text-lg font-extrabold text-medical-teal">{prediction?.label || '--'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-white/60 uppercase">Latency</p>
                                        <p className="text-sm font-bold font-mono-data text-white">{prediction?.latency_ms ? `${prediction.latency_ms.toFixed(1)} ms` : '--'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Probabilities */}
                            {prediction?.probabilities && (
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5 mt-1 space-y-2">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-2">
                                        <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Probabilities</p>
                                        <p className="text-[9px] text-white/50 uppercase">Threshold: {prediction.threshold}</p>
                                    </div>
                                    {Object.entries(prediction.probabilities).map(([key, val]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <span className="text-[10px] text-white/80 font-medium">{key}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className={`h-full ${key === prediction.label ? 'bg-medical-teal' : 'bg-white/30'}`} style={{ width: `${(val as number)}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-mono-data w-8 text-right text-white/90">{(val as number).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="text-[9px] text-white/40 text-center uppercase tracking-widest mt-1">
                                Runtime: {prediction?.runtime || 'UNKNOWN'}
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col gap-4">
                            <h3 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-outline-variant/50 pb-2">
                                <span className="material-symbols-outlined text-[18px] text-medical-teal">memory</span>
                                Hardware Health
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                                    <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">CPU Usage</p>
                                    <p className="text-sm font-bold font-mono-data text-charcoal">{system?.cpu_usage_percent ? `${system.cpu_usage_percent.toFixed(1)}%` : '--'}</p>
                                </div>
                                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                                    <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">Memory</p>
                                    <p className="text-sm font-bold font-mono-data text-charcoal flex flex-col">
                                        {system?.memory_usage_percent ? `${system.memory_usage_percent.toFixed(1)}%` : '--'}
                                        <span className="text-[9px] font-normal text-on-surface-variant mt-0.5">{system?.memory_usage_mb ? `${system.memory_usage_mb} MB` : ''}</span>
                                    </p>
                                </div>
                                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                                    <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">Temperature</p>
                                    <p className={`text-sm font-bold font-mono-data ${system?.cpu_temperature_c && system.cpu_temperature_c > 60 ? 'text-alert-red' : 'text-charcoal'}`}>{system?.cpu_temperature_c ? `${system.cpu_temperature_c.toFixed(1)}°C` : '--'}</p>
                                </div>
                                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                                    <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">Uptime</p>
                                    <p className="text-sm font-bold font-mono-data text-charcoal">{system?.uptime_s ? `${Math.floor(system.uptime_s / 3600)}h ${Math.floor((system.uptime_s % 3600) / 60)}m` : '--'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Network & Connectivity */}
                        <div className="bg-surface border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col gap-4">
                            <h3 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-outline-variant/50 pb-2">
                                <span className="material-symbols-outlined text-[18px] text-primary">cell_tower</span>
                                Network Metrics
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                                    <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">WiFi RSSI</p>
                                    <p className={`text-sm font-bold font-mono-data ${network?.wifi_rssi_dbm && network.wifi_rssi_dbm > -70 ? 'text-green-600' : 'text-alert-red'}`}>{network?.wifi_rssi_dbm ? `${network.wifi_rssi_dbm} dBm` : '--'}</p>
                                </div>
                                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                                    <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">MQTT Latency</p>
                                    <p className="text-sm font-bold font-mono-data text-charcoal">{network?.mqtt_publish_latency_ms ? `${network.mqtt_publish_latency_ms.toFixed(1)} ms` : '--'}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 text-xs">
                                <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">MQTT Connection</p>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${network?.mqtt_connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    <p className="font-bold text-[11px] text-charcoal">{network?.mqtt_connected ? 'CONNECTED' : 'DISCONNECTED'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 bg-surface-container-low p-2 rounded border border-outline-variant/30 justify-center">
                                <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-medical-teal animate-ping' : 'bg-alert-red'}`}></span>
                                <p className={`text-xs font-bold tracking-wider ${isRecording ? 'text-medical-teal' : 'text-alert-red'}`}>
                                    {isRecording ? 'STREAMING ACTIVE' : 'DISCONNECTED'}
                                </p>
                            </div>
                        </div>

                    </aside>
                </div>
            </main>
        </div>
    );
};
