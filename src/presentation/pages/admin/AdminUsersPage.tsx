import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { API_URL } from '../../../config/env';

interface AdminUser {
    id: string;
    name: string;
    role: string;
    status: string;
    registered_at: string;
}

export const AdminUsersPage: React.FC = () => {
    const { isOpen, toggleSidebar } = useSidebar();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token') || '';
        fetch(`${API_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch users", err);
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
                        <h1 className="text-2xl font-bold tracking-tight text-charcoal">Manajemen Pengguna</h1>
                        <p className="text-xs text-on-surface-variant mt-0.5">Daftar semua pengguna terdaftar di sistem.</p>
                    </div>
                </header>

                <div className="px-6 max-w-container-max mx-auto mt-6">
                    <div className="bg-surface border border-outline-variant/60 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-outline-variant/60 flex justify-between items-center bg-surface-container-lowest">
                            <h2 className="font-bold text-charcoal">Tabel Pengguna</h2>
                            <button className="bg-medical-teal text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">+ Tambah Manual</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold border-b border-outline-variant/60">User ID</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Nama Lengkap</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Role</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Status</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Tgl Daftar</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                                    ) : users.map(u => (
                                        <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30 last:border-0">
                                            <td className="p-4 font-mono-data text-xs text-medical-teal font-bold">{u.id}</td>
                                            <td className="p-4 text-sm font-bold text-charcoal">{u.name}</td>
                                            <td className="p-4 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'dokter' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-bold">
                                                <span className={`flex items-center gap-1.5 ${u.status === 'Online' ? 'text-status-green' : 'text-on-surface-variant'}`}>
                                                    <span className={`w-2.5 h-2.5 rounded-full ${u.status === 'Online' ? 'bg-status-green' : 'bg-on-surface-variant'}`}></span>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-on-surface-variant">{u.registered_at.split('T')[0]}</td>
                                            <td className="p-4">
                                                <button className="text-primary hover:underline text-xs font-bold">Detail</button>
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
