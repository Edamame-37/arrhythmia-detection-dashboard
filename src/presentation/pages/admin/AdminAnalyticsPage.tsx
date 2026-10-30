import React from "react";
import { useSearchParams } from "react-router-dom";
import { SessionReview } from "../../components/dashboard/SessionReview";
import { AdminSidebar } from "../../components/layout/AdminSidebar";
import { SessionList } from "../../components/dashboard/SessionList";
import { useSidebar } from "../../../application/context/SidebarContext";
export const AdminAnalyticsPage: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [parameters] = useSearchParams();
  const session = parameters.get("sessionId");
  return (
    <div className="bg-clinical-surface text-clinical-charcoal min-h-screen relative font-sans">
      <div className="absolute inset-0 ecg-grid opacity-10 pointer-events-none" />
      <AdminSidebar />
      <div
        className={`transition-all duration-300 md:ml-[260px] md:w-[calc(100%-260px)] ${isCollapsed ? "md:!ml-[72px] md:!w-[calc(100%-72px)]" : ""}`}
      >
        {session ? <SessionReview sessionId={session} /> : <SessionList />}
      </div>
    </div>
  );
};
