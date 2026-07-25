import React from 'react';
import { Link } from 'react-router-dom';

export const DeviceGuidePage: React.FC = () => {
  return (
    <div className="bg-medical-gray font-body-md text-on-background min-h-screen w-full">

{/* Top Navigation Bar */}
<nav className="sticky top-0 z-50 bg-white border-b border-outline-variant shadow-sm h-16">
<div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-full max-w-container-max mx-auto">
<div className="flex items-center gap-2">
<img alt="ecgrhythmia logo" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy5y87N3mp8UKFJRXyChQpdyadUEzkV6AS8IZcieba7sKtSRb42hI7PqQ9krIcKisUDmDlgW1HGv1COvgVjUwjKE1Zmo4lkoQAZgt9tsUSDIsh3F0EuQtCXGSpr1VCOPLHpNp0Jl9m_CRW7T7e1kll4f4gsbfKXD1hTvU9LjClxcWiu0srFXin8ncvzpSVMsmz-HOjgCC58WoJexzHBgNLTWjPPhNo3fqzDnASdzaCfAa1xnLIEqRUfPKkXZATV87_dbZlZc9QfnWP"/>
<span className="font-headline-md text-headline-md font-bold tracking-tight">
<span className="text-vibrant-red">ecg</span><span className="text-dark-navy">rhythmia</span>
</span>
</div>
<Link className="flex items-center gap-1 text-primary hover:text-primary-container transition-colors font-medium" to="/patient/dashboard">
<span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
<span className="font-label-md text-label-md">Kembali</span>
</Link>
</div>
</nav>
{/* Main Content Scroll Area */}
<main className="max-w-2xl mx-auto px-margin-mobile pb-12">
{/* Page Header */}
<header className="text-center mt-8 mb-10">
<h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">Panduan Pemasangan Alat</h1>
<p className="text-on-surface-variant font-body-md">Ikuti 2 langkah mudah ini untuk mulai memantau irama jantung Anda.</p>
</header>
{/* Card 1: Langkah 1 */}
<section className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant hover:border-medical-teal transition-all duration-300">
<div className="flex items-center gap-3 mb-6">
<div className="bg-medical-teal/10 p-2 rounded-lg">
<span className="material-symbols-outlined text-medical-teal font-bold" data-icon="settings_input_component">settings_input_component</span>
</div>
<h2 className="font-headline-md text-headline-md font-bold text-medical-teal">1. Tempelkan 4 Elektroda</h2>
</div>
{/* Illustration Area */}
<div className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden flex flex-col items-center justify-center border border-dashed border-outline-variant">
<div className="relative w-full max-w-[280px] aspect-[4/5] flex items-center justify-center">
{/* Torso Silhouette Placeholder */}
<div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-20" data-alt="A clean, minimalist 2D vector silhouette illustration of a human upper torso in soft light gray tones. The style is clinical, professional, and instructional, designed for medical app documentation. The lighting is flat and even to prioritize clarity of the diagram over artistic shadow. Minimalist anatomical lines define the shoulders and chest area against a neutral studio-lit background." style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBe_SMCnFf1Fiy8PVGyDlVWKr_5U3S5MnyoRD4XnnESB0hIWFm38DnjIE7FrKSXHtyqpS4MfXZZB2VtAbgP_7RmagW-dRNrnMrOIH-EQV9et5eoLaeFhYYR7_YZY-ZpTWZZtL0RzCx5goNzlWfTk5qyQByRHIY2LsvRv1dLVmoa5gFvQHAhtEa-JphnTMW2L9pSt8oPI--QBUatnQW29Lv2y94QJ2lIfWZq-x5o5VgFHbhu7nL_1czZWaIwq5USfdj1tliYzbRW3Zje")' }}>
</div>
{/* Electrode Markers */}
{/* RA (Kanan Atas) */}
<div className="absolute top-[20%] right-[15%] flex flex-col items-center">
<div className="electrode-dot bg-red-600 mb-1"></div>
<span className="font-label-bold text-[10px] bg-white px-1.5 py-0.5 rounded shadow-sm border border-outline-variant">RA</span>
</div>
{/* LA (Kiri Atas) */}
<div className="absolute top-[20%] left-[15%] flex flex-col items-center">
<div className="electrode-dot bg-yellow-400 mb-1"></div>
<span className="font-label-bold text-[10px] bg-white px-1.5 py-0.5 rounded shadow-sm border border-outline-variant">LA</span>
</div>
{/* RL (Kanan Bawah) */}
<div className="absolute bottom-[20%] right-[20%] flex flex-col items-center">
<div className="electrode-dot bg-green-600 mb-1"></div>
<span className="font-label-bold text-[10px] bg-white px-1.5 py-0.5 rounded shadow-sm border border-outline-variant">RL</span>
</div>
{/* LL (Kiri Bawah) */}
<div className="absolute bottom-[20%] left-[20%] flex flex-col items-center">
<div className="electrode-dot bg-black mb-1"></div>
<span className="font-label-bold text-[10px] bg-white px-1.5 py-0.5 rounded shadow-sm border border-outline-variant">LL</span>
</div>
</div>
</div>
{/* Legend */}
<div className="grid grid-cols-2 gap-3 mt-6">
<div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
<div className="w-3 h-3 rounded-full bg-red-600"></div>
<span className="text-label-md font-medium">RA (Kanan Atas)</span>
</div>
<div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
<div className="w-3 h-3 rounded-full bg-yellow-400"></div>
<span className="text-label-md font-medium">LA (Kiri Atas)</span>
</div>
<div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
<div className="w-3 h-3 rounded-full bg-green-600"></div>
<span className="text-label-md font-medium">RL (Kanan Bawah)</span>
</div>
<div className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/30">
<div className="w-3 h-3 rounded-full bg-black"></div>
<span className="text-label-md font-medium">LL (Kiri Bawah)</span>
</div>
</div>
</section>
{/* Card 2: Langkah 2 */}
<section className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant mt-6 hover:border-medical-teal transition-all duration-300">
<div className="flex items-center gap-3 mb-6">
<div className="bg-medical-teal/10 p-2 rounded-lg">
<span className="material-symbols-outlined text-medical-teal font-bold" data-icon="light_mode">light_mode</span>
</div>
<h2 className="font-headline-md text-headline-md font-bold text-medical-teal">2. Periksa Lampu Indikator</h2>
</div>
<div className="space-y-4">
{/* LED Item 1 */}
<div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-transparent hover:border-outline-variant transition-colors">
<div className="mt-1">
<div className="w-4 h-4 rounded-full bg-blue-500 pulse-blue"></div>
</div>
<div>
<h3 className="font-label-bold text-on-surface">Biru Berkedip</h3>
<p className="font-body-sm text-on-surface-variant">Mencari koneksi Wi-Fi</p>
</div>
</div>
{/* LED Item 2 */}
<div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-transparent hover:border-outline-variant transition-colors">
<div className="mt-1">
<div className="w-4 h-4 rounded-full bg-signal-green shadow-[0_0_8px_rgba(46,204,113,0.6)]"></div>
</div>
<div>
<h3 className="font-label-bold text-on-surface">Hijau Menyala</h3>
<p className="font-body-sm text-on-surface-variant">Alat terhubung dan sedang merekam dengan baik</p>
</div>
</div>
{/* LED Item 3 */}
<div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low/50 border border-transparent hover:border-outline-variant transition-colors">
<div className="mt-1">
<div className="w-4 h-4 rounded-full bg-amber-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
</div>
<div>
<h3 className="font-label-bold text-on-surface">Kuning Menyala</h3>
<p className="font-body-sm text-on-surface-variant">Baterai lemah, harap segera isi daya</p>
</div>
</div>
</div>
</section>
{/* Footer Help */}
<footer className="mt-10 text-center space-y-6">
<button className="w-full md:w-auto px-10 h-12 flex items-center justify-center gap-2 bg-white border-2 border-medical-teal text-medical-teal font-bold rounded-lg hover:bg-medical-teal hover:text-white transition-all active:scale-[0.98]">
<span className="material-symbols-outlined" data-icon="headset_mic">headset_mic</span>
        Bantuan &amp; Troubleshooting
      </button>
<div className="pt-4 border-t border-outline-variant">
<p className="text-on-surface-variant font-label-md flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[18px]" data-icon="call">call</span>
          Call Center: <span className="font-bold text-dark-navy">1500-ECG (Bebas Pulsa)</span>
</p>
<p className="text-[10px] text-outline mt-2 tracking-wide uppercase">ecgrhythmia v1.0.4 • Clinical Precision Guaranteed</p>
</div>
</footer>
</main>
{/* Interactive States Script */}


    </div>
  );
};
