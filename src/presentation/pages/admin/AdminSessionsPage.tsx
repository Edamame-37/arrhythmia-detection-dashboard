import React from "react";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { SessionList } from "../../components/dashboard/SessionList";
import { useSidebar } from "../../../application/context/SidebarContext";
export const AdminSessionsPage: React.FC = () => {
  const { isCollapsed } = useSidebar();
  return (
    <div className="bg-clinical-surface text-clinical-charcoal min-h-screen relative font-sans">
      <div className="absolute inset-0 ecg-grid opacity-10 pointer-events-none" />
      <AdminSidebar />
      <div
        className={`transition-all duration-300 md:ml-[260px] md:w-[calc(100%-260px)] ${isCollapsed ? "md:!ml-[72px] md:!w-[calc(100%-72px)]" : ""}`}
      >
        <SessionList administrative />
      </div>
    </div>
  );
};
