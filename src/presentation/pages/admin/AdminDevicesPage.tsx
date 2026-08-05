import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';

interface DeviceRecord {
    id: string;
    name: string;
    mac: string | null;
    battery: number | null;
    status: string | null;
    assigned_to: string | null;
}

export const AdminDevicesPage: React.FC = () => {
    const { isOpen, toggleSidebar } = useSidebar();
    const [devices, setDevices] = useState<DeviceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://127.0.0.1:8081/api/admin/devices')
            .then(res => res.json())
            .then(data => {
                setDevices(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch devices", err);
                setLoading(false);
            });
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
                        <h1 className="text-2xl font-bold tracking-tight text-charcoal">Armada Perangkat (IoT Devices)</h1>
                        <p className="text-xs text-on-surface-variant mt-0.5">Pemantauan armada perangkat keras yang terhubung ke jaringan.</p>
                    </div>
                </header>

                <div className="px-6 max-w-container-max mx-auto mt-6">
                    <div className="bg-surface border border-outline-variant/60 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-outline-variant/60 flex justify-between items-center bg-surface-container-lowest">
                            <h2 className="font-bold text-charcoal">Daftar Perangkat</h2>
                            <button className="bg-medical-teal text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">add</span> Register Alat Baru
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Device ID</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">MAC Address</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Baterai</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Status</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Assigned To</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                                    ) : devices.map(d => (
                                        <tr key={d.id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30 last:border-0">
                                            <td className="p-4 font-mono-data text-xs text-medical-teal font-bold">{d.id}</td>
                                            <td className="p-4 font-mono-data text-xs text-charcoal">{d.mac || 'Unknown'}</td>
                                            <td className="p-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-surface-container rounded-full overflow-hidden">
                                                        <div className={`h-full ${(d.battery || 0) > 20 ? 'bg-status-green' : 'bg-alert-red'}`} style={{ width: `${d.battery || 0}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-bold font-mono-data">{d.battery || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-bold">
                                                <span className={`flex items-center gap-1 ${(d.status || 'Offline') === 'Active' ? 'text-status-green' : ((d.status || 'Offline') === 'Low Battery' ? 'text-orange-500' : 'text-on-surface-variant')}`}>
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        {(d.status || 'Offline') === 'Active' ? 'check_circle' : ((d.status || 'Offline') === 'Low Battery' ? 'battery_alert' : 'cancel')}
                                                    </span>
                                                    {d.status || 'Offline'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs font-mono-data text-on-surface-variant">{d.assigned_to || 'Unassigned'}</td>
                                            <td className="p-4 flex gap-2">
                                                <button className="text-primary hover:underline text-xs font-bold">Ping</button>
                                                <span className="text-outline">|</span>
                                                <button className="text-alert-red hover:underline text-xs font-bold">Reset</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
