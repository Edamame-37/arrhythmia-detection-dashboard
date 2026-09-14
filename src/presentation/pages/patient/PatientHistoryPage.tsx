import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PatientHeader } from "../../components/layout/PatientHeader";
import { Pagination } from "../../components/shared/Pagination";
import { useStickyState } from "../../../application/hooks/useStickyState";
import { useTranslation } from "../../../application/hooks/useTranslation";
import { API_URL } from "../../../config/env";
import { fetchWithAuth, getPhotoUrl } from "../../../config/api";
import { useCachedFetch } from "../../../application/hooks/useCachedFetch";
import { ScreenCalibrationModal } from "../../components/shared/ScreenCalibrationModal";
import { RulerIcon } from "../../components/shared/RulerIcon";
import { supabase } from "../../../config/supabaseClient";

interface SessionRecord {
  id: string;
  device_id: string;
  started_at: string;
  ecg_paper?: string | null;
}

interface PatientProfile {
  patient: {
    first_name: string;
    last_name: string;
    profile_photo: string | null;
  };
}

export const PatientHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  // Inisialisasi userId dari localStorage dengan nilai default kosong agar SWR tidak menembak endpoint '1' yang tidak valid
  const [userId, setUserId] = useState<string>(() => {
    const id = localStorage.getItem("user_id");
    return id && id !== "1" ? id : "";
  });
  const userRole = localStorage.getItem("user_role");

  // State untuk melihat seluruh rekaman (berguna jika akun pasien baru belum memiliki sesi rekaman pribadi atau untuk demonstrasi/evaluasi)
  const [viewAllSessions, setViewAllSessions] = useStickyState<boolean>(userRole === 'admin', "patientHistoryViewAll");

  // Sinkronkan userId jika localStorage belum terisi tapi ada sesi Supabase aktif
  useEffect(() => {
    const syncUser = async () => {
      const storedId = localStorage.getItem("user_id");
      if (!storedId || storedId === "1") {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          localStorage.setItem("user_id", session.user.id);
          setUserId(session.user.id);
        }
      } else if (storedId !== userId) {
        setUserId(storedId);
      }
    };
    syncUser();
  }, [userId]);

  // Pagination
  const [currentPage, setCurrentPage] = useStickyState(1, "patientHistoryPage");
  const itemsPerPage = 10;

  // Ambil data profil pasien untuk memastikan kita mendapatkan ID pasien resmi (profile.patient.id)
  const { data: profile } = useCachedFetch(userId ? `/api/patients/${userId}` : null);
  
  // Prioritaskan ID resmi dari tabel patients jika tersedia, atau fallback ke userId dari session auth
  const resolvedPatientId = profile?.patient?.id || (userId && userId !== "1" ? userId : null);

  // Jika role admin atau dalam mode viewAllSessions, panggil endpoint /api/sessions
  // Jika pasien dan resolvedPatientId tersedia, panggil /api/patients/${resolvedPatientId}/sessions
  const isAllMode = userRole === 'admin' || viewAllSessions;
  const sessionsEndpoint = isAllMode
    ? `/api/sessions?page=${currentPage}&limit=${itemsPerPage}`
    : (resolvedPatientId ? `/api/patients/${resolvedPatientId}/sessions?page=${currentPage}&limit=${itemsPerPage}` : null);

  const { data: sessionsResponse, mutate: mutateSessions, isLoading, error: sessionsError } = useCachedFetch(sessionsEndpoint, { keepPreviousData: true });

  const apiSessions: SessionRecord[] = useMemo(() => {
    return sessionsResponse?.data || sessionsResponse?.sessions || (Array.isArray(sessionsResponse) ? sessionsResponse : []);
  }, [sessionsResponse]);

  const totalSessions = sessionsResponse?.pagination?.total ?? apiSessions.length;
  const totalPages = sessionsResponse?.pagination?.total_pages || Math.ceil(totalSessions / itemsPerPage) || 1;

  // Optimistic overrides untuk pembaruan instan ecg_paper setelah upload/delete
  const [sessionOverrides, setSessionOverrides] = useState<Record<string, { ecg_paper?: string | null }>>({});

  useEffect(() => {
    if (!isLoading && totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, setCurrentPage, isLoading]);

  const sessions = useMemo(() => {
    return apiSessions.map((s) => {
      if (sessionOverrides[s.id] !== undefined) {
        return { ...s, ...sessionOverrides[s.id] };
      }
      return s;
    });
  }, [apiSessions, sessionOverrides]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSessionId, setUploadingSessionId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showScreenCalibration, setShowScreenCalibration] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !uploadingSessionId) return;
    const file = e.target.files[0];
    setPreviewFile(file);
    if (previewUrl && previewFile) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const submitUpload = async () => {
    if (!previewFile || !uploadingSessionId) return;
    const formData = new FormData();
    formData.append("paper", previewFile);

    try {
      const res = await fetchWithAuth(`/api/sessions/${uploadingSessionId}/ecg_paper`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSessionOverrides((prev) => ({ ...prev, [uploadingSessionId]: { ecg_paper: data.path } }));
        mutateSessions();
        cancelUpload();
      } else {
        alert("Gagal mengunggah foto: " + data.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat mengunggah foto.");
    }
  };

  const cancelUpload = () => {
    if (previewUrl && previewFile) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
    setUploadingSessionId(null);
    setIsEditMode(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteUpload = async () => {
    if (!uploadingSessionId) return;
    if (!confirm("Apakah Anda yakin ingin menghapus foto EKG ini?")) return;
    try {
      const res = await fetchWithAuth(`/api/sessions/${uploadingSessionId}/ecg_paper`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSessionOverrides((prev) => ({ ...prev, [uploadingSessionId]: { ecg_paper: null } }));
        mutateSessions();
        cancelUpload();
      } else {
        alert("Gagal menghapus foto: " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Terjadi kesalahan saat menghapus foto.");
    }
  };

  const triggerUpload = (sessionId: string) => {
    setUploadingSessionId(sessionId);
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const { t } = useTranslation();

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return "";
    return `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase();
  };

  const patientName = profile ? `${profile.patient.first_name} ${profile.patient.last_name}` : t("profile.loading");

  return (
    <div className="bg-clinical-surface/30 text-clinical-charcoal w-full min-h-screen flex flex-col transition-colors duration-700 relative">
      <div className="absolute inset-0 ecg-grid opacity-[0.15] z-0 pointer-events-none"></div>
      {/* Top Navigation Bar */}
      <PatientHeader />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <main className="max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 flex flex-col flex-grow relative z-10">
        {/* Main Card Container */}
        <div className="bg-white rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] border border-clinical-charcoal/5 p-6 md:p-12 w-full relative overflow-hidden z-10 flex flex-col min-h-[500px]">
          <header className="mb-8 z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold font-display text-clinical-charcoal mb-2">{t("history.title")}</h1>
              <p className="text-sm font-medium text-clinical-charcoal/60">{t("history.desc")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Tab Selector: Rekaman Saya vs Data Sampel Demo */}
              {userRole !== 'admin' && (
                <div className="flex items-center gap-1.5 bg-clinical-surface p-1 rounded-full border border-clinical-charcoal/10 shadow-sm">
                  <button
                    onClick={() => {
                      setViewAllSessions(false);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      !isAllMode 
                        ? 'bg-white text-clinical-blue shadow-sm' 
                        : 'text-clinical-charcoal/60 hover:text-clinical-charcoal'
                    }`}
                  >
                    Rekaman Saya
                  </button>
                  <button
                    onClick={() => {
                      setViewAllSessions(true);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isAllMode 
                        ? 'bg-clinical-blue text-white shadow-sm' 
                        : 'text-clinical-charcoal/60 hover:text-clinical-charcoal'
                    }`}
                  >
                    <span>Data Sampel</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isAllMode ? 'bg-white/20 text-white' : 'bg-clinical-charcoal/10 text-clinical-charcoal/70'}`}>Demo</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowScreenCalibration(true)}
                aria-label="Kalibrasi layar dengan penggaris"
                title="Kalibrasi ukuran fisik layar"
                className="flex items-center justify-center gap-2 bg-clinical-surface hover:bg-clinical-charcoal/5 border border-clinical-charcoal/10 px-4 py-2 rounded-full font-bold text-xs transition-all duration-300 outline-none hover:-translate-y-0.5 shadow-sm"
              >
                <RulerIcon size={18} />
                Ruler
              </button>
            </div>
          </header>

          {/* Banner Informasi Mode Demonstrasi */}
          {isAllMode && userRole !== 'admin' && (
            <div className="mb-6 bg-blue-50/70 border border-clinical-blue/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs z-10 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5 text-clinical-blue font-medium">
                <span className="material-symbols-outlined text-[20px]">info</span>
                <span>Menampilkan rekaman EKG sampel dari sistem (Mode Demonstrasi & Evaluasi Medis).</span>
              </div>
              <button
                onClick={() => {
                  setViewAllSessions(false);
                  setCurrentPage(1);
                }}
                className="font-bold text-clinical-blue hover:underline shrink-0"
              >
                Kembali ke Rekaman Saya
              </button>
            </div>
          )}

          <div className="space-y-4 z-10">
            {isLoading && sessions.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-clinical-charcoal/5 animate-pulse flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2 w-full md:w-1/2">
                      <div className="h-3 w-28 bg-slate-200 rounded"></div>
                      <div className="h-4 w-48 bg-slate-100 rounded"></div>
                    </div>
                    <div className="h-10 w-48 bg-slate-100 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center text-clinical-charcoal/60 p-12 bg-white rounded-2xl border border-clinical-charcoal/5 shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-slate-50 text-clinical-charcoal/30 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl">folder_off</span>
                </div>
                <p className="font-bold text-base text-clinical-charcoal mb-1">
                  {!isAllMode ? "Belum Ada Rekaman Pribadi" : t("history.noHistory")}
                </p>
                <p className="text-xs text-clinical-charcoal/50 mb-6 leading-relaxed">
                  {!isAllMode 
                    ? "Akun Anda belum memiliki sesi rekaman EKG yang tersimpan di sistem. Anda dapat melihat rekaman sampel yang tersedia."
                    : "Belum ada rekaman pemantauan EKG yang tercatat di database."}
                </p>
                {!isAllMode && (
                  <button
                    onClick={() => {
                      setViewAllSessions(true);
                      setCurrentPage(1);
                    }}
                    className="px-6 py-3 rounded-full bg-clinical-blue text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-clinical-blue/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">medical_services</span>
                    Tampilkan Rekaman Sampel / Demo
                  </button>
                )}
                {sessionsError && <p className="text-xs text-alert-red mt-3 font-medium">Gagal memuat sesi: {sessionsError.message}</p>}
              </div>
            ) : (
              (() => {
                return sessions.map((session) => (
                  <article
                    key={session.id}
                    className="bg-white p-6 rounded-[2rem] shadow-sm border border-clinical-charcoal/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-clinical-blue/20 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-700"
                  >
                    <div>
                      <h2 className="font-bold text-clinical-charcoal mb-1 uppercase tracking-widest text-xs">{t("history.recordingSession")}</h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-clinical-charcoal/60 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]" data-icon="calendar_today">
                            calendar_today
                          </span>
                          <span>{new Date(session.started_at).toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]" data-icon="fingerprint">
                            fingerprint
                          </span>
                          <span className="uppercase font-mono-data text-xs">
                            {t("history.id")}: {session.id.substring(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {session.ecg_paper ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewImage(getPhotoUrl(session.ecg_paper) || null)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-clinical-blue text-white font-bold text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all outline-none"
                          >
                            Lihat Foto EKG
                            <span className="material-symbols-outlined text-[18px]">image</span>
                          </button>
                          <button
                            onClick={() => {
                              setUploadingSessionId(session.id);
                              setIsEditMode(true);
                              setPreviewUrl(getPhotoUrl(session.ecg_paper) || null);
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-amber-500 text-white font-bold text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all outline-none"
                          >
                            Edit
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerUpload(session.id)}
                          disabled={uploadingSessionId === session.id && !previewUrl}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-clinical-charcoal/5 text-clinical-charcoal font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-charcoal/10 active:scale-95 transition-all outline-none"
                        >
                          {uploadingSessionId === session.id && !previewUrl ? "Memproses..." : "Unggah Foto EKG"}
                          <span className="material-symbols-outlined text-[18px]">upload</span>
                        </button>
                      )}
                      <Link
                        to={`/patient/history/${session.id}`}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-clinical-blue/10 text-clinical-blue font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-blue hover:text-white active:scale-95 transition-all outline-none"
                      >
                        {t("history.details")}
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </div>
                  </article>
                ));
              })()
            )}
          </div>
          {sessions.length > 0 && (
            <div className="mt-8 z-10">
              <Pagination currentPage={currentPage} totalItems={totalPages * itemsPerPage} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </main>
      <ScreenCalibrationModal isOpen={showScreenCalibration} onClose={() => setShowScreenCalibration(false)} onSave={() => setShowScreenCalibration(false)} />
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-clinical-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col">
            <h3 className="font-bold font-display text-xl text-clinical-charcoal mb-4">Lihat Foto EKG</h3>
            <div className="flex-grow overflow-auto rounded-xl border border-clinical-charcoal/10 bg-clinical-surface/50 p-2 mb-6">
              <img 
                src={previewImage} 
                alt="ECG Paper" 
                className="w-full h-auto rounded-lg object-contain" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24'%3E%3Cpath fill='%2394a3b8' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => window.open(previewImage, "_blank")}
                className="py-3 px-6 rounded-full bg-clinical-charcoal/5 text-clinical-charcoal font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-charcoal/10 active:scale-95 transition-all outline-none"
              >
                Buka di Tab Lain
              </button>
              <button
                onClick={() => {
                  fetch(previewImage)
                    .then((r) => r.blob())
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `ecg_paper.jpg`;
                      a.click();
                      URL.revokeObjectURL(url);
                    })
                    .catch(() => window.open(previewImage, "_blank"));
                }}
                className="py-3 px-6 rounded-full bg-clinical-blue/10 text-clinical-blue font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-blue hover:text-white active:scale-95 transition-all outline-none"
              >
                Download
              </button>
              <button onClick={() => setPreviewImage(null)} className="py-3 px-6 rounded-full bg-clinical-blue text-white font-bold text-[11px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all outline-none">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {uploadingSessionId && previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-clinical-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col">
            <h3 className="font-bold font-display text-xl text-clinical-charcoal mb-4">{isEditMode ? "Edit Foto EKG" : "Pratinjau Foto EKG"}</h3>
            <div className="flex-grow overflow-auto rounded-xl border border-clinical-charcoal/10 bg-clinical-surface/50 p-2 mb-6">
              <img src={previewUrl} alt="Preview ECG" className="w-full h-auto rounded-lg object-contain" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={cancelUpload}
                className="py-3 px-6 rounded-full bg-clinical-charcoal/5 text-clinical-charcoal font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-charcoal/10 active:scale-95 transition-all outline-none"
              >
                Batal
              </button>
              {isEditMode && !previewFile && (
                <button
                  onClick={deleteUpload}
                  className="py-3 px-6 rounded-full bg-clinical-red/10 text-clinical-red font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-red hover:text-white active:scale-95 transition-all outline-none"
                >
                  Hapus
                </button>
              )}
              <button
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="py-3 px-6 rounded-full bg-clinical-blue/10 text-clinical-blue font-bold text-[11px] uppercase tracking-widest hover:bg-clinical-blue hover:text-white active:scale-95 transition-all outline-none"
              >
                Pilih Gambar Lain
              </button>
              {previewFile && (
                <button onClick={submitUpload} className="py-3 px-6 rounded-full bg-clinical-blue text-white font-bold text-[11px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all outline-none">
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
