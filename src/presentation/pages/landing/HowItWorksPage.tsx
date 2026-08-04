import React from 'react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

const RevealContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-in-out transform w-full ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'} ${className || ''}`}
        >
            {children}
        </div>
    );
};

export const HowItWorksPage: React.FC = () => {
    return (
        <div id="main-scroll-container" className="bg-white dark:bg-luxury-cream text-clinical-charcoal dark:text-luxury-navy font-body-md dark:font-luxury-body overflow-x-hidden w-full transition-colors duration-700 h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
            <PublicHeader />

            <main>
                {/* Hero Section */}
                <section className="h-screen w-full flex flex-col justify-center items-center snap-start bg-white dark:bg-luxury-cream transition-colors duration-700 relative overflow-hidden">
                    <div className="absolute inset-0 ecg-grid opacity-20 dark:opacity-5 -z-10"></div>
                    <div className="max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop">
                        <RevealContent className="text-center space-y-4 md:space-y-6">
                            <span className="text-clinical-blue dark:text-luxury-slate font-label-md dark:font-luxury-button tracking-[0.2em] uppercase text-sm font-bold block mb-4">The Process</span>
                            <h1 className="text-[40px] md:text-[64px] font-headline-xl dark:font-luxury-headline text-clinical-charcoal dark:text-luxury-navy tracking-tight dark:tracking-normal leading-tight">
                                Seamless Integration into <br className="hidden md:block" />
                                <span className="italic dark:not-italic font-light text-clinical-charcoal/70 dark:text-luxury-navy block mt-2">Your Lifestyle.</span>
                            </h1>
                            <p className="text-lg md:text-xl font-body-lg dark:font-luxury-body text-clinical-charcoal/60 dark:text-luxury-navy/70 max-w-2xl mx-auto leading-relaxed dark:font-light">
                                Transforming heart health monitoring into three simple steps. Advanced medical technology, completely redefined for your utmost convenience.
                            </p>
                        </RevealContent>
                    </div>
                    {/* Scroll Indicator & Timeline Start */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-0">
                        <span className="material-symbols-outlined text-clinical-blue dark:text-luxury-gold text-3xl opacity-70 animate-bounce">expand_more</span>
                    </div>
                </section>

                {/* Step 1 Section */}
                <section className="min-h-screen py-24 md:py-0 md:h-screen w-full flex flex-col justify-center snap-start bg-clinical-surface/30 dark:bg-[#F8F8F5] transition-colors duration-700 relative">
                    <div className="hidden md:block absolute left-1/2 top-1/2 bottom-0 w-1 bg-clinical-blue dark:bg-luxury-gold -translate-x-1/2 z-0"></div>
                    <div className="max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
                        <RevealContent className="flex flex-col md:flex-row items-center relative group w-full">
                            <div className="md:hidden w-12 h-12 rounded-full bg-clinical-blue dark:bg-luxury-gold text-white flex items-center justify-center font-bold mb-6 text-lg shadow-lg">01</div>
                            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-clinical-blue dark:bg-luxury-gold text-white dark:text-luxury-navy items-center justify-center shadow-lg shadow-clinical-blue/20 dark:shadow-luxury-gold/30 text-xl font-bold font-label-md dark:font-luxury-button transition-transform duration-700 group-hover:scale-110 z-20">01</div>

                            <div className="flex-1 w-full md:pr-16 relative">
                                <div className="absolute inset-0 border border-clinical-blue/20 dark:border-luxury-gold/30 rounded-[2rem] transform translate-x-3 translate-y-3 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700"></div>
                                <div className="relative rounded-[2rem] overflow-hidden shadow-xl aspect-[16/9] md:aspect-[4/3] bg-white dark:bg-luxury-muted/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[100px] md:text-[140px] text-clinical-blue/30 dark:text-luxury-navy/20 group-hover:scale-110 transition-transform duration-700">favorite</span>
                                </div>
                            </div>

                            <div className="flex-1 w-full md:pl-16 space-y-4 md:space-y-6 mt-8 md:mt-0 text-center md:text-left">
                                <h3 className="font-headline-lg dark:font-luxury-headline text-3xl md:text-5xl text-clinical-charcoal dark:text-luxury-navy leading-tight">The Application</h3>
                                <p className="text-clinical-charcoal/70 dark:text-luxury-navy/70 font-body-lg dark:font-luxury-body text-base md:text-lg leading-relaxed dark:font-light">
                                    Attach the ultra-thin ecgrhythmia patch to the designated chest area. Our wireless, breathable design ensures absolute comfort and absolute discretion 24/7.
                                </p>
                            </div>
                        </RevealContent>
                    </div>
                </section>

                {/* Step 2 Section */}
                <section className="min-h-screen py-24 md:py-0 md:h-screen w-full flex flex-col justify-center snap-start bg-white dark:bg-luxury-cream transition-colors duration-700 relative">
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-clinical-red dark:bg-luxury-navy -translate-x-1/2 z-0"></div>
                    <div className="max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
                        <RevealContent className="flex flex-col md:flex-row-reverse items-center relative group w-full">
                            <div className="md:hidden w-12 h-12 rounded-full bg-clinical-red dark:bg-luxury-navy text-white dark:text-luxury-cream flex items-center justify-center font-bold mb-6 text-lg shadow-lg">02</div>
                            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-clinical-red dark:bg-luxury-navy text-white dark:text-luxury-cream items-center justify-center shadow-lg shadow-clinical-red/20 dark:shadow-luxury-navy/30 text-xl font-bold font-label-md dark:font-luxury-button transition-transform duration-700 group-hover:scale-110 z-20">02</div>

                            <div className="flex-1 w-full md:pl-16 relative">
                                <div className="absolute inset-0 border border-clinical-red/20 dark:border-luxury-navy/20 rounded-[2rem] transform -translate-x-3 translate-y-3 group-hover:-translate-x-4 group-hover:translate-y-4 transition-transform duration-700"></div>
                                <div className="relative rounded-[2rem] overflow-hidden shadow-xl aspect-[16/9] md:aspect-[4/3] bg-clinical-surface dark:bg-luxury-muted/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[100px] md:text-[140px] text-clinical-red/30 dark:text-luxury-gold/30 group-hover:scale-110 transition-transform duration-700">qr_code_scanner</span>
                                </div>
                            </div>

                            <div className="flex-1 w-full md:pr-16 space-y-4 md:space-y-6 mt-8 md:mt-0 text-center md:text-right">
                                <h3 className="font-headline-lg dark:font-luxury-headline text-3xl md:text-5xl text-clinical-charcoal dark:text-luxury-navy leading-tight">The Connection</h3>
                                <p className="text-clinical-charcoal/70 dark:text-luxury-navy/70 font-body-lg dark:font-luxury-body text-base md:text-lg leading-relaxed dark:font-light">
                                    Scan the unique QR Code on the device using the ecgrhythmia app. Our system automatically establishes an encrypted, military-grade connection instantly.
                                </p>
                            </div>
                        </RevealContent>
                    </div>
                </section>

                {/* Step 3 Section */}
                <section className="min-h-screen py-24 md:py-0 md:h-screen w-full flex flex-col justify-center snap-start bg-clinical-surface/30 dark:bg-[#F8F8F5] transition-colors duration-700 relative">
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-1/2 w-1 bg-clinical-charcoal dark:bg-luxury-slate -translate-x-1/2 z-0"></div>
                    <div className="max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
                        <RevealContent className="flex flex-col md:flex-row items-center relative group w-full">
                            <div className="md:hidden w-12 h-12 rounded-full bg-clinical-charcoal dark:bg-luxury-slate text-white flex items-center justify-center font-bold mb-6 text-lg shadow-lg">03</div>
                            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-clinical-charcoal dark:bg-luxury-slate text-white items-center justify-center shadow-lg shadow-clinical-charcoal/20 dark:shadow-luxury-slate/30 text-xl font-bold font-label-md dark:font-luxury-button transition-transform duration-700 group-hover:scale-110 z-20">03</div>

                            <div className="flex-1 w-full md:pr-16 relative">
                                <div className="absolute inset-0 border border-clinical-charcoal/20 dark:border-luxury-slate/30 rounded-[2rem] transform translate-x-3 translate-y-3 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700"></div>
                                <div className="relative rounded-[2rem] overflow-hidden shadow-xl aspect-[16/9] md:aspect-[4/3] bg-white dark:bg-luxury-muted/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[100px] md:text-[140px] text-clinical-charcoal/30 dark:text-luxury-slate/30 group-hover:scale-110 transition-transform duration-700">monitor_heart</span>
                                </div>
                            </div>

                            <div className="flex-1 w-full md:pl-16 space-y-4 md:space-y-6 mt-8 md:mt-0 text-center md:text-left">
                                <h3 className="font-headline-lg dark:font-luxury-headline text-3xl md:text-5xl text-clinical-charcoal dark:text-luxury-navy leading-tight">The Insight</h3>
                                <p className="text-clinical-charcoal/70 dark:text-luxury-navy/70 font-body-lg dark:font-luxury-body text-base md:text-lg leading-relaxed dark:font-light">
                                    Your ECG data is continuously transmitted to your private dashboard. Our AI algorithms analyze every heartbeat, providing you and your physician with unparalleled clarity.
                                </p>
                            </div>
                        </RevealContent>
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="min-h-screen py-24 md:py-0 md:h-screen w-full flex items-center justify-center snap-start bg-white dark:bg-luxury-cream transition-colors duration-700 relative">
                    <RevealContent className="max-w-4xl w-full mx-auto px-margin-mobile md:px-margin-desktop text-center relative z-10">
                        <div className="bg-clinical-surface/50 dark:bg-luxury-navy rounded-[2.5rem] p-12 md:p-20 shadow-lg border border-clinical-charcoal/5 dark:border-luxury-gold/20 transition-colors duration-700 group">
                            <span className="text-clinical-blue dark:text-luxury-gold font-label-md dark:font-luxury-button tracking-[0.2em] uppercase text-sm font-bold block mb-4">Take Control</span>
                            <h2 className="font-headline-xl dark:font-luxury-headline text-[32px] md:text-[56px] text-clinical-charcoal dark:text-luxury-cream mb-6 md:mb-8 leading-tight">Ready to Begin?</h2>
                            <p className="text-clinical-charcoal/60 dark:text-luxury-cream/70 mb-10 md:mb-12 max-w-xl mx-auto text-lg md:text-xl font-body-lg dark:font-luxury-body dark:font-light">
                                Connect your device today and gain profound insights into your heart health within minutes.
                            </p>
                            <div className="flex justify-center">
                                <button onClick={() => window.location.href = '/auth/login'} className="w-full sm:w-auto bg-clinical-charcoal dark:bg-transparent text-white dark:text-luxury-gold font-label-md dark:font-luxury-button dark:uppercase dark:tracking-widest dark:border dark:border-luxury-gold text-sm md:text-base px-12 py-4 md:py-5 rounded-full hover:shadow-xl hover:-translate-y-1 dark:hover:bg-luxury-gold dark:hover:text-luxury-navy transition-all duration-700">
                                    Enter Dashboard
                                </button>
                            </div>
                        </div>
                    </RevealContent>
                </section>
            </main>

            <section className="snap-start flex flex-col justify-end bg-clinical-charcoal dark:bg-luxury-navy">
                <PublicFooter />
            </section>
        </div>
    );
};
