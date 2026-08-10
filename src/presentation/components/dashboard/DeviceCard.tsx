import React from 'react';

interface DeviceCardProps {
    deviceId?: string;
    aiMetrics?: { latency_ms?: number; runtime?: string } | null;
    isLive?: boolean;
    network?: { mqtt_publish_latency_ms?: number; wifi_rssi_dbm?: number; mqtt_connected?: boolean } | null;
    system?: { cpu_usage_percent?: number; memory_usage_percent?: number; cpu_temperature_c?: number; uptime_s?: number } | null;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ 
    deviceId = "UNDIP-ECG-01", 
    aiMetrics, 
    isLive = true,
    network,
    system
}) => {
    return (
        <div className="bg-white border border-clinical-charcoal/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-[0px_20px_40px_rgba(0,0,0,0.04)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] group">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-clinical-charcoal/5 flex items-center justify-center text-clinical-blue group-hover:scale-110 transition-transform duration-700">
                    <span className="material-symbols-outlined text-[26px]">developer_board</span>
                </div>
                <div>
                    <p className="text-[11px] font-label-md text-clinical-charcoal/60 uppercase tracking-[0.2em]">Device ID</p>
                    <p className="text-base font-mono-data text-clinical-charcoal font-bold mt-1 tracking-wide">{deviceId}</p>
                </div>
                {isLive && (
                    <div className="ml-auto flex flex-col items-end gap-1">
                        <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-clinical-blue rounded-full text-[10px] font-label-md uppercase tracking-widest border border-blue-100 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-clinical-blue animate-pulse"></span>
                            Online
                        </span>
                    </div>
                )}
            </div>

            {network && (
                <div className="mt-2 border-t border-clinical-charcoal/5 pt-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="bg-clinical-surface/30 p-3 rounded-2xl border border-clinical-charcoal/5">
                        <p className="text-[9px] text-clinical-charcoal/60 uppercase tracking-[0.2em] font-label-md">WiFi RSSI</p>
                        <p className={`text-sm font-bold font-mono-data mt-1 ${network.wifi_rssi_dbm && network.wifi_rssi_dbm > -70 ? 'text-green-600' : 'text-red-500'}`}>
                            {network.wifi_rssi_dbm ? `${network.wifi_rssi_dbm} dBm` : '--'}
                        </p>
                    </div>
                    <div className="bg-clinical-surface/30 p-3 rounded-2xl border border-clinical-charcoal/5">
                        <p className="text-[9px] text-clinical-charcoal/60 uppercase tracking-[0.2em] font-label-md">MQTT Latency</p>
                        <p className="text-sm font-bold font-mono-data mt-1 text-clinical-charcoal">
                            {network.mqtt_publish_latency_ms ? `${network.mqtt_publish_latency_ms.toFixed(1)} ms` : '--'}
                        </p>
                    </div>
                    <div className="bg-clinical-surface/30 p-3 rounded-2xl border border-clinical-charcoal/5 col-span-2 flex items-center justify-between">
                        <p className="text-[9px] text-clinical-charcoal/60 uppercase tracking-[0.2em] font-label-md">MQTT Connection</p>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${network.mqtt_connected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${network.mqtt_connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            {network.mqtt_connected ? 'CONNECTED' : 'DISCONNECTED'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};