import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConnection } from "../../../application/context/ConnectionContext";
import { DoctorSidebar } from "../../components/layout/DoctorSidebar";
import { useSidebar } from "../../../application/context/SidebarContext";
import { QrReader } from "../../components/shared/QrReader";
export const QrScannerPage: React.FC = () => {
  const { addConnectedPatient } = useConnection();
  const navigate = useNavigate();
  const [patient, setPatient] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const connect = async (id = patient, token = code) => {
    setBusy(true);
    setMessage("");
    try {
      await addConnectedPatient({
        id,
        raw_id: id,
        code: token,
        name: "",
        connectedAt: "",
      });
      setShowSuccessModal(true);
    } catch (problem) {
      setMessage(problem instanceof Error ? problem.message : "Penautan gagal");
    } finally {
      setBusy(false);
    }
  };
  const read = (value: string) => {
    try {
      const url = new URL(value);
      if (
        url.protocol !== "ecgrhythmia:" ||
        url.hostname !== "sync" ||
        !url.pathname.startsWith("/patient/") ||
        !url.searchParams.get("token")
      )
        throw new Error("Kode pasien tidak valid");
      const id = url.pathname.slice("/patient/".length);
      const token = url.searchParams.get("token")!;
      setPatient(id);
      setCode(token);
      void connect(id, token);
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
  const { isCollapsed, toggleSidebar } = useSidebar();
  const inputValue = patient;
  const setInputValue = setPatient;
  const foundPatient = { name: patient, id: patient };
  const handleSearch = () => {
    if (!patient || !code) {
      setMessage("ID pasien dan kode persetujuan wajib diisi");
      return;
    }
    void connect();
  };
  return (
    <div className="bg-clinical-surface text-clinical-charcoal antialiased overflow-x-hidden w-full min-h-screen flex relative">
      <div className="fixed inset-0 ecg-grid opacity-10 pointer-events-none z-0"></div>

      <DoctorSidebar />

      <main
        id="main-content"
        className={`flex-grow min-h-screen pb-24 md:pb-12 transition-all duration-300 w-full relative z-10 md:ml-[260px] md:w-[calc(100%-260px)] ${isCollapsed ? "md:!ml-[72px] md:!w-[calc(100%-72px)]" : ""}`}
      >
        <header className="sticky top-0 bg-clinical-surface/80 backdrop-blur-xl border-b border-clinical-charcoal/5 z-40 px-4 md:px-6 py-4 flex justify-between items-center max-w-container-max mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              id="toggle-sidebar-btn"
              className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-white-container text-clinical-charcoal/70 transition-colors outline-none"
              title="Sembunyikan / Tampilkan Menu Utama"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                menu
              </span>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-clinical-charcoal">
                Scanner Pasien
              </h1>
              <p className="text-xs md:text-sm font-medium text-clinical-charcoal/60 mt-0.5">
                Scan QR code atau masukkan ID Pasien
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-4xl mx-auto mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="bg-white rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] border border-clinical-charcoal/5 overflow-hidden p-6 md:p-12 transition-all duration-700 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[300px]"
              >
                qr_code_scanner
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
              <div className="flex flex-col gap-4">
                <div className="w-full aspect-square bg-white-container-lowest border border-clinical-blue/20/50 rounded-3xl relative shadow-sm overflow-hidden group">
                  {/* The HTML5 QR Code Scanner Container */}
                  <QrReader onRead={read} onStatusChange={setCameraStatus} />

                  {/* Corner Viewfinder Overlay */}
                  <div className="absolute inset-0 pointer-events-none p-4 flex items-center justify-center z-20">
                    <div className="w-full h-full relative">
                      {/* Top Left */}
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-black rounded-tl-3xl"></div>
                      {/* Top Right */}
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-black rounded-tr-3xl"></div>
                      {/* Bottom Left */}
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-black rounded-bl-3xl"></div>
                      {/* Bottom Right */}
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-black rounded-br-3xl"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-clinical-charcoal/60 hover:text-clinical-blue font-bold transition-all duration-700 bg-clinical-surface px-5 py-2.5 rounded-full border border-clinical-charcoal/5 hover:border-clinical-blue/20">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[16px]"
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
                  <h2 className="text-2xl font-headline-md text-clinical-charcoal mb-2">
                    Sinkronisasi Manual
                  </h2>
                  <p className="text-sm font-body-sm text-clinical-charcoal/70 mb-6 leading-relaxed">
                    Masukkan ID Pasien secara manual jika kode QR sulit dipindai
                    atau stiker rusak.
                  </p>

                  <div className="relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      aria-label="ID pasien lengkap"
                      placeholder="ID pasien lengkap"
                      className="w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-[1.5rem] p-5 pl-14 text-lg focus:ring-2 focus:ring-clinical-blue/20 focus:border-clinical-blue outline-none font-mono uppercase tracking-widest shadow-sm transition-all duration-700 hover:shadow-md text-clinical-charcoal"
                    />
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-clinical-charcoal/40 text-[24px]"
                    >
                      badge
                    </span>
                  </div>
                </div>
                <label className="flex flex-col gap-2 text-xs font-bold text-clinical-charcoal/60">
                  Kode persetujuan pasien
                  <input
                    aria-label="Kode persetujuan pasien"
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
                  className="w-full bg-clinical-blue text-white py-4 rounded-[2rem] font-bold text-base hover:brightness-110 active:scale-95 transition-all duration-700 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
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
                      className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform duration-700"
                    >
                      search
                    </span>
                  )}
                  {isLoading ? "Mencari..." : "Hubungkan Pasien"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in-50 fade-in duration-500 ease-spring">
            <div className="w-20 h-20 bg-status-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-5xl text-status-green"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                check_circle
              </span>
            </div>
            <h3 className="text-2xl font-headline-md text-clinical-charcoal mb-2">
              Pasien Terhubung!
            </h3>

            <div className="bg-white-container-lowest rounded-xl p-4 my-6 border border-clinical-blue/20/50">
              <p className="text-xs font-body-sm text-clinical-charcoal/70 uppercase tracking-widest font-headline-md mb-1">
                Identitas Pasien
              </p>
              <p className="font-headline-md font-mono text-lg text-clinical-charcoal mb-1">
                {foundPatient?.id}
              </p>
              <p className="text-clinical-charcoal font-medium">
                {foundPatient?.name}
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                }}
                className="flex-1 bg-white-container text-clinical-charcoal font-headline-md py-3.5 rounded-xl hover:bg-white-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/doctor/dashboard")}
                className="flex-[2] bg-clinical-blue text-white py-3.5 rounded-xl font-headline-md shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[20px]"
                >
                  dashboard
                </span>
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl border-2 border-brand-red/10 animate-in zoom-in-50 fade-in duration-500 ease-spring">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-red/20 animate-ping"></div>
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-5xl text-clinical-red relative z-10"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                error
              </span>
            </div>
            <h3 className="text-2xl font-headline-md text-clinical-charcoal mb-3">
              Koneksi Gagal
            </h3>

            <p className="text-sm font-body-sm text-clinical-charcoal/70 mb-8 leading-relaxed px-2">
              <span role="alert">{modalErrorMsg}</span>
            </p>

            <button
              onClick={closeErrorModal}
              className="w-full bg-brand-red text-white py-3.5 rounded-xl font-headline-md shadow-md hover:bg-brand-red/90 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Tutup dan Coba Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
