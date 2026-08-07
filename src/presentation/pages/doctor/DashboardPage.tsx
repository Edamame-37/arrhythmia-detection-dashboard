import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DoctorSidebar } from '../../components/layout/DoctorSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { useConnection } from '../../../application/context/ConnectionContext';
import { API_URL } from '../../../config/env';

export interface SessionRecord {
    id: string;
    device_id: string;
    patient_id: string | null;
    patient_name: string | null;
    started_at: string;
    ended_at: string | null;
    file_path: string;
}

export interface DeviceRecord {
    id: string;
    name: string;
}

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [devices, setDevices] = useState<DeviceRecord[]>([]);
    const { isOpen, toggleSidebar } = useSidebar();
    const { connectedPatient, disconnectAll, setConnectedPatient } = useConnection();
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [standbyPatientProfile, setStandbyPatientProfile] = useState<any>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchPatientProfile = () => {
            if (connectedPatient && connectedPatient.id) {
                // Convert PAT-0001-XYZ to pat000000000001
                const numStr = connectedPatient.id.replace(/[^0-9]/g, '');
                const dbPatientId = `pat${numStr.padStart(12, '0')}`;
                
                if (dbPatientId) {
                    fetch(`${API_URL}/api/patients/${dbPatientId}`)
                        .then(res => {
                            if (!res.ok) throw new Error('API offline');
                            return res.json();
                        })
                        .then(data => {
                            if (data && data.patient) {
                                setStandbyPatientProfile(data.patient);
                                // Opsional: tetap perbarui context jika diperlukan
                                const newName = `${data.patient.first_name} ${data.patient.last_name}`;
                                const newPhoto = data.patient.profile_photo || undefined;
                                if (newName !== connectedPatient.name || newPhoto !== connectedPatient.profile_photo) {
                                    setConnectedPatient({
                                        ...connectedPatient,
                                        name: newName,
                                        profile_photo: newPhoto
                                    });
                                }
                            }
                        })
                        .catch(e => {
                            console.error("Gagal me-refresh data pasien dari database:", e);
                            const savedMock = localStorage.getItem('mock_patient_profile');
                            if (savedMock) {
                                const mockData = JSON.parse(savedMock);
                                setStandbyPatientProfile(mockData.patient);
                            }
                        });
                }
            } else {
                setStandbyPatientProfile(null);
            }
        };

        fetchPatientProfile();

        window.addEventListener('patient_profile_updated', fetchPatientProfile);
        return () => window.removeEventListener('patient_profile_updated', fetchPatientProfile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectedPatient?.id]);

    useEffect(() => {
        fetch(`${API_URL}/api/sessions`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.sessions)) {
                    setSessions(data.sessions);
                } else if (Array.isArray(data)) {
                    setSessions(data);
                } else {
                    setSessions([]);
                }
            })
            .catch(err => console.error("Error fetching sessions:", err));

        fetch(`${API_URL}/api/devices`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.devices)) {
                    setDevices(data.devices);
                } else if (Array.isArray(data)) {
                    setDevices(data);
                } else {
                    setDevices([]);
                }
            })
            .catch(err => console.error("Error fetching devices:", err));
    }, []);

    const activeSessions = sessions.filter(session => !session.ended_at);
    
    const displayPatient = standbyPatientProfile ? {
        name: `${standbyPatientProfile.first_name} ${standbyPatientProfile.last_name}`,
        id: standbyPatientProfile.id,
        photo: standbyPatientProfile.profile_photo || null
    } : connectedPatient ? {
        name: connectedPatient.name,
        id: connectedPatient.id,
        photo: connectedPatient.profile_photo || null
    } : null;

    const filteredHistorySessions = displayPatient 
        ? sessions.filter(s => s.patient_id === displayPatient.id || (s.patient_name && s.patient_name.includes(displayPatient.name)))
        : sessions;

    return (
        <div className="bg-background text-on-surface antialiased overflow-x-hidden w-full">
            <DoctorSidebar />
            <main id="main-content" className={`min-h-screen pb-24 md:pb-12 transition-all duration-300 w-full ${isOpen ? 'md:ml-[260px] md:w-[calc(100%-260px)]' : 'ml-0'}`}>

                <header className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 z-40 px-6 py-4 flex justify-between items-center max-w-container-max mx-auto">
                    <div className="flex items-center gap-3">
                        <button onClick={toggleSidebar} id="toggle-sidebar-btn" className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-charcoal">Dashboard Utama Klinis</h1>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                                {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(currentTime)} • {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(currentTime).replace(/\./g, ':')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/doctor/qr-scanner')} className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm text-sm">
                            <span className="material-symbols-outlined text-base">add</span>
                            <span className="hidden sm:inline">Pasien Baru</span>
                        </button>
                    </div>
                </header>

                <div className="px-6 max-w-container-max mx-auto mt-6">
                    {activeSessions.length > 0 && (
                        <section className="mb-6">
                            <div className="bg-medical-teal/10 border-2 border-medical-teal/30 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                                <div className="flex gap-4 relative z-10">
                                    <div className="bg-medical-teal text-white p-3 rounded-lg h-fit flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[28px] animate-pulse">monitor_heart</span>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-medical-teal font-bold mb-1">SESI PEREKAMAN AKTIF</p>
                                        <h2 className="text-xl font-bold text-charcoal">{activeSessions[0].patient_name || 'Tidak Diketahui'}</h2>
                                        <p className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
                                            <span className="material-symbols-outlined text-[14px]">router</span> Alat: {activeSessions[0].device_id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full lg:w-auto relative z-10">
                                    <button onClick={() => navigate('/doctor/monitor')} className="w-full lg:w-auto bg-medical-teal text-white px-6 py-3 rounded-lg font-bold hover:brightness-110 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                                        <span>Buka Live Monitor</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none z-0">
                                    <span className="material-symbols-outlined text-[150px]">monitor_heart</span>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="mb-8">
                        <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${activeSessions.length > 0 ? 'bg-alert-red animate-ping' : 'bg-outline-variant'}`}></span>
                            <span>Sesi Perekaman Aktif</span>
                        </h2>
                        {activeSessions.length > 0 ? (
                            <div className="space-y-3">
                                {activeSessions.map(session => (
                                    <div key={session.id} className="bg-surface border border-outline-variant/60 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="w-10 h-10 rounded-full bg-medical-teal/10 flex items-center justify-center font-bold text-medical-teal text-base">
                                                {session.patient_name ? session.patient_name.substring(0, 2).toUpperCase() : 'UK'}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-charcoal">{session.patient_name || 'Pasien Anonim'}</h3>
                                                <p className="text-xs text-on-surface-variant font-mono-data mt-0.5">SN Perangkat: {session.device_id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                            <button onClick={() => navigate('/doctor/monitor')} className="bg-medical-teal hover:brightness-110 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm active:scale-95">
                                                Buka Monitor
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-surface border border-outline-variant/60 p-5 rounded-xl flex items-center justify-center shadow-sm">
                                <p className="text-sm text-on-surface-variant">Tidak ada perekaman saat ini.</p>
                            </div>
                        )}
                    </section>

                    <section className="mb-8">
                        <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${devices.length > 0 ? 'bg-medical-teal animate-ping' : 'bg-outline-variant'}`}></span>
                            <span>Perangkat Online</span>
                        </h2>
                        {devices.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {devices.map(device => (
                                    <div key={device.id} className="bg-surface border border-outline-variant/60 p-4 rounded-xl flex items-center gap-3 shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-medical-teal/10 flex items-center justify-center text-medical-teal">
                                            <span className="material-symbols-outlined text-xl">router</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-charcoal text-sm">{device.name}</h3>
                                            <p className="text-xs text-on-surface-variant font-mono-data mt-0.5">ID: {device.id}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-surface border border-outline-variant/60 p-5 rounded-xl flex items-center justify-center shadow-sm">
                                <p className="text-sm text-on-surface-variant">Belum ada perangkat yang terhubung ke dashboard.</p>
                            </div>
                        )}
                    </section>

                    <section className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${connectedPatient && activeSessions.length === 0 ? 'bg-medical-teal animate-pulse' : 'bg-outline-variant'}`}></span>
                                <span>Pasien Standby (Menunggu Perekaman)</span>
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {displayPatient && activeSessions.length === 0 ? (
                                <div className="bg-gradient-to-r from-surface to-medical-teal/5 border border-medical-teal/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-medical-teal/10 flex items-center justify-center text-base font-bold text-medical-teal uppercase border border-medical-teal/20 overflow-hidden">
                                            {displayPatient.photo ? (
                                                <img src={displayPatient.photo} alt={displayPatient.name} className="w-full h-full object-cover" />
                                            ) : (
                                                displayPatient.name.substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-charcoal">{displayPatient.name}</h4>
                                            <p className="text-xs text-on-surface-variant font-mono-data mt-0.5 mb-1.5">ID: {displayPatient.id}</p>
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-medical-teal/10 text-medical-teal text-[10px] font-bold uppercase tracking-wider border border-medical-teal/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-medical-teal animate-pulse"></div>
                                                Terkoneksi & Siap
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <button onClick={() => setShowDisconnectModal(true)} className="flex-1 sm:flex-none border border-outline-variant hover:border-brand-red text-on-surface-variant hover:text-brand-red hover:bg-brand-red/5 px-4 py-2 rounded-lg text-xs font-bold transition-all">
                                            Putus Hubungan
                                        </button>
                                        <button onClick={() => navigate('/doctor/monitor')} className="flex-1 sm:flex-none bg-medical-teal text-white px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95">
                                            <span className="material-symbols-outlined text-[16px]">play_circle</span>
                                            Mulai Rekam
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-surface border border-outline-variant/60 p-5 rounded-xl flex items-center justify-center shadow-sm">
                                    <p className="text-sm text-on-surface-variant">Tidak ada pasien yang menunggu saat ini.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${displayPatient ? 'bg-medical-teal' : 'bg-outline-variant'}`}></span>
                                <span>{displayPatient ? `Riwayat Rekaman: ${displayPatient.name}` : 'Riwayat Seluruh Pasien'}</span>
                            </h2>
                            <button onClick={() => navigate('/doctor/analytics')} className="text-medical-teal font-bold text-sm hover:underline flex items-center gap-1 transition-all hover:gap-2">
                                <span>Lihat Semua Arsip</span>
                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {filteredHistorySessions.length === 0 ? (
                                <div className="bg-surface border border-outline-variant/60 p-5 rounded-xl flex items-center justify-center shadow-sm">
                                    <p className="text-sm text-on-surface-variant">Belum ada riwayat sesi yang tersimpan.</p>
                                </div>
                            ) : filteredHistorySessions.map(session => (
                                <div key={session.id} className="bg-surface border border-outline-variant/60 p-4 rounded-xl flex items-center justify-between gap-4 opacity-80 interactive-card">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-outline uppercase">
                                            {session.patient_name ? session.patient_name.substring(0, 2) : 'UK'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-charcoal truncate max-w-[150px] sm:max-w-[200px]">{session.patient_name || 'Pasien Anonim'}</h4>
                                            <p className="text-xs text-on-surface-variant font-mono-data mt-0.5">Sesi: {session.id.substring(0, 8)}... • SN: {session.device_id}</p>
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-on-surface-variant font-bold uppercase tracking-wide">
                                                <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                                                Status: Putus (Tersimpan)
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => navigate(`/doctor/analytics?sessionId=${session.id}`)} className="border border-outline-variant text-on-surface-variant hover:text-medical-teal hover:border-medical-teal px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface transition-all flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">history</span>
                                            Lihat Arsip
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>



            {/* Disconnect Modals */}
            {showDisconnectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm border border-outline-variant shadow-xl animate-in zoom-in-50 fade-in duration-500 ease-spring">
                    <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4 text-error">
                    <span className="material-symbols-outlined text-2xl">warning</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-charcoal mb-2">Putuskan Hubungan?</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6">Apakah Anda yakin ingin memutuskan hubungan dengan pasien ini? Pemantauan live akan terhenti dan Anda harus melakukan scan QR ulang untuk memantau lagi.</p>
                    <div className="flex gap-3">
                    <button onClick={() => setShowDisconnectModal(false)} className="flex-1 py-2 rounded-lg font-label-bold text-label-bold border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors">Batal</button>
                    <button onClick={() => {
                        disconnectAll();
                        setShowDisconnectModal(false);
                        setShowSuccessModal(true);
                    }} className="flex-1 py-2 rounded-lg font-label-bold text-label-bold bg-error text-white hover:bg-red-600 transition-colors shadow-sm">Ya, Putuskan</button>
                    </div>
                </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm border border-outline-variant shadow-xl text-center animate-in zoom-in-50 fade-in duration-500 ease-spring">
                    <div className="w-16 h-16 rounded-full bg-status-green/10 flex items-center justify-center mb-4 text-status-green mx-auto">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-charcoal mb-2">Berhasil Terputus</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6">Koneksi dengan pasien telah berhasil dibatalkan.</p>
                    <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-lg font-label-bold text-label-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm">Tutup</button>
                </div>
                </div>
            )}

        </div>
    );
};
