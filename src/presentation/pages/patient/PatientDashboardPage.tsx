import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnection } from '../../../application/context/ConnectionContext';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { useTranslation } from '../../../application/hooks/useTranslation';
import { APP_CONFIG } from '../../../core/config';

interface PatientProfile {
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    primary_doctor_id: number | null;
    profile_photo: string | null;
  };
  doctor: {
    id: number;
    first_name: string;
    last_name: string;
    profile_photo: string | null;
  } | null;
}


export const PatientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { connectedDoctor, setConnectedDoctor, disconnectAll } = useConnection();
  const { t, tArray } = useTranslation();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const greetings = tArray('dashboard.greetingsArray');
  const healthTips = tArray('dashboard.healthTipsListArray');

  const randomGreetingText = useMemo(() => {
    if (!greetings.length) return '';
    return greetings[Math.floor(Math.random() * greetings.length)];
  }, [greetings]);

  const randomHealthTipText = useMemo(() => {
    if (!healthTips.length) return '';
    return healthTips[Math.floor(Math.random() * healthTips.length)];
  }, [healthTips]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return t('dashboard.greetingMorning');
    if (hour >= 11 && hour < 15) return t('dashboard.greetingAfternoon');
    if (hour >= 15 && hour < 18) return t('dashboard.greetingEvening');
    return t('dashboard.greetingNight');
  };

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return '';
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  };

  useEffect(() => {
    const fetchDashboardProfile = () => {
      const userId = localStorage.getItem('user_id') || '1';
      fetch(`${APP_CONFIG.API_URL}/api/patients/${userId}`)
        .then(res => {
          if (!res.ok) throw new Error('API offline');
          return res.json();
        })
        .then(data => setProfile(data))
        .catch(err => {
          console.error("Error fetching patient profile:", err);
          const savedMock = localStorage.getItem('mock_patient_profile');
          if (savedMock) {
            setProfile(JSON.parse(savedMock));
          }
        });

      fetch(`${APP_CONFIG.API_URL}/api/patients/${userId}/sessions`)
        .then(res => res.json())
        .then(data => setSessions(data))
        .catch(err => console.error("Error fetching sessions:", err));
    };

    fetchDashboardProfile();

    const handleUpdate = () => {
      fetchDashboardProfile();
    };

    window.addEventListener('patient_profile_updated', handleUpdate);
    return () => window.removeEventListener('patient_profile_updated', handleUpdate);
  }, []);

  const activeSession = sessions.find(s => !s.ended_at);
  const isRecording = !!activeSession;

  useEffect(() => {
    const fetchDoctorProfile = () => {
      const docIdToFetch = (connectedDoctor && connectedDoctor.id) || (activeSession && activeSession.doctor_id);
      if (docIdToFetch) {
        fetch(`${APP_CONFIG.API_URL}/api/doctors/${docIdToFetch}`)
          .then(res => {
            if (!res.ok) throw new Error('Doctor API offline');
            return res.json();
          })
          .then(data => {
            if (data) {
              const newName = `Dr. ${data.first_name} ${data.last_name}`;
              const newPhoto = data.profile_photo || undefined;
              if (connectedDoctor) {
                if (newName !== connectedDoctor.name || newPhoto !== connectedDoctor.photo || docIdToFetch !== connectedDoctor.id) {
                  setConnectedDoctor({
                    ...connectedDoctor,
                    id: docIdToFetch,
                    name: newName,
                    photo: newPhoto
                  });
                }
              } else {
                 setConnectedDoctor({
                    id: docIdToFetch,
                    name: newName,
                    hospital: "",
                    photo: newPhoto
                 });
              }
            }
          })
          .catch(err => {
            console.error("Gagal me-refresh data dokter dari database:", err);
          });
      }
    };

    fetchDoctorProfile();

    window.addEventListener('doctor_profile_updated', fetchDoctorProfile);
    return () => window.removeEventListener('doctor_profile_updated', fetchDoctorProfile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedDoctor?.id, activeSession?.doctor_id]);

  const patientName = profile ? `${profile.patient.first_name} ${profile.patient.last_name}` : t('dashboard.loading');

  const displayDoctor = profile?.doctor ? {
    name: `Dr. ${profile.doctor.first_name} ${profile.doctor.last_name}`,
    hospital: t('dashboard.doctorRole'),
    photo: profile.doctor.profile_photo,
    isLive: !!connectedDoctor
  } : connectedDoctor ? {
    name: connectedDoctor.name,
    hospital: connectedDoctor.hospital || '',
    photo: connectedDoctor.photo || null,
    isLive: true
  } : null;

  return (
    <div className="text-on-surface w-full">

      {/* Top Navigation Bar */}
      <PatientHeader />
      {/* Main Content Area */}
      <main className="max-w-container-max mx-auto px-gutter py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Main Patient Monitoring */}
          <div className="lg:col-span-8 flex flex-col h-full gap-6">
            {/* Live Device Status */}
            {isRecording && (
              <section className="glass-card rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isRecording ? 'bg-status-green/10' : 'bg-outline-variant/30'}`}>
                    <span className={`material-symbols-outlined text-3xl ${isRecording ? 'text-status-green' : 'text-on-surface-variant'}`}>sensors</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline-md text-headline-md text-on-surface">{isRecording ? t('dashboard.deviceRecording') : t('dashboard.deviceInactive')}</h2>
                      <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-status-green pulse-dot' : 'bg-outline-variant'}`}></div>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{isRecording ? t('dashboard.deviceRecordingDesc') : t('dashboard.deviceInactiveDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 bg-surface-container-low p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-status-green">battery_very_low</span>
                    <span className="font-label-bold text-label-bold">85% - {t('dashboard.batteryGood')}</span>
                  </div>
                  <div className="w-px h-6 bg-outline-variant"></div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">wifi</span>
                    <span className="font-label-bold text-label-bold">{t('dashboard.cloudSync')}</span>
                  </div>
                </div>
              </section>
            )}
            {/* Daily Trend Visualization */}
            <div className="bg-gradient-to-br from-white to-medical-teal/5 p-6 md:p-8 rounded-3xl shadow-sm border border-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-72 h-72 bg-medical-teal/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-10 w-48 h-48 bg-brand-red/5 rounded-full translate-y-1/2 blur-3xl pointer-events-none"></div>

              <div className="z-10 flex flex-col">
                <h2 className="text-2xl md:text-3xl font-bold text-charcoal mb-2 flex items-center flex-wrap gap-2">
                  {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-medical-teal to-brand-navy">{profile?.patient.first_name || 'Memuat...'}</span>
                  <span className="inline-block origin-bottom-right hover:rotate-12 transition-transform cursor-default">👋</span>
                </h2>
                <p className="text-base md:text-lg text-on-surface-variant/70 max-w-2xl leading-relaxed">{randomGreetingText}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center shrink-0 z-10 border border-white shadow-lg shadow-medical-teal/5 hidden md:flex hover:scale-105 active:scale-95 transition-transform duration-300 group cursor-pointer" title="Jaga kesehatan jantung Anda!">
                <span className="material-symbols-outlined text-4xl text-brand-red transition-transform duration-300 group-hover:scale-125 group-active:scale-90" style={{ fontVariationSettings: '"FILL" 1' }}>favorite</span>
              </div>
            </div>

            <h3 className="font-headline-md text-headline-md text-charcoal mb-0 mt-auto">{t('dashboard.menuAccess')}</h3>
            <div className="flex flex-col gap-4 flex-1">
              <div onClick={() => navigate('/patient/qr-sync')} className="bg-gradient-to-br from-medical-teal to-brand-navy border-transparent text-white p-6 rounded-2xl flex items-center gap-4 md:gap-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative border flex-1">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <span className="material-symbols-outlined text-[160px] translate-x-1/4">qr_code_2</span>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 z-10 transition-colors bg-surface-container-lowest/20 backdrop-blur-sm border border-white/30 text-white">
                  <span className="material-symbols-outlined text-3xl">qr_code_2</span>
                </div>
                <div className="flex flex-col z-10">
                  <p className="text-xl font-bold mb-1 text-white">{t('dashboard.qrSyncTitle')}</p>
                  <p className="text-base text-white/80">{t('dashboard.qrSyncDesc')}</p>
                </div>
              </div>

              <div onClick={() => navigate('/patient/history')} className="bg-gradient-to-br from-medical-teal to-brand-navy border-transparent text-white p-6 rounded-2xl flex items-center gap-4 md:gap-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative border flex-1">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <span className="material-symbols-outlined text-[160px] translate-x-1/4">history</span>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 z-10 transition-colors bg-surface-container-lowest/20 backdrop-blur-sm border border-white/30 text-white">
                  <span className="material-symbols-outlined text-3xl">history</span>
                </div>
                <div className="flex flex-col z-10">
                  <p className="text-xl font-bold mb-1 text-white">{t('dashboard.historyTitle')}</p>
                  <p className="text-base text-white/80">{t('dashboard.historyDesc')}</p>
                </div>
              </div>

              <div onClick={() => navigate('/patient/settings')} className="bg-gradient-to-br from-medical-teal to-brand-navy border-transparent text-white p-6 rounded-2xl flex items-center gap-4 md:gap-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative border flex-1">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  <span className="material-symbols-outlined text-[160px] translate-x-1/4">person</span>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 z-10 transition-colors bg-surface-container-lowest/20 backdrop-blur-sm border border-white/30 text-white">
                  <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <div className="flex flex-col z-10">
                  <p className="text-xl font-bold mb-1 text-white">{t('dashboard.settingsTitle')}</p>
                  <p className="text-base text-white/80">{t('dashboard.settingsDesc')}</p>
                </div>
              </div>
            </div>
            {/* Quick Action: QR Sync */}
          </div>
          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Connected Doctor Card */}
            {/* Connected Doctor Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-high shadow-sm flex flex-col items-center text-center">
              <div className="w-full flex justify-center border-b border-surface-container-high pb-4 mb-6">
                <h4 className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-widest">{t('dashboard.connectedDoctor')}</h4>
              </div>

              {displayDoctor ? (
                <>
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full border-4 border-surface-container-high overflow-hidden shadow-sm flex items-center justify-center bg-surface-container text-3xl font-bold text-on-surface-variant">
                      {displayDoctor.photo ? (
                        <img src={displayDoctor.photo} alt="Doctor" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-5xl">person</span>
                      )}
                    </div>
                    {displayDoctor.isLive && (
                      <div className="absolute bottom-1 right-1 bg-status-green w-5 h-5 rounded-full border-4 border-white"></div>
                    )}
                  </div>
                  <h5 className="font-headline-md text-headline-md text-charcoal">{displayDoctor.name}</h5>
                  {displayDoctor.hospital && (
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">{displayDoctor.hospital}</p>
                  )}

                  {displayDoctor.isLive ? (
                    <div className="bg-status-green/10 px-4 py-2 rounded-full mb-8">
                      <span className="font-label-bold text-label-bold text-status-green flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                        {t('dashboard.liveMonitoring')}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-medical-teal/10 px-4 py-2 rounded-full mb-8">
                      <span className="font-label-bold text-label-bold text-medical-teal flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
                        {t('dashboard.primaryDoctor')}
                      </span>
                    </div>
                  )}

                  <div className="w-full mt-4 space-y-3">
                    <button onClick={() => alert(t('dashboard.comingSoon'))} className="w-full py-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-bold text-label-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">chat</span>
                      {t('dashboard.sendMessage')}
                    </button>
                    {displayDoctor.isLive && (
                      <button onClick={() => setShowDisconnectModal(true)} className="w-full py-3 bg-error/10 hover:bg-error/20 text-error font-label-bold text-label-bold rounded-lg transition-colors flex items-center justify-center gap-2 border border-error/20">
                        <span className="material-symbols-outlined text-sm">sync_disabled</span>
                        {t('dashboard.cancelSync')}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-6 text-on-surface-variant/50">
                    <span className="material-symbols-outlined text-5xl">person_off</span>
                  </div>
                  <h5 className="font-headline-md text-headline-md text-charcoal mb-2">{t('dashboard.notConnected')}</h5>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">{t('dashboard.notConnectedDesc')}</p>

                  <div className="bg-surface-container-high px-4 py-2 rounded-full mb-8">
                    <span className="font-label-bold text-label-bold text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>pending</span>
                      {t('dashboard.waitingAssignment')}
                    </span>
                  </div>

                  <div className="w-full mt-2">
                    <button onClick={() => navigate('/patient/qr-sync')} className="w-full py-3 bg-medical-teal text-white font-label-bold text-label-bold rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                      <span className="material-symbols-outlined text-sm">qr_code_2</span>
                      {t('dashboard.qrSyncTitle')}
                    </button>
                  </div>
                </>
              )}
            </div>
            {/* System Information Card */}
            <div className="rounded-3xl p-8 bg-brand-navy text-white overflow-hidden relative shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl">favorite</span>
              </div>
              <h4 className="font-label-bold text-label-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                {t('dashboard.healthTips')}
              </h4>
              <p className="font-body-sm text-body-sm text-surface-variant leading-relaxed">
                {randomHealthTipText}
              </p>
            </div>
          </aside>
        </div>
      </main>
      {/* Mobile Bottom Nav Spacer */}
      <div className="h-16 md:hidden"></div>

      {/* Disconnect Modals */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm border border-outline-variant shadow-xl animate-in zoom-in-50 fade-in duration-500 ease-spring">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4 text-error">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-charcoal mb-2">{t('dashboard.cancelSyncModalTitle')}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">{t('dashboard.cancelSyncModalDesc')}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDisconnectModal(false)} className="flex-1 py-2 rounded-lg font-label-bold text-label-bold border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors">{t('dashboard.cancel')}</button>
              <button onClick={() => {
                disconnectAll();
                setShowDisconnectModal(false);
                setShowSuccessModal(true);
              }} className="flex-1 py-2 rounded-lg font-label-bold text-label-bold bg-error text-white hover:bg-red-600 transition-colors shadow-sm">{t('dashboard.yesDisconnect')}</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm border border-outline-variant shadow-xl text-center animate-in zoom-in-50 fade-in duration-500 ease-spring">
            <div className="w-16 h-16 rounded-full bg-status-green/10 flex items-center justify-center mb-4 text-status-green mx-auto">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-charcoal mb-2">{t('dashboard.successDisconnectTitle')}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">{t('dashboard.successDisconnectDesc')}</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-lg font-label-bold text-label-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm">{t('dashboard.close')}</button>
          </div>
        </div>
      )}

    </div>
  );
};
