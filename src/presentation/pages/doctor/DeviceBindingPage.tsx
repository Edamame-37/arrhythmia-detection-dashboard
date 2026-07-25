import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const DeviceBindingPage: React.FC = () => {
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
            <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group" to="/doctor/dashboard">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">dashboard</span>
                <span className="text-sm">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group" to="/doctor/qr-scanner">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">qr_code_scanner</span>
                <span className="text-sm">Pasien Baru (QR)</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 bg-medical-teal text-white rounded-lg font-semibold shadow-sm transition-all" to="/doctor/device-binding">
                <span className="material-symbols-outlined">cable</span>
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

    <main id="main-content" className="md:ml-[260px] min-h-screen pb-24 md:pb-12 transition-all duration-300 relative">

        <header className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 z-40 px-6 py-4 flex justify-between items-center max-w-container-max mx-auto">
            <div className="flex items-center gap-3">
                <button id="toggle-sidebar-btn" className="hidden md:flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-charcoal">Penambatan Alat Medis</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Manajemen perangkat ECGRhythmia aktif</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative cursor-pointer group p-2 hover:bg-surface-container rounded-full transition-all">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: '"FILL" 0' }}>notifications</span>
                </div>
                <button onClick={() => navigate('/doctor/qr-scanner')} className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm text-sm">
                    <span className="material-symbols-outlined text-base">add</span>
                    <span className="hidden sm:inline">Pasien Baru</span>
                </button>
            </div>
        </header>

        <div className="px-6 max-w-container-max mx-auto mt-8 z-10 relative">

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-charcoal mb-2">Pindai Perangkat Lokal</h2>
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-medical-teal rounded-full animate-pulse-teal"></div>
                    <p className="text-sm font-medium text-on-surface-variant">Memindai jaringan Wi-Fi untuk perangkat aktif...</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <div className="bg-surface-container-lowest border-2 border-medical-teal rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgba(26,147,158,0.12)]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-medical-teal/10 rounded-lg">
                            <span className="material-symbols-outlined text-medical-teal text-3xl">developer_board</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-signal-green rounded-full"></div>
                            <span className="text-green-700 text-[10px] font-bold uppercase tracking-wider">Tersedia</span>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-charcoal mb-1">ECGR-01</h3>
                    <p className="text-sm text-outline font-mono-data mb-8">MAC: 00:1A:2B:3C:4D:5E</p>

                    <button onClick={() => alert('Fitur segera hadir!')} className="w-full bg-medical-teal hover:brightness-110 text-white py-3 rounded-lg font-bold transition-all active:scale-95 shadow-sm">
                        Hubungkan Alat
                    </button>
                </div>

                <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 opacity-80 grayscale-[0.3]">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-outline-variant/30 rounded-lg">
                            <span className="material-symbols-outlined text-outline text-3xl">developer_board</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-alert-red rounded-full"></div>
                            <span className="text-red-700 text-[10px] font-bold uppercase tracking-wider">Terkunci (Soft Mutex)</span>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-charcoal mb-1">ECGR-02</h3>
                    <p className="text-sm text-alert-red font-medium mb-8">Aktif digunakan Nakes Lain</p>

                    <button className="w-full bg-outline-variant text-white cursor-not-allowed py-3 rounded-lg font-bold" disabled>
                        Tidak Tersedia
                    </button>
                </div>
            </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-40 pointer-events-none opacity-5 overflow-hidden z-0">
            <svg className="w-full h-full preserve-3d" viewBox="0 0 1440 320">
                <path className="animate-[dash_10s_linear_infinite]" d="M0,160L40,144C80,128,160,96,240,112C320,128,400,192,480,208C560,224,640,192,720,160C800,128,880,96,960,112C1040,128,1120,192,1200,181.3C1280,171,1360,85,1400,42.7L1440,0" fill="none" stroke="#1A939E" strokeWidth="2"></path>
            </svg>
        </div>
    </main>

    <div className="fixed inset-0 z-[100] hidden items-center justify-center p-4 glass-overlay" id="pinModal">
        <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-outline-variant">
            <div className="p-8">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-medical-teal/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-medical-teal text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>vpn_key</span>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-center text-charcoal mb-2">Masukkan PIN Alat</h2>
                <p className="text-sm text-center text-on-surface-variant mb-8 px-4">
                    Masukkan 6-digit PIN fisis di balik perangkat <span className="font-bold text-medical-teal">ECGR-01</span>.
                </p>
                <div className="flex justify-between gap-2 mb-10">
                    <input autoFocus className="w-12 h-14 text-center text-2xl font-bold bg-surface-container-low border border-outline-variant rounded-lg focus:border-medical-teal focus:ring-2 focus:ring-medical-teal/20 outline-none transition-all" maxLength={1} type="text" />
                    <input className="w-12 h-14 text-center text-2xl font-bold bg-surface-container-low border border-outline-variant rounded-lg focus:border-medical-teal focus:ring-2 focus:ring-medical-teal/20 outline-none transition-all" maxLength={1} type="text" />
                    <input className="w-12 h-14 text-center text-2xl font-bold bg-surface-container-low border border-outline-variant rounded-lg focus:border-medical-teal focus:ring-2 focus:ring-medical-teal/20 outline-none transition-all" maxLength={1} type="text" />
                    <input className="w-12 h-14 text-center text-2xl font-bold bg-surface-container-low border border-outline-variant rounded-lg focus:border-medical-teal focus:ring-2 focus:ring-medical-teal/20 outline-none transition-all" maxLength={1} type="text" />
                    <input className="w-12 h-14 text-center text-2xl font-bold bg-surface-container-low border border-outline-variant rounded-lg focus:border-medical-teal focus:ring-2 focus:ring-medical-teal/20 outline-none transition-all" maxLength={1} type="text" />
                    <input className="w-12 h-14 text-center text-2xl font-bold bg-surface-container-low border border-outline-variant rounded-lg focus:border-medical-teal focus:ring-2 focus:ring-medical-teal/20 outline-none transition-all" maxLength={1} type="text" />
                </div>

                <button onClick={() => navigate('/doctor/dashboard')} className="w-full bg-medical-teal hover:brightness-110 text-white py-4 rounded-lg font-bold text-base shadow-md transition-all active:scale-95">
                    Verifikasi & Kunci Alat
                </button>
                <button className="w-full mt-4 text-on-surface-variant font-bold text-sm py-2 hover:text-charcoal transition-colors" onClick={() => {}} data-legacy-onclick="hideModal()">
                    Batal
                </button>
            </div>
            <div className="bg-surface-container py-3 px-8 border-t border-outline-variant flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-outline">lock</span>
                    <span className="text-[10px] text-outline font-bold uppercase tracking-widest">Koneksi Dienkripsi AES-256</span>
                </div>
            </div>
        </div>
    </div>

    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant grid grid-cols-5 py-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <Link className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-medical-teal" to="/doctor/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[9px] font-medium">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-medical-teal" to="/doctor/qr-scanner">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span className="text-[9px] font-medium">Scan QR</span>
        </Link>
        <Link className="flex flex-col items-center gap-0.5 text-medical-teal" to="/doctor/device-binding">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>cable</span>
            <span className="text-[9px] font-bold">Alat</span>
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
