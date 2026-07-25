import React from 'react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { useNavigate } from 'react-router-dom';

import fikriImg from '../../../assets/team-profile/Muhammad Fikri.png';
import rizqikaImg from '../../../assets/team-profile/Rizqika Azkiya Algim.png';
import athayaImg from '../../../assets/team-profile/Athaya Rashif Hanang Syah.png';
import rafaImg from '../../../assets/team-profile/Rafa Azlan.png';
import raffiImg from '../../../assets/team-profile/Raffi Arditama.png';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden w-full">

{/* TopNavBar */}
<PublicHeader />
<main>
{/* Hero Section */}
<section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
<div className="absolute inset-0 ecg-grid opacity-50 -z-10"></div>
<div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
<div className="space-y-8">
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pulse-red-light text-primary font-semibold text-sm">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>favorite</span>
                        Future of Medical Monitoring Technology
                    </div>
<h1 className="font-headline-xl text-headline-xl text-secondary">
                        Monitor Your Heart Rhythm <span className="text-primary">Anytime</span>, Anywhere.
                    </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                        ecgrhythmia is a compact heart monitoring device that is comfortable to wear to monitor your heart rate in real-time and provide alerts and analysis if it encounters abnormal heart rhythms.
                    </p>
<div className="flex flex-col sm:flex-row gap-4">
<button className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-xl shadow-primary/25 hover:scale-105 transition-all">Pair Device</button>
<button className="px-8 py-4 rounded-full border-2 border-primary text-primary font-bold text-lg hover:bg-primary/5 transition-all" onClick={() => navigate('/auth/login')}>Go to Dashboard</button>
</div>
</div>
<div className="relative group">
<div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-3xl group-hover:bg-primary/10 transition-colors"></div>
<div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-surface-container-high">
<img alt="Heart monitor device" className="w-full h-[400px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApKbquevPy4Kbeh4eHmnJxTUW6kQrEGAvO8aA-wtdxZNFxZ1o6WwMvLR7yd4M4kLauQIvM-zmvucKPg7e0jkfVSxx3u7DucWdB9-yZTQnP0OK5uuwoAVzTRs6aMXwehGviPxN5n9atoqbxF1Npn9l63K_Dk3T7WmEoBodh6JCFunHOe4YOwcy6Eyjv2SHw2-_rSPeubzFedrbj8aCnIOIAv2U57Gv_yLCrZxIMVSLE7sGdPVTvpeVhn9Qnv4ZU5-M3-AVcVoQ9N8Ph" />
<div className="absolute bottom-6 left-6 right-6 glass-card p-6 rounded-2xl shadow-lg border border-white/50">
<div className="flex items-center justify-between mb-4">
<span className="font-bold text-secondary">ECG Real-time</span>
<span className="flex items-center gap-2 text-primary font-bold">
                                    LIVE
                                </span>
</div>
<div className="h-20 w-full overflow-hidden relative">
<svg className="absolute inset-0 w-full h-full text-primary" preserveAspectRatio="none" viewBox="0 0 400 100">
<path className="pulse-animation" d="M0,50 L50,50 L60,20 L75,80 L85,50 L120,50 L130,10 L145,90 L160,50 L200,50 L210,20 L225,80 L235,50 L270,50 L280,10 L295,90 L310,50 L350,50" fill="none" stroke="currentColor" strokeWidth="2"></path>
</svg>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Feature Cards */}
<section className="py-24 bg-surface-gray">
<div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
<div className="text-center mb-16 space-y-4">
<h2 className="font-headline-lg text-headline-lg text-secondary">Why ecgrhythmia?</h2>
<p className="text-on-surface-variant max-w-2xl mx-auto">We combine medical precision with daily convenience to keep your heart healthy.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
{/* Card 1 */}
<div className="p-8 rounded-3xl bg-white shadow-[0px_4px_20px_rgba(0,31,84,0.05)] hover:-translate-y-2 transition-all duration-300">
<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-3xl">monitor_heart</span>
</div>
<h3 className="font-headline-md text-headline-md text-secondary mb-3">Real-time Monitoring</h3>
<p className="text-on-surface-variant">Hassle-free, your heart rate data is sent directly to your phone via wireless communication.</p>
</div>
{/* Card*/}
<div className="p-8 rounded-3xl bg-white shadow-[0px_4px_20px_rgba(0,31,84,0.05)] hover:-translate-y-2 transition-all duration-300">
<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-3xl">notifications_active</span>
</div>
<h3 className="font-headline-md text-headline-md text-secondary mb-3">Smart Notifications</h3>
<p className="text-on-surface-variant">Our AI algorithms detect heart anomalies early and provide instant alerts.</p>
</div>
{/* Card 3 */}
<div className="p-8 rounded-3xl bg-white shadow-[0px_4px_20px_rgba(0,31,84,0.05)] hover:-translate-y-2 transition-all duration-300">
<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-3xl">cloud_upload</span>
</div>
<h3 className="font-headline-md text-headline-md text-secondary mb-3">Centralized Data</h3>
<p className="text-on-surface-variant">Store health history in the cloud and share it with doctors with just one click.</p>
</div>
{/* Card 4 */}
<div className="p-8 rounded-3xl bg-white shadow-[0px_4px_20px_rgba(0,31,84,0.05)] hover:-translate-y-2 transition-all duration-300">
<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-3xl">circle</span>
</div>
<h3 className="font-headline-md text-headline-md text-secondary mb-3">Wireless &amp; Hassle-free</h3>
<p className="text-on-surface-variant">Minimalist and lightweight design that is very comfortable and compact to carry and wear anywhere.</p>
</div>
</div>
</div>
</section>
{/* How It Works */}
<section className="py-24 bg-background pb-16">
<div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
<div className="text-center mb-16">
<h2 className="font-headline-lg text-headline-lg text-secondary">Just 3 Simple Steps</h2>
</div>
<div className="relative flex flex-col md:flex-row justify-between items-start gap-12">
{/* Connector line (Desktop) */}
<div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-secondary/10 -z-0"></div>
{/* Step 1 */}
<div className="relative z-10 flex flex-col items-center text-center flex-1">
<div className="w-20 h-20 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-2xl mb-8 border-8 border-background shadow-xl">1</div>
<h4 className="font-headline-md text-headline-md text-secondary mb-4">Attach Device</h4>
<p className="text-on-surface-variant">Place the ecgrhythmia patch on the chest area according to the video guide.</p>
</div>
{/* Step 2 */}
<div className="relative z-10 flex flex-col items-center text-center flex-1">
<div className="w-20 h-20 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-2xl mb-8 border-8 border-background shadow-xl">2</div>
<h4 className="font-headline-md text-headline-md text-secondary mb-4">Connect Account</h4>
<p className="text-on-surface-variant">Open the ecgrhythmia app and scan the QR code on the device for instant sync.</p>
</div>
{/* Step 3 */}
<div className="relative z-10 flex flex-col items-center text-center flex-1">
<div className="w-20 h-20 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-2xl mb-8 border-8 border-background shadow-xl">3</div>
<h4 className="font-headline-md text-headline-md text-secondary mb-4">Start Monitoring</h4>
<p className="text-on-surface-variant">Your heart health data is now visible on the dashboard in detail and accuracy.</p>
</div>
</div>
</div>
</section>
</main>
{/* Footer */}
<section className="py-24 bg-background" id="about-us">
<div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
{/* Mission Statement */}
<div className="max-w-3xl mx-auto text-center mb-20 space-y-6">
<h2 className="font-headline-lg text-headline-lg text-secondary">Our Mission</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
        Our team is driven by a shared mission to bridge the gap between medical precision and daily convenience. ecgrhythmia was born from a desire to make heart health monitoring accessible, reliable, and non-intrusive for everyone.
      </p>
</div>
{/* Meet Our Team */}
<div className="text-center mb-16">
<h2 className="font-headline-lg text-headline-lg text-secondary">Meet Our Team</h2>
</div>
{/* Team Grid (3+2 Layout) */}
<div className="space-y-gutter">
{/* Top Row: 3 Members */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<div className="p-8 rounded-3xl bg-white shadow-[0px_4px_20px_rgba(0,31,84,0.05)] text-center hover:-translate-y-2 transition-all duration-300">
<img src={fikriImg} alt="Muhammad Fikri" className="w-24 h-24 rounded-full object-cover mx-auto mb-6 shadow-sm" />
<h3 className="font-headline-md text-headline-md text-secondary mb-2">Muhammad Fikri</h3>
<p className="text-primary font-semibold mb-4">Team Leader</p>
<p className="text-on-surface-variant text-sm"><br /></p>
</div>
<div className="p-8 rounded-3xl bg-white shadow-[0px_4px_20px_rgba(0,31,84,0.05)] text-center hover:-translate-y-2 transition-all duration-300">
<img src={rizqikaImg} alt="Rizqika Azkiya Algim" className="w-24 h-24 rounded-full object-cover mx-auto mb-6 shadow-sm" />
<h3 className="font-headline-md text-headline-md text-secondary mb-2">Rizqika Azkiya Algim&nbsp;</h3>
<p className="text-primary font-semibold mb-4">Medical</p>
<p className="text-on-surface-variant text-sm"><br /></p>
</div>
<div className="p-8 rounded-3xl bg-white shadow-[0px_4px_20px_rgba(0,31,84,0.05)] text-center hover:-translate-y-2 transition-all duration-300">
<img src={athayaImg} alt="Athaya Rashif Hanang Syah" className="w-24 h-24 rounded-full object-cover mx-auto mb-6 shadow-sm" />
<h3 className="font-headline-md text-headline-md text-secondary mb-2">Athaya Rashif Hanang Syah</h3>
<p className="text-primary font-semibold mb-4">Hardware</p>

</div>
</div>
{/* Bottom Row: 2 Members (Centered) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-gutter max-w-2xl mx-auto">
<div className="p-8 rounded-3xl bg-white shadow-[0px_4px_20px_rgba(0,31,84,0.05)] text-center hover:-translate-y-2 transition-all duration-300">
<img src={rafaImg} alt="Rafa Azlan" className="w-24 h-24 rounded-full object-cover mx-auto mb-6 shadow-sm" />
<h3 className="font-headline-md text-headline-md text-secondary mb-2">Rafa Azlan</h3>
<p className="text-primary font-semibold mb-4">Software</p>

</div>
<div className="p-8 rounded-3xl bg-white shadow-[0px_4px_20px_rgba(0,31,84,0.05)] text-center hover:-translate-y-2 transition-all duration-300">
<img src={raffiImg} alt="Raffi Arditama" className="w-24 h-24 rounded-full object-cover mx-auto mb-6 shadow-sm" />
<h3 className="font-headline-md text-headline-md text-secondary mb-2">Raffi Arditama</h3>
<p className="text-primary font-semibold mb-4">Data Assurance</p>

</div>
</div>
</div>
</div>
</section><PublicFooter />




    </div>
  );
};
