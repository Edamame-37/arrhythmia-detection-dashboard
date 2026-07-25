import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const QrScannerPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden w-full">


    <aside id="main-sidebar" className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] bg-surface-container-lowest border-r border-outline-variant flex-col z-50 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-outline-variant/30 cursor-pointer" onClick={() => navigate('/doctor/dashboard')}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuASRzHEz6GVTS-jC60ca6czzvMjB1SFiN9EANBd4QcQ7M0TZmxcsuweLI2606snGOBzNW0NUJFqF8IFFf0MYFw0FhGh7xTs-mwsjka9c1MYHX3MCKo0ZCEhWPr48oeWkbN3DFCzXBWv_hO4kotQ48fmB0p7Sl6A4Z65x7QYnmN72EVbdshvFRefbHzI4kCMEDjqKYoaqpyO5TzlPdpka4gK7VLSzRg1LPBVLwqszQg-tllZR-17H9wmnHUZXszE0pMfG1Oypi7N2QKm"
                alt="ecgrhythmia logo" className="w-8 h-8 object-contain" />
            <div className="text-xl font-extrabold tracking-tight select-none">
                <span className="text-brand-red">ecg</span><span className="text-brand-navy">rhythmia</span>
            </div>
        </div>
        <nav className="flex-1 px-4 mt-6 space-y-1">
            <Link to="/doctor/dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-medical-teal">dashboard</span>
                <span className="text-sm">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 bg-medical-teal text-white rounded-lg font-semibold shadow-sm transition-all" to="/doctor/qr-scanner">
                <span className="material-symbols-outlined">qr_code_scanner</span>
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
                <button onClick={() => navigate('/auth/login')} className="material-symbols-outlined text-outline text-lg group-hover:text-alert-red transition-colors">logout</button>
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
                    <h1 className="text-2xl font-bold tracking-tight text-charcoal">Scanner Pasien</h1>
                    <p className="text-xs text-on-surface-variant mt-0.5">Scan QR code atau masukkan ID Pasien</p>
                </div>
            </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">

                    <div className="flex flex-col gap-4">

                        <div className="w-full aspect-square bg-charcoal rounded-2xl relative shadow-inner border-4 border-surface-container overflow-hidden">

                            <div id="reader" className="absolute top-0 left-0 w-full h-full z-10 bg-charcoal"></div>

                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                <div className="relative w-[70%] h-[70%] border-2 border-white/50 rounded-xl overflow-hidden shadow-[0_0_0_9999px_rgba(45,52,54,0.6)]" id="scanner-ui">
                                    <div className="scanning-laser absolute left-0 right-0 h-1 bg-medical-teal shadow-[0_0_15px_#1A939E]"></div>
                                </div>
                            </div>

                            <span className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-2 bg-charcoal/80 backdrop-blur text-white text-xs font-bold uppercase tracking-widest rounded-full z-30 shadow-lg pointer-events-none border border-white/10 whitespace-nowrap">
                                Area Scan QR
                            </span>

                            <div id="camera-error" className="absolute top-0 left-0 w-full h-full z-40 hidden flex-col items-center justify-center bg-charcoal text-center px-6">
                                <span className="material-symbols-outlined text-outline text-4xl mb-2">no_photography</span>
                                <p className="text-sm text-white font-medium">Kamera tidak aktif.</p>
                                <p className="text-xs text-outline mt-1">Harap berikan izin akses kamera di browser Anda.</p>
                            </div>
                        </div>

                        <div className="flex justify-center mt-2">
                            <button id="switch-camera-btn" className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-medical-teal font-medium transition-colors">
                                <span className="material-symbols-outlined text-[18px]">switch_camera</span>
                                Ganti Kamera Depan/Belakang
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 h-full justify-center">
                        <div>
                            <h2 className="text-xl font-bold text-charcoal mb-2">Masukkan ID Manual</h2>
                            <p className="text-sm text-on-surface-variant mb-4">Gunakan kolom ini jika kamera bermasalah atau stiker QR rusak.</p>
                            <input id="manual-input" type="text" placeholder="Contoh: PAT-1234-XYZ" className="w-full bg-surface border border-outline-variant rounded-lg p-4 text-base focus:ring-2 focus:ring-medical-teal focus:border-medical-teal outline-none font-mono-data" />
                        </div>
                        <button id="search-btn" className="w-full bg-medical-teal text-white py-4 rounded-lg font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                            Cari Pasien
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </main>

    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant grid grid-cols-5 py-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe">
        <Link className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-medical-teal" to="/doctor/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[9px] font-medium">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-0.5 text-medical-teal" to="/doctor/qr-scanner">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>qr_code_scanner</span>
            <span className="text-[9px] font-bold">Scan QR</span>
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

    <div className="fixed inset-0 z-[100] hidden items-center justify-center p-4 glass-overlay" id="success-modal">
        <div className="bg-surface w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-signal-green" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Pasien Ditemukan!</h3>
            <p className="text-sm text-on-surface-variant mb-6">ID: <span id="modal-patient-id" className="font-bold font-mono-data text-charcoal"></span></p>

            <div className="space-y-3">
                <button onClick={() => navigate('/doctor/monitor')} className="w-full bg-medical-teal text-white py-3 rounded-lg font-bold shadow-md hover:brightness-110 transition-all active:scale-95">
                    Mulai Pemantauan
                </button>
                <button onClick={() => alert('Fitur segera hadir!')} className="w-full text-on-surface-variant font-bold text-sm py-2 hover:text-charcoal transition-colors">
                    Batal
                </button>
            </div>
        </div>
    </div>

    

    </div>
  );
};
