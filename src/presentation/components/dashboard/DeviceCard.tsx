import React from 'react';

interface DeviceCardProps {
    deviceId?: string;
    aiMetrics?: { latency_ms?: number; runtime?: string } | null;
    isLive?: boolean;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ deviceId = "UNDIP-ECG-01", aiMetrics, isLive = true }) => {
    return (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface border border-outline-variant/60 flex items-center justify-center">
                    <span className="material-symbols-outlined text-charcoal text-[20px]">developer_board</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Device ID</p>
                    <p className="text-sm font-mono-data text-charcoal font-bold mt-0.5">{deviceId}</p>
                </div>
                {isLive && (
                    <div className="ml-auto flex flex-col items-end">
                        <span className="material-symbols-outlined text-signal-green text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>wifi_tethering</span>
                        <span className="text-xs font-bold text-signal-green mt-0.5">Online</span>
                    </div>
                )}
            </div>
            
            {/* Edge AI Performance Metrics */}
            <div className="bg-surface rounded-lg p-3 border border-outline-variant/50 flex justify-between items-center mt-1">
                <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Performa Edge AI</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono-data font-bold text-charcoal">
                            {aiMetrics?.latency_ms ? `${aiMetrics.latency_ms.toFixed(2)} ms` : '-- ms'}
                        </span>
                        <span className="text-[10px] bg-medical-teal/10 text-medical-teal px-1.5 py-0.5 rounded font-bold uppercase">
                            {aiMetrics?.runtime || 'Menunggu AI...'}
                        </span>
                    </div>
                </div>
                <span className="material-symbols-outlined text-medical-teal opacity-50 text-[24px]">memory</span>
            </div>
        </div>
    );
};