import React, { useState } from 'react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

const RevealContent: React.FC<{ children: React.ReactNode, className?: string, durationClass?: string }> = ({ children, className, durationClass = "duration-1500" }) => {
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
            className={`transition-all ${durationClass} ease-in-out transform w-full ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'} ${className || ''}`}
        >
            {children}
        </div>
    );
};

export const FaqPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [direction, setDirection] = useState<'right' | 'left' | null>(null);

    const handleCategoryClick = (newCat: string) => {
        const oldIdx = categories.indexOf(activeCategory);
        const newIdx = categories.indexOf(newCat);
        if (oldIdx === newIdx) return;
        setDirection(newIdx > oldIdx ? 'right' : 'left');
        setActiveCategory(newCat);
        setOpenIndex(null);
    };

    const faqData = [
        { category: "Getting Started", q: "How do I pair the device?", a: "Turn on Bluetooth on your smartphone and open the ecgrhythmia app. Press and hold the device button until the indicator flashes. Follow the elegant on-screen pairing guide in the app." },
        { category: "Device & Pairing", q: "Is the patch comfortable for 24/7 wear?", a: "Yes. Our patches are constructed from medical-grade, hypoallergenic, and highly breathable materials designed to move with your body." },
        { category: "Readings & Alerts", q: "How accurate is the ECG reading?", a: "ecgrhythmia utilizes clinical-grade sensors that provide 99.8% accuracy compared to standard Holter monitors, analyzed instantly by our proprietary AI." },
        { category: "Readings & Alerts", q: "Will it notify my doctor automatically?", a: "With your explicit consent, the 'Smart Link' feature can transmit critical arrhythmia alerts directly to your registered healthcare provider's dashboard." },
        { category: "Privacy & Data", q: "How is my medical data protected?", a: "Your privacy is our highest priority. All data is encrypted locally using AES-256 before transmission and stored in HIPAA-compliant cloud servers." },
    ];

    const categories = ['All', 'Getting Started', 'Device & Pairing', 'Readings & Alerts', 'Privacy & Data'];

    const filteredFaqs = activeCategory === 'All'
        ? faqData
        : faqData.filter(faq => faq.category === activeCategory);

    return (
        <div id="main-scroll-container" className="bg-white dark:bg-luxury-cream text-clinical-charcoal dark:text-luxury-navy font-body-md dark:font-luxury-body overflow-x-hidden w-full transition-colors duration-1000 h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes swipeInRight {
                    from { transform: translateX(30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes swipeInLeft {
                    from { transform: translateX(-30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-swipe-right { animation: swipeInRight 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
                .animate-swipe-left { animation: swipeInLeft 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
            `}</style>
            <PublicHeader />

            <main>
                {/* Hero Section */}
                <section className="h-screen w-full flex flex-col justify-center items-center snap-start bg-clinical-surface/50 dark:bg-luxury-navy transition-colors duration-1000 relative overflow-hidden">
                    <div className="absolute inset-0 ecg-grid opacity-30 dark:opacity-10 -z-10"></div>
                    <div className="max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop text-center">
                        <RevealContent durationClass="duration-1000">
                            <span className="text-clinical-blue dark:text-luxury-gold font-label-md dark:font-luxury-button tracking-[0.2em] uppercase text-sm font-bold block mb-6">Knowledge Base</span>
                            <h1 className="text-[40px] md:text-[64px] font-headline-xl dark:font-luxury-headline text-clinical-charcoal dark:text-luxury-cream mb-8 tracking-tight dark:tracking-normal leading-tight">
                                Frequently Asked <br className="hidden md:block" />
                                <span className="italic dark:not-italic font-light text-clinical-blue dark:text-luxury-gold block mt-2">Questions.</span>
                            </h1>
                            <p className="text-lg md:text-xl font-body-lg dark:font-luxury-body text-clinical-charcoal/70 dark:text-luxury-cream/80 max-w-2xl mx-auto leading-relaxed dark:font-light">
                                Discover everything you need to know about our technology, seamless integration, and your data security.
                            </p>
                        </RevealContent>
                    </div>
                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <span className="material-symbols-outlined text-clinical-blue dark:text-luxury-gold text-3xl opacity-70">expand_more</span>
                    </div>
                </section>

                {/* FAQ Content Section */}
                <section className="min-h-screen w-full flex flex-col justify-start snap-start bg-white dark:bg-luxury-cream transition-colors duration-1000 pt-40 md:pt-48 pb-32">
                    <RevealContent className="w-full max-w-[860px] mx-auto px-margin-mobile md:px-margin-desktop">
                        {/* Category Tabs */}
                        <div className="flex flex-nowrap overflow-x-auto hide-scrollbar justify-start md:justify-center gap-3 mb-16 pb-2 px-4 md:px-0">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`whitespace-nowrap
                                        px-6 py-2.5 rounded-full font-label-md dark:font-luxury-button tracking-wider text-sm transition-all duration-700 border
                                        ${activeCategory === cat
                                            ? 'bg-clinical-charcoal dark:bg-luxury-navy text-white border-clinical-charcoal dark:border-luxury-navy shadow-md'
                                            : 'bg-transparent text-clinical-charcoal/60 dark:text-luxury-navy/60 border-clinical-charcoal/20 dark:border-luxury-navy/20 hover:border-clinical-charcoal dark:hover:border-luxury-navy hover:text-clinical-charcoal dark:hover:text-luxury-navy'}
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* FAQ Accordion */}
                        <div key={activeCategory} className={`space-y-4 ${direction === 'right' ? 'animate-swipe-right' : direction === 'left' ? 'animate-swipe-left' : ''}`}>
                            {filteredFaqs.map((faq, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className={`
                                            border rounded-2xl overflow-hidden transition-all duration-700
                                            ${isOpen
                                                ? 'border-clinical-blue/30 dark:border-luxury-gold/50 bg-clinical-surface/30 dark:bg-luxury-gold/5 shadow-sm'
                                                : 'border-clinical-charcoal/10 dark:border-luxury-navy/10 bg-transparent hover:border-clinical-charcoal/30 dark:hover:border-luxury-navy/30'}
                                        `}
                                    >
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : index)}
                                            className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none"
                                        >
                                            <span className={`font-headline-md dark:font-luxury-headline text-lg md:text-xl transition-colors duration-700 ${isOpen ? 'text-clinical-blue dark:text-luxury-navy' : 'text-clinical-charcoal dark:text-luxury-navy/80'}`}>
                                                {faq.q}
                                            </span>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-700 ${isOpen ? 'rotate-180 bg-clinical-blue dark:bg-luxury-gold text-white dark:text-luxury-navy' : 'bg-clinical-surface dark:bg-luxury-navy/5 text-clinical-charcoal dark:text-luxury-navy'}`}>
                                                <span className="material-symbols-outlined text-[20px]">
                                                    keyboard_arrow_down
                                                </span>
                                            </div>
                                        </button>

                                        <div
                                            className="overflow-hidden transition-all duration-700 ease-in-out"
                                            style={{ maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0 }}
                                        >
                                            <p className="px-8 pb-8 pt-2 text-clinical-charcoal/70 dark:text-luxury-navy/70 font-body-lg dark:font-luxury-body text-base md:text-lg leading-relaxed dark:font-light">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
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
