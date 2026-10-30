import React from "react";
import { DoctorSidebar } from "../../components/layout/DoctorSidebar";
import { MonitorPanel } from "../../components/dashboard/MonitorPanel";
import { useSidebar } from "../../../application/context/SidebarContext";
export const MonitorPage: React.FC = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  return (
    <div className="bg-clinical-surface text-clinical-charcoal min-h-screen relative font-sans">
      <div className="absolute inset-0 ecg-grid opacity-10 pointer-events-none" />
      <DoctorSidebar />
      <div
        className={`relative transition-all duration-300 md:ml-[260px] md:w-[calc(100%-260px)] ${isCollapsed ? "md:!ml-[72px] md:!w-[calc(100%-72px)]" : ""}`}
      >
        <header className="sticky top-0 bg-clinical-surface/80 backdrop-blur-xl border-b border-clinical-charcoal/5 z-40 px-4 md:px-6 py-4 flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-full hover:bg-white"
            title="Sembunyikan / Tampilkan Menu Utama"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <p className="font-bold">Live Stream Monitor</p>
        </header>
        <MonitorPanel />
      </div>
    </div>
  );
};
