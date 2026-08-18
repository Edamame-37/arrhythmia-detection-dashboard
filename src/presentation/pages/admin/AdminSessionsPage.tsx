import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { fetchWithAuth } from '../../../config/api';
import { supabase } from '../../../config/supabaseClient';

export const AdminSessionsPage: React.FC = () => {
    const navigate = useNavigate();
    const { isOpen, toggleSidebar } = useSidebar();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [patientNames, setPatientNames] = useState<Record<string, string>>({});
    const [doctorNames, setDoctorNames] = useState<Record<string, string>>({});
    const [sessionValidations, setSessionValidations] = useState<Record<string, { total: number, validated: number }>>({});
    
    // View States
    const [viewMode, setViewMode] = useState<'all' | 'users'>('all');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetchWithAuth(`/api/sessions`)
            .then(res => res.json())
            .then(data => {
                const fetchedSessions = Array.isArray(data.sessions) ? data.sessions : (Array.isArray(data) ? data : []);
                
                // Sort descending (terbaru paling atas)
                fetchedSessions.sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
                
                setSessions(fetchedSessions);

                // Ambil info akun untuk map nama pasien dan dokter
                fetchWithAuth('/api/admin/users')
                    .then(r => r.json())
                    .then(users => {
                        const pNames: Record<string, string> = {};
                        const dNames: Record<string, string> = {};
                        if (Array.isArray(users)) {
                            users.forEach(u => {
                                if (u.role === 'pasien') pNames[u.id] = u.name;
                                if (u.role === 'dokter') dNames[u.id] = u.name;
                            });
                        }
                        setPatientNames(pNames);
                        setDoctorNames(dNames);
                    });

                // Kalkulasi validasi dari Supabase
                const sessionIds = fetchedSessions.map((s: any) => s.id);
                if (sessionIds.length > 0) {
                    supabase.from('frame_records')
                        .select('session_id, confirmation')
                        .in('session_id', sessionIds)
                        .then(({ data: frames, error }) => {
                            if (!error && frames) {
                                const counts: Record<string, { total: number, validated: number }> = {};
                                sessionIds.forEach((id: string) => {
                                    counts[id] = { total: 0, validated: 0 };
                                });
                                frames.forEach(fr => {
                                    if (counts[fr.session_id]) {
                                        counts[fr.session_id].total++;
                                        if (fr.confirmation !== null && fr.confirmation !== undefined) {
                                            counts[fr.session_id].validated++;
                                        }
                                    }
                                });
                                setSessionValidations(counts);
                            }
                        });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch sessions", err);
                setLoading(false);
            });
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Grouping by Patient
    const patientsMap = new Map<string, { id: string, name: string, totalSessions: number, lastSessionDate: string }>();
    sessions.forEach(session => {
        const pId = session.patient_id;
        if (!patientsMap.has(pId)) {
            patientsMap.set(pId, {
                id: pId,
                name: patientNames[pId] || pId || 'Unknown',
                totalSessions: 0,
                lastSessionDate: session.start_time
            });
        }
        const pData = patientsMap.get(pId)!;
        pData.totalSessions++;
        // Karena sudah di-sort DESC, session pertama untuk pasien ini adalah yang terakhir
    });
    const patientsList = Array.from(patientsMap.values());

    const displayedSessions = selectedUserId 
        ? sessions.filter(s => s.patient_id === selectedUserId)
        : sessions;

    const renderSessionsTable = (sessionList: any[]) => (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-lowest border-b border-outline-variant">
                    <tr>
                        <th className="px-6 py-4 font-bold tracking-wider">Pasien</th>
                        <th className="px-6 py-4 font-bold tracking-wider">Dokter Pengawas</th>
                        <th className="px-6 py-4 font-bold tracking-wider">Device ID</th>
                        <th className="px-6 py-4 font-bold tracking-wider">Waktu Mulai</th>
                        <th className="px-6 py-4 font-bold tracking-wider text-center">Progress Validasi</th>
                        <th className="px-6 py-4 font-bold tracking-wider text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                    {sessionList.map((session) => {
                        const patientName = patientNames[session.patient_id] || session.patient_id || 'Unknown';
                        const doctorName = doctorNames[session.doctor_id] || session.doctor_id || 'Unknown';

                        const validation = sessionValidations[session.id] || { total: 0, validated: 0 };
                        let validationStatus = "Belum Divalidasi";
                        let validationClass = "bg-surface-variant/50 text-on-surface-variant";
                        
                        if (validation.total > 0) {
                            if (validation.validated === validation.total) {
                                validationStatus = "Sudah Divalidasi";
                                validationClass = "bg-signal-green/20 text-signal-green";
                            } else if (validation.validated > 0) {
                                const percentage = Math.round((validation.validated / validation.total) * 100);
                                validationStatus = `Tervalidasi ${percentage}%`;
                                validationClass = "bg-brand-navy/10 text-brand-navy";
                            }
                        }

                        return (
                            <tr key={session.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-charcoal">{patientName}</div>
                                    <div className="text-xs text-on-surface-variant font-mono mt-1 truncate max-w-[120px]">{session.patient_id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-charcoal">{doctorName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs bg-surface-variant/30 px-2 py-1 rounded text-charcoal font-semibold border border-outline-variant/50">
                                        {session.device_id || '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">
                                    {formatDate(session.start_time)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${validationClass}`}>
                                        {validationStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => navigate(`/admin/analytics?sessionId=${session.id}`)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white hover:bg-brand-navy/90 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const renderPatientsTable = () => (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-lowest border-b border-outline-variant">
                    <tr>
                        <th className="px-6 py-4 font-bold tracking-wider">Nama Pasien</th>
                        <th className="px-6 py-4 font-bold tracking-wider">Patient ID</th>
                        <th className="px-6 py-4 font-bold tracking-wider text-center">Total Sesi</th>
                        <th className="px-6 py-4 font-bold tracking-wider">Sesi Terakhir</th>
                        <th className="px-6 py-4 font-bold tracking-wider text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                    {patientsList.map((patient) => (
                        <tr key={patient.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-charcoal">
                                {patient.name}
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-xs text-on-surface-variant font-mono truncate max-w-[150px] inline-block">{patient.id}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="font-bold text-medical-teal bg-medical-teal/10 px-3 py-1 rounded-full">
                                    {patient.totalSessions}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant">
                                {formatDate(patient.lastSessionDate)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => setSelectedUserId(patient.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-variant text-charcoal hover:bg-outline-variant/30 rounded-lg text-xs font-bold transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">folder_open</span>
                                    Lihat Riwayat
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="bg-background text-on-surface antialiased overflow-x-hidden w-full min-h-screen">
            <AdminSidebar />

            <main className={`flex flex-col transition-all duration-300 min-h-screen pb-12 w-full ${isOpen ? 'md:ml-[260px] md:w-[calc(100%-260px)]' : 'ml-0'}`}>
                {/* Header */}
                <header className="sticky top-0 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 z-40 px-4 md:px-6 py-4 flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                        <button onClick={toggleSidebar} className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-charcoal">Manajemen Sesi</h1>
                            <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase mt-1">Sistem Pemantauan Seluruh Rekaman</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
                    
                    <div className="bg-surface rounded-3xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
                        <div className="px-4 py-4 md:px-6 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-lowest gap-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-bold text-charcoal">
                                    {selectedUserId ? `Riwayat Pasien: ${patientNames[selectedUserId] || selectedUserId}` : 'Daftar Rekaman'}
                                </h2>
                                {!selectedUserId && (
                                    <div className="flex bg-surface-variant/40 rounded-lg p-1">
                                        <button 
                                            onClick={() => setViewMode('all')}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'all' ? 'bg-white shadow-sm text-brand-navy' : 'text-on-surface-variant hover:text-charcoal'}`}
                                        >
                                            Semua Rekaman
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('users')}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'users' ? 'bg-white shadow-sm text-brand-navy' : 'text-on-surface-variant hover:text-charcoal'}`}
                                        >
                                            Berdasarkan Pasien
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {selectedUserId && (
                                    <button 
                                        onClick={() => setSelectedUserId(null)}
                                        className="text-xs font-bold bg-surface-variant/50 hover:bg-surface-variant text-charcoal px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                        Kembali ke List Pasien
                                    </button>
                                )}
                                <div className="text-sm font-semibold text-on-surface-variant bg-surface-variant/30 px-3 py-1.5 rounded-lg">
                                    Total: {viewMode === 'users' && !selectedUserId ? patientsList.length : displayedSessions.length} {viewMode === 'users' && !selectedUserId ? 'Pasien' : 'Sesi'}
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-on-surface-variant">Memuat data sesi...</div>
                        ) : sessions.length === 0 ? (
                            <div className="p-12 text-center text-on-surface-variant font-medium">Belum ada sesi rekaman EKG.</div>
                        ) : (
                            viewMode === 'users' && !selectedUserId 
                                ? renderPatientsTable() 
                                : renderSessionsTable(displayedSessions)
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
