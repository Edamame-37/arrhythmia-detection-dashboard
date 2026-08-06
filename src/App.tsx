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
      '/doctor/monitor': 'Live Monitor',
      '/doctor/analytics': 'Analytics',
      '/doctor/qr-scanner': 'QR Scanner',
      '/doctor/profile': 'Profile',
      '/patient/dashboard': 'Patient Dashboard',
      '/patient/qr-sync': 'QR Sync',
      '/patient/history': 'History',
      '/patient/device-guide': 'Device Guide',
      '/patient/profile': 'Profil & Keamanan',
      '/patient/settings': 'Patient Settings',
    };

    const pageName = titles[location.pathname] || 'App';
    document.title = `ecgrhythmia | ${pageName}`;
  }, [location]);

  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PreferencesProvider>
      <ConnectionProvider>
      <SidebarProvider>
      <TitleSetter />
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
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/monitor" element={<AdminMonitorPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/devices" element={<AdminDevicesPage />} />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<DashboardPage />} />
        <Route path="/doctor/monitor" element={<MonitorPage />} />
        <Route path="/doctor/analytics" element={<AnalyticsPage />} />
        <Route path="/doctor/qr-scanner" element={<QrScannerPage />} />
        <Route path="/doctor/profile" element={<ProfilePage />} />

        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
        <Route path="/patient/qr-sync" element={<PatientQrSyncPage />} />
        <Route path="/patient/history" element={<PatientHistoryPage />} />
        <Route path="/patient/history/:sessionId" element={<PatientHistoryDetailPage />} />
        <Route path="/patient/profile" element={<PatientProfilePage />} />
        <Route path="/patient/settings" element={<PatientSettingsPage />} />

        {/* Catch-all Redirect to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </SidebarProvider>
      </ConnectionProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
};