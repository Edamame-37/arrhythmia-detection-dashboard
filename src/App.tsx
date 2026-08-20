import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';

// Landing Pages
import { HomePage } from './presentation/pages/landing/HomePage';
import { HowItWorksPage } from './presentation/pages/landing/HowItWorksPage';
import { FaqPage } from './presentation/pages/landing/FaqPage';

// Auth Pages
import { SplashPage } from './presentation/pages/auth/SplashPage';
import { LoginPage } from './presentation/pages/auth/LoginPage';
import { RegisterPage } from './presentation/pages/auth/RegisterPage';

import { SidebarProvider } from './application/context/SidebarContext';
import { ConnectionProvider } from './application/context/ConnectionContext';
import { PreferencesProvider } from './application/context/PreferencesContext';
import { SecurityProvider } from './application/context/SecurityContext';
import { DevToolsBlocker } from './presentation/components/DevToolsBlocker';

// Admin Pages
import { ErrorBoundary } from './presentation/components/ErrorBoundary';
import { AdminDashboardPage } from './presentation/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './presentation/pages/admin/AdminUsersPage';
import { AdminDevicesPage } from './presentation/pages/admin/AdminDevicesPage';
import { AdminSessionsPage } from './presentation/pages/admin/AdminSessionsPage';
import { AdminAnalyticsPage } from './presentation/pages/admin/AdminAnalyticsPage';

// Doctor Pages
import { DashboardPage } from './presentation/pages/doctor/DashboardPage';
import { MonitorPage } from './presentation/pages/doctor/MonitorPage';
import { AnalyticsPage } from './presentation/pages/doctor/AnalyticsPage';
import { QrScannerPage } from './presentation/pages/doctor/QrScannerPage';
import { ProfilePage } from './presentation/pages/doctor/ProfilePage';

// Patient Pages
import { PatientDashboardPage } from './presentation/pages/patient/PatientDashboardPage';
import { PatientQrSyncPage } from './presentation/pages/patient/PatientQrSyncPage';
import { PatientHistoryPage } from './presentation/pages/patient/PatientHistoryPage';
import { PatientHistoryDetailPage } from './presentation/pages/patient/PatientHistoryDetailPage';
import { PatientProfilePage } from './presentation/pages/patient/PatientProfilePage';
import { PatientSettingsPage } from './presentation/pages/patient/PatientSettingsPage';
import { PatientMonitorPage } from './presentation/pages/patient/PatientMonitorPage';
import { PatientDeviceScannerPage } from './presentation/pages/patient/PatientDeviceScannerPage';

const TitleSetter: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Home',
      '/how-it-works': 'How It Works',
      '/faq': 'FAQ',
      '/auth': 'Auth',
      '/auth/login': 'Login',
      '/auth/register': 'Register',
      '/admin/dashboard': 'Admin Dashboard',
      '/admin/monitor': 'Live Stream Monitor',
      '/admin/users': 'User Management',
      '/admin/devices': 'Device Fleet',
      '/admin/sessions': 'Session Management',
      '/admin/analytics': 'Admin Analytics',
      '/doctor/dashboard': 'Doctor Dashboard',
      '/doctor/analytics': 'Analytics',
      '/doctor/qr-scanner': 'QR Scanner',
      '/doctor/profile': 'Profile',
      '/patient/dashboard': 'Patient Dashboard',
      '/patient/qr-sync': 'QR Sync',
      '/patient/history': 'History',
      '/patient/device-guide': 'Device Guide',
      '/patient/profile': 'Profil & Keamanan',
      '/patient/settings': 'Patient Settings',
      '/patient/monitor': 'Live Monitor',
    };

    const pageName = titles[location.pathname] || 'App';
    document.title = `ecgrhythmia | ${pageName}`;
  }, [location]);

  return null;
};

<<<<<<< HEAD
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('pasien' | 'dokter' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  let userId = localStorage.getItem('user_id');
  let userRole = localStorage.getItem('user_role') as 'pasien' | 'dokter' | 'admin' | null;

  // Automatically restore admin session if accessing an admin route and an admin token backup exists
  const adminToken = localStorage.getItem('admin_auth_token');
  if (adminToken && allowedRoles.includes('admin') && userRole !== 'admin') {
    localStorage.setItem('auth_token', adminToken);
    localStorage.setItem('user_role', 'admin');
    const adminId = localStorage.getItem('admin_user_id') || '';
    localStorage.setItem('user_id', adminId);
    userId = adminId;
    userRole = 'admin';
  }

  if (!userId || !userRole) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Allow anyone to access admin pages if they are logged in (for easy monitoring/maintenance)
    if (allowedRoles.includes('admin')) {
      return <>{children}</>;
    }
    if (userRole === 'pasien') return <Navigate to="/patient/dashboard" replace />;
    if (userRole === 'dokter') return <Navigate to="/doctor/dashboard" replace />;
    if (userRole === 'admin') return <Navigate to="/admin/monitor" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const ImpersonationBanner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [targetUser, setTargetUser] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<string | null>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_auth_token');
    const userRole = localStorage.getItem('user_role');
    const userId = localStorage.getItem('user_id');
    if (adminToken && userRole !== 'admin') {
      setIsAdminMode(true);
      setTargetUser(userId);
      setTargetRole(userRole);
    } else {
      setIsAdminMode(false);
    }
  }, [location]);

  const handleReturnToAdmin = () => {
    const adminToken = localStorage.getItem('admin_auth_token');
    const adminId = localStorage.getItem('admin_user_id');
    if (adminToken) {
      localStorage.setItem('auth_token', adminToken);
      localStorage.setItem('user_role', 'admin');
      if (adminId) localStorage.setItem('user_id', adminId);
      
      localStorage.removeItem('admin_auth_token');
      localStorage.removeItem('admin_user_id');
      localStorage.removeItem('connectedPatients');
      localStorage.removeItem('connectedDoctor');
      localStorage.removeItem('mock_patient_profile');
      
      navigate('/admin/users');
    }
  };

  if (!isAdminMode) return null;

  return (
    <div className="w-full bg-gradient-to-r from-medical-teal to-clinical-blue text-white py-3 px-6 shadow-md flex items-center justify-between z-[9999] relative border-b border-white/10 font-sans backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] animate-pulse">admin_panel_settings</span>
        <span className="text-sm font-semibold tracking-wide">
          Impersonation Active: Currently viewing as <span className="underline font-bold capitalize">{targetRole}</span> ({targetUser})
        </span>
      </div>
      <button 
        onClick={handleReturnToAdmin}
        className="bg-white/20 hover:bg-white text-white hover:text-medical-teal font-bold text-xs py-1.5 px-4 rounded-lg border border-white/20 hover:border-white transition-all duration-300 shadow-sm flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[16px]">exit_to_app</span>
        Return to Admin Portal
      </button>
    </div>
  );
=======
const SessionRestorer: React.FC = () => {
  useEffect(() => {
    const isImpersonating = sessionStorage.getItem('is_impersonating');
    if (!isImpersonating) {
      const adminToken = localStorage.getItem('admin_auth_token');
      const adminId = localStorage.getItem('admin_user_id');
      const docToken = localStorage.getItem('doctor_auth_token');
      const docId = localStorage.getItem('doctor_user_id');
      const originalRole = localStorage.getItem('original_role');

      if (adminToken && adminId && originalRole === 'admin') {
        localStorage.setItem('auth_token', adminToken);
        localStorage.setItem('user_id', adminId);
        localStorage.setItem('user_role', 'admin');
        localStorage.removeItem('admin_auth_token');
        localStorage.removeItem('admin_user_id');
        localStorage.removeItem('original_role');
      } else if (docToken && docId && originalRole === 'dokter') {
        localStorage.setItem('auth_token', docToken);
        localStorage.setItem('user_id', docId);
        localStorage.setItem('user_role', 'dokter');
        localStorage.removeItem('doctor_auth_token');
        localStorage.removeItem('doctor_user_id');
        localStorage.removeItem('original_role');
      }
    }
  }, []);
  return null;
>>>>>>> poli-scheme-adaptation
};

export const App: React.FC = () => {
  const [showBanner, setShowBanner] = React.useState(false); // keep react state hook standard
  return (
    <BrowserRouter>
      <SecurityProvider>
        <PreferencesProvider>
          <ConnectionProvider>
            <SidebarProvider>
              <TitleSetter />
              <SessionRestorer />
              <DevToolsBlocker />
              <ErrorBoundary>
                <ImpersonationBanner />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/faq" element={<FaqPage />} />

                  {/* Auth Routes */}
                  <Route path="/auth" element={<SplashPage />} />
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/register" element={<RegisterPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
                  <Route path="/admin/devices" element={<ProtectedRoute allowedRoles={['admin']}><AdminDevicesPage /></ProtectedRoute>} />
                  <Route path="/admin/sessions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSessionsPage /></ProtectedRoute>} />
                  <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />

                {/* Doctor Routes */}
                <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['dokter']}><DashboardPage /></ProtectedRoute>} />
                <Route path="/doctor/monitor" element={<ProtectedRoute allowedRoles={['dokter']}><MonitorPage /></ProtectedRoute>} />
                <Route path="/doctor/analytics" element={<ProtectedRoute allowedRoles={['dokter']}><AnalyticsPage /></ProtectedRoute>} />
                <Route path="/doctor/qr-scanner" element={<ProtectedRoute allowedRoles={['dokter']}><QrScannerPage /></ProtectedRoute>} />
                <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['dokter']}><ProfilePage /></ProtectedRoute>} />

                  {/* Patient Routes */}
                  <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['pasien']}><PatientDashboardPage /></ProtectedRoute>} />
                  <Route path="/patient/qr-sync" element={<ProtectedRoute allowedRoles={['pasien']}><PatientQrSyncPage /></ProtectedRoute>} />
                  <Route path="/patient/device-scanner" element={<ProtectedRoute allowedRoles={['pasien']}><PatientDeviceScannerPage /></ProtectedRoute>} />
                  <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['pasien']}><PatientHistoryPage /></ProtectedRoute>} />
                  <Route path="/patient/history/:sessionId" element={<ProtectedRoute allowedRoles={['pasien']}><PatientHistoryDetailPage /></ProtectedRoute>} />
                  <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['pasien']}><PatientProfilePage /></ProtectedRoute>} />
                  <Route path="/patient/settings" element={<ProtectedRoute allowedRoles={['pasien']}><PatientSettingsPage /></ProtectedRoute>} />
                  <Route path="/patient/monitor" element={<ProtectedRoute allowedRoles={['pasien']}><PatientMonitorPage /></ProtectedRoute>} />
                </Routes>
              </ErrorBoundary>
            </SidebarProvider>
          </ConnectionProvider>
        </PreferencesProvider>
      </SecurityProvider>
    </BrowserRouter>
  );
};