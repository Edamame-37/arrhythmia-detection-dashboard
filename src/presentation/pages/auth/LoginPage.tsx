import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'pasien' | 'dokter'>('dokter');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faskes, setFaskes] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validasi Email & Password (Berlaku untuk Pasien & Dokter)
    if (email !== 'ecgrhythmia@gmail.com' || password !== 'pppp') {
      setError('Email atau password salah.');
      return;
    }

    // Validasi tambahan khusus Dokter
    if (role === 'dokter' && faskes.toUpperCase() !== 'F-12345') {
      setError('Kode Faskes tidak valid.');
      return;
    }

    // Navigasi jika berhasil
    if (role === 'pasien') {
      navigate('/patient/dashboard');
    } else {
      navigate('/doctor/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full">

    <main className="w-full max-w-[450px]">
        <section className="bg-white shadow-lg rounded-xl p-10 flex flex-col items-center">
            <div className="flex flex-row items-center justify-center gap-2 mb-8">
                <img alt="ecgrhythmia clinical heart and stethoscope logo" className="w-14 h-14" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCMHY1rwJz3Bn-D6aH30NsUoKCHh50RKw49BhscJugmYHzwjI4ey5ccSp9XawgX4Jzj6xSb8kHazzVJlVQ4AdKSkMKGRM3q1qB3ul_AyWaXLT_CJAZj0oV7QHTVIezEjnYJ1hRIIzWdfCh30ZbtQNyDMH86S-6c8UfQHx6HJub_2ZcnhGdwWIYbmcrjuDuluEo3nxY2ENq7nc0W5lO03dsPefmV_kTOnKCGtpZq9Sd3zxp7toZSYaVXYPGZa3bFZpNAb27eoWoXd1A" />
                <h1 className="font-headline-lg text-headline-lg flex tracking-tight text-[32px]">
                    <span className="text-brand-red font-extrabold">ecg</span><span className="text-brand-navy font-bold">rhythmia</span>
                </h1>
            </div>
            <div className="w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-[24px] font-bold text-deep-charcoal mt-6 mb-2">Sign In</h2>
                    <p className="text-body-sm text-secondary max-w-[300px] mx-auto">Enter your credentials to access the clinical portal.</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-alert-red/30 text-alert-red p-3 rounded-lg text-sm text-center font-bold">
                        {error}
                    </div>
                )}

                <div className="flex bg-surface-container p-1 rounded-lg w-full my-6">
                    <button 
                        type="button"
                        onClick={() => { setRole('pasien'); setError(''); }}
                        className={`flex-1 py-2 px-4 rounded-md font-label-bold text-label-bold transition-all ${role === 'pasien' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                    >
                        Pasien
                    </button>
                    <button 
                        type="button"
                        onClick={() => { setRole('dokter'); setError(''); }}
                        className={`flex-1 py-2 px-4 rounded-md font-label-bold text-label-bold transition-all ${role === 'dokter' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                    >
                        Dokter / Nakes
                    </button>
                </div>
                <form className="w-full space-y-5" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label className="font-medium text-label-bold text-on-surface-variant" htmlFor="email">Email Address</label>
                        <input className="w-full bg-white border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline" id="email" placeholder="name@clinical.com"
                            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="font-medium text-label-bold text-on-surface-variant" htmlFor="password">Password</label>
                        <div className="relative">
                            <input className="w-full bg-white border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline" id="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-medical-teal transition-colors" type="button">
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                        </div>
                    </div>
                    {role === 'dokter' && (
                        <div className="space-y-2 animate-fade-in">
                            <label className="font-medium text-label-bold text-on-surface-variant" htmlFor="faskes">Kode Faskes (Facility Code)</label>
                            <input className="w-full bg-white border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none uppercase border-outline" id="faskes" placeholder="F-12345"
                                type="text" value={faskes} onChange={(e) => setFaskes(e.target.value)} required />
                            <p className="font-label-md text-label-md text-secondary italic">*Required for medical staff</p>
                        </div>
                    )}
                    <div className="pt-4 space-y-4">
                        <button className="w-full bg-medical-teal text-white font-label-bold text-label-bold py-4 rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all" type="submit">
                             Masuk / Sign In
                        </button>
                        <div className="text-center">
                            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-medical-teal hover:underline transition-all" to="#">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                </form>
                <div className="mt-8 mb-6 text-center w-full border-t border-outline-variant pt-6">
                    <p className="text-body-sm text-secondary max-w-[300px] mx-auto text-sm">
                        © 2024 ecgrhythmia Medical Systems.
                        <span className="block mt-1">Need help? <Link className="text-medical-teal font-bold hover:underline" to="#">Contact Support</Link></span>
                    </p>
                </div>
            </div>
        </section>
    </main>
    



    </div>
  );
};
