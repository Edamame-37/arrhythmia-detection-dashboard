import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden w-full">


    <aside id="main-sidebar" className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] bg-surface-container-lowest border-r border-outline-variant flex-col z-50 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-outline-variant/30 cursor-pointer" onClick={() => navigate('/doctor/dashboard')}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJfACqMSzy6S1S81otlvrhfNIHr526OT9XlgCl04PJNewQysO-szQBYwNy1CAVfF851GuVn5qSOMjNWQdVGWANcLFnC4v9hdbnEGw6a6zjZHiO-z3KrczLQUpmNPbJBK3DPcvSUNAMyxXlVaN3XK5XqDW2MwFfclgdHRXsKHmF-u3QnVmzkBpw6dRTGNCyHk4YD526zmZNozyix_CMqEgOacA2M9LUFTaMDhBfigT5e7htUaxvw6bZCKeoVwqQgtQxho0qkC32iy0g"
                alt="ecgrhythmia logo" className="w-8 h-8 object-contain" />
            <div className="text-xl font-extrabold tracking-tight select-none flex">
                <span className="text-brand-red">ecg</span><span className="text-brand-navy">rhythmia</span>
            </div>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-1">
            <Link className="flex items-center gap-3 px-4 py-3 bg-medical-teal text-white rounded-lg font-semibold shadow-sm transition-all" to="/doctor/dashboard">
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-sm">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group" to="/doctor/qr-scanner">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">qr_code_scanner</span>
                <span className="text-sm">Pasien Baru (QR)</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group" to="/doctor/device-binding">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">cable</span>
                <span className="text-sm">Penambatan Alat</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group" to="/doctor/analytics">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">history</span>
                <span className="text-sm">Riwayat Klinis</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group" to="/doctor/settings">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">settings</span>
                <span className="text-sm">Preferensi Sistem</span>
            </Link>
        </nav>

        <div className="p-4 border-t border-outline-variant/40 bg-surface-container-low/50">
            <Link to="/doctor/profile" className="flex bg-surface border border-outline-variant/50 p-3 rounded-lg items-center gap-3 hover:border-medical-teal transition-all group">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant">
                    <img className="w-full h-full object-cover" alt="Dr. Sarah" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJnW83EbvA5v2Xigf0wqmbI5jrKwsPF00DTG43yZhygP2i7bPT6QKmb8NETNv7aD3XIwaQT7AHRoU-e64ocs4nbb24kazsCZEwZAyqEqSceqqphkwPVv7MqWPDbLo2o_ltAdvTadtvzDDQwiAYKEErG53lECKzOCU8d538KrEbQlwWxwOlwMLF92lujNxnhG1EwgY5kF19w2_IN_EwSb3QlxXIUweD2_OQeWW20_flE7_reevsn4K9jKf7Vx34kMIWyJkr8mM7dXcx" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-xs text-on-surface truncate group-hover:text-medical-teal transition-colors">Dr. Sarah Puspita</p>
                    <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-wider font-medium">Spesialis Jantung</p>
                </div>
                <span className="material-symbols-outlined text-outline text-lg group-hover:text-alert-red transition-colors">logout</span>
            </Link>
        </div>
    </aside>

    <main id="main-content" className="md:ml-[260px] min-h-screen pb-24 md:pb-12 transition-all duration-300">

        <header className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 z-40 px-6 py-4 flex justify-between items-center max-w-container-max mx-auto">
            <div className="flex items-center gap-3">
                <button id="toggle-sidebar-btn" className="hidden md:flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-charcoal">Dashboard Utama Klinis</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Senin, 18 Juni 2026 • Stasiun Kardiologi Pusat</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative cursor-pointer group p-2 hover:bg-surface-container rounded-full transition-all">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: '"FILL" 0' }}>notifications</span>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full ring-2 ring-background"></span>
                </div>
                <button onClick={() => navigate('/doctor/qr-scanner')} className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm text-sm">
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Pasien Baru</span>
                </button>
            </div>
        </header>

        <div className="px-6 max-w-container-max mx-auto mt-6">

            <section className="mb-6">
                <div className="bg-red-50 border-2 border-alert-red rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-pulse-red">
                    <div className="flex gap-4">
                        <div className="bg-alert-red text-white p-3 rounded-lg h-fit flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-alert-red uppercase tracking-wide">Peringatan Anomali Kritis Terdeteksi!</h2>
                            <p className="text-sm text-on-surface-variant mt-1">
                                <span className="font-bold text-charcoal">Pasien:</span> Tn. Ahmad Hidayat <span className="text-outline mx-2">|</span>
                                <span className="font-bold text-charcoal">Aritmia:</span> Ventricular Tachycardia (VT) <span className="text-outline mx-2">|</span>
                                <span className="font-bold text-charcoal font-mono-data">Alat: ECGR-02</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/doctor/monitor')} className="w-full lg:w-auto bg-alert-red hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-sm">
                        <span>Tinjau Live Monitor</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-alert-red animate-ping"></span>
                    <span>Sesi Perekaman Aktif Bedside</span>
                </h2>
                <div className="bg-surface border border-outline-variant/60 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center font-bold text-alert-red text-base">
                            AH
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-charcoal">Tn. Ahmad Hidayat</h3>
                            <p className="text-xs text-on-surface-variant font-mono-data mt-0.5">SN Perangkat: ECGR-02</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="px-3 py-1 bg-red-100 text-alert-red rounded-full text-xs font-bold uppercase tracking-wider animate-pulse border border-red-200">
                            VT Crisis
                        </span>
                        <button onClick={() => navigate('/doctor/monitor')} className="bg-medical-teal hover:bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95">
                            Buka Monitor
                        </button>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-charcoal">Riwayat Pasien Terhubung Sesi Ini</h2>
                    <button onClick={() => navigate('/doctor/analytics')} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                        <span>Lihat Semua Arsip</span>
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="bg-surface border border-outline-variant/60 p-4 rounded-xl flex items-center justify-between gap-4 opacity-80 interactive-card">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-outline">
                                BS
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-charcoal">Budi Santoso</h4>
                                <p className="text-xs text-on-surface-variant font-mono-data mt-0.5">SN: ECGR-01 • Hari ini, 08:30 WIB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-md text-[11px] font-bold uppercase tracking-wider border border-outline-variant/30">
                                Terputus
                            </span>
                            <button onClick={() => navigate('/doctor/analytics')} className="border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface transition-all">
                                Analisis Sesi
                            </button>
                        </div>
                    </div>

                    <div className="bg-surface border border-outline-variant/60 p-4 rounded-xl flex items-center justify-between gap-4 opacity-80 interactive-card">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-outline">
                                LW
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-charcoal">Ny. Laksmiwati</h4>
                                <p className="text-xs text-on-surface-variant font-mono-data mt-0.5">SN: ECGR-15 • Kemarin, 14:15 WIB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-md text-[11px] font-bold uppercase tracking-wider border border-outline-variant/30">
                                Terputus
                            </span>
                            <button onClick={() => navigate('/doctor/analytics')} className="border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface transition-all">
                                Analisis Sesi
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant grid grid-cols-5 py-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <Link className="flex flex-col items-center gap-0.5 text-medical-teal" to="/doctor/dashboard">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>dashboard</span>
            <span className="text-[9px] font-bold">Home</span>
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
        <Link className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-medical-teal" to="/doctor/profile">
            <span className="material-symbols-outlined">account_circle</span>
            <span className="text-[9px] font-medium">Profil</span>
        </Link>
    </nav>

    

    </div>
  );
};
