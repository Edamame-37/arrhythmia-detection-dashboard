import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DoctorSidebar } from '../../components/layout/DoctorSidebar';
import { useSidebar } from '../../../application/context/SidebarContext';
import { LogoutModal } from '../../components/shared/LogoutModal';
import { useConnection } from '../../../application/context/ConnectionContext';
import { API_URL } from '../../../config/env';
import { fetchWithAuth } from '../../../config/api';
interface DoctorProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    profile_photo: string | null;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, toggleSidebar } = useSidebar();
  const { connectedDoctor, setConnectedDoctor } = useConnection();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
      first_name: '',
      last_name: '',
      profile_photo: ''
  });

  const fetchProfile = () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        navigate('/auth/login');
        return;
    }
    fetchWithAuth(`/api/doctors/${userId}`)
        .then(res => {
            if (!res.ok) throw new Error('Gagal mengambil profil dokter');
            return res.json();
        })
        .then(data => {
            setProfile(data);
            setEditForm({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                profile_photo: data.profile_photo || ''
            });
            setIsLoading(false);
            if (connectedDoctor) {
                setConnectedDoctor({
                    ...connectedDoctor,
                    name: `Dr. ${data.first_name} ${data.last_name}`,
                    photo: data.profile_photo || undefined
                });
            }
        })
        .catch(err => {
            setError(err.message);
            setIsLoading(false);
        });
  };

  useEffect(() => {
      fetchProfile();
  }, [navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditForm({...editForm, profile_photo: reader.result as string});
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!profile) return;
      setIsSaving(true);
      setError('');
      
      try {
          const response = await fetchWithAuth(`/api/doctors/${profile.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  first_name: editForm.first_name,
                  last_name: editForm.last_name,
                  profile_photo: editForm.profile_photo || null
              })
          });
          
          const data = await response.json();
          if (data.success) {
              setIsEditing(false);
              fetchProfile(); // Refresh data
          } else {
              setError(data.message || 'Gagal menyimpan profil');
          }
      } catch (err) {
          setError('Koneksi ke server gagal saat menyimpan profil');
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="bg-clinical-surface text-clinical-charcoal antialiased overflow-hidden flex h-screen w-full font-sans">
        <DoctorSidebar />

        <div className={`flex-1 flex flex-col min-w-0 bg-clinical-surface relative transition-all duration-300 ${isOpen ? 'md:ml-[260px]' : 'ml-0'}`}>

            <header className="sticky top-0 bg-clinical-surface/90 backdrop-blur-md border-b border-clinical-blue/20/30 z-40 px-6 py-4 flex justify-between items-center w-full shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={toggleSidebar} id="toggle-sidebar-btn" className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-white-container text-clinical-charcoal/70 transition-colors outline-none" title="Menu Utama">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-headline-md tracking-tight text-clinical-charcoal">Pengaturan Akun</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => {
                        setIsLogoutModalOpen(true);
                    }} className="bg-white border border-clinical-blue/20 hover:bg-white-container-low text-alert-red px-4 py-2 rounded-lg font-label-md flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm text-sm font-body-sm">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar bg-white-container-lowest">
                {/* Premium Banner */}
                <div className="w-full h-48 bg-gradient-to-r from-medical-teal to-primary relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                </div>

                <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-12 -mt-20 relative z-10">
                    <div className="bg-white rounded-2xl shadow-xl border border-clinical-blue/20/40 overflow-hidden flex flex-col lg:flex-row">
                        
                        {/* Profile Info Section */}
                        <div className="p-8 lg:p-12 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-clinical-blue/20/30 bg-white-container-lowest flex flex-col items-center text-center">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white-container flex items-center justify-center mb-6 ring-4 ring-medical-teal/20">
                                {profile?.profile_photo ? (
                                    <img alt="Profile" className="w-full h-full object-cover" src={profile.profile_photo} />
                                ) : (
                                    <span className="material-symbols-outlined text-6xl text-clinical-charcoal/70">person</span>
                                )}
                            </div>
                            <h2 className="text-2xl font-headline-lg text-clinical-charcoal tracking-tight mb-1">
                                {isLoading ? 'Memuat...' : (profile ? `${profile.first_name} ${profile.last_name}` : 'Tidak Ditemukan')}
                            </h2>
                            <p className="text-xs font-body-sm font-headline-md text-clinical-blue uppercase tracking-[0.2em] mb-6">
                                {profile?.role === 'doctor' ? 'Kardiolog Utama' : profile?.role}
                            </p>
                            
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} disabled={isLoading || !profile} className="w-full bg-charcoal text-white hover:bg-black font-headline-md py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Edit Profil
                                </button>
                            )}
                        </div>

                        {/* Details & Form Section */}
                        <div className="p-8 lg:p-12 lg:w-2/3 bg-white">
                            <h3 className="text-lg font-headline-md text-clinical-charcoal mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-clinical-blue">manage_accounts</span>
                                {isEditing ? 'Perbarui Informasi' : 'Detail Akun'}
                            </h3>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-alert-red text-alert-red text-sm font-body-sm font-headline-md rounded-r-lg flex items-center gap-3">
                                    <span className="material-symbols-outlined">error</span>
                                    {error}
                                </div>
                            )}

                            {!isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="bg-white-container-low/30 p-5 rounded-xl border border-clinical-blue/20/50 transition-all hover:border-clinical-blue/30 hover:shadow-sm">
                                            <p className="text-[10px] text-outline uppercase font-headline-md tracking-widest mb-1">Nama Depan</p>
                                            <p className="text-base font-body-md font-headline-md text-clinical-charcoal">{isLoading ? '---' : profile?.first_name}</p>
                                        </div>
                                        <div className="bg-white-container-low/30 p-5 rounded-xl border border-clinical-blue/20/50 transition-all hover:border-clinical-blue/30 hover:shadow-sm">
                                            <p className="text-[10px] text-outline uppercase font-headline-md tracking-widest mb-1">Nama Belakang</p>
                                            <p className="text-base font-body-md font-headline-md text-clinical-charcoal">{isLoading ? '---' : profile?.last_name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white-container-low/30 p-5 rounded-xl border border-clinical-blue/20/50">
                                        <p className="text-[10px] text-outline uppercase font-headline-md tracking-widest mb-1">Email Registrasi (Read-only)</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-base font-body-md font-headline-md text-clinical-charcoal">{isLoading ? '---' : profile?.email}</p>
                                            <span className="material-symbols-outlined text-green-500" title="Email Terverifikasi">verified</span>
                                        </div>
                                    </div>

                                    <div className="bg-white-container-low/30 p-5 rounded-xl border border-clinical-blue/20/50">
                                        <p className="text-[10px] text-outline uppercase font-headline-md tracking-widest mb-1">ID Pengguna (Read-only)</p>
                                        <p className="text-sm font-body-sm font-mono text-clinical-charcoal/70 font-headline-md">{isLoading ? '---' : profile?.id}</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-body-sm font-headline-md text-clinical-charcoal uppercase tracking-wider">Nama Depan</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={editForm.first_name}
                                                onChange={e => setEditForm({...editForm, first_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-white-container-low border border-clinical-blue/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-teal focus:border-transparent text-clinical-charcoal font-medium transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-body-sm font-headline-md text-clinical-charcoal uppercase tracking-wider">Nama Belakang</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={editForm.last_name}
                                                onChange={e => setEditForm({...editForm, last_name: e.target.value})}
                                                className="w-full px-4 py-3 bg-white-container-low border border-clinical-blue/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-teal focus:border-transparent text-clinical-charcoal font-medium transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-body-sm font-headline-md text-clinical-charcoal uppercase tracking-wider">Unggah Foto Profil</label>
                                        <div className="flex items-center gap-4">
                                            {editForm.profile_photo && (
                                                <div className="w-12 h-12 rounded-full overflow-hidden border border-clinical-blue/20 shrink-0">
                                                    <img src={editForm.profile_photo} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="w-full text-sm font-body-sm text-clinical-charcoal/70 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm font-body-sm file:font-headline-md file:bg-clinical-blue/10 file:text-clinical-blue hover:file:bg-clinical-blue/20 transition-all cursor-pointer"
                                            />
                                        </div>
                                        <p className="text-[10px] text-clinical-charcoal/70">Pilih foto berformat JPG/PNG (opsional). Maks. 1MB direkomendasikan.</p>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-clinical-blue/20/30 mt-6">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setIsEditing(false);
                                                setError('');
                                                if (profile) {
                                                    setEditForm({
                                                        first_name: profile.first_name,
                                                        last_name: profile.last_name,
                                                        profile_photo: profile.profile_photo || ''
                                                    });
                                                }
                                            }}
                                            className="flex-1 px-6 py-3 border-2 border-clinical-blue/20 text-clinical-charcoal font-headline-md rounded-xl hover:bg-white-container transition-all"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="flex-1 px-6 py-3 bg-clinical-blue text-white font-headline-md rounded-xl hover:bg-teal-700 transition-all shadow-md active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                                        >
                                            {isSaving ? (
                                                <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Menyimpan...</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-[18px]">save</span> Simpan</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>


        <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </div>
  );
};
