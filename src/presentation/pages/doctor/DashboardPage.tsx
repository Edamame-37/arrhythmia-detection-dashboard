import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DoctorSidebar } from '../../components/layout/DoctorSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { useConnection } from '../../../application/context/ConnectionContext';
import { API_URL } from '../../../config/env';
import { fetchWithAuth } from '../../../config/api';

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
    const { connectedPatients, removeConnectedPatient, disconnectAll } = useConnection();
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [patientToDisconnect, setPatientToDisconnect] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // (Patient profile syncing removed for multi-patient support to simplify state)

    useEffect(() => {
        // Jika kembali (Back) dari impersonasi, pulihkan sesi dokter
        const docToken = localStorage.getItem('doctor_auth_token');
        if (docToken && localStorage.getItem('user_role') !== 'dokter') {
            localStorage.setItem('auth_token', docToken);
            localStorage.setItem('user_role', 'dokter');
            const docId = localStorage.getItem('doctor_user_id');
            if (docId) localStorage.setItem('user_id', docId);
        }

        fetchWithAuth(`/api/sessions`)
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

        fetchWithAuth(`/api/devices`)
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

    const filteredHistorySessions = sessions; // Removed specific patient filter for now, or could filter if needed

    const handleImpersonate = async (patientId: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetchWithAuth(`/api/doctors/impersonate/${patientId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (data.success && data.user_id) {
                // Backup doctor credentials sebelum impersonate
                const currentRole = localStorage.getItem('user_role');
                if (currentRole === 'dokter') {
                    localStorage.setItem('doctor_auth_token', token || '');
                    localStorage.setItem('doctor_user_id', localStorage.getItem('user_id') || '');
                }

                // Clear old connected state
                localStorage.removeItem('connectedPatients');
                localStorage.removeItem('connectedDoctor');
                localStorage.removeItem('mock_patient_profile');
                
                // Set new credentials
                localStorage.setItem('user_id', data.user_id.toString());
                localStorage.setItem('user_role', data.role);
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                
                // Navigate
                if (data.role === 'pasien') {
                    navigate('/patient/dashboard');
                }
            } else {
                alert(data.message || 'Gagal melakukan impersonate.');
            }
        } catch (err) {
            console.error("Gagal impersonate", err);
            alert("Koneksi ke server gagal.");
        }
    };

    return (
        <div className="bg-clinical-surface text-clinical-charcoal antialiased overflow-x-hidden w-full">
            <DoctorSidebar />
            <main id="main-content" className={`min-h-screen pb-24 md:pb-12 transition-all duration-300 w-full ${isOpen ? 'md:ml-[260px] md:w-[calc(100%-260px)]' : 'ml-0'}`}>

                <header className="sticky top-0 bg-clinical-surface/90 backdrop-blur-md border-b border-clinical-blue/20/30 z-40 px-6 py-4 flex justify-between items-center max-w-container-max mx-auto">
                    <div className="flex items-center gap-3">
                        <button onClick={toggleSidebar} id="toggle-sidebar-btn" className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-white-container text-clinical-charcoal/70 transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-headline-md tracking-tight text-clinical-charcoal">Dashboard Utama Klinis</h1>
                            <p className="text-xs font-body-sm text-clinical-charcoal/70 mt-0.5">
                                {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(currentTime)} • {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(currentTime).replace(/\./g, ':')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/doctor/qr-scanner')} className="bg-clinical-blue hover:brightness-110 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm text-sm font-body-sm">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span className="hidden sm:inline">Pasien Baru</span>
                        </button>
                    </div>
                </header>

                <div className="px-6 max-w-container-max mx-auto mt-6">
                    {activeSessions.length > 0 && (
                        <section className="mb-6">
                            <div className="bg-clinical-blue/10 border-2 border-clinical-blue/30 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                                <div className="flex gap-4 relative z-10">
                                    <div className="bg-clinical-blue text-white p-3 rounded-lg h-fit flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[28px] animate-pulse">monitor_heart</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-body-sm uppercase tracking-widest text-clinical-blue font-headline-md mb-1">SESI PEREKAMAN AKTIF</p>
                                        <h2 className="text-xl font-headline-md text-clinical-charcoal">{activeSessions[0].patient_name || 'Tidak Diketahui'}</h2>
                                        <p className="text-sm font-body-sm text-clinical-charcoal/70 flex items-center gap-1.5 mt-1">
                                            <span className="material-symbols-outlined text-[14px]">router</span> Alat: {activeSessions[0].device_id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full lg:w-auto relative z-10">
                                    <button onClick={() => navigate('/doctor/monitor')} className="w-full lg:w-auto bg-clinical-blue text-white px-6 py-3 rounded-lg font-headline-md hover:brightness-110 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                                        <span>Buka Live Monitor</span>
                                        <span className="material-symbols-outlined text-sm font-body-sm">arrow_forward</span>
                                    </button>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none z-0">
                                    <span className="material-symbols-outlined text-[150px]">monitor_heart</span>
                                </div>
                            </div>
                        </section>
                    )}



                    <section className="mb-8">
                        <h2 className="text-base font-body-md font-headline-md text-clinical-charcoal mb-4 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${devices.length > 0 ? 'bg-clinical-blue animate-ping' : 'bg-clinical-blue/20'}`}></span>
                            <span>Perangkat Online</span>
                        </h2>
                        {devices.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {devices.map(device => (
                                    <div key={device.id} className="bg-white border border-clinical-blue/20/60 p-4 rounded-xl flex items-center gap-3 shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-clinical-blue/10 flex items-center justify-center text-clinical-blue">
                                            <span className="material-symbols-outlined text-xl">router</span>
                                        </div>
                                        <div>
                                            <h3 className="font-headline-md text-clinical-charcoal text-sm font-body-sm">{device.name}</h3>
                                            <p className="text-xs font-body-sm text-clinical-charcoal/70 font-mono-data mt-0.5">ID: {device.id}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-clinical-blue/20/60 p-5 rounded-xl flex items-center justify-center shadow-sm">
                                <p className="text-sm font-body-sm text-clinical-charcoal/70">Belum ada perangkat yang terhubung ke dashboard.</p>
                            </div>
                        )}
                    </section>

                    <section className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-body-md font-headline-md text-clinical-charcoal flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${connectedPatients.length > 0 ? 'bg-clinical-blue animate-pulse' : 'bg-clinical-blue/20'}`}></span>
                                <span>Pasien Terhubung ({connectedPatients.length})</span>
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {connectedPatients.length > 0 ? (
                                connectedPatients.map(patient => (
                                    <div key={patient.id} className="bg-gradient-to-r from-surface to-medical-teal/5 border border-clinical-blue/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-clinical-blue/10 flex items-center justify-center text-base font-body-md font-headline-md text-clinical-blue uppercase border border-clinical-blue/20 overflow-hidden">
                                                {patient.profile_photo ? (
                                                    <img src={patient.profile_photo} alt={patient.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    patient.name.substring(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-headline-md text-sm font-body-sm text-clinical-charcoal">{patient.name}</h4>
                                                <p className="text-xs font-body-sm text-clinical-charcoal/70 font-mono-data mt-0.5 mb-1.5">ID: {patient.id}</p>
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-clinical-blue/10 text-clinical-blue text-[10px] font-headline-md uppercase tracking-wider border border-clinical-blue/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-clinical-blue animate-pulse"></div>
                                                    Terkoneksi & Siap
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                                            <button onClick={() => handleImpersonate(patient.id)} className="flex-1 sm:flex-none bg-medical-teal text-white hover:brightness-110 px-4 py-2 rounded-lg text-xs font-body-sm font-headline-md transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm">
                                                <span className="material-symbols-outlined text-[16px]">login</span>
                                                Login
                                            </button>
                                            <button onClick={() => {
                                                setPatientToDisconnect(patient.id);
                                                setShowDisconnectModal(true);
                                            }} className="flex-1 sm:flex-none bg-error text-white hover:bg-red-600 px-4 py-2 rounded-lg text-xs font-body-sm font-headline-md transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm">
                                                <span className="material-symbols-outlined text-[16px]">person_remove</span>
                                                Putuskan
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white border border-clinical-blue/20/60 p-5 rounded-xl flex items-center justify-center shadow-sm">
                                    <p className="text-sm font-body-sm text-clinical-charcoal/70">Tidak ada pasien yang menunggu saat ini.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-body-md font-headline-md text-clinical-charcoal flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-clinical-blue/20"></span>
                                <span>Riwayat Seluruh Pasien</span>
                            </h2>
                            <button onClick={() => navigate('/doctor/analytics')} className="text-clinical-blue font-headline-md text-sm font-body-sm hover:underline flex items-center gap-1 transition-all hover:gap-2">
                                <span>Lihat Semua Arsip</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {connectedPatients.length === 0 ? (
                                <div className="bg-white border border-clinical-blue/20/60 p-5 rounded-xl flex items-center justify-center shadow-sm">
                                    <p className="text-sm font-body-sm text-clinical-charcoal/70">Sambungkan ke pasien untuk melihat riwayat rekaman.</p>
                                </div>
                            ) : filteredHistorySessions.length === 0 ? (
                                <div className="bg-white border border-clinical-blue/20/60 p-5 rounded-xl flex items-center justify-center shadow-sm">
                                    <p className="text-sm font-body-sm text-clinical-charcoal/70">Belum ada riwayat sesi yang tersimpan.</p>
                                </div>
                            ) : (
                                <>
                                    {filteredHistorySessions.slice(0, 3).map(session => (
                                        <div key={session.id} className="bg-white border border-clinical-blue/20/60 p-4 rounded-xl flex items-center justify-between gap-4 opacity-80 interactive-card">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white-container-low flex items-center justify-center font-headline-md text-outline uppercase overflow-hidden">
                                                    {session.patient_name ? session.patient_name.substring(0, 2).toUpperCase() : 'UK'}
                                                </div>
                                                <div>
                                                    <h4 className="font-headline-md text-sm font-body-sm text-clinical-charcoal truncate max-w-[150px] sm:max-w-[200px]">{session.patient_name || 'Pasien Anonim'}</h4>
                                                    <p className="text-xs font-body-sm text-clinical-charcoal/70 font-mono-data mt-0.5">Sesi: {session.id.substring(0, 8)}... • SN: {session.device_id}</p>
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-clinical-charcoal/70 font-headline-md uppercase tracking-wide">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-clinical-blue/20"></div>
                                                        Status: Putus (Tersimpan)
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => navigate(`/doctor/analytics?sessionId=${session.id}`)} className="border border-clinical-blue/20 text-clinical-charcoal/70 hover:text-clinical-blue hover:border-clinical-blue px-3 py-1.5 rounded-lg text-xs font-body-sm font-label-md bg-white transition-all flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">history</span>
                                                    Lihat Arsip
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredHistorySessions.length > 3 && (
                                        <div className="text-center pt-2">
                                            <p className="text-xs font-body-sm text-clinical-charcoal/70">
                                                Menampilkan 3 riwayat terbaru. <button onClick={() => navigate('/doctor/analytics')} className="text-clinical-blue font-headline-md hover:underline">Klik Lihat Semua Arsip</button> untuk melihat {filteredHistorySessions.length - 3} rekaman lainnya.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </main>



            {/* Disconnect Modals */}
            {showDisconnectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white-container-lowest rounded-2xl p-6 w-full max-w-sm border border-clinical-blue/20 shadow-xl animate-in zoom-in-50 fade-in duration-500 ease-spring">
                        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4 text-error">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-clinical-charcoal mb-2">Putuskan Hubungan?</h3>
                        <p className="font-body-md text-body-md text-clinical-charcoal/70 mb-6">Apakah Anda yakin ingin memutuskan hubungan dengan pasien ini? Pemantauan live akan terhenti dan Anda harus melakukan scan QR ulang untuk memantau lagi.</p>
                        <div className="flex gap-3">
                            <button onClick={() => {
                                setShowDisconnectModal(false);
                                setPatientToDisconnect(null);
                            }} className="flex-1 py-2 rounded-lg font-label-bold text-label-bold border border-clinical-blue/20 hover:bg-white-container text-clinical-charcoal/70 transition-colors">Batal</button>
                            <button onClick={async () => {
                                if (patientToDisconnect) {
                                    await removeConnectedPatient(patientToDisconnect);
                                    setPatientToDisconnect(null);
                                } else {
                                    // Fallback if no specific patient selected (should not happen)
                                    disconnectAll();
                                }
                                setShowDisconnectModal(false);
                                setShowSuccessModal(true);
                            }} className="flex-1 py-2 rounded-lg font-label-bold text-label-bold bg-error text-white hover:bg-red-600 transition-colors shadow-sm">Ya, Putuskan</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white-container-lowest rounded-2xl p-6 w-full max-w-sm border border-clinical-blue/20 shadow-xl text-center animate-in zoom-in-50 fade-in duration-500 ease-spring">
                        <div className="w-16 h-16 rounded-full bg-status-green/10 flex items-center justify-center mb-4 text-status-green mx-auto">
                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-clinical-charcoal mb-2">Berhasil Terputus</h3>
                        <p className="font-body-md text-body-md text-clinical-charcoal/70 mb-6">Koneksi dengan pasien telah berhasil dibatalkan.</p>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-lg font-label-bold text-label-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm">Tutup</button>
                    </div>
                </div>
            )}

        </div>
    );
};
