import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { Pagination } from '../../components/shared/Pagination';
import { useStickyState } from '../../../application/hooks/useStickyState';
import { API_URL } from '../../../config/env';
import { fetchWithAuth } from '../../../config/api';

interface DeviceRecord {
    id: string;
    name: string;
    mqtt_broker: string;
    mqtt_port: number;
    mqtt_topic: string;
    mqtt_username: string;
    assigned_to: string | null;
}

export const AdminDevicesPage: React.FC = () => {
    const { isOpen, toggleSidebar } = useSidebar();
    const [devices, setDevices] = useState<DeviceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeviceQr, setSelectedDeviceQr] = useState<string | null>(null);

    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        mqtt_broker: '',
        mqtt_port: 1883,
        mqtt_topic: '',
        mqtt_username: '',
        mqtt_password: ''
    });

    const [currentPage, setCurrentPage] = useStickyState(1, 'adminDevicesPage');
    const itemsPerPage = 10;

    const fetchDevices = () => {
        setLoading(true);
        fetchWithAuth(`/api/admin/devices`)
            .then(res => res.json())
            .then(data => {
                setDevices(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch devices", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            const url = editingDeviceId ? `/api/admin/devices/${editingDeviceId}` : `/api/admin/devices`;
            const method = editingDeviceId ? 'PUT' : 'POST';
            
            const res = await fetchWithAuth(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert(`Berhasil ${editingDeviceId ? 'mengedit' : 'mendaftarkan'} alat dan pairing MQTT dimulai.`);
                setIsRegisterModalOpen(false);
                fetchDevices();
            } else {
                alert("Gagal: " + (data.message || data.error || JSON.stringify(data)));
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan jaringan.");
        }
    };

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
                            <button onClick={() => {
                                setEditingDeviceId(null);
                                setFormData({
                                    name: '', mqtt_broker: '', mqtt_port: 8883,
                                    mqtt_topic: '', mqtt_username: '', mqtt_password: ''
                                });
                                setIsRegisterModalOpen(true);
                            }} className="bg-medical-teal text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">add</span> Register Alat Baru
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Device ID</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Device Name</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">MQTT Broker</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">MQTT Topic</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Assigned To</th>
                                        <th className="p-4 font-bold border-b border-outline-variant/60">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                                    ) : (() => {
                                        const paginatedDevices = devices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                                        return paginatedDevices.map(d => (
                                        <tr key={d.id} className="hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30 last:border-0">
                                            <td className="p-4 font-mono-data text-xs text-medical-teal font-bold">{d.id}</td>
                                            <td className="p-4 font-bold text-sm text-charcoal">{d.name}</td>
                                            <td className="p-4 font-mono-data text-xs text-on-surface-variant">{d.mqtt_broker}:{d.mqtt_port}</td>
                                            <td className="p-4 font-mono-data text-xs text-on-surface-variant bg-surface-container-lowest rounded">{d.mqtt_topic}</td>
                                            <td className="p-4 text-xs font-mono-data text-on-surface-variant">{d.assigned_to || 'Unassigned'}</td>
                                            <td className="p-4 flex gap-2">
                                                <button onClick={() => setSelectedDeviceQr(d.name || d.id)} className="text-medical-teal hover:underline text-xs font-bold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[16px]">qr_code</span> Tampilkan QR
                                                </button>
                                                <span className="text-outline">|</span>
                                                <button className="text-primary hover:underline text-xs font-bold">Ping</button>
                                                <span className="text-outline">|</span>
                                                <button onClick={() => {
                                                    setEditingDeviceId(d.id);
                                                    setFormData({
                                                        name: d.name,
                                                        mqtt_broker: d.mqtt_broker,
                                                        mqtt_port: d.mqtt_port,
                                                        mqtt_topic: d.mqtt_topic,
                                                        mqtt_username: d.mqtt_username,
                                                        mqtt_password: ''
                                                    });
                                                    setIsRegisterModalOpen(true);
                                                }} className="text-medical-teal hover:underline text-xs font-bold flex items-center gap-1">Edit</button>
                                            </td>
                                        </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                        {devices.length > 0 && (
                            <Pagination 
                                currentPage={currentPage}
                                totalItems={devices.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* QR Code Modal */}
            {selectedDeviceQr && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl flex flex-col items-center">
                        <h3 className="text-2xl font-bold text-charcoal mb-2">QR Code Alat</h3>
                        <p className="text-sm text-on-surface-variant mb-6">Minta pasien memindai QR Code ini untuk terhubung dengan alat.</p>
                        
                        <div className="bg-white p-4 rounded-xl border-4 border-medical-teal/20 mb-6">
                            <QRCode 
                                value={JSON.stringify({ type: 'device_sync', deviceId: selectedDeviceQr })} 
                                size={200}
                                level="H"
                            />
                        </div>

                        <div className="bg-surface-container-low rounded-lg p-3 w-full mb-6 flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Device ID</span>
                            <span className="font-mono text-lg font-bold text-charcoal">{selectedDeviceQr}</span>
                        </div>

                        <button onClick={() => setSelectedDeviceQr(null)} className="w-full bg-medical-teal text-white py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all">
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* Registration Modal */}
            {isRegisterModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl flex flex-col">
                        <h3 className="text-2xl font-bold text-charcoal mb-6 text-center">{editingDeviceId ? 'Edit Alat' : 'Registrasi Alat Baru'}</h3>
                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-bold text-charcoal mb-1">Nama Perangkat (ID)*</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest" placeholder="Contoh: device02" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-charcoal mb-1">MQTT Broker*</label>
                                    <input required type="text" value={formData.mqtt_broker} onChange={e => setFormData({...formData, mqtt_broker: e.target.value})} className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest" placeholder="contoh.hivemq.cloud" />
                                </div>
                                <div className="w-24">
                                    <label className="block text-sm font-bold text-charcoal mb-1">Port*</label>
                                    <input required type="number" value={formData.mqtt_port} onChange={e => setFormData({...formData, mqtt_port: parseInt(e.target.value)})} className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest" placeholder="8883" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-charcoal mb-1">MQTT Topic*</label>
                                <input required type="text" value={formData.mqtt_topic} onChange={e => setFormData({...formData, mqtt_topic: e.target.value})} className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest" placeholder="Contoh: ecgrhythmia/#" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-charcoal mb-1">Username*</label>
                                    <input required type="text" value={formData.mqtt_username} onChange={e => setFormData({...formData, mqtt_username: e.target.value})} className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-charcoal mb-1">Password*</label>
                                    <input required type="password" value={formData.mqtt_password} onChange={e => setFormData({...formData, mqtt_password: e.target.value})} className="w-full border border-outline-variant rounded-lg p-3 outline-none focus:border-medical-teal bg-surface-container-lowest" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-medical-teal text-white font-bold rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all">
                                    Simpan & Pairing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
