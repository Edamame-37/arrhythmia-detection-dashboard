import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const PrivacyControlPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="text-on-surface w-full">

{/* TopAppBar */}
<header className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-outline-variant flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 max-w-container-max mx-auto">
<div className="flex items-center gap-3">
<img alt="ecgrhythmia logo" className="h-8 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEvGE-Jl6muSsxMgJHFbw1PqbWpmiWINlxj1OCuk8UL8G55azU4BxJdcvZyrXjLhKuAexdWSpbjxAjx3KcgWRXV-zyML7GFL0sJN8w9kxVIBcckkQtRvNwwMXcGhwPW3Vs5UIbaGfSJouyQTfedh6GkfgCUpmqspe5UPD09F29I2fQv0NM13uSD27yEKppp1_eKZ-gFcirC0oxq6k6hC_k5pyJGzc0fIYJlgr4Tq0mLCxW7UpPA3U6peIWBymkSxiOBQdDM_YWdl-e"/>
<h1 className="font-bold text-headline-md leading-none flex items-center">
<span className="text-brand-red">ecg</span><span className="text-brand-navy">rhythmia</span>
</h1>
</div>
<Link className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer font-label-md text-label-md group" to="/patient/dashboard"><div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant mr-2"><img alt="Budi Santoso" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ0uEsAKEJ35lYFco-uP_vXQ6H-pXYfl4gMz5Tu4x5cIRXy_OUpMD68BU_iIYd2zfCcdMordvK3mPI_DkqchZifxr3BV9omv2qzSipTCs8WkY-x0uudqBJ54VzaA9W6_NyVAUJ_Rb8rYSodpiC7L-91vz0MrYpI3F6yZ32er1x6AlM-P02VbBkAatansWqbncKJzLpfQJIcOUvsJwkzQ_3nDbpYi1yC8uox5YF6IV5AgVX3uwbngpSkxuR4-InIetFQiCUP9yI5yBf"/></div>
<span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
            Kembali ke Beranda
        </Link>
</header>
<main className="pt-24 pb-32 px-4">
<div className="max-w-2xl mx-auto space-y-6">
{/* Card 1: Informasi Medis Pribadi */}
<section className="clinical-card rounded-2xl p-8 flex flex-col items-center">
<div className="relative mb-4 group">
<div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-low shadow-sm">
<img className="w-full h-full object-cover" data-alt="A clean, professional portrait of a 58-year-old Indonesian man named Budi Santoso with a warm, friendly expression. The lighting is soft and natural, typical of a professional medical portal avatar. He is wearing a simple, high-quality white polo shirt against a minimalist, light gray clinical background that suggests a modern healthcare environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ0uEsAKEJ35lYFco-uP_vXQ6H-pXYfl4gMz5Tu4x5cIRXy_OUpMD68BU_iIYd2zfCcdMordvK3mPI_DkqchZifxr3BV9omv2qzSipTCs8WkY-x0uudqBJ54VzaA9W6_NyVAUJ_Rb8rYSodpiC7L-91vz0MrYpI3F6yZ32er1x6AlM-P02VbBkAatansWqbncKJzLpfQJIcOUvsJwkzQ_3nDbpYi1yC8uox5YF6IV5AgVX3uwbngpSkxuR4-InIetFQiCUP9yI5yBf"/>
</div>
<button className="absolute bottom-0 right-0 bg-primary text-on-primary p-1.5 rounded-full shadow-lg border-2 border-white hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
</div>
<h2 className="font-headline-md text-headline-md text-on-surface font-bold">Budi Santoso</h2>
<p className="font-mono-data text-mono-data text-on-surface-variant tracking-wider uppercase">Nomor Rekam Medis: RM-9824-XYZ</p><div className="mt-2 inline-flex items-center px-3 py-1 bg-teal-50 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-teal-100">Status Sinkronisasi Akun: Aktif</div>
<div className="grid grid-cols-2 gap-4 w-full mt-8"><div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-start gap-3"><div className="p-2 bg-red-50 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-brand-red">bloodtype</span></div><div><p className="text-label-md font-bold text-on-surface-variant">Golongan Darah</p><p className="font-label-bold text-label-bold text-on-surface mt-0.5">O Positif (O+)</p></div></div><div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-start gap-3"><div className="p-2 bg-teal-50 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-primary">person</span></div><div><p className="text-label-md font-bold text-on-surface-variant">Usia &amp; Berat</p><p className="font-label-bold text-label-bold text-on-surface mt-0.5">58 Tahun | 72 kg</p></div></div><div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-start gap-3"><div className="p-2 bg-teal-50 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-primary">contact_phone</span></div><div><p className="text-label-md font-bold text-on-surface-variant">Kontak Darurat</p><p className="font-label-bold text-label-bold text-on-surface mt-0.5">Istri: 0812-3456-7890</p></div></div><div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-start gap-3"><div className="p-2 bg-teal-50 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-location_on">location_on</span></div><div><p className="text-label-md font-bold text-on-surface-variant">Domisili</p><p className="font-label-bold text-label-bold text-on-surface mt-0.5">Kec. Banyumanik, Semarang</p></div></div></div>
</section>
{/* Card 2: Kontrol Privasi & Izin Akses Dokter */}
<section className="clinical-card rounded-2xl p-6">
<div className="mb-6">
<h3 className="font-headline-md text-headline-md text-on-surface font-bold">Izin Akses Rekam Medis</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Kelola siapa saja yang dapat memantau data ECG Anda secara real-time.</p>
</div>
<div className="space-y-4">
{/* Active Doctor Row */}
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-teal-50/50 border border-teal-100 rounded-xl gap-4">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full overflow-hidden border border-teal-200">
<img className="w-full h-full object-cover" data-alt="A professional medical profile photo of Dr. Sarah Puspita, a female cardiologist in her 40s wearing a clean white doctor's coat and a stethoscope around her neck. She has a confident and empathetic smile, set against a soft-focus clinical background. The image is bright, professional, and inspires trust, perfectly fitting a medical health application." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSFb4nMfwyNkq0YVK5umXz2jCWVrkF1-Q74w64opOzQiZPK_4hYrWnhHb7wdFEPHpvKlfgnZedOqwCXoHVrXh4onjndAjR5S0FK7zSHk1-L-aoFsYuyZdcbsYMPTfCQ2t_Wc6a7kL5-fkJYPeuVBGJNeJrAJRq-36s1w7V-tuXbT9xnoNCBFee2g8sfU5zUovPe8NJIm6n5dB33WQUwxdOGlpXHss6Ogowo5darAHchzGWwKl-1SD4OgUuq2FDAbQGaZ7WE8so4Rlx"/>
</div>
<div>
<h4 className="font-label-bold text-label-bold text-on-surface">Dr. Sarah Puspita</h4>
<p className="text-label-md font-label-md text-on-surface-variant">Puskesmas Pratama</p><p className="text-[10px] text-primary font-medium">Klinik Jantung Sehat Institution</p>
<span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider status-chip-active">
                                    Akses Aktif
                                </span>
</div>
</div>
<button onClick={() => alert('Akses Data Dicabut!')} className="w-full sm:w-auto px-4 py-2 border border-alert-red text-alert-red font-label-bold text-label-bold rounded-lg hover:bg-red-50 transition-colors shadow-lg shadow-red-100 border-2">
                            Cabut Akses Data
                        </button>
</div>
{/* History Doctor Row */}
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface-container-low border border-outline-variant rounded-xl gap-4 opacity-70">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full overflow-hidden border border-outline grayscale">
<img className="w-full h-full object-cover" data-alt="A professional medical profile photo of Dr. Andi Wijaya, a male specialist in cardiology. He is wearing professional clinical attire. The image is presented in a muted, slightly lower-contrast style with a grayscale filter to denote a historical or inactive status, while still maintaining high professional quality and facial clarity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHegE_M2b6DIrIvSKgPdlNHFkFblgUU2MeqNwP78SFlX6nTIUndHfxpl0txKXpMCMoaRSV5Wcvre3DjDhZbnUzYRxJJI3RUXA4EX3xkO_3sei1y7Clm8LTecPAebhoEFTJWpWj2mmBSZOxShWfjZwvR0iZWJLCXi0ExuyfHTRNiN8uVdgAxtaeqCcDlsdCEv8xXolz-nxOShxZZQGmxOXSaHF-4mJX2KB_ih9YroYGLt8ZTg92zIBRZM8AywJrtS7zLhEmSiBDqL-b"/>
</div>
<div>
<h4 className="font-label-bold text-label-bold text-on-surface">Dr. Andi Wijaya</h4>
<p className="text-label-md font-label-md text-on-surface-variant">Klinik Jantung Sehat</p><p className="text-[10px] text-primary font-medium">Klinik Jantung Sehat Institution</p>
<span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider status-chip-revoked">
                                    Akses Dicabut
                                </span>
</div>
</div>
<button onClick={() => alert('Izin Diberikan!')} className="w-full sm:w-auto px-4 py-2 border border-outline text-on-surface-variant font-label-bold text-label-bold rounded-lg hover:bg-surface-container-highest transition-colors">
                            Berikan Izin Kembali
                        </button>
</div>
</div>
</section>
{/* Card 3: Pengaturan Akun & Logout */}
<section className="clinical-card rounded-2xl overflow-hidden">
<div className="p-6 flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>watch</span>
<span className="font-body-md text-body-md text-on-surface">Status Perangkat: <span className="font-bold">ECGR-01</span></span>
</div>
<span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-label-bold font-label-bold rounded-md">
                        Tersambung
                    </span>
</div>
<div className="border-t border-outline-variant"><div className="px-6 pt-4 pb-2"><p className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Danger Zone</p></div>
<button onClick={() => navigate('/auth/login')} className="w-full p-6 text-center text-on-primary bg-brand-red hover:opacity-90 transition-all font-label-bold text-label-bold flex items-center justify-center gap-2 group"><span className="material-symbols-outlined text-[20px]">logout</span>Keluar Aplikasi (Logout)</button>
</div>
</section>
</div>
</main>
{/* BottomNavBar (Mobile Only) */}
<nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 pb-safe bg-surface border-t border-outline-variant md:hidden">
<button onClick={() => navigate('/patient/dashboard')} className="flex flex-col items-center justify-center text-secondary hover:bg-surface-container-low transition-all active:scale-95 duration-150 flex-1 h-full">
<span className="material-symbols-outlined">home</span>
<span className="font-label-md text-label-md">Home</span>
</button>
<button onClick={() => navigate('/patient/history')} className="flex flex-col items-center justify-center text-secondary hover:bg-surface-container-low transition-all active:scale-95 duration-150 flex-1 h-full">
<span className="material-symbols-outlined">ecg_heart</span>
<span className="font-label-md text-label-md">Readings</span>
</button>
<button onClick={() => navigate('/patient/qr-sync')} className="flex flex-col items-center justify-center text-secondary hover:bg-surface-container-low transition-all active:scale-95 duration-150 flex-1 h-full">
<span className="material-symbols-outlined">query_stats</span>
<span className="font-label-md text-label-md">Insights</span>
</button>
<button onClick={() => navigate('/patient/settings')} className="flex flex-col items-center justify-center text-primary font-bold hover:bg-surface-container-low transition-all active:scale-95 duration-150 flex-1 h-full">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>person</span>
<span className="font-label-md text-label-md">Privacy</span>
</button>
</nav>


    </div>
  );
};
