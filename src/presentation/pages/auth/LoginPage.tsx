import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../../../config/env';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isAdmin = queryParams.get('admin') === 'true';
  const [role, setRole] = useState<'pasien' | 'dokter' | 'admin'>(isAdmin ? 'admin' : 'dokter');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    if (userId) {
      if (userRole === 'pasien') navigate('/patient/dashboard');
      else if (userRole === 'dokter') navigate('/doctor/dashboard');
      else navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await response.json();
      
      if (data.success && data.user_id) {
        // Hapus data koneksi lama sebelum login baru
        localStorage.removeItem('connectedPatients');
        localStorage.removeItem('connectedDoctor');
        localStorage.removeItem('mock_patient_profile');

        // Save user ID to localStorage
        localStorage.setItem('user_id', data.user_id.toString());
        localStorage.setItem('user_role', data.role || role);
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        // Navigasi jika berhasil
        if (data.role === 'pasien') {
          navigate('/patient/dashboard');
        } else if (data.role === 'dokter') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError(data.message || 'Gagal login. Periksa email atau password.');
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

        <main className="w-full max-w-[450px] z-10">
            <section className="bg-white/95 dark:bg-luxury-navy/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-[2rem] p-6 md:p-10 flex flex-col items-center">
                <div className="flex flex-row items-center justify-center gap-2 mb-8">
                    <img alt="ecgrhythmia clinical heart and stethoscope logo" className="w-14 h-14" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCMHY1rwJz3Bn-D6aH30NsUoKCHh50RKw49BhscJugmYHzwjI4ey5ccSp9XawgX4Jzj6xSb8kHazzVJlVQ4AdKSkMKGRM3q1qB3ul_AyWaXLT_CJAZj0oV7QHTVIezEjnYJ1hRIIzWdfCh30ZbtQNyDMH86S-6c8UfQHx6HJub_2ZcnhGdwWIYbmcrjuDuluEo3nxY2ENq7nc0W5lO03dsPefmV_kTOnKCGtpZq9Sd3zxp7toZSYaVXYPGZa3bFZpNAb27eoWoXd1A" />
                    <h1 className="font-headline text-3xl flex tracking-tight">
                        <span className="text-brand-red font-extrabold">ecg</span><span className="text-brand-navy dark:text-white font-bold">rhythmia</span>
                    </h1>
                </div>
                <div className="w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-[24px] font-headline font-bold text-charcoal dark:text-white mt-6 mb-2">Sign In</h2>
                        <p className="text-body-sm text-secondary dark:text-luxury-slate max-w-[300px] mx-auto">Enter your credentials to access the clinical portal.</p>
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 border border-alert-red/30 text-alert-red p-3 rounded-xl text-sm text-center font-bold">
                            {error}
                        </div>
                    )}

                    {!isAdmin ? (
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
                    ) : (
                        <div className="w-full text-center my-6">
                            <span className="inline-block bg-medical-teal/10 text-medical-teal font-bold px-4 py-2 rounded-xl text-sm">Portal Administrator</span>
                        </div>
                    )}
                    <form className="w-full space-y-5" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="font-medium text-label-bold text-on-surface-variant dark:text-luxury-slate" htmlFor="email">Email Address</label>
                            <input className="w-full bg-white dark:bg-luxury-navy border border-outline-variant rounded-xl p-3.5 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline text-charcoal dark:text-white" id="email" placeholder="name@clinical.com"
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="font-medium text-label-bold text-on-surface-variant dark:text-luxury-slate" htmlFor="password">Password</label>
                            <div className="relative">
                                <input className="w-full bg-white dark:bg-luxury-navy border border-outline-variant rounded-xl p-3.5 font-body-sm text-body-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal transition-all outline-none border-outline text-charcoal dark:text-white" id="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-medical-teal transition-colors" type="button">
                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </button>
                            </div>
                        </div>
                        <div className="pt-4 space-y-4">
                            <button className="w-full bg-medical-teal text-white font-label-bold text-label-bold py-4 rounded-xl shadow-md hover:brightness-110 active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-medical-teal/20" type="submit">
                                 Masuk / Sign In
                            </button>
                            <div className="text-center space-y-2 flex flex-col">
                                <Link className="font-label-md text-label-md text-on-surface-variant hover:text-medical-teal hover:underline transition-all" to="#">
                                    Forgot Password?
                                </Link>
                                <span className="text-body-sm text-secondary dark:text-luxury-slate">
                                    Belum punya akun? <Link className="text-medical-teal font-bold hover:underline transition-all" to="/auth/register">Buat Akun</Link>
                                </span>
                            </div>
                        </div>
                    </form>
                    <div className="mt-8 mb-6 text-center w-full border-t border-outline-variant/30 pt-6">
                        <p className="text-body-sm text-secondary dark:text-luxury-slate max-w-[300px] mx-auto text-sm">
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
