import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoutModal } from '../../components/shared/LogoutModal';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { usePreferences } from '../../../application/context/PreferencesContext';
import { useTranslation } from '../../../application/hooks/useTranslation';

export const PatientSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const {
        isLargeText, setIsLargeText,
        isHighContrast, setIsHighContrast,
        language, setLanguage
    } = usePreferences();
    const { t } = useTranslation();

    return (
        <div className="text-on-surface w-full bg-surface-gray min-h-screen flex flex-col relative overflow-hidden">
            {/* Animated Background decorative elements */}
            <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-medical-teal/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
            <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-brand-navy/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

            <PatientHeader />

            <main className="max-w-3xl w-full mx-auto px-4 py-8 space-y-8 relative z-10 flex-grow">
                <div className="mb-10 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-medical-teal to-brand-navy flex items-center justify-center text-white shadow-lg shadow-medical-teal/20">
                        <span className="material-symbols-outlined text-4xl">settings</span>
                    </div>
                    <div>
                        <h1 className="font-headline-lg text-headline-lg text-charcoal mb-2 tracking-tight">{t('settings.title')}</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
                            {t('settings.desc')}
                        </p>
                    </div>
                </div>
                <div className="space-y-6">
                    {/* Section: Pengaturan Akun */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <span className="material-symbols-outlined text-medical-teal text-xl">account_circle</span>
                            <h2 className="font-label-bold text-label-bold text-charcoal uppercase tracking-wider">{t('settings.accountTitle')}</h2>
                        </div>
                        <section className="bg-surface-container-lowest rounded-[2rem] shadow-xl shadow-medical-teal/5 border border-surface-container-high overflow-hidden">
                            <div className="divide-y divide-outline-variant/40">
                                <button onClick={() => navigate('/patient/profile')} className="w-full p-6 flex items-center justify-between hover:bg-medical-teal/5 transition-colors duration-300 text-left group">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-on-surface-variant">manage_accounts</span>
                                        <span className="font-label-bold text-label-bold text-charcoal group-hover:text-medical-teal transition-colors">{t('settings.profile')}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Section: Aksesibilitas & Tampilan */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <span className="material-symbols-outlined text-medical-teal text-xl">accessibility_new</span>
                            <h2 className="font-label-bold text-label-bold text-charcoal uppercase tracking-wider">{t('settings.displayTitle')}</h2>
                        </div>
                        <section className="bg-surface-container-lowest rounded-[2rem] shadow-xl shadow-medical-teal/5 border border-surface-container-high overflow-hidden">
                            <div className="divide-y divide-outline-variant/40">
                                {/* Row 1 */}
                                <div className="p-6 flex items-center justify-between gap-4 hover:bg-medical-teal/5 transition-colors duration-300">
                                    <div>
                                        <h3 className="font-headline-md text-headline-sm font-bold text-charcoal mb-1">{t('settings.largeText')}</h3>
                                        <p className="text-body-md text-on-surface-variant">{t('settings.largeTextDesc')}</p>
                                    </div>
                                    <label className="toggle-switch scale-110">
                                        <input
                                            type="checkbox"
                                            checked={isLargeText}
                                            onChange={(e) => setIsLargeText(e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                {/* Row 2 */}
                                <div className="p-6 flex items-center justify-between gap-4 hover:bg-medical-teal/5 transition-colors duration-300">
                                    <div>
                                        <h3 className="font-headline-md text-headline-sm font-bold text-charcoal mb-1">{t('settings.highContrast')}</h3>
                                        <p className="text-body-md text-on-surface-variant">{t('settings.highContrastDesc')}</p>
                                    </div>
                                    <label className="toggle-switch scale-110">
                                        <input
                                            type="checkbox"
                                            checked={isHighContrast}
                                            onChange={(e) => setIsHighContrast(e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                {/* Row 4 */}
                                <div className="p-6 flex items-center justify-between gap-4 hover:bg-medical-teal/5 transition-colors duration-300">
                                    <div>
                                        <h3 className="font-headline-md text-headline-sm font-bold text-charcoal mb-1">{t('settings.languageMode')}</h3>
                                        <p className="text-body-md text-on-surface-variant">{t('settings.languageModeDesc')}</p>
                                    </div>
                                    <select
                                        className="bg-surface border border-outline-variant/60 rounded-xl px-4 py-2.5 text-charcoal font-medium text-sm outline-none focus:border-medical-teal transition-colors shadow-sm cursor-pointer"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    >
                                        <option value="id">Bahasa Indonesia</option>
                                        <option value="en">English (US)</option>
                                        <option value="zh">中文 (Chinese)</option>
                                        <option value="he">עברית (Hebrew)</option>
                                        <option value="ar">العربية (Arabic)</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Section: Bantuan & Tentang Aplikasi */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <span className="material-symbols-outlined text-medical-teal text-xl">help</span>
                            <h2 className="font-label-bold text-label-bold text-charcoal uppercase tracking-wider">{t('settings.helpTitle')}</h2>
                        </div>
                        <section className="bg-surface-container-lowest rounded-[2rem] shadow-xl shadow-medical-teal/5 border border-surface-container-high overflow-hidden">
                            <div className="divide-y divide-outline-variant/40">

                                <a href="https://wa.me/6281227884743" target="_blank" rel="noopener noreferrer" className="w-full p-6 flex items-center justify-between gap-4 hover:bg-medical-teal/5 transition-colors duration-300 text-left group cursor-pointer block">
                                    <div>
                                        <h3 className="font-headline-md text-headline-sm font-bold text-charcoal mb-1 group-hover:text-medical-teal transition-colors">{t('settings.support')}</h3>
                                        <p className="text-body-md text-on-surface-variant">{t('settings.supportDesc')}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
                                </a>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-12 pb-16 flex flex-col gap-4">
                    <button
                        onClick={() => alert(t('settings.savedAlert'))}
                        className="w-full py-4 bg-gradient-to-r from-medical-teal to-brand-navy text-white font-label-bold rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-medical-teal/30 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 outline-none"
                    >
                        <span className="material-symbols-outlined">save</span>
                        {t('settings.save')}
                    </button>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full py-4 bg-surface-container-lowest text-brand-red border border-brand-red/30 hover:bg-brand-red/5 font-label-bold rounded-xl active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 outline-none"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        {t('settings.logout')}
                    </button>

                    <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-2">Terakhir diperbarui: 4 Agustus 2026</p>
                </div>
            </main>
            <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
        </div>
    );
};
