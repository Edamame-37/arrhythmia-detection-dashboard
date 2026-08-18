import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { Pagination } from '../../components/shared/Pagination';
import { useTranslation } from '../../../application/hooks/useTranslation';
import { API_URL } from '../../../config/env';
import { fetchWithAuth } from '../../../config/api';

interface SessionRecord {
    id: string;
    device_id: string;
    started_at: string;
    ecg_paper?: string | null;
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingSessionId, setUploadingSessionId] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !uploadingSessionId) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('paper', file);

        try {
            const res = await fetchWithAuth(`/api/sessions/${uploadingSessionId}/ecg_paper`, {
                method: 'POST',
                body: formData
            }); // Multipart is handled automatically by not setting Content-Type
            const data = await res.json();
            if (data.success) {
                setSessions(prev => prev.map(s => s.id === uploadingSessionId ? { ...s, ecg_paper: data.path } : s));
            } else {
                alert("Gagal mengunggah foto: " + data.message);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Terjadi kesalahan saat mengunggah foto.");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
            setUploadingSessionId(null);
        }
    };

    const triggerUpload = (sessionId: string) => {
        setUploadingSessionId(sessionId);
        if (fileInputRef.current) fileInputRef.current.click();
    };
    const { t } = useTranslation();

    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName && !lastName) return '';
        return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
    };

    useEffect(() => {
        const userId = localStorage.getItem('user_id') || '1';
        fetch(`${API_URL}/api/patients/${userId}`)
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(console.error);

        fetch(`${API_URL}/api/patients/${userId}/sessions`)
            .then(res => res.json())
            .then(data => {
                setSessions(data || []);
            })
            .catch(console.error);
    }, []);

    const patientName = profile ? `${profile.patient.first_name} ${profile.patient.last_name}` : t('profile.loading');

    return (
        <div className="bg-clinical-surface/30 text-clinical-charcoal w-full min-h-screen flex flex-col transition-colors duration-700 relative">
            <div className="absolute inset-0 ecg-grid opacity-[0.15] z-0 pointer-events-none"></div>
            {/* Top Navigation Bar */}
            <PatientHeader />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

            <main className="max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 flex flex-col flex-grow relative z-10">

                {/* Main Card Container */}
                <div className="bg-white rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] border border-clinical-charcoal/5 p-6 md:p-12 w-full relative overflow-hidden z-10 flex flex-col min-h-[500px]">

                    <header className="mb-8 z-10">
                        <h1 className="text-3xl font-extrabold font-display text-clinical-charcoal mb-2">{t('history.title')}</h1>
                        <p className="text-sm font-medium text-clinical-charcoal/60">{t('history.desc')}</p>
                    </header>
                    <div className="space-y-4 z-10">
                        {sessions.length === 0 ? (
                            <div className="text-center text-clinical-charcoal/60 p-8 bg-white rounded-2xl border border-clinical-charcoal/5 shadow-sm">{t('history.noHistory')}</div>
                        ) : (() => {
                            const paginatedSessions = sessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                            return paginatedSessions.map(session => (
                            <article key={session.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-clinical-charcoal/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-clinical-blue/20 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-700">
                                <div>
                                    <h2 className="font-bold text-clinical-charcoal mb-1 uppercase tracking-widest text-xs">{t('history.recordingSession')}</h2>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-clinical-charcoal/60 text-sm">
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
                                    {session.ecg_paper ? (
                                        <button onClick={() => setPreviewImage(API_URL + session.ecg_paper)} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-clinical-blue text-white font-bold text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all outline-none">
                                            Lihat Foto EKG
                                            <span className="material-symbols-outlined text-[18px]">image</span>
                                        </button>
                                    ) : (
                                        <button onClick={() => triggerUpload(session.id)} disabled={uploadingSessionId === session.id} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-clinical-charcoal/5 text-clinical-charcoal font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-charcoal/10 active:scale-95 transition-all outline-none">
                                            {uploadingSessionId === session.id ? "Mengunggah..." : "Unggah Foto EKG"}
                                            <span className="material-symbols-outlined text-[18px]">upload</span>
                                        </button>
                                    )}
                                    <Link
                                        to={`/patient/history/${session.id}`}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-clinical-blue/10 text-clinical-blue font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-blue hover:text-white active:scale-95 transition-all outline-none"
                                    >
                                        {t('history.details')}
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </Link>
                                </div>
                            </article>
                        ));
                        })()}
                    </div>
                    {sessions.length > 0 && (
                        <div className="mt-8 z-10">
                            <Pagination 
                                currentPage={currentPage}
                                totalItems={sessions.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </main>
            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full p-4" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white hover:text-clinical-red transition-colors">
                            <span className="material-symbols-outlined text-4xl">close</span>
                        </button>
                        <img src={previewImage} alt="ECG Paper" className="w-full h-full object-contain rounded-2xl shadow-2xl" />
                    </div>
                </div>
            )}


        </div>
    );
};
