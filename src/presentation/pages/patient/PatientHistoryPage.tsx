import React from "react";
import { PatientHeader } from "../../components/layout/PatientHeader";
import { SessionList } from "../../components/dashboard/SessionList";
export const PatientHistoryPage: React.FC = () => (
  <div className="bg-clinical-surface/30 text-clinical-charcoal min-h-screen w-full flex flex-col transition-colors duration-700 relative">
    <div className="absolute inset-0 ecg-grid opacity-[0.15] z-0 pointer-events-none" />
    <PatientHeader />
    <SessionList />
  </div>
);
