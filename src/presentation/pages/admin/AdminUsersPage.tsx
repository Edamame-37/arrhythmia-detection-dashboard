import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { API_URL } from '../../../config/env';
import { fetchWithAuth } from '../../../config/api';

interface AdminUser {
    id: string;
    name: string;
    role: string;
    status: string;
    registered_at: string;
    connected_doctor_id?: string | null;
    connected_device_id?: string | null;
    profile_photo?: string | null;
}

interface DeviceRecord {
    id: string;
    name: string;
    assigned_to: string | null;
}

export const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const { isOpen, toggleSidebar } = useSidebar();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [devices, setDevices] = useState<DeviceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dokter' | 'pasien'>('dokter');

    // Add Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [addEmail, setAddEmail] = useState('');
    const [addPassword, setAddPassword] = useState('');
    const [addRole, setAddRole] = useState<'dokter' | 'pasien'>('dokter');
    const [addFirstName, setAddFirstName] = useState('');
    const [addLastName, setAddLastName] = useState('');
    const [addAge, setAddAge] = useState<number | ''>('');
    const [addGender, setAddGender] = useState('L');
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    // Detail Modal State
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [userDetail, setUserDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    
    // Sync states
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

    const fetchUsersAndDevices = () => {
        setLoading(true);
        const token = localStorage.getItem('auth_token') || '';
        Promise.all([
            fetchWithAuth(`/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
            fetchWithAuth(`/api/admin/devices`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
        ])
        .then(([usersData, devicesData]) => {
            setUsers(usersData);
            setDevices(devicesData);
            setLoading(false);
        })
        .catch(err => {
            console.error("Failed to fetch data", err);
            setLoading(false);
        });
    };

    useEffect(() => {
        // Jika kembali (Back) dari impersonasi, pulihkan sesi admin
        const adminToken = localStorage.getItem('admin_auth_token');
        if (adminToken && localStorage.getItem('user_role') !== 'admin') {
            localStorage.setItem('auth_token', adminToken);
            localStorage.setItem('user_role', 'admin');
            const adminId = localStorage.getItem('admin_user_id');
            if (adminId) localStorage.setItem('user_id', adminId);
        }
        fetchUsersAndDevices();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);
        try {
            const res = await fetchWithAuth(`/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: addEmail, 
                    password: addPassword, 
                    role: addRole,
                    first_name: addFirstName,
                    last_name: addLastName,
                    age: addAge || 0,
                    gender: addGender
                })
            });
            const data = await res.json();
            if (data.success || res.ok) {
                setShowAddModal(false);
                setAddEmail('');
                setAddPassword('');
                setAddFirstName('');
                setAddLastName('');
                setAddAge('');
                setAddGender('L');
                fetchUsersAndDevices();
            } else {
                setAddError(data.message || 'Gagal mendaftarkan akun.');
            }
        } catch (err) {
            setAddError('Terjadi kesalahan jaringan.');
        }
        setAddLoading(false);
    };

    const handleViewDetail = async (user: AdminUser) => {
        setSelectedUser(user);
        setUserDetail(null);
        setLoadingDetail(true);
        try {
            const endpoint = user.role === 'dokter' ? `/api/doctors/${user.id}` : `/api/patients/${user.id}`;
            const res = await fetchWithAuth(`${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                setUserDetail(data);
                if (user.role === 'pasien') {
                    // pre-fill selected options
                    setSelectedDoctorId(data.patient?.primary_doctor_id || '');
                    const assignedDevice = devices.find(d => d.assigned_to === user.id);
                    setSelectedDeviceId(assignedDevice?.id || '');
                }
            }
        } catch (err) {
            console.error("Failed to fetch user detail", err);
        }
        setLoadingDetail(false);
    };

    const closeDetailModal = () => {
        setSelectedUser(null);
        setUserDetail(null);
    };

    const handleSyncDoctor = async () => {
        if (!selectedUser) return;
        try {
            if (selectedDoctorId) {
                await fetchWithAuth(`/api/patients/${selectedUser.id}/connect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ doctor_id: selectedDoctorId })
                });
            } else {
                await fetchWithAuth(`/api/patients/${selectedUser.id}/disconnect`, { method: 'POST' });
            }
            handleViewDetail(selectedUser);
            fetchUsersAndDevices();
        } catch (err) {
            console.error("Failed to sync doctor", err);
        }
    };

    const handleSyncDevice = async () => {
        if (!selectedUser) return;
        try {
            if (selectedDeviceId) {
                await fetchWithAuth(`/api/devices/${selectedDeviceId}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patient_id: selectedUser.id })
                });
            } else {
                const assignedDevice = devices.find(d => d.assigned_to === selectedUser.id);
                if (assignedDevice) {
                    await fetchWithAuth(`/api/devices/${assignedDevice.id}/assign`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ patient_id: null })
                    });
                }
            }
            handleViewDetail(selectedUser);
            fetchUsersAndDevices();
        } catch (err) {
            console.error("Failed to sync device", err);
        }
    };

    const handleImpersonate = async (user: AdminUser) => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetchWithAuth(`/api/admin/impersonate/${user.id}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            
            if (data.success && data.user_id) {
                // Backup admin credentials sebelum impersonate
                const currentRole = localStorage.getItem('user_role');
                if (currentRole === 'admin') {
                    localStorage.setItem('admin_auth_token', token || '');
                    localStorage.setItem('admin_user_id', localStorage.getItem('user_id') || '');
                }

                // Clear old connected state
                localStorage.removeItem('connectedPatients');
                localStorage.removeItem('connectedDoctor');
                localStorage.removeItem('mock_patient_profile');
                
                // Set new credentials
                localStorage.setItem('user_id', data.user_id.toString());
                localStorage.setItem('user_role', data.role);
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                
                // Navigate
                if (data.role === 'pasien') {
                    navigate('/patient/dashboard');
                } else if (data.role === 'dokter') {
                    navigate('/doctor/dashboard');
                }
            } else {
                alert(data.message || 'Gagal melakukan impersonate.');
            }
        } catch (err) {
            console.error("Gagal impersonate", err);
            alert("Koneksi ke server gagal.");
        }
    };

    const filteredUsers = users.filter(u => u.role === activeTab);
    const doctorsList = users.filter(u => u.role === 'dokter');

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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <div className="flex bg-surface-container-low rounded-lg p-1">
                            <button 
                                onClick={() => setActiveTab('dokter')} 
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'dokter' ? 'bg-white shadow-sm text-charcoal' : 'text-on-surface-variant hover:text-charcoal'}`}
                            >Dokter</button>
                            <button 
                                onClick={() => setActiveTab('pasien')} 
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'pasien' ? 'bg-white shadow-sm text-charcoal' : 'text-on-surface-variant hover:text-charcoal'}`}
                            >Pasien</button>
                        </div>
                        <div className="flex-1"></div>
                        <button onClick={() => setShowAddModal(true)} className="bg-medical-teal text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                            <span className="material-symbols-outlined text-[18px]">add</span> Tambah Manual
                        </button>
                    </div>

                    <div className="bg-surface border border-outline-variant/60 rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold border-b border-outline-variant/60">User ID</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Nama Lengkap</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Status</th>
                                        {activeTab === 'pasien' && <th className="p-4 font-bold border-b border-outline-variant/60">Dokter Terhubung</th>}
                                        {activeTab === 'pasien' && <th className="p-4 font-bold border-b border-outline-variant/60">Device Terhubung</th>}
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Tgl Daftar</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={activeTab === 'pasien' ? 7 : 5} className="p-4 text-center text-sm">Memuat data...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan={activeTab === 'pasien' ? 7 : 5} className="p-4 text-center text-sm text-on-surface-variant">Tidak ada data.</td></tr>
                                    ) : filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30 last:border-0">
                                            <td className="p-4 font-mono-data text-xs text-medical-teal font-bold">{u.id}</td>
                                            <td className="p-4 text-sm font-bold text-charcoal">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/50 shadow-sm overflow-hidden flex items-center justify-center text-on-surface-variant shrink-0">
                                                        {u.profile_photo ? (
                                                            <img src={u.profile_photo} alt={u.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-[18px]">person</span>
                                                        )}
                                                    </div>
                                                    {u.name}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-bold">
                                                <span className={`flex items-center gap-1.5 ${u.status === 'Online' ? 'text-status-green' : 'text-on-surface-variant'}`}>
                                                    <span className={`w-2.5 h-2.5 rounded-full ${u.status === 'Online' ? 'bg-status-green' : 'bg-on-surface-variant'}`}></span>
                                                    {u.status}
                                                </span>
                                            </td>
                                            {activeTab === 'pasien' && (
                                                <td className="p-4 text-xs font-mono-data font-bold text-medical-teal">
                                                    {u.connected_doctor_id ? u.connected_doctor_id : <span className="text-on-surface-variant italic font-normal">Kosong</span>}
                                                </td>
                                            )}
                                            {activeTab === 'pasien' && (
                                                <td className="p-4 text-xs font-mono-data font-bold text-primary">
                                                    {u.connected_device_id ? u.connected_device_id : <span className="text-on-surface-variant italic font-normal">Kosong</span>}
                                                </td>
                                            )}
                                            <td className="p-4 text-xs text-on-surface-variant">{u.registered_at.split('T')[0]}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => handleViewDetail(u)} className="text-primary hover:underline text-xs font-bold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                        Detail & Sync
                                                    </button>
                                                    <button onClick={() => handleImpersonate(u)} className="text-medical-teal hover:underline text-xs font-bold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">login</span>
                                                        Login
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-outline-variant/60 overflow-hidden">
                        <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-lowest">
                            <h3 className="font-bold text-charcoal">Tambah Pengguna Manual</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-charcoal"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            {addError && <div className="bg-error/10 text-error p-3 rounded-lg text-sm font-bold">{addError}</div>}
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email</label>
                                <input type="email" required value={addEmail} onChange={e => setAddEmail(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="email@contoh.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Password (Minimal 6 karakter)</label>
                                <input type="password" required minLength={6} value={addPassword} onChange={e => setAddPassword(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="••••••" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Role</label>
                                <select value={addRole} onChange={e => setAddRole(e.target.value as any)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                                    <option value="dokter">Dokter</option>
                                    <option value="pasien">Pasien</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Nama Depan</label>
                                    <input type="text" required value={addFirstName} onChange={e => setAddFirstName(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="John" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Nama Belakang</label>
                                    <input type="text" required value={addLastName} onChange={e => setAddLastName(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Doe" />
                                </div>
                            </div>
                            {addRole === 'pasien' && (
                                <div className="flex gap-4 animate-in fade-in duration-200">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Tanggal Lahir</label>
                                        <input type="number" required value={addAge} onChange={e => setAddAge(parseInt(e.target.value) || '')} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Gender</label>
                                        <select value={addGender} onChange={e => setAddGender(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl font-bold text-charcoal bg-surface-container hover:bg-surface-container-high transition-colors">Batal</button>
                                <button type="submit" disabled={addLoading} className="flex-1 py-3 rounded-xl font-bold text-white bg-medical-teal hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {addLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                    {addLoading ? 'Menyimpan...' : 'Simpan Akun'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail & Sync Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl border border-outline-variant/60 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-lowest shrink-0">
                            <h3 className="font-bold text-charcoal">Detail & Sinkronisasi Pengguna</h3>
                            <button onClick={closeDetailModal} className="text-on-surface-variant hover:text-charcoal"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            {loadingDetail ? (
                                <div className="text-center py-12 flex flex-col items-center gap-3">
                                    <span className="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
                                    <p className="text-on-surface-variant font-bold text-sm">Memuat informasi profil...</p>
                                </div>
                            ) : userDetail ? (
                                <div className="space-y-6">
                                    {/* Profile Header */}
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-full bg-surface-container-high border-4 border-white shadow-sm overflow-hidden flex items-center justify-center text-on-surface-variant shrink-0">
                                            {userDetail.patient?.profile_photo || userDetail.profile_photo ? (
                                                <img src={userDetail.patient?.profile_photo || userDetail.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-5xl">person</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-charcoal mb-1">
                                                {selectedUser.name}
                                            </h4>
                                            <p className="text-sm text-primary font-mono-data bg-primary/10 px-2 py-1 rounded inline-block font-bold">{selectedUser.id}</p>
                                            <p className="text-xs text-on-surface-variant mt-2 font-medium">Terdaftar sejak: {selectedUser.registered_at.split('T')[0]}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Detailed Data */}
                                    <div className="grid grid-cols-2 gap-4 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30">
                                        <div>
                                            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">Jenis Kelamin</p>
                                            <p className="font-bold text-charcoal text-sm">{userDetail.gender || userDetail.doctor?.gender || userDetail.patient?.gender || 'Belum diatur'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-1">Tanggal Lahir</p>
                                            <p className="font-bold text-charcoal text-sm">{userDetail.age || userDetail.doctor?.age || userDetail.patient?.age || 'Belum diatur'}</p>
                                        </div>
                                    </div>

                                    {/* Sync Actions (Only for Patient) */}
                                    {selectedUser.role === 'pasien' && (
                                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                            <h4 className="font-bold text-charcoal text-sm flex items-center gap-2 pb-2 border-b border-outline-variant/30 mt-6">
                                                <span className="material-symbols-outlined text-primary text-[18px]">sync_alt</span>
                                                Manajemen Sinkronisasi
                                            </h4>
                                            
                                            {/* Sync Doctor */}
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-end gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2">Dokter Penanggung Jawab</label>
                                                    <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)} className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 shadow-sm transition-colors text-charcoal">
                                                        <option value="">-- Kosong (Tidak Terhubung) --</option>
                                                        {doctorsList.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button onClick={handleSyncDoctor} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                                    Terapkan
                                                </button>
                                            </div>

                                            {/* Sync Device */}
                                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-end gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-2">Alat ECG Terpasang</label>
                                                    <select value={selectedDeviceId} onChange={e => setSelectedDeviceId(e.target.value)} className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 shadow-sm transition-colors text-charcoal">
                                                        <option value="">-- Kosong (Tidak Terhubung) --</option>
                                                        {devices.map(d => (
                                                            <option key={d.id} value={d.id} disabled={d.assigned_to !== null && d.assigned_to !== selectedUser.id}>
                                                                {d.name} {d.assigned_to && d.assigned_to !== selectedUser.id ? '(Sedang dipakai pasien lain)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button onClick={handleSyncDevice} className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                                    Terapkan
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-on-surface-variant font-medium">Gagal mengambil detail.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
