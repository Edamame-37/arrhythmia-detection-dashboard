import React, { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./application/context/AuthContext";
import { PreferencesProvider } from "./application/context/PreferencesContext";
import { ConnectionProvider } from "./application/context/ConnectionContext";
import { SidebarProvider } from "./application/context/SidebarContext";
import { ErrorBoundary } from "./presentation/components/ErrorBoundary";
import { ErrorPage } from "./presentation/pages/shared/ErrorPage";
import type { UserRole } from "./core/types/apiTypes";
const Home = lazy(() =>
  import("./presentation/pages/landing/HomePage").then((module) => ({
    default: module.HomePage,
  })),
);
const How = lazy(() =>
  import("./presentation/pages/landing/HowItWorksPage").then((module) => ({
    default: module.HowItWorksPage,
  })),
);
const Faq = lazy(() =>
  import("./presentation/pages/landing/FaqPage").then((module) => ({
    default: module.FaqPage,
  })),
);
const Login = lazy(() =>
  import("./presentation/pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const Register = lazy(() =>
  import("./presentation/pages/auth/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  })),
);
const ResetPassword = lazy(() =>
  import("./presentation/pages/auth/ResetPasswordPage").then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const Splash = lazy(() =>
  import("./presentation/pages/auth/SplashPage").then((module) => ({
    default: module.SplashPage,
  })),
);
const AdminDashboard = lazy(() =>
  import("./presentation/pages/admin/AdminDashboardPage").then((module) => ({
    default: module.AdminDashboardPage,
  })),
);
const AdminUsers = lazy(() =>
  import("./presentation/pages/admin/AdminUsersPage").then((module) => ({
    default: module.AdminUsersPage,
  })),
);
const AdminDevices = lazy(() =>
  import("./presentation/pages/admin/AdminDevicesPage").then((module) => ({
    default: module.AdminDevicesPage,
  })),
);
const AdminSessions = lazy(() =>
  import("./presentation/pages/admin/AdminSessionsPage").then((module) => ({
    default: module.AdminSessionsPage,
  })),
);
const AdminAnalytics = lazy(() =>
  import("./presentation/pages/admin/AdminAnalyticsPage").then((module) => ({
    default: module.AdminAnalyticsPage,
  })),
);
const AdminMonitor = lazy(() =>
  import("./presentation/pages/admin/AdminMonitorPage").then((module) => ({
    default: module.AdminMonitorPage,
  })),
);
const DoctorDashboard = lazy(() =>
  import("./presentation/pages/doctor/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const DoctorAnalytics = lazy(() =>
  import("./presentation/pages/doctor/AnalyticsPage").then((module) => ({
    default: module.AnalyticsPage,
  })),
);
const DoctorQr = lazy(() =>
  import("./presentation/pages/doctor/QrScannerPage").then((module) => ({
    default: module.QrScannerPage,
  })),
);
const DoctorProfile = lazy(() =>
  import("./presentation/pages/doctor/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);
const DoctorMonitor = lazy(() =>
  import("./presentation/pages/doctor/MonitorPage").then((module) => ({
    default: module.MonitorPage,
  })),
);
const PatientDashboard = lazy(() =>
  import("./presentation/pages/patient/PatientDashboardPage").then(
    (module) => ({ default: module.PatientDashboardPage }),
  ),
);
const PatientQr = lazy(() =>
  import("./presentation/pages/patient/PatientQrSyncPage").then((module) => ({
    default: module.PatientQrSyncPage,
  })),
);
const PatientDevice = lazy(() =>
  import("./presentation/pages/patient/PatientDeviceScannerPage").then(
    (module) => ({ default: module.PatientDeviceScannerPage }),
  ),
);
const PatientHistory = lazy(() =>
  import("./presentation/pages/patient/PatientHistoryPage").then((module) => ({
    default: module.PatientHistoryPage,
  })),
);
const PatientHistoryDetail = lazy(() =>
  import("./presentation/pages/patient/PatientHistoryDetailPage").then(
    (module) => ({ default: module.PatientHistoryDetailPage }),
  ),
);
const PatientProfile = lazy(() =>
  import("./presentation/pages/patient/PatientProfilePage").then((module) => ({
    default: module.PatientProfilePage,
  })),
);
const PatientSettings = lazy(() =>
  import("./presentation/pages/patient/PatientSettingsPage").then((module) => ({
    default: module.PatientSettingsPage,
  })),
);
const PatientMonitor = lazy(() =>
  import("./presentation/pages/patient/PatientMonitorPage").then((module) => ({
    default: module.PatientMonitorPage,
  })),
);
function RequireRole({ roles }: { roles: UserRole[] }) {
  const { identity, loading, error } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <p role="status" className="p-8">
        Memverifikasi sesi...
      </p>
    );
  if (!identity)
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname, error }}
      />
    );
  if (!roles.includes(identity.role))
    return (
      <main className="p-8">
        <h1>Akses ditolak</h1>
        <p>Anda tidak memiliki izin untuk halaman ini.</p>
      </main>
    );
  return <Outlet />;
}
function Title() {
  const location = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Home",
      "/how-it-works": "How It Works",
      "/faq": "FAQ",
      "/auth": "Auth",
      "/auth/login": "Login",
      "/auth/register": "Register",
      "/admin/dashboard": "Admin Dashboard",
      "/admin/monitor": "Live Stream Monitor",
      "/admin/users": "User Management",
      "/admin/devices": "Device Fleet",
      "/admin/sessions": "Session Management",
      "/admin/analytics": "Admin Analytics",
      "/doctor/dashboard": "Doctor Dashboard",
      "/doctor/analytics": "Analytics",
      "/doctor/qr-scanner": "QR Scanner",
      "/doctor/profile": "Profile",
      "/patient/dashboard": "Patient Dashboard",
      "/patient/qr-sync": "QR Sync",
      "/patient/history": "History",
      "/patient/device-guide": "Device Guide",
      "/patient/profile": "Profil & Keamanan",
      "/patient/settings": "Patient Settings",
      "/patient/monitor": "Live Monitor",
    };
    document.title =
      "ecgrhythmia | " +
      (titles[location.pathname] ||
        (location.pathname.startsWith("/patient/history/")
          ? "Detail Riwayat"
          : "App"));
  }, [location.pathname]);
  return null;
}
export const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <ErrorBoundary>
        <PreferencesProvider>
          <ConnectionProvider>
            <SidebarProvider>
              <Title />
              <Suspense
                fallback={
                  <p role="status" className="p-8">
                    Memuat halaman...
                  </p>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/how-it-works" element={<How />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/auth" element={<Splash />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route
                    path="/auth/reset-password"
                    element={<ResetPassword />}
                  />
                  <Route element={<RequireRole roles={["admin"]} />}>
                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/devices" element={<AdminDevices />} />
                    <Route path="/admin/sessions" element={<AdminSessions />} />
                    <Route
                      path="/admin/analytics"
                      element={<AdminAnalytics />}
                    />
                    <Route path="/admin/monitor" element={<AdminMonitor />} />
                  </Route>
                  <Route element={<RequireRole roles={["dokter"]} />}>
                    <Route
                      path="/doctor/dashboard"
                      element={<DoctorDashboard />}
                    />
                    <Route
                      path="/doctor/analytics"
                      element={<DoctorAnalytics />}
                    />
                    <Route path="/doctor/qr-scanner" element={<DoctorQr />} />
                    <Route path="/doctor/profile" element={<DoctorProfile />} />
                    <Route path="/doctor/monitor" element={<DoctorMonitor />} />
                  </Route>
                  <Route element={<RequireRole roles={["pasien"]} />}>
                    <Route
                      path="/patient/dashboard"
                      element={<PatientDashboard />}
                    />
                    <Route path="/patient/qr-sync" element={<PatientQr />} />
                    <Route
                      path="/patient/device-scanner"
                      element={<PatientDevice />}
                    />
                    <Route
                      path="/patient/history"
                      element={<PatientHistory />}
                    />
                    <Route
                      path="/patient/history/:sessionId"
                      element={<PatientHistoryDetail />}
                    />
                    <Route
                      path="/patient/profile"
                      element={<PatientProfile />}
                    />
                    <Route
                      path="/patient/settings"
                      element={<PatientSettings />}
                    />
                    <Route
                      path="/patient/monitor"
                      element={<PatientMonitor />}
                    />
                  </Route>
                  <Route path="*" element={<ErrorPage type="404" />} />
                </Routes>
              </Suspense>
            </SidebarProvider>
          </ConnectionProvider>
        </PreferencesProvider>
      </ErrorBoundary>
    </AuthProvider>
  </BrowserRouter>
);
