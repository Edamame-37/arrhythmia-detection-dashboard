import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../config/supabaseClient";
import {
  apiJson,
  endImpersonation,
  getImpersonation,
} from "../../../config/api";
export const LogoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      if (getImpersonation()) {
        await endImpersonation();
        const actor = await apiJson("/api/auth/me");
        navigate(
          actor.role === "admin" ? "/admin/dashboard" : "/doctor/dashboard",
        );
      } else {
        const { error: problem } = await supabase.auth.signOut();
        if (problem) throw problem;
        navigate("/", { replace: true, state: { logoutSuccess: true } });
      }
      onClose();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Gagal keluar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Konfirmasi Keluar"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-outline-variant/30 w-full max-w-sm overflow-hidden animate-in zoom-in-50 fade-in duration-500 ease-spring"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-alert-red/10 text-alert-red rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">
              logout
            </span>
          </div>
          <h2 className="text-xl font-bold text-charcoal mb-2">
            {getImpersonation() ? "Kembali ke akun asli?" : "Konfirmasi Keluar"}
          </h2>
          <p className="text-sm text-charcoal/70">
            Apakah Anda yakin ingin keluar dari aplikasi? Sesi Anda akan
            berakhir.
          </p>
        </div>
        {error && (
          <p role="alert" className="px-6 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="bg-white px-6 py-5 border-t border-outline-variant/30 flex items-center gap-3">
          <button
            onClick={() => {
              if (!busy) onClose();
            }}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-charcoal bg-white hover:bg-gray-50 transition-colors border border-gray-200 outline-none"
          >
            Batal
          </button>
          <button
            disabled={busy}
            onClick={confirm}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-alert-red hover:bg-red-600 transition-colors shadow-sm outline-none"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
