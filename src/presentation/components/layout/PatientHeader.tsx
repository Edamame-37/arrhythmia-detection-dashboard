import {
  apiJson,
  getImpersonation,
  endImpersonation,
} from "../../../config/api";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const handleReturnToOriginalProfile = async (navigate: any) => {
  await endImpersonation();
  const actor = await apiJson("/api/auth/me");
  navigate(actor.role === "admin" ? "/admin/dashboard" : "/doctor/dashboard");
};
import { useTranslation } from "../../../application/hooks/useTranslation";
import { useCachedFetch } from "../../../application/hooks/useCachedFetch";
import { Avatar } from "../shared/Avatar";
import { useAuth } from "../../../application/context/AuthContext";

interface PatientProfile {
  patient: {
    id: string | number;
    first_name: string;
    last_name: string;
    profile_photo: string | null;
  };
}

export const PatientHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { identity } = useAuth();
  const userId = identity?.profile_id || "";

  const { data: profileData } = useCachedFetch<PatientProfile>(
    userId ? "/api/patients/" + userId : null,
  );
  const profile = profileData || null;

  const patientName = profile
    ? `${profile.patient?.first_name || ""} ${profile.patient?.last_name || ""}`.trim()
    : t("dashboard.loading");

  return (
    <>
      <div className="h-16 w-full shrink-0"></div>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-clinical-charcoal/5 h-16 shadow-sm transition-colors duration-700">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            {location.pathname !== "/patient/dashboard" && (
              <button
                onClick={() => navigate(-1)}
                className="material-symbols-outlined text-clinical-charcoal hover:text-clinical-blue transition-colors cursor-pointer text-[24px] mr-1"
                title="Kembali"
              >
                arrow_back
              </button>
            )}
            <div
              onClick={() => navigate("/patient/dashboard")}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <img
                alt="ecgrhythmia logo"
                className="h-8 w-auto"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVHX00UF6lwM6kjDUMgD4Jv6lMMp5h2u1ZBPFlnvJJNam11nmTsrGtn_y5NNHv61wLHc3plhgbJeduSWPWMT-xKDKHnnifesb9pERppu-cGEHZODeFvF8XLLfRKpP1GdLDV5iINEmqPsbVTFdQZhAPCXP6aHQm-ecIuBbV0YG8GByhRtVQ6xZQrpQpUmXqjqW6DWiEZHDW8D81u4xSnTtsE-7HlTKrn6GuXcYUOYjdpCvaEqIKW1ghrNjEt5sTxTf_o6esUGi3HzNB"
              />
              <span className="font-extrabold text-xl tracking-tight text-clinical-charcoal font-display">
                ecg<span className="text-clinical-blue">rhythmia</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {getImpersonation() && (
              <div className="bg-red-50 border border-red-200 px-3 py-1 rounded-full flex items-center shadow-sm animate-pulse">
                <span className="text-xs font-bold text-red-700">
                  {"Akun asli"}
                </span>
                <button
                  onClick={() => handleReturnToOriginalProfile(navigate)}
                  className="ml-2 text-[10px] bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 transition-colors"
                >
                  KEMBALI
                </button>
              </div>
            )}
            <div
              onClick={() => navigate("/patient/profile")}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-clinical-charcoal">
                  {patientName}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-clinical-charcoal/60">
                  {t("dashboard.patientRole")}
                </span>
              </div>
              {/* Komponen Avatar Terstandarisasi yang menangani fallback inisial tanpa leaking teks alt */}
              <Avatar
                src={profile?.patient.profile_photo}
                name={patientName !== t("dashboard.loading") ? patientName : ""}
                size="md"
                className="ring-1 ring-clinical-blue/20"
              />
            </div>
            {location.pathname !== "/patient/settings" && (
              <button
                onClick={() => navigate("/patient/settings")}
                className="material-symbols-outlined text-clinical-charcoal/60 hover:text-clinical-blue transition-colors cursor-pointer text-[22px]"
              >
                settings
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};
