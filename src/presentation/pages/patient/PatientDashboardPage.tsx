import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PatientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="text-on-surface w-full">

{/* Top Navigation Bar */}
<nav className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant h-16">
<div className="max-w-container-max mx-auto px-gutter h-full flex justify-between items-center">
<div className="flex items-center gap-3">
<img alt="ecgrhythmia logo" className="h-8 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVHX00UF6lwM6kjDUMgD4Jv6lMMp5h2u1ZBPFlnvJJNam11nmTsrGtn_y5NNHv61wLHc3plhgbJeduSWPWMT-xKDKHnnifesb9pERppu-cGEHZODeFvF8XLLfRKpP1GdLDV5iINEmqPsbVTFdQZhAPCXP6aHQm-ecIuBbV0YG8GByhRtVQ6xZQrpQpUmXqjqW6DWiEZHDW8D81u4xSnTtsE-7HlTKrn6GuXcYUOYjdpCvaEqIKW1ghrNjEt5sTxTf_o6esUGi3HzNB" />
<div className="font-headline-md text-headline-md tracking-tight flex">
<span className="text-brand-red">ecg</span><span className="text-brand-navy">rhythmia</span>
</div>
</div>
<div className="flex items-center gap-4">
<div className="hidden md:flex flex-col items-end">
<span className="font-label-bold text-label-bold text-on-surface">Budi Santoso</span>
<span className="font-label-md text-label-md text-on-surface-variant">Pasien Jantung</span>
</div>
<div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden bg-surface-container">
<img className="w-full h-full object-cover" data-alt="A professional headshot of a middle-aged Indonesian man with a kind smile, clean-shaven, wearing a simple white polo shirt. The background is a soft-focus clinical interior with warm lighting. The image maintains a high-end medical portal aesthetic with soft, natural textures and clear resolution." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUam0uK7UDwfb1MlHqZd-PKV0X63gB5gC2oX75jmCOxl6nbT5YIQRt4XQRiIxj6JM2zIkJS1LHCPI-CPtuuBJceNekMcnMqa7iUSpfH7Dv5Qq_SVKd-pJowOb_sZozjkEf7fMkdhAT9HpoeiGt_PZq8HSlCoocRpQdbTzg2n_Fm6A1HppIaNS82Zq-vB4W3hPTXi4qGThMYF_sYCwSDjYI7mF8tTjTHDTMn7FqmXAT65XwHMZW5dPnf9rTolHvMUs70gH-lDy2dUFx" />
</div>
<button onClick={() => navigate('/patient/settings')} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">settings</button>
</div>
</div>
</nav>
{/* Main Content Area */}
<main className="max-w-container-max mx-auto px-gutter py-8">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
{/* Left Column: Main Patient Monitoring */}
<div className="lg:col-span-8 space-y-6">
{/* Live Device Status */}
<section className="glass-card rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
<div className="flex items-start gap-4">
<div className="w-12 h-12 rounded-lg bg-status-green/10 flex items-center justify-center">
<span className="material-symbols-outlined text-status-green text-3xl">sensors</span>
</div>
<div>
<div className="flex items-center gap-2">
<h2 className="font-headline-md text-headline-md text-on-surface">Alat Sedang Merekam</h2>
<div className="w-2.5 h-2.5 bg-status-green rounded-full pulse-dot"></div>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Status koneksi optimal melalui jaringan Wi-Fi lokal</p>
</div>
</div>
<div className="flex items-center gap-6 bg-surface-container-low p-4 rounded-lg">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-status-green">battery_very_low</span>
<span className="font-label-bold text-label-bold">85% - Daya Cukup</span>
</div>
<div className="w-px h-6 bg-outline-variant"></div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary">wifi</span>
<span className="font-label-bold text-label-bold">Sinkron Cloud</span>
</div>
</div>
</section>
{/* Daily Trend Visualization */}
<div className="mt-6"><div className="mb-6 p-6 rounded-xl border border-outline-variant bg-gradient-to-r from-teal-50 to-white flex flex-col">
  <h2 className="text-2xl font-bold text-[#2D3436]">Selamat pagi, Budi Santoso.</h2>
  <p className="text-lg text-gray-600 mt-2">Pemantauan jantung Anda berjalan optimal. Tidak ada anomali yang terdeteksi hari ini.</p>
</div><h3 className="font-headline-md text-headline-md text-[#2D3436] mb-4">Akses Cepat Menu</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div onClick={() => navigate('/patient/qr-sync')} className="bg-teal-accent p-6 rounded-xl flex flex-col items-start justify-start min-h-[160px] cursor-pointer hover:bg-primary transition-all shadow-lg shadow-teal-500/20">
  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1A939E] mb-4">
    <span className="material-symbols-outlined text-3xl">qr_code_2</span>
  </div>
  <div className="flex flex-col">
    <p className="text-lg font-bold text-white mb-1">Tampilkan QR Sinkronisasi</p>
    <p className="text-white opacity-90 text-sm">Bagikan akses pemantauan live ke dokter Anda.</p>
  </div>
</div><div onClick={() => navigate('/patient/history')} className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col items-start justify-start min-h-[160px] cursor-pointer hover:bg-surface-container-low hover:shadow-md transition-all shadow-sm">
  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-[#1A939E] mb-4">
    <span className="material-symbols-outlined text-3xl">history</span>
  </div>
  <div className="flex flex-col">
    <p className="text-lg font-bold text-on-surface mb-1">Riwayat Pemeriksaan</p>
    <p className="text-on-surface-variant/70 text-sm opacity-90">Lihat log aktivitas harian dan ringkasan mingguan.</p>
  </div>
</div><div onClick={() => navigate('/patient/settings')} className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col items-start justify-start min-h-[160px] cursor-pointer hover:bg-surface-container-low hover:shadow-md transition-all shadow-sm">
  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-[#1A939E] mb-4">
    <span className="material-symbols-outlined text-3xl">person</span>
  </div>
  <div className="flex flex-col">
    <p className="text-lg font-bold text-on-surface mb-1">Profil &amp; Pengaturan</p>
    <p className="text-on-surface-variant/70 text-sm opacity-90">Kelola data pribadi, preferensi, dan keamanan.</p>
  </div>
</div><div onClick={() => navigate('/patient/device-guide')} className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col items-start justify-start min-h-[160px] cursor-pointer hover:bg-surface-container-low hover:shadow-md transition-all shadow-sm">
  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-[#1A939E] mb-4">
    <span className="material-symbols-outlined text-3xl">info</span>
  </div>
  <div className="flex flex-col">
    <p className="text-lg font-bold text-on-surface mb-1">Panduan Penggunaan Alat</p>
    <p className="text-on-surface-variant/70 text-sm opacity-90">Tutorial pemasangan elektroda dan info baterai.</p>
  </div>
</div></div></div>
{/* Quick Action: QR Sync */}
</div>
{/* Right Column: Sidebar */}
<aside className="lg:col-span-4 space-y-8">
{/* Connected Doctor Card */}
<div className="glass-card rounded-xl p-6">
<h4 className="font-label-bold text-label-bold text-on-surface-variant mb-6 uppercase tracking-widest border-b border-outline-variant pb-2">Dokter Penanggung Jawab</h4>
<div className="flex flex-col items-center text-center">
<div className="relative mb-4">
<div className="w-24 h-24 rounded-full border-4 border-surface-container-high overflow-hidden shadow-sm">
<img className="w-full h-full object-cover" data-alt="A professional portrait of Dr. Sarah, a female cardiologist with a reassuring and empathetic expression. She wears a clean white medical coat and a subtle stethoscope around her neck. The lighting is soft and flattering, set in a bright, modern clinic with minimalist decor. The overall aesthetic is trustworthy, clinical, and professional." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAPF427TKbofqTeAODzGQtgG8Wrh84qAQTGtPdgijTSkdPa38AItbLpmKF8VCo88H98c4PcJRSb75hgAf_Lk4GrFNFywyu36PNNPk_d9GOe6QovRBpJ3airNva6dnRH35EQD9HYnBHedMLi9kpZ0plWAGoTVZnKpI3Nuw3ES-xnp9dK0Z8Qyf0pJ98nEvbjapVwvFjndFn8CA0nwyIPRF9WMG2gs_NJ2vLjIiVhacRzxM4zLvCYdFS5BiLNxIboISeeAI_qSns0n0K" />
</div>
<div className="absolute bottom-1 right-1 bg-status-green w-5 h-5 rounded-full border-4 border-white"></div>
</div>
<h5 className="font-headline-md text-headline-md text-on-surface">Dr. Sarah Puspita</h5>
<p className="font-body-md text-body-md text-on-surface-variant mb-4">Puskesmas Pratama</p>
<div className="bg-status-green/10 px-4 py-2 rounded-full mb-8">
<span className="font-label-bold text-label-bold text-status-green flex items-center gap-2">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                Terhubung &amp; Memantau
              </span>
</div>
<div className="w-full space-y-3">
<button onClick={() => alert('Fitur segera hadir!')} className="w-full py-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold rounded-lg transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-sm">chat</span>
                Hubungi Klinik
              </button>
<button onClick={() => alert('Fitur segera hadir!')} className="w-full py-3 text-on-surface-variant/60 font-label-md text-label-md hover:text-error transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-error/20 rounded-lg">
<span className="material-symbols-outlined text-sm">link_off</span>
                Cabut Izin Akses
              </button>
</div>
</div>
</div>
{/* System Information Card */}
<div className="glass-card rounded-xl p-6 bg-brand-navy text-white overflow-hidden relative">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-6xl">favorite</span>
</div>
<h4 className="font-label-bold text-label-bold mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-sm">info</span>
            Tips Kesehatan Hari Ini
          </h4>
<p className="font-body-sm text-body-sm text-surface-variant leading-relaxed">
            "Pastikan Anda meminum air putih yang cukup dan hindari konsumsi kafein berlebih sebelum jam tidur untuk menjaga ritme jantung tetap stabil."
          </p>
<div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
<span className="text-xs text-surface-variant/70">Versi App v2.4.1</span>
<span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
</div>
</div>
{/* Recent Logs (Bonus for Information Density) */}
<div className="glass-card rounded-xl p-6">
<h4 className="font-label-bold text-label-bold text-on-surface-variant mb-4">Aktivitas Terakhir</h4>
<div className="space-y-4">
<div className="flex items-center gap-4">
<div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-sm text-primary">sync</span>
</div>
<div className="flex-1">
<p className="text-xs font-label-bold">Data Berhasil Dikirim</p>
<p className="text-[10px] text-on-surface-variant/60">10 Menit yang lalu</p>
</div>
</div>
<div className="flex items-center gap-4">
<div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-sm text-status-green">verified_user</span>
</div>
<div className="flex-1">
<p className="text-xs font-label-bold">Cek Rutin Mingguan</p>
<p className="text-[10px] text-on-surface-variant/60">Kemarin, 14:20</p>
</div>
</div>
</div>
</div>
</aside>
</div>
</main>
{/* Mobile Bottom Nav Spacer */}
<div className="h-16 md:hidden"></div>
{/* Micro Interaction Script */}




    </div>
  );
};
