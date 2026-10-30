import React from "react";
import { useParams } from "react-router-dom";
import { PatientHeader } from "../../components/layout/PatientHeader";
import { SessionReview } from "../../components/dashboard/SessionReview";
export const PatientHistoryDetailPage: React.FC = () => {
  const { sessionId = "" } = useParams();
  return (
    <div className="bg-clinical-surface/30 text-clinical-charcoal min-h-screen w-full flex flex-col transition-colors duration-700 relative">
      <div className="absolute inset-0 ecg-grid opacity-[0.15] z-0 pointer-events-none" />
      <PatientHeader />
      <SessionReview sessionId={sessionId} />
    </div>
  );
};
