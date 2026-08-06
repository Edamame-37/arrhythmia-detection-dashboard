import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../../../core/config';


export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'pasien' | 'dokter'>('pasien');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('L');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Password harus lebih dari 6 karakter.');
      return;
    }

    try {
      const response = await fetch(`${APP_CONFIG.API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, password, first_name: firstName, last_name: lastName, date_of_birth: dob, gender })
      });
      const data = await response.json();
      if (data.success) {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/auth/login');
      } else {
        setError(data.message || 'Gagal mendaftar');
      }
    } catch (err) {
      setError('Koneksi ke server gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full bg-gradient-to-tr from-luxury-navy via-brand-navy to-clinical-blue/20 dark:from-luxury-navy dark:via-luxury-muted dark:to-[#071A3A] relative overflow-hidden">
        {/* Animated backdrop spots */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clinical-blue/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <main className="w-full max-w-[450px] my-8 z-10">
            <section className="bg-white/95 dark:bg-luxury-navy/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-[2rem] p-6 md:p-10 flex flex-col items-center">
                <div className="flex flex-row items-center justify-center gap-2 mb-8">
                    <img alt="ecgrhythmia clinical heart and stethoscope logo" className="w-14 h-14" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCMHY1rwJz3Bn-D6aH30NsUoKCHh50RKw49BhscJugmYHzwjI4ey5ccSp9XawgX4Jzj6xSb8kHazzVJlVQ4AdKSkMKGRM3q1qB3ul_AyWaXLT_CJAZj0oV7QHTVIezEjnYJ1hRIIzWdfCh30ZbtQNyDMH86S-6c8UfQHx6HJub_2ZcnhGdwWIYbmcrjuDuluEo3nxY2ENq7nc0W5lO03dsPefmV_kTOnKCGtpZq9Sd3zxp7toZSYaVXYPGZa3bFZpNAb27eoWoXd1A" />
                    <h1 className="font-headline text-3xl flex tracking-tight">
                        <span className="text-brand-red font-extrabold">ecg</span><span className="text-brand-navy dark:text-white font-bold">rhythmia</span>
                    </h1>
                </div>
                <div className="w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-[24px] font-headline font-bold text-charcoal dark:text-white mt-2 mb-2">Create Account</h2>
                        <p className="text-body-sm text-secondary dark:text-luxury-slate max-w-[300px] mx-auto">Silakan isi data diri Anda untuk mendaftar ke portal klinis.</p>
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 border border-alert-red/30 text-alert-red p-3 rounded-xl text-sm text-center font-bold">
                            {error}
                        </div>
                    )}

                    <div className="flex bg-surface-container dark:bg-luxury-navy/60 p-1.5 rounded-xl w-full my-6 border border-outline-variant/30">
                        <button 
                            type="button"
                            onClick={() => { setRole('pasien'); setError(''); }}
                            className={`flex-1 py-2.5 px-2 md:px-4 rounded-lg font-label-bold text-label-bold transition-all text-xs md:text-sm ${role === 'pasien' ? 'bg-white dark:bg-luxury-muted shadow-sm text-on-surface dark:text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                        >
                            Pasien
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setRole('dokter'); setError(''); }}
                            className={`flex-1 py-2.5 px-2 md:px-4 rounded-lg font-label-bold text-label-bold transition-all text-xs md:text-sm ${role === 'dokter' ? 'bg-white dark:bg-luxury-muted shadow-sm text-on-surface dark:text-white' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                        >
                            Dokter / Nakes
                        </button>
                    </div>
                    <form className="w-full space-y-4" onSubmit={handleRegister}>
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            <div className="space-y-2 flex-1">
                                <label className="font-medium text-label-bold text-on-surface-variant dark:text-luxury-slate" htmlFor="firstName">Nama Depan</label>
                                <input className="w-full bg-white dark:bg-luxury-navy border border-outline-variant rounded-xl p-3.5 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline text-charcoal dark:text-white" id="firstName" placeholder="John"
                                    type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="font-medium text-label-bold text-on-surface-variant dark:text-luxury-slate" htmlFor="lastName">Nama Belakang</label>
                                <input className="w-full bg-white dark:bg-luxury-navy border border-outline-variant rounded-xl p-3.5 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline text-charcoal dark:text-white" id="lastName" placeholder="Doe"
                                    type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                            </div>
                        </div>
                        {role === 'pasien' && (
                            <div className="flex flex-col md:flex-row gap-4 w-full animate-fade-in">
                                <div className="space-y-2 flex-1">
                                    <label className="font-medium text-label-bold text-on-surface-variant dark:text-luxury-slate" htmlFor="dob">Tanggal Lahir</label>
                                    <input className="w-full bg-white dark:bg-luxury-navy border border-outline-variant rounded-xl p-3.5 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline text-charcoal dark:text-white" id="dob"
                                        type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <label className="font-medium text-label-bold text-on-surface-variant dark:text-luxury-slate" htmlFor="gender">Jenis Kelamin</label>
                                    <select className="w-full bg-white dark:bg-luxury-navy border border-outline-variant rounded-xl p-3.5 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline appearance-none text-charcoal dark:text-white" id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="font-medium text-label-bold text-on-surface-variant dark:text-luxury-slate" htmlFor="email">Email Address</label>
                            <input className="w-full bg-white dark:bg-luxury-navy border border-outline-variant rounded-xl p-3.5 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline text-charcoal dark:text-white" id="email" placeholder="name@clinical.com"
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="font-medium text-label-bold text-on-surface-variant dark:text-luxury-slate" htmlFor="password">Password</label>
                            <input className="w-full bg-white dark:bg-luxury-navy border border-outline-variant rounded-xl p-3.5 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline text-charcoal dark:text-white" id="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="font-medium text-label-bold text-on-surface-variant dark:text-luxury-slate" htmlFor="confirmPassword">Konfirmasi Password</label>
                            <input className="w-full bg-white dark:bg-luxury-navy border border-outline-variant rounded-xl p-3.5 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline text-charcoal dark:text-white" id="confirmPassword" placeholder="••••••••" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div className="pt-4 space-y-4">
                            <button className="w-full bg-medical-teal text-white font-label-bold text-label-bold py-4 rounded-xl shadow-md hover:brightness-110 active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-medical-teal/20" type="submit">
                                 Buat Akun / Register
                            </button>
                            <div className="text-center">
                                <span className="text-body-sm text-secondary dark:text-luxury-slate">
                                    Sudah punya akun? <Link className="text-medical-teal font-bold hover:underline transition-all" to="/auth/login">Masuk di sini</Link>
                                </span>
                            </div>
                        </div>
                    </form>
                    <div className="mt-8 mb-6 text-center w-full border-t border-outline-variant/30 pt-6">
                        <p className="text-body-sm text-secondary dark:text-luxury-slate max-w-[300px] mx-auto text-sm">
                            © 2024 ecgrhythmia Medical Systems.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    </div>
  );
};
