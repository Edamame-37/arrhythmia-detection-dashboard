import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { useTranslation } from '../../../application/hooks/useTranslation';
import { APP_CONFIG } from '../../../core/config';

interface SessionRecord {
    id: string;
    device_id: string;
    started_at: string;
}

interface PatientProfile {
    patient: {
        first_name: string;
        last_name: string;
        profile_photo: string | null;
    }
}

export const PatientHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const { t } = useTranslation();

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

        fetch(`${APP_CONFIG.API_URL}/api/patients/${userId}/sessions`)
            .then(res => res.json())
            .then(data => {
                setSessions(data || []);
            })
            .catch(console.error);
    }, []);

    const patientName = profile ? `${profile.patient.first_name} ${profile.patient.last_name}` : t('profile.loading');

    return (
        <div className="text-on-surface w-full bg-surface-gray min-h-screen flex flex-col">
            {/* Top Navigation Bar */}
            <PatientHeader />

            <main className="max-w-5xl w-full mx-auto px-gutter py-8 md:py-12 flex flex-col flex-grow">
                {/* Animated Background decorative elements */}
                <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-medical-teal/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
                <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-brand-navy/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>


                {/* Main Card Container */}
                <div className="bg-surface-container-lowest rounded-[2rem] shadow-xl shadow-medical-teal/5 border border-surface-container-high p-6 md:p-12 w-full relative overflow-hidden z-10 flex flex-col min-h-[500px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-medical-teal/5 rounded-bl-[100px] -z-0"></div>

                    <header className="mb-8 z-10">
                        <h1 className="font-headline-lg text-headline-lg text-charcoal mb-2">{t('history.title')}</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">{t('history.desc')}</p>
                    </header>
                    <div className="space-y-4 z-10">
                        {sessions.length === 0 ? (
                            <div className="text-center text-on-surface-variant p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm">{t('history.noHistory')}</div>
                        ) : sessions.map(session => (
                            <article key={session.id} className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-medical-teal/40 transition-colors">
                                <div>
                                    <h2 className="font-label-bold text-label-bold text-charcoal mb-1">{t('history.recordingSession')}</h2>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]" data-icon="calendar_today">calendar_today</span>
                                            <span>{new Date(session.started_at).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]" data-icon="fingerprint">fingerprint</span>
                                            <span className="uppercase font-mono-data text-xs">{t('history.id')}: {session.id.substring(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">

                                    <Link
                                        to={`/patient/history/${session.id}`}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface-container-high text-medical-teal font-body-md font-bold hover:bg-medical-teal hover:text-white active:scale-95 transition-all outline-none"
                                    >
                                        {t('history.details')}
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>


        </div>
    );
};
