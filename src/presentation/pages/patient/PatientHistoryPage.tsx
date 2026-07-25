import React from 'react';
import { Link } from 'react-router-dom';

export const PatientHistoryPage: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen w-full">

    {/* TopNavBar Navigation Shell */}
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            {/* Brand Logo */}
            <div className="flex items-center gap-2">
                <Link className="flex items-center active:scale-95 transition-transform duration-150 gap-2" to="/patient/dashboard"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVjGRAiT5MAG2QJ0fKRBbgb3NlUXGdzqCzQvC9LS2sBfNB6UckkPdUnj26g1aa0OdKmlhYEAJp1ksjWXtdm-zeMGf5N5BZ2Qb9AXLMe6P4hWMbl2EKhcJNR48d-zUtbyz7HARbW8PidLmSkIr0gsMTsh6G-naszg8M3wWNOcH3uGvGjVaf1jDtTGu6PRPMs7_qaI3XK1BdB0SRmJYt-YmCJwagh0HXt-n9pqRP6bHkUM7Azes-QuDiDPI0tOQBgqK9PCiq7FHeCWEI"
                        alt="ecgrhythmia logo" className="h-8 w-auto" />
                    <span className="font-headline-md text-headline-md font-bold"><span style={{ color: '#E60000' }} className="">ecg</span><span style={{ color: '#001F54' }} className="">rhythmia</span></span>
                </Link>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-4">
                <Link className="flex items-center gap-1 text-secondary hover:bg-surface-container-low px-3 py-1.5 rounded-full transition-colors active:scale-95" to="/patient/dashboard">
                    <span className="material-symbols-outlined text-[20px]" data-icon="arrow_back">arrow_back</span>
                    <span className="font-label-md text-label-md">Kembali</span>
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
                    <span className="hidden md:block font-label-md text-label-md font-bold text-on-surface">Budi Santoso</span>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high">
                        <img className="w-full h-full object-cover" data-alt="A professional studio portrait of Budi Santoso, a middle-aged Indonesian man with a friendly and calm expression. He is wearing a clean white polo shirt against a soft, neutral medical background. The lighting is bright and high-key, reflecting a sterile but approachable clinical environment. The style is minimalist and high-definition, focusing on reliability and trust."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3O-Q7qZhXGgRXJ-GG99Qu51okH9vekH8hdxK4G0kRoIFdACEyT0Tac-0H99uSpPOW8izJqeCqGmmP9GAQ-txIX92XL9k-AHXwWvBglMD8P0aejev3czntEqB96aAFwH4mMLnfL8yq9o578_H856WOOd6TzDHrPhjnlUCP-eW6AlzhiCeC95K7dAzxvlMWEVplK49eec2kfmW6Ke5UvPHQ8BcVOqDj8TUXBLhYYvyrRvuknZB24-QVkwxMtClqPXjT6Gfeho0z1r_U" />
                    </div>
                </div>
            </div>
        </div>
    </header>
    {/* Main Canvas Content */}
    <main className="pt-24 pb-32 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-3xl mx-auto">
            {/* Page Header */}
            <header className="mb-8">
                <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">Riwayat Pemeriksaan Anda</h1>
                <p className="font-body-md text-body-md text-secondary">Ringkasan pemantauan jantung mandiri Anda.</p>
            </header>
            {/* History Content Grid */}
            <div className="space-y-6">
                {/* History Card 1: Normal State */}
                <article className="bg-surface-container-lowest p-6 rounded-2xl medical-card-shadow border border-outline-variant/30 overflow-hidden relative group">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Sesi Pagi</h2>
                            <div className="flex items-center gap-2 text-secondary">
                                <span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
                                <span className="font-label-md text-label-md">Hari ini, 08:00 WIB</span>
                            </div>
                        </div>
                        {/* Status Chip: Normal */}
                        <div className="flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-[#2ECC71]/20">
                            <span className="material-symbols-outlined text-[#2ECC71] text-[18px]" data-icon="check_circle" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                            <span className="font-label-bold text-[#2ECC71] text-body-md">Aman / Irama Sinus Normal</span>
                        </div>
                    </div>
                    {/* Abstract Wave Visualization */}
                    <div className="h-24 w-full bg-surface-container-low rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 wave-bg flex items-center justify-center">
                            {/* Visualized wave silhouette using SVG placeholder logic */}
                            <svg className="w-full h-full opacity-40" fill="none" stroke="#1A939E" strokeWidth="2.5" viewBox="0 0 400 100"><path d="M0,60 L20,60 L25,55 L30,60 L45,60 L50,20 L55,80 L60,60 L75,60 L80,55 L85,60 L100,60 M100,60 L120,60 L125,55 L130,60 L145,60 L150,20 L155,80 L160,60 L175,60 L180,55 L185,60 L200,60 M200,60 L220,60 L225,55 L230,60 L245,60 L250,20 L255,80 L260,60 L275,60 L280,55 L285,60 L300,60 M300,60 L320,60 L325,55 L330,60 L345,60 L350,20 L355,80 L360,60 L375,60 L380,55 L385,60 L400,60"></path></svg>
                        </div>
                        <span className="relative font-label-md text-label-md text-secondary/50 uppercase tracking-widest">Aktivitas Jantung Stabil</span>
                    </div>
                    {/* CTA Button */}
                    <button onClick={() => alert('Fitur Unduh PDF segera hadir!')} className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg border border-primary text-primary font-body-md font-semibold hover:bg-primary/5 active:scale-95 transition-all">
<span className="material-symbols-outlined" data-icon="download">download</span>
            Unduh Ringkasan PDF
          </button>
                </article>
                {/* History Card 2: Anomaly State */}
                <article className="bg-surface-container-lowest p-6 rounded-2xl medical-card-shadow border border-outline-variant/30 overflow-hidden relative group">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Sesi Malam</h2>
                            <div className="flex items-center gap-2 text-secondary">
                                <span className="material-symbols-outlined text-[18px]" data-icon="history">history</span>
                                <span className="font-label-md text-label-md">Kemarin, 21:30 WIB</span>
                            </div>
                        </div>
                        {/* Status Chip: Anomaly */}
                        <div className="flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-[#D97706]/20">
                            <span className="material-symbols-outlined text-[#D97706] text-[18px]" data-icon="info" style={{ fontVariationSettings: '"FILL" 1' }}>info</span>
                            <span className="font-label-bold text-[#D97706] text-body-md">Ada Sedikit Anomali - Konsultasikan ke Dokter</span>
                        </div>
                    </div>
                    {/* Abstract Wave Visualization: Grayed */}
                    <div className="h-24 w-full bg-surface-container-low rounded-xl mb-6 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 wave-bg flex items-center justify-center">
                            <svg className="w-full h-full opacity-30" fill="none" stroke="#586062" strokeWidth="2.5" viewBox="0 0 400 100"><path d="M0,60 L15,60 L20,30 L25,75 L30,60 L40,60 L45,50 L50,60 L80,60 L85,20 L90,85 L95,60 L110,60 L115,55 L120,60 L160,60 L165,15 L170,80 L175,60 L200,60 L205,40 L210,60 L250,60 L255,25 L260,75 L265,60 L300,60 L305,50 L310,60 L350,60 L355,10 L360,90 L365,60 L400,60"></path></svg>
                        </div>
                        <span className="relative font-label-md text-label-md text-secondary/50 uppercase tracking-widest">Pola Tidak Teratur Terdeteksi</span>
                    </div>
                    {/* CTA Button */}
                    <button onClick={() => alert('Fitur Unduh PDF segera hadir!')} className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg border border-primary text-primary font-body-md font-semibold hover:bg-primary/5 active:scale-95 transition-all">
<span className="material-symbols-outlined" data-icon="download">download</span>
            Unduh Ringkasan PDF
          </button>
                </article>
            </div>
            {/* Load More Placeholder */}
            <div className="mt-12 text-center">
                <button className="font-label-md text-label-md text-secondary hover:text-primary transition-colors flex items-center gap-2 mx-auto">
          Lihat riwayat lebih lama
          <span className="material-symbols-outlined" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
</button>
            </div>
        </div>
    </main>
    {/* BottomNavBar Navigation Shell */}
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 bg-surface border-t border-outline-variant z-50">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors" to="/patient/dashboard">
            <span className="material-symbols-outlined" data-icon="home">home</span>
            <span className="font-label-md text-label-md">Home</span>
        </Link>
        <Link className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-colors" to="/patient/history">
            <span className="material-symbols-outlined" data-icon="ecg_heart" style={{ fontVariationSettings: '"FILL" 1' }}>ecg_heart</span>
            <span className="font-label-md text-label-md">Readings</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors" to="/patient/qr-sync">
            <span className="material-symbols-outlined" data-icon="monitoring">monitoring</span>
            <span className="font-label-md text-label-md">Vitals</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors" to="/patient/settings">
            <span className="material-symbols-outlined" data-icon="person">person</span>
            <span className="font-label-md text-label-md">Settings</span>
        </Link>
    </nav>
    



    </div>
  );
};
