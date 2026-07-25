import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ClinicalSettingsPage: React.FC = () => {
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
            <Link to="/doctor/settings" className="flex items-center gap-3 px-4 py-3 bg-medical-teal text-white rounded-lg font-semibold shadow-sm transition-all">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>settings</span>
                <span className="text-sm whitespace-nowrap">Preferensi Sistem</span>
            </Link>
        </nav>

        <div className="p-4 border-t border-outline-variant/40 bg-surface-container-low/50">
            <Link to="/doctor/profile" className="flex bg-surface border border-outline-variant/50 p-3 rounded-lg items-center gap-3 hover:border-medical-teal transition-all group">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                    <img className="w-full h-full object-cover" alt="Dr. Sarah Johnson" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKFp_wvFmUuADAL6NWAkXvGyrNxRRVsdgRmCQBELBwFPH1HZGNuDklfDMq7YuB2PoUTz3ja4HbcIq3jeeCpPbyE4vMK4pvYbt60pW-exopWU-r3cmCEuoH_dGA1fAzwYMa75F05aG323wbHFSAdAvkrZ_qC1_VOq07Lod47Nao8CGSkO-1gZnCFMupk5lA7SVfImIoHr31T4QO-bkIvoWeg1nYQzyblnQmCe4adHD4tv_FEVhDy6B1gDg_UgEefxQ10aoRBxvd9DwQ" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-xs text-on-surface truncate group-hover:text-medical-teal transition-colors">Dr. Sarah Johnson</p>
                    <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-wider font-medium">Cardiologist</p>
                </div>
                <button onClick={() => navigate('/auth/login')} className="material-symbols-outlined text-outline text-lg group-hover:text-alert-red transition-colors flex-shrink-0">logout</button>
            </Link>
        </div>
    </aside>

    <div className="flex-1 flex flex-col min-w-0 bg-background relative transition-all duration-300">

        <header className="flex-shrink-0 h-16 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-6 z-40">
            <div className="flex items-center gap-3">
                <button id="toggle-sidebar-btn" className="hidden md:flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h1 className="text-xl font-bold text-charcoal tracking-tight">Pengaturan Klinis</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative flex gap-2 hidden sm:flex">
                    <button className="relative cursor-pointer hover:bg-surface-container p-2 rounded-full transition-colors outline-none">
                        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-vibrant-red rounded-full ring-2 ring-white"></span>
                    </button>
                    <button className="relative cursor-default bg-surface-container p-2 rounded-full outline-none text-medical-teal" title="Pengaturan Klinis">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>settings</span>
                    </button>
                </div>

                <button onClick={() => alert('Fitur segera hadir!')} className="bg-medical-teal hover:brightness-110 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm text-sm">
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span className="hidden sm:inline">Simpan Perubahan</span>
                </button>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <div className="max-w-4xl mx-auto space-y-8 pb-20">

                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden bento-card">
                    <div className="border-b border-outline-variant p-5 bg-surface-container-low/30">
                        <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                            <span className="material-symbols-outlined text-medical-teal">monitor_heart</span> Konfigurasi Tampilan EKG
                        </h2>
                        <p className="text-xs text-on-surface-variant mt-1">Pengaturan *default* kanvas grafik untuk Live Monitor dan Riwayat Sesi.</p>
                    </div>
                    <div className="p-6 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Kecepatan Kertas (Paper Speed)</label>
                                <select className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-medical-teal outline-none font-medium text-charcoal cursor-pointer">
                                    <option value="25" selected>25 mm/s (Standar Klinis)</option>
                                    <option value="50">50 mm/s (Resolusi Tinggi)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Skala Amplitudo (Gain)</label>
                                <select className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-medical-teal outline-none font-medium text-charcoal cursor-pointer">
                                    <option value="5">5 mm/mV</option>
                                    <option value="10" selected>10 mm/mV (Standar Klinis)</option>
                                    <option value="20">20 mm/mV</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-charcoal">Filter Artefak (Base Line Wander)</h4>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Otomatis menstabilkan gelombang akibat pernapasan pasien.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" checked />
                                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-teal"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-charcoal">Notch Filter (50/60Hz AC Noise)</h4>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Menghilangkan gangguan statis dari aliran listrik sekitar.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" checked />
                                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-medical-teal"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden bento-card">
                    <div className="border-b border-outline-variant p-5 bg-surface-container-low/30">
                        <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                            <span className="material-symbols-outlined text-alert-red">notifications_active</span> Ambang Batas Medis & Alarm
                        </h2>
                        <p className="text-xs text-on-surface-variant mt-1">Konfigurasi kapan sistem AI membunyikan peringatan kritis.</p>
                    </div>
                    <div className="p-6 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Batas Tachycardia (BPM Atas)</label>
                                <div className="relative">
                                    <input type="number" value="110" className="w-full bg-surface border border-outline-variant rounded-lg p-3 pr-16 text-sm focus:ring-2 focus:ring-alert-red focus:border-alert-red outline-none font-mono-data text-charcoal" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">BPM</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Batas Bradycardia (BPM Bawah)</label>
                                <div className="relative">
                                    <input type="number" value="50" className="w-full bg-surface border border-outline-variant rounded-lg p-3 pr-16 text-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal outline-none font-mono-data text-charcoal" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">BPM</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Sensitivitas AI (Deteksi Aritmia)</label>
                            <div className="flex border border-outline-variant rounded-lg overflow-hidden p-1 bg-surface-container">
                                <button className="flex-1 py-2 text-xs font-bold text-on-surface-variant hover:bg-white rounded transition-all">Rendah (Sedikit Alarm)</button>
                                <button className="flex-1 py-2 text-xs font-bold bg-white text-medical-teal rounded shadow-sm transition-all border border-outline-variant/30">Normal (Standar)</button>
                                <button className="flex-1 py-2 text-xs font-bold text-on-surface-variant hover:bg-white rounded transition-all">Tinggi (Kritis / ICU)</button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-charcoal">Notifikasi Audio Alarm</h4>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Mainkan suara beep berulang jika VT/VF terdeteksi.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" checked />
                                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-alert-red"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden bento-card">
                    <div className="border-b border-outline-variant p-5 bg-surface-container-low/30">
                        <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                            <span className="material-symbols-outlined text-charcoal">cloud_sync</span> Sinkronisasi Perangkat Keras
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-low border border-outline-variant p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-signal-green text-[32px]">wifi_tethering</span>
                                <div>
                                    <h4 className="text-sm font-bold text-charcoal">Auto-Connect ECGRhythmia Hardware</h4>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Langsung menambat perangkat jika berada di jaringan Wi-Fi yang sama.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                <input type="checkbox" value="" className="sr-only peer" checked />
                                <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-signal-green"></div>
                            </label>
                        </div>
                    </div>
                </section>

            </div>
        </main>
    </div>

    <div className="fixed bottom-8 right-8 bg-charcoal text-white px-6 py-4 rounded-xl shadow-2xl translate-y-24 opacity-0 transition-all duration-500 flex items-center gap-3 z-50 border border-outline-variant/30" id="saveToast">
        <span className="material-symbols-outlined text-medical-teal" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
        <span className="font-bold text-sm tracking-wide">Pengaturan berhasil diperbarui.</span>
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
        <Link className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-medical-teal" to="/doctor/profile">
            <span className="material-symbols-outlined">account_circle</span>
            <span className="text-[9px] font-medium">Profil</span>
        </Link>
    </nav>

    

    </div>
  );
};
