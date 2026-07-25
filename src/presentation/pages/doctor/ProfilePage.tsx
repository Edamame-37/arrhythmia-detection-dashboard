import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background text-on-surface antialiased overflow-hidden flex h-screen w-full">


    <aside id="main-sidebar" className="hidden md:flex flex-col w-[260px] flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant z-50 transition-all duration-300 overflow-hidden">

        <div className="p-6 flex items-center gap-3 border-b border-outline-variant/30 cursor-pointer" onClick={() => navigate('/doctor/dashboard')}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4XP45RnDaeVvpR9HXIsxSv6vyBpVim6N-8hpPban0w051xEHKegwIgoCcQF5sdmfXODNZPwlBOj8oSyIfyn5KAVvqa8tOcoP93K5m7geVrlNNaox6U7xyYOEVSUgk8-zzBQaPQm5lQTA9rfxI2DB1Vi--EtPHXIQePYEm6unAUAL0F5VZBqlnqa1aSbDgA5XKgK7_Jdv0u5tmIr-SbIRyRrI0yo30zY9FvghBGGI4ENnETp3un6OY8EHIafV5wRLJH2InVnRxXSce"
                alt="ecgrhythmia logo" className="w-8 h-8 object-contain" />
            <div className="text-xl font-extrabold tracking-tight select-none flex">
                <span className="text-brand-red">ecg</span><span className="text-brand-navy">rhythmia</span>
            </div>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
            <Link to="/doctor/dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">dashboard</span>
                <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>
            </Link>
            <Link to="/doctor/qr-scanner" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">qr_code_scanner</span>
                <span className="text-sm font-medium whitespace-nowrap">Pasien Baru (QR)</span>
            </Link>
            <Link to="/doctor/device-binding" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">cable</span>
                <span className="text-sm font-medium whitespace-nowrap">Penambatan Alat</span>
            </Link>
            <Link to="/doctor/analytics" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">history</span>
                <span className="text-sm font-medium whitespace-nowrap">Riwayat Klinis</span>
            </Link>
            <Link to="/doctor/settings" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">settings</span>
                <span className="text-sm font-medium whitespace-nowrap">Preferensi Sistem</span>
            </Link>
        </nav>

        <div className="p-4 border-t border-outline-variant/40 bg-surface-container-low/50">
            <Link to="/doctor/profile" className="flex bg-medical-teal text-white border border-medical-teal p-3 rounded-lg items-center gap-3 transition-all group shadow-sm">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/50 flex-shrink-0">
                    <img className="w-full h-full object-cover" alt="Dr. Sarah Johnson" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKFp_wvFmUuADAL6NWAkXvGyrNxRRVsdgRmCQBELBwFPH1HZGNuDklfDMq7YuB2PoUTz3ja4HbcIq3jeeCpPbyE4vMK4pvYbt60pW-exopWU-r3cmCEuoH_dGA1fAzwYMa75F05aG323wbHFSAdAvkrZ_qC1_VOq07Lod47Nao8CGSkO-1gZnCFMupk5lA7SVfImIoHr31T4QO-bkIvoWeg1nYQzyblnQmCe4adHD4tv_FEVhDy6B1gDg_UgEefxQ10aoRBxvd9DwQ" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-xs truncate transition-colors">Dr. Sarah Johnson</p>
                    <p className="text-[10px] text-white/80 truncate uppercase tracking-wider font-medium">Cardiologist</p>
                </div>
                <button onClick={() => navigate('/auth/login')} className="material-symbols-outlined text-white/80 text-lg hover:text-white transition-colors flex-shrink-0">logout</button>
            </Link>
        </div>
    </aside>

    <div className="flex-1 flex flex-col min-w-0 bg-background relative transition-all duration-300">

        <header className="flex-shrink-0 h-16 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-6 z-40">
            <div className="flex items-center gap-3">
                <button id="toggle-sidebar-btn" className="hidden md:flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h1 className="text-xl font-bold text-charcoal tracking-tight">Profil Dokter</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative flex gap-2 hidden sm:flex">
                    <button className="relative cursor-pointer hover:bg-surface-container p-2 rounded-full transition-colors outline-none">
                        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-vibrant-red rounded-full ring-2 ring-white"></span>
                    </button>
                    <button onClick={() => navigate('/doctor/settings')} className="relative cursor-pointer hover:bg-surface-container p-2 rounded-full transition-colors outline-none" title="Pengaturan Klinis">
                        <span className="material-symbols-outlined text-on-surface-variant">settings</span>
                    </button>
                </div>
                <button onClick={() => navigate('/auth/login')} className="bg-surface border border-outline-variant hover:bg-surface-container-low text-alert-red px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm text-sm">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span className="hidden sm:inline">Keluar</span>
                </button>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm flex flex-col items-center text-center bento-card relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-medical-teal/10"></div>
                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 mt-8">
                            <img alt="Dr. Sarah Johnson, MD Profile Picture" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKFp_wvFmUuADAL6NWAkXvGyrNxRRVsdgRmCQBELBwFPH1HZGNuDklfDMq7YuB2PoUTz3ja4HbcIq3jeeCpPbyE4vMK4pvYbt60pW-exopWU-r3cmCEuoH_dGA1fAzwYMa75F05aG323wbHFSAdAvkrZ_qC1_VOq07Lod47Nao8CGSkO-1gZnCFMupk5lA7SVfImIoHr31T4QO-bkIvoWeg1nYQzyblnQmCe4adHD4tv_FEVhDy6B1gDg_UgEefxQ10aoRBxvd9DwQ"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-charcoal tracking-tight">Dr. Sarah Johnson, MD</h2>
                        <p className="text-sm font-medium text-medical-teal uppercase tracking-widest mt-1">Lead Cardiologist</p>

                        <div className="mt-6 w-full space-y-3 text-left border-t border-outline-variant/50 pt-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary text-[18px]">badge</span>
                                <div>
                                    <p className="text-[10px] text-outline uppercase font-bold tracking-wider">SIP / License</p>
                                    <p className="text-sm font-bold text-charcoal font-mono-data">33.2.1/3452/12/2026</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary text-[18px]">mail</span>
                                <div>
                                    <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Email Medis</p>
                                    <p className="text-sm font-bold text-charcoal">sarah.j@clinic.ecgrhythmia.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary text-[18px]">domain</span>
                                <div>
                                    <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Afiliasi Rumah Sakit</p>
                                    <p className="text-sm font-bold text-charcoal">Stasiun Kardiologi Pusat</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-8 border border-medical-teal text-medical-teal font-bold py-2.5 rounded-lg hover:bg-medical-teal/5 transition-colors">
                            Edit Profil
                        </button>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm bento-card">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-medical-teal">link</span>
                            <h3 className="text-base font-bold text-charcoal">Penautan Faskes</h3>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-4">Kode penautan unik Anda untuk menghubungkan akun pasien ke konsol pengawasan Anda.</p>
                        <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between border border-outline-variant/60">
                            <div>
                                <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Kode Dokter</p>
                                <p className="text-xl font-bold font-mono-data tracking-[0.2em] text-charcoal">F-12345</p>
                            </div>
                            <button className="p-2 hover:bg-surface-container rounded-md transition-colors text-primary" title="Salin Kode">
                                <span className="material-symbols-outlined text-[20px]">content_copy</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-6">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm bento-card border-t-4 border-t-primary">
                            <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Pasien Aktif</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-extrabold text-charcoal">42</h3>
                                <span className="text-xs font-bold text-signal-green flex items-center"><span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12%</span>
                            </div>
                        </div>
                        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm bento-card border-t-4 border-t-medical-teal">
                            <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Total Sesi Direview</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-extrabold text-charcoal">1,204</h3>
                            </div>
                        </div>
                        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm bento-card border-t-4 border-t-alert-red">
                            <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Deteksi VT</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-extrabold text-charcoal">18</h3>
                                <span className="text-xs font-bold text-secondary">Bulan Ini</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm bento-card">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-charcoal">security</span>
                                <h3 className="text-base font-bold text-charcoal">Keamanan & Akses</h3>
                            </div>
                            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1 uppercase tracking-wider border border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-signal-green"></span> Secured
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-outline-variant/40">
                                <div>
                                    <p className="text-sm font-bold text-charcoal">Kata Sandi</p>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Terakhir diubah 3 bulan lalu</p>
                                </div>
                                <button className="text-sm font-bold text-medical-teal hover:text-primary transition-colors">Ubah</button>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-outline-variant/40">
                                <div>
                                    <p className="text-sm font-bold text-charcoal">Autentikasi Dua Faktor (2FA)</p>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Menggunakan Google Authenticator</p>
                                </div>
                                <button className="text-sm font-bold text-alert-red hover:text-red-800 transition-colors">Nonaktifkan</button>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-bold text-charcoal">Sesi Aktif Saat Ini</p>
                                    <p className="text-xs text-on-surface-variant mt-0.5 font-mono-data">IP: 192.168.1.45 (Semarang, ID)</p>
                                </div>
                                <button className="text-sm font-bold text-medical-teal hover:text-primary transition-colors">Log Out Lainnya</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden bento-card flex flex-col h-full">
                        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-charcoal">terminal</span>
                                <h3 className="text-base font-bold text-charcoal">Log Aktivitas Sistem</h3>
                            </div>
                            <button className="text-xs font-bold text-medical-teal flex items-center gap-1 hover:underline">Lihat Semua <span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-outline-variant bg-surface-container-low/50">
                                        <th className="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Aktivitas</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-wider">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-charcoal">
                                    <tr className="hover:bg-surface-container-low/50 transition-colors border-b border-outline-variant/30">
                                        <td className="px-6 py-4 font-medium">Login via Web Console</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-[10px] font-bold border border-green-200">SUCCESS</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono-data text-xs text-on-surface-variant">18 June 2026, 08:35</td>
                                    </tr>
                                    <tr className="hover:bg-surface-container-low/50 transition-colors border-b border-outline-variant/30">
                                        <td className="px-6 py-4 font-medium">Review Sesi EKG Budi Santoso</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-[10px] font-bold border border-green-200">SUCCESS</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono-data text-xs text-on-surface-variant">18 June 2026, 09:12</td>
                                    </tr>
                                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">Gagal Menautkan Perangkat ECGR-09</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-bold border border-red-200">FAILED</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono-data text-xs text-on-surface-variant">17 June 2026, 16:40</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant grid grid-cols-5 py-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe">
        <Link className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-medical-teal" to="/doctor/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[9px] font-medium">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-medical-teal" to="/doctor/qr-scanner">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span className="text-[9px] font-medium">Scan QR</span>
        </Link>
        <Link className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-medical-teal" to="/doctor/device-binding">
            <span className="material-symbols-outlined">cable</span>
            <span className="text-[9px] font-medium">Alat</span>
        </Link>
        <Link className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-medical-teal" to="/doctor/analytics">
            <span className="material-symbols-outlined">history</span>
            <span className="text-[9px] font-medium">Riwayat</span>
        </Link>
        <Link className="flex flex-col items-center gap-0.5 text-medical-teal" to="/doctor/profile">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>account_circle</span>
            <span className="text-[9px] font-bold">Profil</span>
        </Link>
    </nav>

    

    </div>
  );
};
