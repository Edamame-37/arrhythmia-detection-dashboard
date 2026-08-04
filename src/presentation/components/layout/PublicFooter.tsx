import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-clinical-surface dark:bg-luxury-navy text-clinical-charcoal dark:text-luxury-cream transition-colors duration-700 py-20 border-t border-clinical-charcoal/5 dark:border-luxury-gold/10">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <img alt="ecgrhythmia logo" className="h-10 w-auto cursor-pointer opacity-90 hover:opacity-100 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVHX00UF6lwM6kjDUMgD4Jv6lMMp5h2u1ZBPFlnvJJNam11nmTsrGtn_y5NNHv61wLHc3plhgbJeduSWPWMT-xKDKHnnifesb9pERppu-cGEHZODeFvF8XLLfRKpP1GdLDV5iINEmqPsbVTFdQZhAPCXP6aHQm-ecIuBbV0YG8GByhRtVQ6xZQrpQpUmXqjqW6DWiEZHDW8D81u4xSnTtsE-7HlTKrn6GuXcYUOYjdpCvaEqIKW1ghrNjEt5sTxTf_o6esUGi3HzNB" onClick={() => navigate('/auth/login')} title="Admin Access" />
                            <div className="font-headline-md dark:font-luxury-headline text-[26px] tracking-tight">
                                <span className="text-clinical-red dark:text-luxury-gold">ecg</span>
                                <span>rhythmia</span>
                            </div>
                        </div>
                        <p className="font-body-md dark:font-luxury-body text-clinical-charcoal/70 dark:text-luxury-cream/60 max-w-sm leading-relaxed dark:font-light">
                            Pioneering the intersection of medical precision and daily luxury. Monitoring heart health has never been this elegant.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <h4 className="font-label-md dark:font-luxury-button tracking-widest uppercase text-xs font-bold text-clinical-blue dark:text-luxury-gold">Navigation</h4>
                        <ul className="space-y-4 font-body-md dark:font-luxury-body text-clinical-charcoal/80 dark:text-luxury-cream/80">
                            <li><Link to="/" className="hover:text-clinical-blue dark:hover:text-luxury-gold transition-colors">Home</Link></li>
                            <li><Link to="/how-it-works" className="hover:text-clinical-blue dark:hover:text-luxury-gold transition-colors">How It Works</Link></li>
                            <li><Link to="/faq" className="hover:text-clinical-blue dark:hover:text-luxury-gold transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="font-label-md dark:font-luxury-button tracking-widest uppercase text-xs font-bold text-clinical-blue dark:text-luxury-gold">Contact</h4>
                        <ul className="space-y-4 font-body-md dark:font-luxury-body text-clinical-charcoal/80 dark:text-luxury-cream/80">
                            <li>pkmkcwearableecg@gmail.com</li>
                            <li className="pt-2 text-sm text-clinical-charcoal/50 dark:text-luxury-cream/40">Semarang, Central Java, Indonesia</li>
                        </ul>
                    </div>
                </div>

                {/* Supported By */}
                <div className="pt-8 pb-12">
                    <h4 className="font-label-md dark:font-luxury-button tracking-widest uppercase text-xs font-bold text-clinical-charcoal/50 dark:text-luxury-cream/50 mb-8 text-center">Supported By</h4>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-90">
                        <img src="/icons/1_Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.png" alt="Kemendikbud" className="h-12 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105" />
                        <img src="/icons/2_Primary_Horizontal-Logo.png" alt="Primary Logo" className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105" />
                        <img src="/icons/3_Logo%20Belmawa%20Bersinergi%20-%20Warna.png" alt="Belmawa" className="h-10 md:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105" />
                        <img src="/icons/4_logo-simbelmawa.png" alt="Simbelmawa" className="h-10 md:h-14 w-auto object-contain transition-transform duration-300 hover:scale-105" />
                        <img src="/icons/5_Logo%20PKM%20-%20Warna.png" alt="PKM" className="h-12 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105" />
                        <img src="/icons/6_Undip-Logo%20(1).png" alt="Undip" className="h-12 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105" />
                    </div>
                </div>

                <div className="border-t border-clinical-charcoal/10 dark:border-luxury-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-body-md dark:font-luxury-body text-sm text-clinical-charcoal/60 dark:text-luxury-cream/50 dark:font-light">
                        &copy; {currentYear} ecgrhythmia. All rights reserved.
                    </p>
                    <div className="flex gap-6 font-body-md dark:font-luxury-body text-sm text-clinical-charcoal/60 dark:text-luxury-cream/50 dark:font-light">
                        <span className="hover:text-clinical-blue dark:hover:text-luxury-gold cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="hover:text-clinical-blue dark:hover:text-luxury-gold cursor-pointer transition-colors">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
