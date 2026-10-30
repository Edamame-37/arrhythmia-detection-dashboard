import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCachedFetch } from "../../../application/hooks/useCachedFetch";
import { useAuth } from "../../../application/context/AuthContext";
import { useSidebar } from "../../../application/context/SidebarContext";
import { apiJson, privatePhotoUrl } from "../../../config/api";
import { Pagination } from "../shared/Pagination";
import { FolderUploadModal } from "../shared/FolderUploadModal";
import { ScreenCalibrationModal } from "../shared/ScreenCalibrationModal";
import { RulerIcon } from "../shared/RulerIcon";
import { Avatar } from "../shared/Avatar";
interface SessionRecord {
  id: string;
  patient_id: string;
  patient_name?: string;
  started_at: string;
  ended_at?: string;
  state: string;
  dev_note?: string;
  ecg_paper?: string;
}
function ValidationBadge({ sessionId }: { sessionId: string }) {
  const { data, error } = useCachedFetch<{ total: number; validated: number }>(
    "/api/sessions/" + sessionId + "/validation",
  );
  const available =
    !!data && Number.isFinite(data.total) && Number.isFinite(data.validated);
  const complete = available && data.total > 0 && data.validated === data.total;
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest " +
        (complete
          ? "bg-green-50 text-green-700"
          : "bg-clinical-surface text-clinical-charcoal/50")
      }
      title={error ? "Status validasi gagal dimuat" : "Validasi dokter"}
    >
      <span className="material-symbols-outlined text-[12px]">
        {complete ? "verified" : "pending"}
      </span>
      {available
        ? data.validated + "/" + data.total + " tervalidasi"
        : "Validasi belum tersedia"}
    </span>
  );
}
function PatientSessionRow({
  patient,
  onOpen,
  actions,
}: {
  patient: any;
  onOpen: (id: string) => void;
  actions: (session: SessionRecord) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const sessions = useCachedFetch<{
    data: SessionRecord[];
    pagination: { total: number };
  }>("/api/patients/" + encodeURIComponent(patient.id) + "/sessions?limit=10");
  const latest = sessions.data?.data?.[0];
  return (
    <>
      <tr className="border-b border-clinical-charcoal/5 hover:bg-clinical-surface/50">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar src={patient.profile_photo} name={patient.name} />
            <span className="text-sm font-bold">{patient.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-xs font-mono">{patient.id}</td>
        <td className="px-6 py-4 text-center text-sm font-bold">
          {sessions.data?.pagination?.total ?? "--"}
        </td>
        <td className="px-6 py-4 text-xs text-clinical-charcoal/60">
          {latest ? new Date(latest.started_at).toLocaleString("id-ID") : "--"}
        </td>
        <td className="px-6 py-4 text-right">
          <button
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            className="rounded-full bg-clinical-blue/10 text-clinical-blue px-4 py-2 text-xs font-bold"
          >
            {expanded ? "Tutup Sesi" : "Lihat Sesi"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="p-4 bg-clinical-surface/30">
            {sessions.error ? (
              <p role="alert" className="text-sm text-red-700">
                {sessions.error.message}
              </p>
            ) : sessions.isLoading ? (
              <p role="status" className="text-sm">
                Memuat sesi...
              </p>
            ) : sessions.data?.data.length === 0 ? (
              <p className="text-sm text-clinical-charcoal/60">
                Belum ada sesi rekaman.
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.data?.data.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl bg-white border border-clinical-charcoal/5 p-4 flex flex-wrap justify-between items-center gap-3"
                  >
                    <button
                      onClick={() => onOpen(session.id)}
                      className="font-mono text-xs text-clinical-blue break-all"
                    >
                      {session.id}
                    </button>
                    <span className="text-xs text-clinical-charcoal/60">
                      {new Date(session.started_at).toLocaleString("id-ID")}
                    </span>
                    {actions(session)}
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
export const SessionList: React.FC<{ administrative?: boolean }> = ({
  administrative = false,
}) => {
  const { identity } = useAuth();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [patient, setPatient] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("sessions");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [upload, setUpload] = useState(false);
  const [calibrate, setCalibrate] = useState(false);
  const [editing, setEditing] = useState<SessionRecord | null>(null);
  const [editForm, setEditForm] = useState({
    patient_id: "",
    started_at: "",
    dev_note: "",
  });
  const [photo, setPhoto] = useState<{
    session: SessionRecord;
    url: string;
    file: File | null;
  } | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoTarget = useRef<SessionRecord | null>(null);
  const patientsBase =
    identity?.role === "admin"
      ? "/api/patients"
      : identity?.role === "dokter"
        ? "/api/doctors/" + identity.profile_id + "/patients"
        : null;
  const { data: patients } = useCachedFetch(
    patientsBase ? patientsBase + "?limit=100" : null,
  );
  const groupedPatients = useCachedFetch(
    patientsBase && viewMode === "patients"
      ? patientsBase + "?page=" + page + "&limit=10"
      : null,
  );
  const endpoint =
    "/api/sessions?page=" +
    page +
    "&limit=10" +
    (patient ? "&patient_id=" + encodeURIComponent(patient) : "");
  const sessions = useCachedFetch<{
    data: SessionRecord[];
    pagination: { total: number };
  }>(endpoint);
  const rows = (sessions.data?.data || []).filter(
    (session) =>
      !search ||
      [session.id, session.patient_name, session.state].some((value) =>
        value?.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  const basePath =
    identity?.role === "admin"
      ? "/admin/analytics?sessionId="
      : identity?.role === "dokter"
        ? "/doctor/analytics?sessionId="
        : "/patient/history/";
  const title = administrative
    ? "Manajemen Sesi"
    : identity?.role === "pasien"
      ? "Riwayat Pemeriksaan"
      : "Riwayat Klinis";
  const button =
    "flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const field =
    "w-full bg-clinical-surface/50 border border-clinical-charcoal/10 rounded-xl px-4 py-3 text-sm focus:ring-clinical-blue focus:border-clinical-blue";
  const perform = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      await sessions.mutate();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Permintaan gagal");
    } finally {
      setBusy(false);
    }
  };
  const closePhoto = () => {
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto(null);
  };
  const choosePhoto = (session: SessionRecord) => {
    photoTarget.current = session;
    photoInput.current?.click();
  };
  const openPhoto = (session: SessionRecord) =>
    perform(async () => {
      if (!session.ecg_paper) return;
      const url = await privatePhotoUrl(session.ecg_paper);
      if (photo) URL.revokeObjectURL(photo.url);
      setPhoto({ session, url, file: null });
    });
  const savePhoto = () =>
    perform(async () => {
      if (!photo?.file) return;
      const body = new FormData();
      body.append("paper", photo.file);
      await apiJson("/api/sessions/" + photo.session.id + "/ecg_paper", {
        method: "POST",
        body,
      });
      closePhoto();
    });
  const editSession = (session: SessionRecord) => {
    setEditing(session);
    setEditForm({
      patient_id: session.patient_id,
      started_at: session.started_at,
      dev_note: session.dev_note || "",
    });
    setError("");
  };
  const renderActions = (session: SessionRecord) => (
    <div className="flex flex-wrap items-center gap-2">
      {session.ecg_paper && (
        <button
          onClick={() => void openPhoto(session)}
          className={button + " bg-clinical-blue text-white"}
          title="Lihat foto ECG"
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[16px]"
          >
            image
          </span>
          Foto EKG
        </button>
      )}
      <button
        onClick={() => choosePhoto(session)}
        className={button + " bg-clinical-surface text-clinical-charcoal"}
        title={session.ecg_paper ? "Edit foto ECG" : "Unggah foto ECG"}
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[16px]"
        >
          {session.ecg_paper ? "edit" : "upload"}
        </span>
        {session.ecg_paper ? "Edit Foto" : "Upload Foto"}
      </button>
      <button
        onClick={() => navigate(basePath + encodeURIComponent(session.id))}
        className={button + " bg-clinical-blue/10 text-clinical-blue"}
      >
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[16px]"
        >
          monitor_heart
        </span>
        Selengkapnya
      </button>
      {administrative && (
        <>
          <button
            onClick={() => editSession(session)}
            title="Edit sesi"
            className="p-2 rounded-full text-clinical-charcoal/60 hover:bg-clinical-surface"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            disabled={busy}
            onClick={() => {
              if (confirm("Hapus sesi dan berkas rekamannya?"))
                void perform(() =>
                  apiJson("/api/sessions/" + session.id, { method: "DELETE" }),
                );
            }}
            title="Hapus sesi"
            className="p-2 rounded-full text-clinical-red hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              delete
            </span>
          </button>
        </>
      )}
    </div>
  );
  return (
    <main
      className={
        identity?.role === "pasien"
          ? "max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop py-8 relative z-10"
          : "w-full relative z-10 pb-12"
      }
    >
      <header
        className={
          identity?.role === "pasien"
            ? "flex flex-wrap justify-between items-center gap-4 mb-8"
            : "sticky top-0 bg-clinical-surface/80 backdrop-blur-xl border-b border-clinical-charcoal/5 z-40 px-4 md:px-6 py-4 flex flex-wrap justify-between items-center gap-4"
        }
      >
        <div className="flex items-center gap-3">
          {identity?.role !== "pasien" && (
            <button
              onClick={toggleSidebar}
              title="Sembunyikan / Tampilkan Menu Utama"
              className="md:hidden p-2 -ml-2 rounded-full hover:bg-white"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          )}
          <div>
            <h1
              className={
                identity?.role === "pasien"
                  ? "text-2xl md:text-3xl font-bold font-display text-clinical-charcoal"
                  : "text-xl md:text-2xl font-bold tracking-tight text-clinical-charcoal"
              }
            >
              {title}
            </h1>
            <p className="text-xs md:text-sm font-medium text-clinical-charcoal/60 mt-1">
              {administrative
                ? "Sistem Pemantauan Seluruh Rekaman"
                : "Lihat kembali rekaman dan hasil pemeriksaan EKG Anda."}
            </p>
          </div>
        </div>
        {identity?.role === "pasien" && (
          <button
            onClick={() => setCalibrate(true)}
            aria-label="Kalibrasi layar dengan penggaris"
            className="flex items-center gap-2 bg-white border border-clinical-charcoal/10 px-4 py-2 rounded-full font-bold text-xs shadow-sm"
          >
            <RulerIcon size={18} />
            Ruler
          </button>
        )}
      </header>
      <div
        className={
          identity?.role === "pasien"
            ? "space-y-6"
            : "px-4 md:px-6 mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
        }
      >
        <section
          className={
            administrative
              ? "bg-white rounded-[2rem] border border-clinical-charcoal/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              : "space-y-4"
          }
        >
          <div
            className={
              administrative
                ? "px-6 py-6 border-b border-clinical-charcoal/5 flex flex-wrap justify-between items-center gap-4"
                : "flex flex-wrap items-center justify-between gap-4"
            }
          >
            <div className="flex flex-wrap items-center gap-3">
              {administrative && (
                <h2 className="text-lg font-bold">Daftar Rekaman</h2>
              )}
              {administrative && (
                <select
                  aria-label="Tampilan rekaman"
                  value={viewMode}
                  onChange={(event) => {
                    setViewMode(event.target.value);
                    setPage(1);
                  }}
                  className="bg-clinical-surface border-clinical-charcoal/10 text-xs font-bold rounded-full py-2"
                >
                  <option value="sessions">Menurut Sesi</option>
                  <option value="patients">Menurut Pasien</option>
                </select>
              )}
              {identity?.role !== "pasien" && (
                <select
                  aria-label="Filter pasien"
                  value={patient}
                  onChange={(event) => {
                    setPatient(event.target.value);
                    setPage(1);
                    setViewMode("sessions");
                  }}
                  className="bg-white border-clinical-charcoal/10 text-xs rounded-full max-w-full"
                >
                  <option value="">Seluruh pasien yang dapat diakses</option>
                  {patients?.data?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
              <label className="relative">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-clinical-charcoal/40"
                >
                  search
                </span>
                <input
                  aria-label="Cari sesi pada halaman ini"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari sesi pada halaman ini..."
                  className="rounded-full bg-white border-clinical-charcoal/10 pl-10 py-2 text-xs max-w-full"
                />
              </label>
            </div>
            {(administrative || identity?.role === "pasien") && (
              <button
                disabled={identity?.role !== "pasien" && !patient}
                onClick={() => setUpload(true)}
                className={button + " bg-clinical-blue text-white shadow-sm"}
                title={
                  identity?.role !== "pasien" && !patient
                    ? "Pilih pasien terlebih dahulu"
                    : "Unggah sesi"
                }
              >
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[18px]"
                >
                  add_circle
                </span>
                {administrative ? "Tambah Sesi Baru" : "Unggah Rekaman"}
              </button>
            )}
          </div>
          {(error || sessions.error || groupedPatients.error) && (
            <p
              role="alert"
              className="m-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700"
            >
              {error ||
                sessions.error?.message ||
                groupedPatients.error?.message}
            </p>
          )}
          {viewMode === "patients" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-clinical-surface/50 text-clinical-charcoal/60 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nama Pasien</th>
                    <th className="px-6 py-4">Patient ID</th>
                    <th className="px-6 py-4 text-center">Total Sesi</th>
                    <th className="px-6 py-4">Sesi Terakhir</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedPatients.isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm">
                        Memuat pasien...
                      </td>
                    </tr>
                  ) : (
                    groupedPatients.data?.data?.map((item: any) => (
                      <PatientSessionRow
                        key={item.id}
                        patient={item}
                        onOpen={(id) =>
                          navigate(basePath + encodeURIComponent(id))
                        }
                        actions={renderActions}
                      />
                    ))
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={page}
                totalItems={groupedPatients.data?.pagination?.total || 0}
                itemsPerPage={10}
                onPageChange={setPage}
              />
            </div>
          ) : (
            <>
              {sessions.isLoading ? (
                <div role="status" className="space-y-4 p-4">
                  {[1, 2, 3].map((value) => (
                    <div
                      key={value}
                      className="bg-white p-6 rounded-[2rem] border border-clinical-charcoal/5 animate-pulse h-24"
                    >
                      <span className="sr-only">Memuat sesi...</span>
                      <div className="h-3 w-28 bg-slate-200 rounded" />
                      <div className="h-4 w-48 bg-slate-100 rounded mt-3" />
                    </div>
                  ))}
                </div>
              ) : rows.length === 0 ? (
                <div className="text-center text-clinical-charcoal/60 p-12 bg-white rounded-2xl border border-clinical-charcoal/5 shadow-sm flex flex-col items-center max-w-lg mx-auto">
                  <span className="material-symbols-outlined text-4xl mb-4 text-clinical-charcoal/30">
                    folder_off
                  </span>
                  <h2 className="font-bold text-base text-clinical-charcoal mb-2">
                    Belum Ada Rekaman
                  </h2>
                  <p className="text-xs">
                    Belum ada sesi rekaman yang sesuai dengan pilihan Anda.
                  </p>
                </div>
              ) : administrative ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead className="bg-clinical-surface/50 text-clinical-charcoal/60 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Pasien</th>
                        <th className="px-6 py-4">Session ID</th>
                        <th className="px-6 py-4">Waktu Mulai</th>
                        <th className="px-6 py-4 min-w-[250px]">Catatan</th>
                        <th className="px-6 py-4 text-center">
                          Progress Validasi
                        </th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((session) => (
                        <tr
                          key={session.id}
                          className="hover:bg-clinical-surface/50 transition-colors border-b border-clinical-charcoal/5"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={
                                  session.patient_name || session.patient_id
                                }
                                size="sm"
                              />
                              <span className="text-sm font-bold">
                                {session.patient_name || session.patient_id}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-clinical-blue max-w-[240px] break-all">
                            {session.id}
                          </td>
                          <td className="px-6 py-4 text-xs text-clinical-charcoal/60 whitespace-nowrap">
                            {new Date(session.started_at).toLocaleString(
                              "id-ID",
                            )}
                            <p className="mt-1 text-[10px]">{session.state}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-clinical-charcoal/60">
                            <p className="max-w-[300px] break-words">
                              {session.dev_note || "Tidak ada catatan."}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <ValidationBadge sessionId={session.id} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            {renderActions(session)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-4">
                  {rows.map((session) => (
                    <article
                      key={session.id}
                      className="bg-white p-6 rounded-[2rem] shadow-sm border border-clinical-charcoal/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-clinical-blue/20 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-700"
                    >
                      <div className="min-w-0">
                        <h2 className="font-bold text-clinical-charcoal mb-2 uppercase tracking-widest text-xs">
                          {session.patient_name || "Sesi Perekaman"}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-clinical-charcoal/60 text-xs">
                          <span className="flex items-center gap-1.5">
                            <span
                              aria-hidden="true"
                              className="material-symbols-outlined text-[16px]"
                            >
                              calendar_today
                            </span>
                            {new Date(session.started_at).toLocaleString(
                              "id-ID",
                            )}
                          </span>
                          <span className="font-mono break-all">
                            ID: {session.id}
                          </span>
                          <span>{session.state}</span>
                        </div>
                        <p className="text-xs mt-2 text-clinical-charcoal/60 break-words">
                          {session.dev_note}
                        </p>
                        {identity?.role !== "pasien" && (
                          <div className="mt-2">
                            <ValidationBadge sessionId={session.id} />
                          </div>
                        )}
                      </div>
                      {renderActions(session)}
                    </article>
                  ))}
                </div>
              )}
              <Pagination
                currentPage={page}
                totalItems={sessions.data?.pagination?.total || 0}
                itemsPerPage={10}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      </div>
      <input
        ref={photoInput}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png"
        aria-label="Pilih foto ECG"
        onChange={(event) => {
          const file = event.target.files?.[0];
          const target = photoTarget.current;
          if (file && target) {
            if (photo) URL.revokeObjectURL(photo.url);
            setPhoto({ session: target, url: URL.createObjectURL(file), file });
          }
          event.target.value = "";
        }}
      />
      <FolderUploadModal
        isOpen={upload}
        onClose={() => setUpload(false)}
        patientId={identity?.role === "pasien" ? identity.profile_id : patient}
        onSuccess={() => {
          void sessions.mutate();
        }}
      />
      <ScreenCalibrationModal
        isOpen={calibrate}
        onClose={() => setCalibrate(false)}
        onSave={(value) =>
          localStorage.setItem("ecg_pixels_per_mm", String(value))
        }
      />
      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit sesi"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-clinical-charcoal/60 backdrop-blur-sm"
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void perform(async () => {
                await apiJson("/api/sessions/" + editing.id, {
                  method: "PUT",
                  body: JSON.stringify({
                    ...editForm,
                    started_at: new Date(editForm.started_at).toISOString(),
                  }),
                });
                setEditing(null);
              });
            }}
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full space-y-4"
          >
            <h2 className="text-xl font-bold font-display">
              Edit Sesi Rekaman
            </h2>
            <p className="text-xs font-mono break-all text-clinical-charcoal/60">
              {editing.id}
            </p>
            <label className="block text-xs font-bold">
              Pasien
              <select
                aria-label="Pasien sesi"
                className={field + " mt-2"}
                value={editForm.patient_id}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    patient_id: event.target.value,
                  }))
                }
              >
                {patients?.data?.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold">
              Waktu Mulai (ISO 8601)
              <input
                className={field + " mt-2"}
                value={editForm.started_at}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    started_at: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="block text-xs font-bold">
              Catatan Sesi
              <textarea
                maxLength={4000}
                className={field + " mt-2"}
                value={editForm.dev_note}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    dev_note: event.target.value,
                  }))
                }
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(null)}
                className={button + " bg-clinical-surface"}
              >
                Batal
              </button>
              <button
                disabled={busy}
                className={button + " bg-clinical-blue text-white"}
              >
                {busy ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}
      {photo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ECG"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-clinical-charcoal/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col">
            <h2 className="font-bold text-xl mb-4">
              {photo.file ? "Pratinjau Foto EKG" : "Foto EKG"}
            </h2>
            <div className="flex-grow overflow-auto rounded-xl border border-clinical-charcoal/10 bg-clinical-surface/50 p-2 mb-6">
              <img
                src={photo.url}
                alt="Foto rekaman ECG"
                className="w-full h-auto rounded-lg object-contain"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-700 mb-4">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                disabled={busy}
                onClick={closePhoto}
                className={button + " bg-clinical-surface"}
              >
                Tutup
              </button>
              {!photo.file && (
                <>
                  <a
                    href={photo.url}
                    download="ecg-paper"
                    className={button + " bg-clinical-surface"}
                  >
                    Download
                  </a>
                  <button
                    disabled={busy}
                    onClick={() =>
                      void perform(async () => {
                        await apiJson(
                          "/api/sessions/" + photo.session.id + "/ecg_paper",
                          { method: "DELETE" },
                        );
                        closePhoto();
                      })
                    }
                    className={button + " bg-red-50 text-clinical-red"}
                  >
                    Hapus Foto
                  </button>
                </>
              )}
              <button
                disabled={busy}
                onClick={() => choosePhoto(photo.session)}
                className={button + " bg-clinical-blue/10 text-clinical-blue"}
              >
                Pilih Gambar Lain
              </button>
              {photo.file && (
                <button
                  disabled={busy}
                  onClick={() => void savePhoto()}
                  className={button + " bg-clinical-blue text-white"}
                >
                  {busy ? "Mengunggah..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
