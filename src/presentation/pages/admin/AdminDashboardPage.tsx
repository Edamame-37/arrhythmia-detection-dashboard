import React, { useEffect, useState } from "react";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { useSidebar } from "../../../application/context/SidebarContext";
import { useCachedFetch } from "../../../application/hooks/useCachedFetch";
export const AdminDashboardPage: React.FC = () => {
  const { toggleSidebar, isCollapsed } = useSidebar();
  const {
    data: stats,
    error,
    isLoading: loading,
  } = useCachedFetch("/api/admin/stats", { refreshInterval: 10000 });
  const [lastSync, setLastSync] = useState<Date | null>(null);
  useEffect(() => {
    if (stats) {
      // oxlint-disable-next-line react/set-state-in-effect -- Record the arrival of an external statistics snapshot.
      setLastSync(new Date());
    }
  }, [stats]);
  return (
    <div className="bg-clinical-surface text-clinical-charcoal antialiased overflow-x-hidden w-full min-h-screen relative font-sans">
      <div className="absolute inset-0 ecg-grid opacity-10 pointer-events-none z-0"></div>
      <AdminSidebar />

      <main
        id="main-content"
        className={`pb-24 md:pb-12 transition-all duration-300 min-h-screen flex flex-col md:ml-[260px] md:w-[calc(100%-260px)] ${isCollapsed ? "md:!ml-[72px] md:!w-[calc(100%-72px)]" : ""}`}
      >
        <header className="sticky top-0 bg-clinical-surface/80 backdrop-blur-xl border-b border-clinical-charcoal/5 z-40 px-4 md:px-6 py-4 flex items-center gap-4 w-full w-full transition-all duration-300">
          <button
            onClick={toggleSidebar}
            className="md:hidden flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-clinical-surface text-clinical-charcoal/70 transition-colors outline-none"
            title="Sembunyikan / Tampilkan Menu Utama"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-clinical-charcoal">
              System Overview
            </h1>
            <p className="text-xs md:text-sm font-medium text-clinical-charcoal/60 mt-0.5">
              Terakhir disinkronisasi:{" "}
              {lastSync
                ? lastSync.toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "medium",
                  })
                : "Menyinkronkan..."}
            </p>
          </div>
        </header>

        <div className="px-4 md:px-6 w-full mt-6 space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          {error && (
            <p role="alert" className="text-red-700">
              {error.message}
            </p>
          )}
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-clinical-charcoal/5 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-bold text-clinical-charcoal/60 uppercase tracking-wider">
                Total Patients
              </h3>
              <p className="text-3xl font-extrabold text-clinical-charcoal mt-2">
                {loading ? "..." : (stats?.total_patients ?? "-")}
              </p>
            </div>
            <div className="bg-white border border-clinical-charcoal/5 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-bold text-clinical-charcoal/60 uppercase tracking-wider">
                Total Doctors
              </h3>
              <p className="text-3xl font-extrabold text-clinical-charcoal mt-2">
                {loading ? "..." : (stats?.total_doctors ?? "-")}
              </p>
            </div>
            <div className="bg-white border border-clinical-charcoal/5 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-bold text-clinical-charcoal/60 uppercase tracking-wider">
                Active Devices
              </h3>
              <p className="text-3xl font-extrabold text-clinical-blue mt-2">
                {loading ? "..." : (stats?.active_devices ?? "-")}
              </p>
            </div>
            <div className="bg-white border border-alert-red/30 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-bold text-alert-red uppercase tracking-wider">
                Critical Alerts Today (Frame)
              </h3>
              <p className="text-3xl font-extrabold text-alert-red mt-2">
                {loading ? "..." : (stats?.critical_alerts ?? "-")}
              </p>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white border border-clinical-charcoal/5 rounded-[1.5rem] p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-clinical-charcoal">
                  Keamanan Sesi
                </h2>
                <p className="text-sm text-clinical-charcoal/60 mt-1">
                  Autentikasi Supabase dan izin akses diverifikasi oleh server.
                </p>
              </div>
              <a
                href="/admin/users"
                className="bg-clinical-blue text-white px-5 py-2.5 rounded-full text-sm font-bold"
              >
                Kelola Pengguna
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
