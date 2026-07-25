import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const PatientSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen w-full">

{/* TopNavBar */}
<header className="sticky top-0 w-full bg-surface-container-lowest z-50 border-b border-outline-variant">
<div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
<div className="flex items-center gap-3">
<img alt="ecgrhythmia logo" className="w-10 h-10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkefAEsAfdObWejLXJeo6UJ-aipL9RhLEjQWb_efUqECgaH-Cy5DaXVHVDTzTitlyCm50jVO8f82mihVtdLLjbrQupyycNnY9NDWcJ9kPH_n01G3Rgpg1TIU5VzQwLQP7mfpiMpn0EdCNqgtGoyIoDIQaMDYQXVgyvHpRNlNDx6jx5AcoJLNRIx0uSxxGWyc7cDZUTf6iiBw1IliUP3vBsKl71Gx-rP8O26hnk7S3w43S2zo4-THRmkiKISO-kCWjsA99vH6ZIguo6"/>
<span className="font-bold text-headline-md tracking-tight"><span style={{ color: '#E60000' }}>ecg</span><span style={{ color: '#001F54' }}>rhythmia</span></span>
</div>
<div className="flex items-center gap-4">
<div className="hidden md:flex flex-col items-end">
<span className="font-label-bold text-on-surface">Budi Santoso</span>
<span className="text-body-sm text-secondary">Pasien</span>
</div>
<img className="w-10 h-10 rounded-full border border-outline-variant object-cover" data-alt="A close-up portrait of a friendly Indonesian elderly man with short grey hair and kind eyes, smiling gently at the camera. The lighting is soft and professional, set against a clean, clinical white background with soft blue accents, embodying a medical health-tech aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBOpfLBGZfGoPsOrNd_Xv_w4H4Mf4nEnC30NzQV22i1xHx-BCbN_aarBGgYIQEGglznv-KLanj2If4gE4wu0efOX58Wk0BUOOKx8XfAY5XBFIL4ibN4hmou2mLnRVrnrqBmd1-grGnZ6hWoAhb-lOPay9aaoVxMpHvUO66nS9wM9qeI4iziDhx5zd2itQCQtZy1-JLRvVGoKJsAlP5FhIIIi-w2-X2PeAuVwJ6TSZ3ATk4mJYxojtrE7tjgkHLm7GW8h1Shy63PnVi"/>
<Link className="text-primary font-bold transition-opacity hover:opacity-80 flex items-center gap-1" to="/patient/dashboard">
<span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
                    Kembali
                </Link>
</div>
</div>
</header>
<main className="max-w-2xl mx-auto px-margin-mobile py-8 space-y-6">
<div className="mb-8">
<h1 className="font-headline-md text-headline-md text-on-surface">Pengaturan Aplikasi</h1>
<p className="text-body-md text-secondary">Sesuaikan pengalaman monitoring jantung Anda.</p>
</div>
{/* Section: Jadwal & Pengingat */}
<h2 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2 px-2">Jadwal &amp; Pengingat</h2><section className="bg-surface-container-lowest rounded-xl card-shadow overflow-hidden">
<div className="p-6">
<div className="flex items-center justify-between gap-4">
<div>
<h3 className="font-headline-md text-body-md font-bold">Pengingat Pakai Alat</h3>
<p className="text-body-sm text-secondary">Ingatkan saya setiap jam 08:00 pagi.</p>
</div>
<label className="toggle-switch">
<input defaultChecked type="checkbox"/>
<span className="slider"></span>
</label>
</div>
</div>
</section>
{/* Section: Koneksi & Data */}
<h2 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2 px-2">Koneksi &amp; Data</h2><section className="bg-surface-container-lowest rounded-xl card-shadow overflow-hidden">
<div className="p-6">
<div className="flex items-center justify-between gap-4">
<div>
<h3 className="font-headline-md text-body-md font-bold">Sinkronisasi via Wi-Fi Saja</h3>
<p className="text-body-sm text-secondary">Menghemat paket data seluler Anda.</p>
</div>
<label className="toggle-switch">
<input defaultChecked type="checkbox"/>
<span className="slider"></span>
</label>
</div>
</div>
</section>
{/* Section: Aksesibilitas & Tampilan */}
<h2 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2 px-2">Aksesibilitas &amp; Tampilan</h2><section className="bg-surface-container-lowest rounded-xl card-shadow overflow-hidden">
<div className="divide-y divide-surface-container">
{/* Row 1 */}
<div className="p-6 flex items-center justify-between gap-4">
<div>
<h3 className="font-headline-md text-body-md font-bold">Mode Teks Besar</h3>
<p className="text-body-sm text-secondary">Memperbesar ukuran huruf di seluruh aplikasi.</p>
</div>
<label className="toggle-switch">
<input defaultChecked type="checkbox"/>
<span className="slider"></span>
</label>
</div>
{/* Row 2 */}
<div className="p-6 flex items-center justify-between gap-4">
<div>
<h3 className="font-headline-md text-body-md font-bold">Kontras Tinggi</h3>
<p className="text-body-sm text-secondary">Meningkatkan kejelasan warna teks.</p>
</div>
<label className="toggle-switch">
<input type="checkbox"/>
<span className="slider"></span>
</label>
</div>
</div>
</section>
{/* Section: Bantuan & Tentang Aplikasi */}
<h2 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2 px-2">Bantuan &amp; Tentang Aplikasi</h2><section className="bg-surface-container-lowest rounded-xl card-shadow overflow-hidden">
<div className="divide-y divide-surface-container">
<button className="w-full p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left">
<span className="font-body-md">Panduan Penggunaan</span>
<span className="material-symbols-outlined text-secondary" data-icon="chevron_right">chevron_right</span>
</button>
<button className="w-full p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left">
<span className="font-body-md">Hubungi Dukungan</span>
<span className="material-symbols-outlined text-secondary" data-icon="chevron_right">chevron_right</span>
</button>
<div className="p-6 flex items-center justify-between">
<span className="font-body-md">Versi Aplikasi</span>
<span className="text-body-sm text-secondary font-mono-data">v2.4.0-stable</span>
</div>
</div>
</section>
{/* Bottom Action */}
<div className="pt-8 pb-12">
<button onClick={() => navigate('/auth/login')} className="w-full py-4 mb-4 bg-white text-alert-red border border-alert-red font-bold rounded-xl active:scale-[0.98] transition-all shadow-sm hover:bg-red-50 flex items-center justify-center gap-2"><span className="material-symbols-outlined">logout</span>Keluar / Logout</button>

<button onClick={() => alert('Preferensi Disimpan!')} className="w-full py-4 bg-medical-teal text-on-primary font-bold rounded-xl active:scale-[0.98] transition-all shadow-lg hover:brightness-110 flex items-center justify-center gap-2">
<span className="material-symbols-outlined" data-icon="save">save</span>
                Simpan Preferensi
            </button>
<p className="text-center text-body-sm text-secondary mt-4">Terakhir diperbarui: 18 Juni 2026</p>
</div>
</main>


    </div>
  );
};
