import React from 'react';

export const PatientQrSyncPage: React.FC = () => {
  return (
    <div className="bg-[#F4F7F9] font-body-md text-on-surface min-h-screen flex flex-col w-full">

{/* TopNavBar Component */}
<header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 max-w-container-max mx-auto bg-surface border-b border-outline-variant">
<div className="flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity">
<img alt="ecgrhythmia logo" className="h-8 w-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZsl-IJ64BZCzblmQzCMcaDZC_H_McDSkzhcO4sc6O4FaAZ5R6MA40ZBorFNUCf2hVow9g5BD8u4ekVdIlDE7uuHKzRTp-P7ewGHE40PTWWqOwAVL0T_jcI07NndRgg4GnX49fDRlHLBKIxc70mEHOnAVZqseETmHMwHLpF6xsqZJcS6phaZA9BzSwtpqI-kyzimjpkqCJ2F7NdZzBSlmx8kLpC2f6CfcP19adp0ZjbbTiN_N51Wxu47z8wS4v8cEMDZ9kL0g_NbZo" />
<span className="font-display-lg text-[24px] leading-tight font-bold">
<span className="brand-text-ecg">ecg</span><span className="brand-text-rhythmia">rhythmia</span>
</span>
</div>
<div className="flex items-center gap-4">
<div className="hidden md:flex flex-col items-end">
<span className="font-label-md text-on-surface font-bold">Budi Santoso</span>
<span className="font-body-sm text-secondary">Patient Portal</span>
</div>
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-outline-variant">
<span className="material-symbols-outlined text-on-secondary-container" data-icon="account_circle">account_circle</span>
</div>
</div>
</header>
{/* SideNavBar (Hidden on Mobile, Active: Sync Device) */}
{/* Main Content Area */}
<main className="flex-grow flex items-center justify-center pt-16 px-margin-mobile">
<div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
{/* Central QR Card */}
<div className="bg-white rounded-xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E1E8ED] flex flex-col items-center text-center">
<h1 className="font-headline-md text-on-surface text-xl mb-3">Sinkronisasi Perangkat Dokter</h1>
<p className="font-body-sm text-secondary max-w-[280px] leading-relaxed">
                    Tunjukkan kode QR ini kepada Dokter atau Perawat untuk menautkan rekam medis Anda.
                </p>
{/* QR Code Display */}
<div className="flex items-center justify-center mb-6"><div className="inline-flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant"><span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#1A939E] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A939E]"></span></span><span className="text-[10px] font-bold text-[#1A939E] tracking-wider uppercase">Live Secure</span></div></div><div className="relative mt-8 mb-6 group">
<div className="w-64 h-64 bg-white flex items-center justify-center overflow-hidden"><img alt="2D QR Code" className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3DdUcRZ7LQ4vcHOHE8vi56KPpvtzimVNpFh1zwCWOrS06IFOg08ArpoEytObJhu1Dls15askb1kCuvfPPlJqF0S18YWf0PN3O6ajzMjdjR3WFPMqlCuE1_05cEo9R4uIq2_cu5XjNbN1NXlfgk8uQc6SAyF6W-ooyrTYAGhSVJra8jpLcr_HW39ptT8MnxB9cacwdLW2nlJM2Lyelmk9BpjI5glTI3ibU1PrTwfo4GcO1Mh0rcbB4_GQbcJ0pFjk6LOKPpx5E6Dym" /></div>
</div>
{/* Patient ID Info */}
<div className="mb-8">
<p className="font-mono-data text-on-surface-variant tracking-widest bg-surface-container-low px-4 py-2 rounded-lg text-sm">
                        ID: PAT-9824-XYZ
                    </p>
</div>
{/* Manual Action */}
<button className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#1A939E] text-[#1A939E] font-label-md hover:bg-surface-container-low transition-colors active:opacity-80" id="copyBtn">
<span className="material-symbols-outlined text-[18px]" data-icon="content_copy">content_copy</span>
<span className="">Salin ID Manual</span>
</button>
</div>
{/* Security Trust Badges */}
</div>
</main>
{/* Bottom Navigation (Mobile Only) */}
<footer className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant flex justify-around items-center h-16 z-50">
<button className="flex flex-col items-center gap-1 text-secondary">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="text-[10px] font-medium">Dashboard</span>
</button>
<button className="flex flex-col items-center gap-1 text-primary">
<span className="material-symbols-outlined font-variation-settings-'FILL'-1" data-icon="qr_code_scanner" style={{ fontVariationSettings: '"FILL" 1' }}>qr_code_scanner</span>
<span className="text-[10px] font-bold">Sync</span>
</button>
<button className="flex flex-col items-center gap-1 text-secondary">
<span className="material-symbols-outlined" data-icon="history">history</span>
<span className="text-[10px] font-medium">History</span>
</button>
<button className="flex flex-col items-center gap-1 text-secondary">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="text-[10px] font-medium">Settings</span>
</button>
</footer>




    </div>
  );
};
