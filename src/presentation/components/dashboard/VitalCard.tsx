import React from 'react';
import type { ClinicalExplanation } from '../../../core/clinical/ruleBasedEngine';

import type { DeviceStressTest } from '../../../core/types/ecgTypes';

interface VitalCardProps {
    heartRate: number | string;
    clinicalStatus: ClinicalExplanation | null;
    stressTest?: DeviceStressTest | null;
    createdAt?: string | null;
    hideTechnicalDetails?: boolean;
}

export const VitalCard: React.FC<VitalCardProps> = ({ heartRate, clinicalStatus, stressTest, createdAt, hideTechnicalDetails }) => {
    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[11px] font-bold text-outline uppercase tracking-widest">Heart Rate</p>
                    <h2 className={`text-5xl font-extrabold leading-none mt-1 tracking-tighter transition-colors duration-300 ${clinicalStatus?.severity === 'CRITICAL' ? 'text-alert-red' : 'text-charcoal'}`}>
                        <span>{heartRate}</span> <span className="text-base font-bold tracking-normal ml-0.5">BPM</span>
                    </h2>
                </div>
                <div className={`px-2 py-1 rounded font-bold text-[10px] border flex items-center gap-1.5 transition-all ${
                    !clinicalStatus ? 'bg-surface-container text-outline border-outline-variant' :
                    clinicalStatus.severity === 'CRITICAL' ? 'bg-red-50 text-alert-red border-red-200 pulse-animation' :
                    'bg-green-50 text-green-700 border-green-200'
                }`}>
                    <span className={`w-2 h-2 rounded-full ${!clinicalStatus ? 'bg-outline' : clinicalStatus.severity === 'CRITICAL' ? 'bg-alert-red' : 'bg-signal-green'}`}></span>
                    {!clinicalStatus ? 'Tunggu Data' : clinicalStatus.severity === 'CRITICAL' ? 'Anomali Deteksi' : 'Normal'}
                </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-outline-variant/60">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Status Irama:</span>
                    <span className={`text-sm font-bold transition-colors ${!clinicalStatus ? 'text-outline' : clinicalStatus.severity === 'CRITICAL' ? 'text-alert-red' : 'text-signal-green'}`}>
                        {!clinicalStatus ? 'Menunggu AI...' : clinicalStatus.severity === 'CRITICAL' ? 'Aritmia Terdeteksi' : 'Normal Sinus Rhythm'}
                    </span>
                </div>
                {!hideTechnicalDetails && (
                    <>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-on-surface-variant">Frame ID:</span>
                            <span className="text-sm font-bold text-charcoal">{stressTest?.frame_counter ?? '---'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-on-surface-variant">Created At:</span>
                            <span className="text-sm font-bold text-charcoal truncate ml-2">{createdAt ? new Date(createdAt).toLocaleTimeString() : '---'}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};