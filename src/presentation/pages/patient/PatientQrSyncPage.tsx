import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { useTranslation } from '../../../application/hooks/useTranslation';
import { APP_CONFIG } from '../../../core/config';

interface PatientProfile {
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    profile_photo: string | null;
  };
}

export const PatientQrSyncPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || '1';
    fetch(`${APP_CONFIG.API_URL}/api/patients/${userId}`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error("Error fetching patient profile:", err));
  }, []);

  const patientName = profile ? `${profile.patient.first_name} ${profile.patient.last_name}` : t('profile.loading');
  const patientIdFormatted = profile ? `PAT-${profile.patient.id.toString().padStart(4, '0')}-XYZ` : t('profile.loading');

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return '';
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  };

  return (
    <div className="text-on-surface w-full bg-surface-gray min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <PatientHeader />

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-gutter py-8 md:py-12 flex flex-col flex-grow justify-center">

        {/* Animated Background decorative elements */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-medical-teal/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
        <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-brand-navy/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>


        {/* Sync Card Two-Column Layout */}
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-xl shadow-medical-teal/5 border border-surface-container-high flex flex-col md:flex-row w-full relative overflow-hidden group">

          {/* Left Side: QR Code Area */}
          <div className="md:w-1/2 p-6 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-outline-variant/30 relative bg-surface-container-lowest z-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-medical-teal/5 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110"></div>


            <h1 className="font-headline-md text-headline-md text-charcoal mb-2 z-10 text-center">{t('qrSync.title')}</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[240px] text-center leading-relaxed mb-8 z-10">
              {t('qrSync.desc')}
            </p>

            {/* Real QR Code Display */}
            <div className="bg-white p-4 rounded-3xl shadow-md border border-outline-variant/30 mb-8 z-10 group-hover:shadow-lg transition-shadow duration-500 hover:scale-105">
              {profile ? (
                <QRCode
                  value={`ecgrhythmia://sync/patient/${profile.patient.id}`}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#0A2540"
                  level="H"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center bg-surface-container-lowest animate-pulse rounded-2xl">
                  <span className="material-symbols-outlined text-outline-variant text-5xl">qr_code_2</span>
                </div>
              )}
            </div>

            {/* Patient ID Info */}
            <div className="w-full bg-surface-container-lowest rounded-2xl p-4 flex flex-col items-center gap-1 border border-outline-variant z-10 shadow-inner group-hover:border-medical-teal/30 transition-colors">
              <span className="text-[10px] font-label-md text-on-surface-variant uppercase tracking-widest font-bold">{t('qrSync.patientId')}</span>
              <p className="font-mono text-lg font-bold text-charcoal tracking-[0.1em]">
                {patientIdFormatted}
              </p>
            </div>
          </div>

          {/* Right Side: Instructions & Security */}
          <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-surface-gray z-10">
            <h2 className="text-xl font-bold text-charcoal mb-6">{t('qrSync.howToSync')}</h2>

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-medical-teal text-white flex items-center justify-center shrink-0 font-bold shadow-sm">1</div>
                <div>
                  <h3 className="font-bold text-charcoal text-base mb-1">{t('qrSync.step1Title')}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{t('qrSync.step1Desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-medical-teal text-white flex items-center justify-center shrink-0 font-bold shadow-sm">2</div>
                <div>
                  <h3 className="font-bold text-charcoal text-base mb-1">{t('qrSync.step2Title')}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{t('qrSync.step2Desc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-medical-teal text-white flex items-center justify-center shrink-0 font-bold shadow-sm">3</div>
                <div>
                  <h3 className="font-bold text-charcoal text-base mb-1">{t('qrSync.step3Title')}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{t('qrSync.step3Desc')}</p>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/50 my-8" />

            {/* Security Badge */}
            <div className="bg-status-green/5 border border-status-green/20 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-status-green/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-status-green text-2xl">verified_user</span>
              </div>
              <div>
                <h4 className="font-bold text-status-green text-sm mb-1 flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-green"></span>
                  </span>
                  {t('qrSync.encrypted')}
                </h4>
                <p className="text-xs text-on-surface-variant">{t('qrSync.encryptedDesc')}</p>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
