import React from 'react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden w-full">

{/* TopNavBar */}
{/* TopNavBar */}
<PublicHeader />
<main className="pb-24">
{/* Hero Section */}
<section className="max-w-container-max mx-auto px-margin-desktop mb-20 text-center">
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pulse-red-light text-primary mb-6">
<span className="material-symbols-outlined text-[18px]" data-original-icon="medical_services">medical_services</span>
<span className="text-label-md font-label-md">Panduan Penggunaan Presisi</span>
</div>
<h1 className="text-headline-xl font-headline-xl text-on-surface mb-6">Bagaimana ecgrhythmia Bekerja</h1>
<p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Transformasi pemantauan kesehatan jantung Anda dalam tiga langkah sederhana. Teknologi medis canggih yang kini hadir dalam kenyamanan genggaman Anda.
            </p>
</section>
{/* 3-Step Walkthrough */}
<section className="max-w-container-max mx-auto px-margin-desktop space-y-24 mb-32">
{/* Step 1: Attach Device */}
<div className="flex flex-col md:flex-row items-center gap-16">
<div className="w-full md:w-1/2">
<div className="relative rounded-3xl overflow-hidden elevation-card aspect-[4/3] bg-surface-gray">
<img className="w-full h-full object-cover" alt="ECG patch being applied to a person's upper chest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz0l_IrMi3lkl-p1qSiOtF-guLYLeKP3gn40t6Xw1XorsaGJXomKE52cfKm2z5JCKGkO5RuDHeQ5tf5UA5ETY8vrumyhi2978MrPj3iFaGkvDFQs-vkdHZ09ew8fFsR3U34J4vNRDVIuc9HakSJD-BTRAdHw8cCPq8eDThjHJRDJBzbCVqOBU7x1F4e3EuyH3b6HNToK3yr9macg4CtWtrUBu6mqH5tRDrzKWGlN8SY1j6b4nyPo1reX4J3W6AVMPCHa46Q6eBGorD" />
<div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
<span className="material-symbols-outlined" data-original-icon="play_circle">play_circle</span>
</div>
<div>
<p className="text-label-md font-label-md text-on-surface">Lihat Panduan Video</p>
<p className="text-body-sm font-body-sm text-on-surface-variant">Durasi: 1:20 Menit</p>
</div>
</div>
</div>
</div>
<div className="w-full md:w-1/2">
<span className="text-primary font-headline-xl opacity-20 block mb-2">01</span>
<h2 className="text-headline-lg font-headline-lg text-on-surface mb-6">Pasang Perangkat Patch</h2>
<p className="text-body-md font-body-md text-on-surface-variant mb-8 leading-relaxed">
                        Perangkat ecgrhythmia dirancang untuk kenyamanan maksimal sepanjang hari. Cukup bersihkan area dada, lepaskan lapisan pelindung perekat, dan tempelkan patch secara horizontal di bawah tulang selangka kiri Anda. Desain ergonomisnya memungkinkan Anda beraktivitas normal bahkan saat berolahraga.
                    </p>
<ul className="space-y-4">
<li className="flex items-start gap-3">
<span className="material-symbols-outlined text-primary" data-original-icon="check_circle">check_circle</span>
<span className="text-body-md">Perekat medis hipoalergenik yang ramah di kulit.</span>
</li>
<li className="flex items-start gap-3">
<span className="material-symbols-outlined text-primary" data-original-icon="check_circle">check_circle</span>
<span className="text-body-md">Tahan air untuk penggunaan saat mandi atau berkeringat.</span>
</li>
</ul>
</div>
</div>
{/* Step 2: Connect Account */}
<div className="flex flex-col md:flex-row-reverse items-center gap-16">
<div className="w-full md:w-1/2">
<div className="relative rounded-3xl overflow-hidden elevation-card aspect-[4/3] bg-surface-gray">
<img className="w-full h-full object-cover" alt="Smartphone scanning the QR code on the back of the ECG device" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq1hJ9dGS3k1OKWSkYRvnAd04eWWa79MflOPIg23xc-SsKjkyX9MXzmyreaujGCXYPHy9E5i6oXt4PC4tFpTT_k3u7o_DiMj9TGvMNa07hY8IzMqwaKXOUDRq2a7YwLO83vVEezzh63pAPFWqak2N0tT6xFF0IIYguG7a6oZi_SvYK4RQCxLmDlrwj7PuNOqIINGrJ7UAmvZ521utCRhMxs13lIH3V3hqkTamVnEo6UwGI8stJHJFjs-eiep7xNLhuVA8BfXSG02Hn" />
<div className="absolute top-6 right-6 bg-secondary text-white p-4 rounded-2xl max-w-[200px]">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-[20px]">lightbulb</span>
<span className="text-label-md font-bold">Tips Cerdas</span>
</div>
<p className="text-body-sm text-white/90">Dalam kondisi minim cahaya, gunakan fitur senter pada aplikasi untuk pemindaian QR yang lebih cepat.</p>
</div>
</div>
</div>
<div className="w-full md:w-1/2">
<span className="text-primary font-headline-xl opacity-20 block mb-2">02</span>
<h2 className="text-headline-lg font-headline-lg text-on-surface mb-6">Hubungkan ke Akun Anda</h2>
<p className="text-body-md font-body-md text-on-surface-variant mb-8 leading-relaxed">
                        Buka aplikasi ecgrhythmia di ponsel Anda dan pilih menu 'Tambah Perangkat'. Gunakan kamera ponsel untuk memindai kode QR unik yang tertera pada bagian belakang perangkat. Sinkronisasi instan akan terjadi melalui Bluetooth Low Energy (BLE) untuk memastikan efisiensi baterai.
                    </p>
<div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-secondary text-[32px]">qr_code_scanner</span>
<div>
<h4 className="font-headline-md text-on-surface text-[18px]">Sinkronisasi Instan</h4>
<p className="text-body-sm text-on-surface-variant">Terhubung dalam hitungan detik tanpa kabel yang rumit.</p>
</div>
</div>
</div>
</div>
</div>
{/* Step 3: Start Monitoring */}
<div className="flex flex-col md:flex-row items-center gap-16">
<div className="w-full md:w-1/2">
<div className="relative rounded-3xl overflow-hidden elevation-card aspect-[4/3] bg-surface-gray border border-white">
<div className="absolute inset-0 bg-white">
{/* Simulated ECG Grid/Graph */}
<svg className="w-full h-full opacity-30" viewBox="0 0 400 300">
<defs>
<pattern height="20" id="grid" patternUnits="userSpaceOnUse" width="20">
<path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ddd" strokeWidth="0.5"></path>
</pattern>
</defs>
<rect fill="url(#grid)" height="100%" width="100%"></rect>
<path className="ecg-line" d="M0,150 L50,150 L60,130 L70,170 L80,150 L120,150 L130,120 L140,180 L150,150 L200,150 L210,130 L220,170 L230,150 L270,150 L280,120 L290,180 L300,150 L350,150 L360,130 L370,170 L380,150 L400,150" fill="none" stroke="#b70100" strokeWidth="2"></path>
</svg>
<div className="absolute inset-0 flex items-center justify-center">
<div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl text-center border border-pulse-red-light">
<span className="text-headline-xl font-headline-xl text-primary mb-1 block">72</span>
<span className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest">BPM</span>
<div className="flex items-center gap-2 mt-4 text-green-600 justify-center">
<span className="material-symbols-outlined text-[16px]">favorite</span>
<span className="text-label-md">Normal</span>
</div>
</div>
</div>
</div>
</div>
</div>
<div className="w-full md:w-1/2">
<span className="text-primary font-headline-xl opacity-20 block mb-2">03</span>
<h2 className="text-headline-lg font-headline-lg text-on-surface mb-6">Mulai Pemantauan Langsung</h2>
<p className="text-body-md font-body-md text-on-surface-variant mb-8 leading-relaxed">
                        Lihat visualisasi real-time detak jantung Anda di dashboard. Algoritma kecerdasan buatan kami bekerja di latar belakang untuk mendeteksi anomali ritme jantung. Anda akan menerima notifikasi instan jika terdeteksi pola yang membutuhkan perhatian medis.
                    </p>
<div className="grid grid-cols-2 gap-4">
<div className="p-4 bg-surface-container rounded-2xl">
<p className="text-label-md font-label-md text-secondary mb-1">Status</p>
<p className="text-body-md font-bold text-on-surface">Aktif</p>
</div>
<div className="p-4 bg-surface-container rounded-2xl">
<p className="text-label-md font-label-md text-secondary mb-1">Akurasi</p>
<p className="text-body-md font-bold text-on-surface">99.8%</p>
</div>
</div>
</div>
</div>
</section>
{/* Troubleshooting Section */}
<section className="max-w-container-max mx-auto px-margin-desktop mb-32">
<div className="bg-inverse-surface text-white rounded-3xl p-12 overflow-hidden relative">
<div className="relative z-10">
<h3 className="text-headline-lg font-headline-lg mb-8">Tips Cepat &amp; Troubleshooting</h3>
<div className="grid md:grid-cols-3 gap-8">
<div className="space-y-4">
<div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-white" data-original-icon="clean">clean_hands</span>
</div>
<h4 className="text-headline-md text-[20px]">Persiapan Kulit</h4>
<p className="text-body-sm text-surface-variant leading-relaxed">Pastikan kulit bersih dan kering. Hindari penggunaan lotion atau minyak di area pemasangan untuk daya rekat optimal.</p>
</div>
<div className="space-y-4">
<div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-white">camera_enhance</span>
</div>
<h4 className="text-headline-md text-[20px]">Pemindaian QR</h4>
<p className="text-body-sm text-surface-variant leading-relaxed">Pegang ponsel sekitar 15-20 cm dari perangkat. Pastikan kode tidak tertutup bayangan atau pantulan cahaya lampu.</p>
</div>
<div className="space-y-4">
<div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-white">battery_charging_full</span>
</div>
<h4 className="text-headline-md text-[20px]">Status Baterai</h4>
<p className="text-body-sm text-surface-variant leading-relaxed">Periksa indikator baterai di aplikasi. Satu kali pengisian daya penuh dapat bertahan hingga 7 hari pemantauan kontinu.</p>
</div>
</div>
</div>
{/* Decorative element */}
<div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none">
<span className="material-symbols-outlined text-[300px]">monitor_heart</span>
</div>
</div>
</section>
{/* Closing CTA */}
<section className="max-w-container-max mx-auto px-margin-desktop">
<div className="bg-pulse-red-light rounded-3xl p-16 text-center border-2 border-primary-fixed">
<h2 className="text-headline-lg font-headline-lg text-primary mb-4">Siap untuk mulai memantau?</h2>
<p className="text-body-lg font-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">
                    Hubungkan perangkat Anda sekarang dan dapatkan wawasan mendalam tentang kesehatan jantung Anda dalam hitungan menit.
                </p>
<div className="flex flex-col sm:flex-row justify-center items-center gap-4">
<button className="w-full sm:w-auto bg-primary text-white font-label-md text-label-md px-10 py-4 rounded-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">Hubungkan Perangkat</button>
<button className="w-full sm:w-auto bg-white border-2 border-secondary text-secondary font-label-md text-label-md px-10 py-4 rounded-full hover:bg-surface-container transition-all">Ke Dashboard</button>
</div>
</div>
</section>
</main>
{/* Footer */}
<PublicFooter />



    </div>
  );
};
