import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SUPPORT_CONTACT } from "../../../config/env";
import { supabase } from "../../../config/supabaseClient";
export const ResetPasswordPage: React.FC = () => {
  const [parameters] = useSearchParams();
  const update = parameters.get("mode") === "update";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (update && password.length < 12)
        throw new Error("Password minimal 12 karakter");
      const result = update
        ? await supabase.auth.updateUser({ password })
        : await supabase.auth.resetPasswordForEmail(email, {
            redirectTo:
              window.location.origin + "/auth/reset-password?mode=update",
          });
      if (result.error) throw result.error;
      setMessage(
        update
          ? "Password diperbarui. Silakan login kembali."
          : "Jika email terdaftar, tautan pemulihan akan dikirim.",
      );
      if (update) await supabase.auth.signOut();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Permintaan gagal");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full">
      <main className="w-full max-w-[450px]">
        <section className="bg-white shadow-lg rounded-xl p-6 md:p-10 flex flex-col items-center">
          <div className="flex flex-row items-center justify-center gap-2 mb-8">
            <img
              alt="ecgrhythmia clinical heart and stethoscope logo"
              className="w-14 h-14"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCMHY1rwJz3Bn-D6aH30NsUoKCHh50RKw49BhscJugmYHzwjI4ey5ccSp9XawgX4Jzj6xSb8kHazzVJlVQ4AdKSkMKGRM3q1qB3ul_AyWaXLT_CJAZj0oV7QHTVIezEjnYJ1hRIIzWdfCh30ZbtQNyDMH86S-6c8UfQHx6HJub_2ZcnhGdwWIYbmcrjuDuluEo3nxY2ENq7nc0W5lO03dsPefmV_kTOnKCGtpZq9Sd3zxp7toZSYaVXYPGZa3bFZpNAb27eoWoXd1A"
            />
            <h1 className="font-headline-lg text-headline-lg flex tracking-tight text-[32px]">
              <span className="text-brand-red font-extrabold">ecg</span>
              <span className="text-brand-navy font-bold">rhythmia</span>
            </h1>
          </div>
          <div className="w-full space-y-8">
            <div className="text-center">
              <h2 className="text-[24px] font-bold text-deep-charcoal mt-6 mb-2">
                {update ? "Atur Password Baru" : "Pemulihan Password"}
              </h2>
              <p className="text-body-sm text-secondary max-w-[300px] mx-auto">
                {update
                  ? "Masukkan password baru untuk akun Anda."
                  : "Masukkan email untuk menerima tautan pemulihan akun."}
              </p>
            </div>

            <form onSubmit={submit} className="w-full space-y-5">
              {update ? (
                <label>
                  Password baru
                  <input
                    className="block mt-2 w-full bg-white border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal outline-none"
                    type="password"
                    minLength={12}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
              ) : (
                <label>
                  Email
                  <input
                    className="block mt-2 w-full bg-white border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-medical-teal focus:border-medical-teal outline-none"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
              )}
              <button
                disabled={busy}
                className="w-full bg-medical-teal text-white font-bold py-4 rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {busy ? "Memproses..." : "Kirim"}
              </button>
              <p
                role="status"
                className="text-sm text-center rounded-lg bg-clinical-surface p-3"
              >
                {message}
              </p>
              <Link
                className="block text-center text-sm text-medical-teal font-bold hover:underline"
                to="/auth/login"
              >
                Kembali ke login
              </Link>
            </form>
            <div className="mt-8 mb-6 text-center w-full border-t border-outline-variant pt-6">
              <p className="text-body-sm text-secondary max-w-[300px] mx-auto text-sm">
                ? 2024 ecgrhythmia Medical Systems.
                <span className="block mt-1">
                  Need help?{" "}
                  <Link
                    className="text-medical-teal font-bold hover:underline"
                    to={SUPPORT_CONTACT}
                  >
                    Contact Support
                  </Link>
                </span>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
