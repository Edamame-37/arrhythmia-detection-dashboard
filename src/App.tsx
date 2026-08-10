import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

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
import { AdminDashboardPage } from './presentation/pages/admin/AdminDashboardPage';
import { AdminMonitorPage } from './presentation/pages/admin/AdminMonitorPage';
import { AdminUsersPage } from './presentation/pages/admin/AdminUsersPage';
import { AdminDevicesPage } from './presentation/pages/admin/AdminDevicesPage';

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

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('pasien' | 'dokter' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const userId = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('user_role') as 'pasien' | 'dokter' | 'admin' | null;

  if (!userId || !userRole) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'pasien') return <Navigate to="/patient/dashboard" replace />;
    if (userRole === 'dokter') return <Navigate to="/doctor/dashboard" replace />;
    if (userRole === 'admin') return <Navigate to="/admin/monitor" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SecurityProvider>
        <PreferencesProvider>
          <ConnectionProvider>
            <SidebarProvider>
              <TitleSetter />
              <DevToolsBlocker />
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
                <Route path="/admin/monitor" element={<ProtectedRoute allowedRoles={['admin']}><AdminMonitorPage /></ProtectedRoute>} />

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
            </SidebarProvider>
          </ConnectionProvider>
        </PreferencesProvider>
      </SecurityProvider>
    </BrowserRouter>
  );
};