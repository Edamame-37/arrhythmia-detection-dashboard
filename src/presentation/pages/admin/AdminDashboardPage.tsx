import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';

interface AdminStats {
    total_patients: number;
    total_doctors: number;
    active_devices: number;
    critical_alerts: number;
}

export const AdminDashboardPage: React.FC = () => {
    const { isOpen, toggleSidebar } = useSidebar();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    useEffect(() => {
        const fetchStats = () => {
            const token = localStorage.getItem('auth_token') || '';
            fetch('http://127.0.0.1:8081/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    setStats(data);
                    setLastSync(new Date());
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch stats", err);
                    setLoading(false);
                });
        };
        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Sync every minute
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="bg-background text-on-surface antialiased overflow-x-hidden w-full min-h-screen">
            <AdminSidebar />
            
            <main id="main-content" className={`pb-24 md:pb-12 transition-all duration-300 min-h-screen flex flex-col ${isOpen ? 'md:ml-[260px]' : 'ml-0'}`}>
                <header className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 z-40 px-6 py-4 flex items-center gap-4 max-w-container-max mx-auto w-full">
                    <button onClick={toggleSidebar} className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors outline-none" title="Sembunyikan / Tampilkan Menu Utama">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-charcoal">System Overview</h1>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            Terakhir disinkronisasi: {lastSync ? lastSync.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' }) : 'Menyinkronkan...'}
                        </p>
                    </div>
                </header>

                <div className="px-6 max-w-container-max mx-auto mt-6 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-surface border border-outline-variant/60 rounded-xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-on-surface-variant">Total Patients</h3>
                            <p className="text-3xl font-extrabold text-charcoal mt-2">{loading ? '...' : (stats?.total_patients ?? '-')}</p>
                        </div>
                        <div className="bg-surface border border-outline-variant/60 rounded-xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-on-surface-variant">Total Doctors</h3>
                            <p className="text-3xl font-extrabold text-charcoal mt-2">{loading ? '...' : (stats?.total_doctors ?? '-')}</p>
                        </div>
                        <div className="bg-surface border border-outline-variant/60 rounded-xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-on-surface-variant">Active Devices</h3>
                            <p className="text-3xl font-extrabold text-medical-teal mt-2">{loading ? '...' : (stats?.active_devices ?? '-')}</p>
                        </div>
                        <div className="bg-surface border border-alert-red rounded-xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-alert-red">Critical Alerts Today (Frame)</h3>
                            <p className="text-3xl font-extrabold text-alert-red mt-2">{loading ? '...' : (stats?.critical_alerts ?? '-')}</p>
                        </div>
                    </div>

                    {/* System Health Overview */}
                    <div className="bg-surface border border-outline-variant/60 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-charcoal mb-4">Backend System Health</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm font-bold text-on-surface-variant">API Server</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-3 h-3 bg-status-green rounded-full"></span>
                                    <span className="text-sm font-mono-data font-bold text-charcoal">ONLINE (99.9% Uptime)</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-on-surface-variant">MQTT Broker</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-3 h-3 bg-status-green rounded-full"></span>
                                    <span className="text-sm font-mono-data font-bold text-charcoal">CONNECTED</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-on-surface-variant">Database</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-3 h-3 bg-status-green rounded-full"></span>
                                    <span className="text-sm font-mono-data font-bold text-charcoal">SYNCED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
