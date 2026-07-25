import React from 'react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Link } from 'react-router-dom';

export const FaqPage: React.FC = () => {
  return (
    <div className="bg-background font-body-md text-on-surface w-full">


    {/* TopNavBar (Shared Component) */}
    {/* TopNavBar */}
<PublicHeader />

    <main className="pb-20">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center mb-16 fade-in" id="hero">
            <h1 className="font-headline-xl text-headline-xl text-secondary mb-4">Frequently Asked Questions</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
                Temukan jawaban untuk pertanyaan umum mengenai penggunaan perangkat dan aplikasi ecgrhythmia untuk kesehatan jantung Anda.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-12">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
                <input type="text" placeholder="Cari pertanyaan..." className="w-full pl-14 pr-6 py-4 rounded-full border border-outline-variant bg-background-white focus:outline-none focus:border-secondary shadow-sm transition-all font-body-md text-body-md" />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
                <button className="px-6 py-2.5 rounded-full bg-primary text-white font-label-md text-label-md active-scale transition-all">All</button>
                <button className="px-6 py-2.5 rounded-full bg-surface-gray text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high active-scale transition-all">Getting Started</button>
                <button className="px-6 py-2.5 rounded-full bg-surface-gray text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high active-scale transition-all">Device &amp; Pairing</button>
                <button className="px-6 py-2.5 rounded-full bg-surface-gray text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high active-scale transition-all">Readings &amp; Alerts</button>
                <button className="px-6 py-2.5 rounded-full bg-surface-gray text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high active-scale transition-all">Privacy &amp; Data</button>
            </div>
        </section>

        {/* FAQ Content Grid */}
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop space-y-12">
            
            {/* Category: Getting Started */}
            <section className="fade-in">
                <h2 className="font-headline-md text-headline-md text-secondary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" data-icon="rocket_launch" data-original-icon="rocket_launch">rocket_launch</span>
                    Getting Started
                </h2>
                <div className="space-y-4">
                    {/* Question 1 */}
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">How do I set up ecgrhythmia for the first time?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more" data-original-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">Unduh aplikasi ecgrhythmia dari App Store atau Play Store, buat akun baru, dan ikuti petunjuk langkah demi langkah di layar untuk menghubungkan perangkat Anda melalui Bluetooth.</p>
                        </div>
                    </div>
                    {/* Question 2 */}
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Do I need to charge the device before first use?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">Ya, kami merekomendasikan pengisian daya penuh (sekitar 2 jam) sebelum penggunaan pertama untuk memastikan kalibrasi sensor yang optimal.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category: Device & Pairing */}
            <section className="fade-in">
                <h2 className="font-headline-md text-headline-md text-secondary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" data-icon="settings_bluetooth">settings_bluetooth</span>
                    Device &amp; Pairing
                </h2>
                <div className="space-y-4">
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">How do I pair my device to my account?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">Buka aplikasi, masuk ke menu 'Perangkat', pilih 'Tambah Baru', lalu scan kode QR yang tertera pada bagian belakang perangkat atau kotak kemasan.</p>
                        </div>
                    </div>
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Where do I find the QR code on the device?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">Kode QR terletak di bagian bawah perangkat ecgrhythmia. Jika stiker sudah pudar, Anda juga dapat menemukannya di kartu garansi di dalam kotak.</p>
                        </div>
                    </div>
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">What do I do if the QR scan doesn't work?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">Jika pemindaian gagal, Anda dapat memasukkan ID perangkat secara manual (terdiri dari 12 digit alfanumerik) yang berada tepat di bawah kode QR.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category: Readings & Alerts */}
            <section className="fade-in">
                <h2 className="font-headline-md text-headline-md text-secondary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" data-icon="monitor_heart">monitor_heart</span>
                    Readings &amp; Alerts
                </h2>
                <div className="space-y-4">
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">What happens if the app detects an irregular heartbeat?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">Aplikasi akan segera mengirimkan notifikasi dan menandai rekaman tersebut sebagai 'Anomali'. Anda akan disarankan untuk tetap tenang dan segera berkonsultasi dengan tenaga medis profesional.</p>
                        </div>
                    </div>
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">How accurate are the readings?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">ecgrhythmia menggunakan sensor kelas medis dengan tingkat akurasi tinggi. Namun, hasil rekaman harus digunakan sebagai referensi awal dan bukan sebagai pengganti diagnosa medis lengkap dari rumah sakit.</p>
                        </div>
                    </div>
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Can my doctor see my data too?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">Ya, Anda dapat membagikan laporan PDF hasil ECG secara langsung melalui aplikasi ke WhatsApp atau Email dokter Anda.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category: Privacy & Data */}
            <section className="fade-in">
                <h2 className="font-headline-md text-headline-md text-secondary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" data-icon="verified_user">verified_user</span>
                    Privacy &amp; Data
                </h2>
                <div className="space-y-4">
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Is my heart data encrypted and private?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">Keamanan data Anda adalah prioritas kami. Seluruh data kesehatan dienkripsi menggunakan standar AES-256 baik saat penyimpanan maupun saat pengiriman.</p>
                        </div>
                    </div>
                    <div className="faq-card rounded-2xl bg-white p-6 shadow-[0px_4px_20px_rgba(0,31,84,0.05)] cursor-pointer transition-all group" onClick={() => {}} data-legacy-onclick="this.classList.toggle('active')">
                        <div className="flex justify-between items-center">
                            <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Who can access my ECG readings?</h3>
                            <span className="material-symbols-outlined chevron transition-transform text-on-surface-variant" data-icon="expand_more">expand_more</span>
                        </div>
                        <div className="faq-card-content font-body-md text-body-md text-on-surface-variant">
                            <p className="">Hanya Anda yang memiliki akses penuh ke data Anda. Tim teknis kami hanya dapat mengakses data anonim untuk pengembangan algoritma deteksi, kecuali Anda secara eksplisit memberikan izin untuk dukungan teknis.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing Card */}
            <section className="fade-in">
                <div className="bg-secondary rounded-3xl p-10 text-center text-white relative overflow-hidden">
                    {/* Subtle BG Pattern */}
                    <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                        <span className="material-symbols-outlined text-[300px]" data-icon="favorite">favorite</span>
                    </div>
                    
                    <h2 className="font-headline-lg text-headline-lg mb-4 relative z-10">Still need help?</h2>
                    <p className="font-body-md text-body-md text-surface-variant mb-8 relative z-10 max-w-lg mx-auto">
                        Jika Anda belum menemukan jawaban yang dicari, tim pendukung kami siap membantu Anda kapan saja.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <button className="bg-primary text-white px-10 py-3 rounded-full font-label-md text-label-md active-scale transition-all shadow-lg hover:brightness-110">Contact Support</button>
                        <Link to="#" className="text-white font-label-md text-label-md hover:underline active-scale transition-all">Go to Dashboard</Link>
                    </div>
                </div>
            </section>
        </div>
    </main>

    {/* Footer (Shared Component) */}
    <PublicFooter />

    

    </div>
  );
};
