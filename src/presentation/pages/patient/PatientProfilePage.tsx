import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoutModal } from '../../components/shared/LogoutModal';
import { PatientHeader } from '../../components/layout/PatientHeader';
import { useTranslation } from '../../../application/hooks/useTranslation';
import { APP_CONFIG } from '../../../core/config';

export const PatientProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { t } = useTranslation();

    // Profile data state
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        profile_photo: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('user_id') || '1'; // Default to 1 if not logged in for testing
        fetchProfile(userId);
    }, []);

    const fetchProfile = async (userId: string) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${APP_CONFIG.API_URL}/api/patients/${userId}`);
            if (!response.ok) throw new Error(t('profile.fetchError'));
            const data = await response.json();
            setProfile(data);
            
            // Populate form data
            if (data && data.patient) {
                setFormData({
                    first_name: data.patient.first_name || '',
                    last_name: data.patient.last_name || '',
                    date_of_birth: data.patient.date_of_birth || '',
                    profile_photo: data.patient.profile_photo || ''
                });
            }
        } catch (err: any) {
            console.error("Error fetching patient profile:", err);
            setError(err.message || t('profile.fetchError'));
            
            // Fallback for UI visualization if server is off
            const savedMock = localStorage.getItem('mock_patient_profile');
            let mockData;
            if (savedMock) {
                mockData = JSON.parse(savedMock);
            } else {
                mockData = {
                    patient: {
                        id: parseInt(userId),
                        first_name: 'Budi',
                        last_name: 'Santoso',
                        date_of_birth: '1968-05-12',
                        profile_photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQ0uEsAKEJ35lYFco-uP_vXQ6H-pXYfl4gMz5Tu4x5cIRXy_OUpMD68BU_iIYd2zfCcdMordvK3mPI_DkqchZifxr3BV9omv2qzSipTCs8WkY-x0uudqBJ54VzaA9W6_NyVAUJ_Rb8rYSodpiC7L-91vz0MrYpI3F6yZ32er1x6AlM-P02VbBkAatansWqbncKJzLpfQJIcOUvsJwkzQ_3nDbpYi1yC8uox5YF6IV5AgVX3uwbngpSkxuR4-InIetFQiCUP9yI5yBf'
                    },
                    doctor: {
                        id: 2,
                        first_name: 'Fikri',
                        last_name: 'Ahmad',
                        hospital: 'Klinik Jantung Sehat',
                        profile_photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9y3H1x3YF-j_V7K-gXpYt9o_4jA1vXhX5Lz_11WnKxV2pZ9jC99xR6_0B6xO9H5k332PqD8Q_kM4b8xK6jH0wQ6C2pP6aG2O3Y0L4lR6L2N3c2lQ2g_qL6bY9hA8sJ6I6v6t6_hG4P3j6xO3yI_4n_s_tI8mD7K_kH2sK4X6_tV0lZ3gB9a_tP5O0_2k4m_y1'
                    }
                };
            }
            setProfile(mockData);
            setFormData({
                first_name: mockData.patient.first_name,
                last_name: mockData.patient.last_name,
                date_of_birth: mockData.patient.date_of_birth,
                profile_photo: mockData.patient.profile_photo
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        const userId = localStorage.getItem('user_id') || '1';
        
        try {
            const response = await fetch(`${APP_CONFIG.API_URL}/api/patients/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    date_of_birth: formData.date_of_birth,
                    profile_photo: formData.profile_photo || null
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setIsEditing(false);
                fetchProfile(userId); // Refresh data
                window.dispatchEvent(new Event('patient_profile_updated')); // Notify other components
                setShowSuccessPopup(true);
                setTimeout(() => setShowSuccessPopup(false), 3000);
            } else {
                setError(data.message || t('profile.saveFailed'));
            }
        } catch (err) {
            setError(t('profile.serverError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({...formData, profile_photo: reader.result as string});
            };
            reader.readAsDataURL(file);
        }
    };

    const calculateAge = (dobString: string) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const diffMs = Date.now() - dob.getTime();
        const ageDate = new Date(diffMs); 
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    return (
        <div className="bg-background text-on-surface antialiased overflow-hidden flex flex-col h-screen w-full font-sans">
            <PatientHeader />

            <main className="flex-1 overflow-y-auto custom-scrollbar bg-surface-container-lowest relative">
                {/* Premium Banner */}
                <div className="w-full h-48 bg-gradient-to-r from-medical-teal to-brand-navy relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                </div>

                <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-12 -mt-20 relative z-10 space-y-6">
                    <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/40 overflow-hidden flex flex-col lg:flex-row">
                        
                        {/* Profile Info Section */}
                        <div className="p-8 lg:p-12 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-outline-variant/30 bg-surface-container-lowest flex flex-col items-center text-center">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-surface-container flex items-center justify-center mb-6 ring-4 ring-medical-teal/20">
                                {profile?.patient?.profile_photo ? (
                                    <img alt="Profile" className="w-full h-full object-cover" src={profile.patient.profile_photo} />
                                ) : (
                                    <span className="material-symbols-outlined text-6xl text-on-surface-variant">person</span>
                                )}
                            </div>
                            <h2 className="text-2xl font-extrabold text-charcoal tracking-tight mb-1">
                                {isLoading ? t('profile.loading') : (profile ? `${profile.patient.first_name} ${profile.patient.last_name}` : t('profile.notFound'))}
                            </h2>
                            <p className="text-xs font-bold text-medical-teal uppercase tracking-[0.2em] mb-6 flex items-center gap-1 justify-center">
                                <span className="material-symbols-outlined text-[14px]">badge</span>
                                {profile?.patient?.id ? `PAT-${profile.patient.id.toString().padStart(4, '0')}` : '---'}
                            </p>
                            
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} disabled={isLoading || !profile} className="w-full bg-inverse-surface text-inverse-on-surface hover:bg-black font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    {t('profile.editProfile')}
                                </button>
                            )}
                        </div>

                        {/* Details & Form Section */}
                        <div className="p-8 lg:p-12 lg:w-2/3 bg-surface-container-lowest">
                            <h3 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-medical-teal">manage_accounts</span>
                                {isEditing ? t('profile.updateInfo') : t('profile.accountDetails')}
                            </h3>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-alert-red text-alert-red text-sm font-bold rounded-r-lg flex items-center gap-3">
                                    <span className="material-symbols-outlined">error</span>
                                    {error}
                                </div>
                            )}

                            {!isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-surface-container-low/30 p-5 rounded-xl border border-outline-variant/50 transition-all hover:border-medical-teal/30 hover:shadow-sm">
                                            <p className="text-[10px] text-outline uppercase font-bold tracking-widest mb-1">{t('profile.firstName')}</p>
                                            <p className="text-base font-bold text-charcoal">{isLoading ? '---' : profile?.patient?.first_name}</p>
                                        </div>
                                        <div className="bg-surface-container-low/30 p-5 rounded-xl border border-outline-variant/50 transition-all hover:border-medical-teal/30 hover:shadow-sm">
                                            <p className="text-[10px] text-outline uppercase font-bold tracking-widest mb-1">{t('profile.lastName')}</p>
                                            <p className="text-base font-bold text-charcoal">{isLoading ? '---' : profile?.patient?.last_name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-surface-container-low/30 p-5 rounded-xl border border-outline-variant/50 transition-all hover:border-medical-teal/30 hover:shadow-sm">
                                            <p className="text-[10px] text-outline uppercase font-bold tracking-widest mb-1">{t('profile.dob')}</p>
                                            <p className="text-base font-bold text-charcoal flex items-center gap-2">
                                                {isLoading ? '---' : (profile?.patient?.date_of_birth ? new Date(profile.patient.date_of_birth).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-')}
                                            </p>
                                        </div>
                                        <div className="bg-surface-container-low/30 p-5 rounded-xl border border-outline-variant/50 transition-all hover:border-medical-teal/30 hover:shadow-sm">
                                            <p className="text-[10px] text-outline uppercase font-bold tracking-widest mb-1">{t('profile.age')}</p>
                                            <p className="text-base font-bold text-charcoal">
                                                {isLoading ? '---' : (calculateAge(profile?.patient?.date_of_birth) ? `${calculateAge(profile.patient.date_of_birth)} ${t('profile.yearsOld')}` : '-')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveProfile} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-charcoal uppercase tracking-wider">{t('profile.firstName')}</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.first_name}
                                                onChange={e => setFormData({...formData, first_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-teal focus:border-transparent text-charcoal font-medium transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-charcoal uppercase tracking-wider">{t('profile.lastName')}</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.last_name}
                                                onChange={e => setFormData({...formData, last_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-teal focus:border-transparent text-charcoal font-medium transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-charcoal uppercase tracking-wider">{t('profile.dob')}</label>
                                        <input 
                                            type="date" 
                                            value={formData.date_of_birth}
                                            onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
                                            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-teal focus:border-transparent text-charcoal font-medium transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-charcoal uppercase tracking-wider">{t('profile.uploadPhoto')}</label>
                                        <div className="flex items-center gap-4">
                                            {formData.profile_photo && formData.profile_photo.startsWith('data:') && (
                                                <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant shrink-0">
                                                    <img src={formData.profile_photo} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-medical-teal/10 file:text-medical-teal hover:file:bg-medical-teal/20 transition-all cursor-pointer"
                                            />
                                        </div>
                                        <p className="text-[10px] text-on-surface-variant">{t('profile.uploadHint')}</p>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-outline-variant/30 mt-6">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setIsEditing(false);
                                                setError('');
                                                if (profile && profile.patient) {
                                                    setFormData({
                                                        first_name: profile.patient.first_name,
                                                        last_name: profile.patient.last_name,
                                                        date_of_birth: profile.patient.date_of_birth,
                                                        profile_photo: profile.patient.profile_photo || ''
                                                    });
                                                }
                                            }}
                                            className="flex-1 px-6 py-3 border-2 border-outline-variant text-charcoal font-bold rounded-xl hover:bg-surface-container transition-all"
                                        >
                                            {t('profile.cancel')}
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="flex-1 px-6 py-3 bg-medical-teal text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> {t('profile.saving')}</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-[18px]">save</span> {t('profile.save')}</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Section: Izin Akses Dokter */}
                    {!isLoading && profile?.doctor && !isEditing && (
                        <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/40 overflow-hidden">
                            <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest flex items-center gap-3">
                                <span className="material-symbols-outlined text-medical-teal text-[24px]">verified_user</span>
                                <h3 className="text-lg font-bold text-charcoal">{t('profile.doctorAccess')}</h3>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 p-0.5 bg-surface-container-lowest border-medical-teal">
                                                {profile.doctor.profile_photo ? (
                                                    <img className="w-full h-full rounded-full object-cover" src={profile.doctor.profile_photo} alt={`Dr. ${profile.doctor.first_name}`}/>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[32px] w-full h-full flex items-center justify-center text-on-surface-variant bg-surface-container-lowest">person</span>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full bg-green-500 shadow-sm"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-headline-sm text-headline-sm text-charcoal font-bold">Dr. {profile.doctor.first_name} {profile.doctor.last_name}</h4>
                                            <p className="text-label-md font-label-md text-on-surface-variant">{t('profile.doctorRole')} <span className="text-outline-variant mx-1">•</span> {profile.doctor.hospital || 'Klinik Jantung Sehat'}</p>
                                            
                                            <span className="inline-flex items-center mt-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                                {t('profile.accessActive')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => alert(t('profile.revokeAlert'))} className="w-full md:w-auto px-6 py-2.5 rounded-full border border-brand-red text-brand-red font-label-bold text-label-bold hover:bg-brand-red hover:text-white transition-all shadow-sm focus:ring-4 focus:ring-red-100">
                                        {t('profile.revokeAccess')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logout Section */}
                    {!isEditing && (
                        <div className="pt-4">
                            <button onClick={() => setIsLogoutModalOpen(true)} className="w-full bg-surface-container-lowest p-6 rounded-2xl border border-brand-red/20 text-brand-red hover:bg-red-50 hover:border-brand-red/40 transition-all font-bold flex items-center justify-center gap-3 group shadow-sm focus:ring-4 focus:ring-red-100 outline-none">
                                <span className="material-symbols-outlined text-[24px] group-hover:scale-110 group-hover:-translate-x-1 transition-transform">logout</span>
                                <span className="text-lg">{t('profile.logout')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-surface-container-lowest border border-medical-teal/20 shadow-xl p-4 rounded-xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300 pointer-events-none">
                    <span className="material-symbols-outlined text-medical-teal text-[28px]">check_circle</span>
                    <p className="font-bold text-charcoal text-sm md:text-base pr-2">{t('profile.saveSuccess')}</p>
                </div>
            )}
        </div>
    );
};
