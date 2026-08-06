import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export const PatientHeader: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [profile, setProfile] = useState<PatientProfile | null>(null);

    useEffect(() => {
        const fetchHeaderProfile = () => {
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
        };

        fetchHeaderProfile();

        const handleUpdate = () => {
            fetchHeaderProfile();
        };

        window.addEventListener('patient_profile_updated', handleUpdate);
        return () => window.removeEventListener('patient_profile_updated', handleUpdate);
    }, []);

    const patientName = profile ? `${profile.patient.first_name} ${profile.patient.last_name}` : t('dashboard.loading');

    const getInitials = (firstName: string, lastName: string) => {
        if (!firstName && !lastName) return '';
        return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
    };

    return (
        <nav className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant h-16 w-full">
            <div className="w-full px-4 md:px-6 h-full flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {location.pathname !== '/patient/dashboard' && (
                        <button onClick={() => navigate(-1)} className="material-symbols-outlined text-charcoal hover:text-medical-teal transition-colors cursor-pointer text-[24px] mr-1" title="Kembali">
                            arrow_back
                        </button>
                    )}
                    <div onClick={() => navigate('/patient/dashboard')} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                        <img alt="ecgrhythmia logo" className="h-8 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVHX00UF6lwM6kjDUMgD4Jv6lMMp5h2u1ZBPFlnvJJNam11nmTsrGtn_y5NNHv61wLHc3plhgbJeduSWPWMT-xKDKHnnifesb9pERppu-cGEHZODeFvF8XLLfRKpP1GdLDV5iINEmqPsbVTFdQZhAPCXP6aHQm-ecIuBbV0YG8GByhRtVQ6xZQrpQpUmXqjqW6DWiEZHDW8D81u4xSnTtsE-7HlTKrn6GuXcYUOYjdpCvaEqIKW1ghrNjEt5sTxTf_o6esUGi3HzNB" />
                        <div className="font-headline-md text-headline-md tracking-tight flex">
                            <span className="text-brand-red">ecg</span><span className="text-brand-navy">rhythmia</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div onClick={() => navigate('/patient/profile')} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="font-label-bold text-label-bold text-on-surface">{patientName}</span>
                            <span className="font-label-md text-label-md text-on-surface-variant">{t('dashboard.patientRole')}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center font-bold text-on-surface-variant text-sm shrink-0">
                            {profile?.patient.profile_photo ? (
                                <img className="w-full h-full object-cover" data-alt="Patient Profile" src={profile.patient.profile_photo} />
                            ) : (
                                <span>{profile ? getInitials(profile.patient.first_name, profile.patient.last_name) : ''}</span>
                            )}
                        </div>
                    </div>
                    {location.pathname !== '/patient/settings' && (
                        <button onClick={() => navigate('/patient/settings')} className="material-symbols-outlined text-on-surface-variant hover:text-medical-teal transition-colors cursor-pointer">settings</button>
                    )}
                </div>
            </div>
        </nav>
    );
};
