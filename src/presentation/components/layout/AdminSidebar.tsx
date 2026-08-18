import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../application/context/SidebarContext';
import { LogoutModal } from '../shared/LogoutModal';

export const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isOpen, closeSidebar } = useSidebar();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={closeSidebar}
                />
            )}
            <aside id="main-sidebar" className={`fixed left-0 top-0 h-screen w-[260px] bg-surface-container-lowest border-r border-outline-variant flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0 flex' : '-translate-x-full hidden md:flex'}`}>
                <div className="p-6 flex items-center gap-3 border-b border-outline-variant/30 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJfACqMSzy6S1S81otlvrhfNIHr526OT9XlgCl04PJNewQysO-szQBYwNy1CAVfF851GuVn5qSOMjNWQdVGWANcLFnC4v9hdbnEGw6a6zjZHiO-z3KrczLQUpmNPbJBK3DPcvSUNAMyxXlVaN3XK5XqDW2MwFfclgdHRXsKHmF-u3QnVmzkBpw6dRTGNCyHk4YD526zmZNozyix_CMqEgOacA2M9LUFTaMDhBfigT5e7htUaxvw6bZCKeoVwqQgtQxho0qkC32iy0g"
                        alt="ecgrhythmia logo" className="w-8 h-8 object-contain" />
                    <div className="text-xl font-extrabold tracking-tight select-none flex">
                        <span className="text-brand-red">ecg</span><span className="text-brand-navy">rhythmia</span>
                    </div>
                </div>

                <div className="px-6 py-2 bg-charcoal text-white text-[10px] font-bold tracking-widest uppercase text-center border-b border-outline-variant/30">
                    SYSTEM ADMIN
                </div>

                <nav className="flex-1 px-4 mt-6 space-y-1">
                    <Link className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold shadow-sm transition-all ${isActive('/admin/dashboard') ? 'bg-brand-red text-white' : 'text-on-surface-variant hover:bg-surface-container-low group'}`} to="/admin/dashboard">
                        <span className={`material-symbols-outlined ${isActive('/admin/dashboard') ? '' : 'text-outline group-hover:text-brand-red'}`}>dashboard</span>
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold shadow-sm transition-all ${isActive('/admin/users') ? 'bg-brand-red text-white' : 'text-on-surface-variant hover:bg-surface-container-low group'}`} to="/admin/users">
                        <span className={`material-symbols-outlined ${isActive('/admin/users') ? '' : 'text-outline group-hover:text-brand-red'}`}>manage_accounts</span>
                        <span className="text-sm">Manajemen Pengguna</span>
                    </Link>
                    <Link className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold shadow-sm transition-all ${isActive('/admin/devices') ? 'bg-brand-red text-white' : 'text-on-surface-variant hover:bg-surface-container-low group'}`} to="/admin/devices">
                        <span className={`material-symbols-outlined ${isActive('/admin/devices') ? '' : 'text-outline group-hover:text-brand-red'}`}>router</span>
                        <span className="text-sm">Armada Perangkat</span>
                    </Link>
                    <Link className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold shadow-sm transition-all ${isActive('/admin/sessions') ? 'bg-brand-red text-white' : 'text-on-surface-variant hover:bg-surface-container-low group'}`} to="/admin/sessions">
                        <span className={`material-symbols-outlined ${isActive('/admin/sessions') ? '' : 'text-outline group-hover:text-brand-red'}`}>history</span>
                        <span className="text-sm">Manajemen Sesi</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-outline-variant/40 bg-surface-container-low/50">
                    <div className="flex bg-surface border border-outline-variant/50 p-3 rounded-lg items-center gap-3 transition-all group hover:border-brand-red cursor-pointer">
                        <div className="w-9 h-9 rounded-full bg-brand-red/10 flex items-center justify-center border border-brand-red/20 text-brand-red font-bold">
                            AD
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-xs text-on-surface truncate group-hover:text-brand-red transition-colors">atmint</p>
                            <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-wider font-medium">Root Access</p>
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
