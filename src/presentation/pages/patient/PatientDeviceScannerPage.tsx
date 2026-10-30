import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../application/context/AuthContext";
import { apiJson } from "../../../config/api";
import { PatientHeader } from "../../components/layout/PatientHeader";
import { QrReader } from "../../components/shared/QrReader";
export const PatientDeviceScannerPage: React.FC = () => {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const [device, setDevice] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const pair = async (deviceId = device, pairingCode = code) => {
    setBusy(true);
    setMessage("");
    try {
      await apiJson(
        "/api/devices/" + encodeURIComponent(deviceId) + "/assign",
        {
          method: "POST",
          body: JSON.stringify({
            patient_id: identity?.profile_id,
            code: pairingCode,
          }),
        },
      );
      setShowSuccessModal(true);
    } catch (problem) {
      setMessage(problem instanceof Error ? problem.message : "Pairing gagal");
    } finally {
      setBusy(false);
    }
  };
  const read = (value: string) => {
    try {
      const payload = JSON.parse(value);
      if (payload.type !== "device_sync" || !payload.deviceId || !payload.code)
        throw new Error(
          "QR perangkat tidak valid atau belum berisi kode pairing",
        );
      setDevice(payload.deviceId);
      setCode(payload.code);
      void pair(payload.deviceId, payload.code);
    } catch (problem) {
      setMessage(problem instanceof Error ? problem.message : "QR tidak valid");
    }
  };
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cameraStatus, setCameraStatus] = useState({
    active: false,
    error: "",
  });
  const cameraError = cameraStatus.error;
  const isCameraActive = cameraStatus.active;
  const isLoading = busy;
  const showErrorModal = !!message;
  const modalErrorMsg = message;
  const closeErrorModal = () => setMessage("");
  const inputValue = device;
  const setInputValue = setDevice;
  const foundDevice = device;
  const handleSearch = () => {
    if (!device || !code) {
      setMessage("ID perangkat dan kode pairing wajib diisi");
      return;
    }
    void pair();
  };
  return (
    <div className="bg-clinical-surface/30 text-clinical-charcoal antialiased overflow-x-hidden w-full min-h-screen flex flex-col relative">
      <div className="absolute inset-0 ecg-grid opacity-[0.15] z-0 pointer-events-none"></div>
      <PatientHeader />

      <main
        id="main-content"
        className="flex-grow p-4 md:p-6 max-w-4xl mx-auto w-full relative z-10"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold font-display text-clinical-charcoal tracking-tight">
            Pemindai Alat EKG
          </h1>
          <p className="text-sm text-clinical-charcoal/60 mt-1">
            Pindai QR Code alat dari layar Admin untuk menghubungkannya.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-clinical-charcoal/5 shadow-[0px_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden p-4 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-square bg-white border border-clinical-charcoal/5 rounded-3xl relative shadow-sm overflow-hidden group">
                <QrReader onRead={read} onStatusChange={setCameraStatus} />
                <div className="absolute inset-0 pointer-events-none p-4 flex items-center justify-center z-20">
                  <div className="w-full h-full relative">
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-black rounded-tl-3xl"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-black rounded-tr-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-black rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-black rounded-br-3xl"></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-2">
                <button className="flex items-center gap-2 text-sm text-clinical-charcoal/60 hover:text-clinical-blue font-medium transition-colors bg-clinical-surface px-4 py-2 rounded-full">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[18px]"
                  >
                    {cameraError || !isCameraActive
                      ? "videocam_off"
                      : "videocam"}
                  </span>
                  {cameraError
                    ? "Kamera Gagal Akses"
                    : isCameraActive
                      ? "Status Kamera Aktif"
                      : "Status Kamera Tidak Aktif"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6 justify-center">
              <div>
                <h2 className="text-2xl font-bold font-display text-clinical-charcoal mb-2">
                  Sinkronisasi Manual
                </h2>
                <p className="text-sm text-clinical-charcoal/60 mb-6 leading-relaxed">
                  Masukkan ID Alat secara manual jika kode QR sulit dipindai
                  atau kamera bermasalah.
                </p>

                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    aria-label="ID perangkat"
                    placeholder="Contoh: device01"
                    className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-2xl p-4 pl-12 text-lg focus:ring-2 focus:ring-clinical-blue focus:border-clinical-blue outline-none font-mono tracking-widest shadow-sm transition-shadow hover:shadow-md"
                  />
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-clinical-charcoal/40"
                  >
                    sensors
                  </span>
                </div>
              </div>
              <label className="flex flex-col gap-2 text-xs font-bold text-clinical-charcoal/60">
                Kode pairing administrator
                <input
                  aria-label="Kode pairing administrator"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-2xl p-4 text-sm focus:ring-clinical-blue focus:border-clinical-blue font-mono"
                  placeholder="Masukkan kode yang berlaku"
                  required
                />
              </label>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-clinical-blue text-white py-4 rounded-2xl font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[20px] animate-spin"
                  >
                    progress_activity
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[20px]"
                  >
                    link
                  </span>
                )}
                {isLoading ? "Menyinkronkan..." : "Hubungkan Alat"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-clinical-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl border border-clinical-charcoal/5 animate-in zoom-in-50 fade-in duration-500 ease-spring">
            <div className="w-20 h-20 rounded-full bg-status-green/10 flex items-center justify-center mx-auto mb-6 text-status-green">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-4xl"
              >
                verified
              </span>
            </div>
            <h3 className="text-2xl font-bold font-display text-clinical-charcoal mb-2">
              Alat Terhubung!
            </h3>
            <p className="text-clinical-charcoal/60 font-medium">
              Berhasil sinkronisasi dengan alat:
            </p>
            <div className="bg-clinical-surface/50 rounded-xl p-4 my-6 border border-clinical-charcoal/10">
              <p className="font-bold font-mono text-xl text-clinical-charcoal">
                {foundDevice}
              </p>
            </div>

            <button
              onClick={() => navigate("/patient/dashboard")}
              className="w-full bg-clinical-blue text-white py-3.5 rounded-xl font-bold shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[20px]"
              >
                home
              </span>
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-clinical-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl border-2 border-clinical-red/10 animate-in zoom-in-50 fade-in duration-500 ease-spring">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 text-clinical-red">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-4xl"
              >
                error
              </span>
            </div>
            <h3 className="text-2xl font-bold font-display text-clinical-charcoal mb-3">
              Koneksi Gagal
            </h3>

            <p className="text-sm text-clinical-charcoal/60 mb-8 leading-relaxed px-2">
              <span role="alert">{modalErrorMsg}</span>
            </p>

            <button
              onClick={closeErrorModal}
              className="w-full bg-clinical-red text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-clinical-red/90 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Tutup dan Coba Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
