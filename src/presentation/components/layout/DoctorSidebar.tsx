import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../application/context/SidebarContext';
import { LogoutModal } from '../shared/LogoutModal';
import { API_URL } from '../../../config/env';

export const DoctorSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isOpen, closeSidebar } = useSidebar();
    const [profile, setProfile] = useState<any>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleNavClick = () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    };

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            fetch(`${API_URL}/api/doctors/${userId}`)
                .then(res => res.json())
                .then(data => setProfile(data))
                .catch(err => console.error("Failed to load profile for sidebar", err));
        }
    }, []);

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={closeSidebar}
                />
            )}
            <aside id="main-sidebar" className={`
                z-50 flex-col transition-all duration-300
                md:fixed md:top-0 md:h-screen md:w-[260px] md:bg-surface-container-lowest md:border-r md:border-outline-variant md:translate-y-0 md:flex md:rounded-none md:shadow-none
                fixed top-[72px] left-4 right-4 w-[calc(100%-32px)] bg-white rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden pb-4 md:pb-0
                ${isOpen ? 'opacity-100 scale-100 flex translate-y-0 md:translate-x-0 md:left-0 md:opacity-100' : 'opacity-0 scale-95 pointer-events-none hidden md:flex md:-translate-x-full md:opacity-0'}
            `}>
                <div className="hidden md:flex p-6 items-center gap-3 border-b border-outline-variant/30 cursor-pointer" onClick={() => { navigate('/doctor/dashboard'); handleNavClick(); }}>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJfACqMSzy6S1S81otlvrhfNIHr526OT9XlgCl04PJNewQysO-szQBYwNy1CAVfF851GuVn5qSOMjNWQdVGWANcLFnC4v9hdbnEGw6a6zjZHiO-z3KrczLQUpmNPbJBK3DPcvSUNAMyxXlVaN3XK5XqDW2MwFfclgdHRXsKHmF-u3QnVmzkBpw6dRTGNCyHk4YD526zmZNozyix_CMqEgOacA2M9LUFTaMDhBfigT5e7htUaxvw6bZCKeoVwqQgtQxho0qkC32iy0g"
                        alt="ecgrhythmia logo" className="w-8 h-8 object-contain" />
                    <div className="text-xl font-extrabold tracking-tight select-none flex">
                        <span className="text-brand-red">ecg</span><span className="text-brand-navy">rhythmia</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 mt-6 space-y-1">
                    <Link onClick={handleNavClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold shadow-sm transition-all ${isActive('/doctor/dashboard') ? 'bg-medical-teal text-white' : 'text-on-surface-variant hover:bg-surface-container-low group'}`} to="/doctor/dashboard">
                        <span className={`material-symbols-outlined ${isActive('/doctor/dashboard') ? '' : 'text-outline group-hover:text-medical-teal'}`}>dashboard</span>
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link onClick={handleNavClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold shadow-sm transition-all ${isActive('/doctor/qr-scanner') ? 'bg-medical-teal text-white' : 'text-on-surface-variant hover:bg-surface-container-low group'}`} to="/doctor/qr-scanner">
                        <span className={`material-symbols-outlined ${isActive('/doctor/qr-scanner') ? '' : 'text-outline group-hover:text-medical-teal'}`}>qr_code_scanner</span>
                        <span className="text-sm">Pasien Baru (QR)</span>
                    </Link>

                    <Link onClick={handleNavClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold shadow-sm transition-all ${isActive('/doctor/analytics') ? 'bg-medical-teal text-white' : 'text-on-surface-variant hover:bg-surface-container-low group'}`} to="/doctor/analytics">
                        <span className={`material-symbols-outlined ${isActive('/doctor/analytics') ? '' : 'text-outline group-hover:text-medical-teal'}`}>history</span>
                        <span className="text-sm">Riwayat Klinis</span>
                    </Link>
                </nav>

                <div className="p-4 mt-4 md:mt-0 border-t border-outline-variant/40 md:bg-surface-container-low/50">
                    <div className="flex bg-surface border border-outline-variant/50 p-3 rounded-lg items-center gap-3 transition-all group hover:border-medical-teal cursor-pointer" onClick={() => { navigate('/doctor/profile'); handleNavClick(); }}>
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center bg-surface-container">
                            {profile?.profile_photo ? (
                                <img className="w-full h-full object-cover" alt="Profile" src={profile.profile_photo} />
                            ) : (
                                <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-xs text-on-surface truncate group-hover:text-medical-teal transition-colors">
                                {profile ? `Dr. ${profile.first_name} ${profile.last_name}` : 'Memuat...'}
                            </p>
                            <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-wider font-medium">
                                {profile?.role === 'doctor' ? 'Dokter / Kardiolog' : profile?.role || '---'}
                            </p>
                        </div>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            setIsLogoutModalOpen(true);
                        }}>
                            <span className="material-symbols-outlined text-outline text-lg hover:text-alert-red transition-colors">logout</span>
                        </button>
                    </div>
                </div>
            </aside>
            <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
        </>
    );
};
