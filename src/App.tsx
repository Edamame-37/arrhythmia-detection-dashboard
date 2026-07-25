import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Landing Pages
import { HomePage } from './presentation/pages/landing/HomePage';
import { HowItWorksPage } from './presentation/pages/landing/HowItWorksPage';
import { FaqPage } from './presentation/pages/landing/FaqPage';

// Auth Pages
import { SplashPage } from './presentation/pages/auth/SplashPage';
import { LoginPage } from './presentation/pages/auth/LoginPage';

// Doctor Pages
import { DashboardPage } from './presentation/pages/doctor/DashboardPage';
import { MonitorPage } from './presentation/pages/doctor/MonitorPage';
import { AnalyticsPage } from './presentation/pages/doctor/AnalyticsPage';
import { DeviceBindingPage } from './presentation/pages/doctor/DeviceBindingPage';
import { QrScannerPage } from './presentation/pages/doctor/QrScannerPage';
import { ProfilePage } from './presentation/pages/doctor/ProfilePage';
import { ClinicalSettingsPage } from './presentation/pages/doctor/ClinicalSettingsPage';

// Patient Pages
import { PatientDashboardPage } from './presentation/pages/patient/PatientDashboardPage';
import { PatientQrSyncPage } from './presentation/pages/patient/PatientQrSyncPage';
import { PatientHistoryPage } from './presentation/pages/patient/PatientHistoryPage';
import { DeviceGuidePage } from './presentation/pages/patient/DeviceGuidePage';
import { PrivacyControlPage } from './presentation/pages/patient/PrivacyControlPage';
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
      '/doctor/dashboard': 'Doctor Dashboard',
      '/doctor/monitor': 'Live Monitor',
      '/doctor/analytics': 'Analytics',
      '/doctor/device-binding': 'Device Binding',
      '/doctor/qr-scanner': 'QR Scanner',
      '/doctor/profile': 'Profile',
      '/doctor/settings': 'Clinical Settings',
      '/patient/dashboard': 'Patient Dashboard',
      '/patient/qr-sync': 'QR Sync',
      '/patient/history': 'History',
      '/patient/device-guide': 'Device Guide',
      '/patient/privacy-control': 'Privacy Control',
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
      <TitleSetter />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FaqPage />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<SplashPage />} />
        <Route path="/auth/login" element={<LoginPage />} />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<DashboardPage />} />
        <Route path="/doctor/monitor" element={<MonitorPage />} />
        <Route path="/doctor/analytics" element={<AnalyticsPage />} />
        <Route path="/doctor/device-binding" element={<DeviceBindingPage />} />
        <Route path="/doctor/qr-scanner" element={<QrScannerPage />} />
        <Route path="/doctor/profile" element={<ProfilePage />} />
        <Route path="/doctor/settings" element={<ClinicalSettingsPage />} />

        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
        <Route path="/patient/qr-sync" element={<PatientQrSyncPage />} />
        <Route path="/patient/history" element={<PatientHistoryPage />} />
        <Route path="/patient/device-guide" element={<DeviceGuidePage />} />
        <Route path="/patient/privacy-control" element={<PrivacyControlPage />} />
        <Route path="/patient/settings" element={<PatientSettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
};