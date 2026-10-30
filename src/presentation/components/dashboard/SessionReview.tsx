import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TimelineBar } from "../shared/TimelineBar";
import { ScreenCalibrationModal } from "../shared/ScreenCalibrationModal";
import { RulerIcon } from "../shared/RulerIcon";
import { DeviceCard } from "./DeviceCard";
import { useSidebar } from "../../../application/context/SidebarContext";
import { useSessionReview } from "../../../application/hooks/useSessionReview";
import { useAuth } from "../../../application/context/AuthContext";
import { apiJson, privatePhotoUrl } from "../../../config/api";
import { formatRecordingTime } from "../../../core/algorithms/ecgCoordinates";
import { isNormalClassification } from "../../../core/clinical/ruleBasedEngine";
import { EcgViewer } from "./EcgViewer";
import { VitalCard } from "./VitalCard";
import { AiCard } from "./AiCard";
function download(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const SessionReview: React.FC<{ sessionId: string }> = ({
  sessionId,
}) => {
  const { identity } = useAuth();
  const review = useSessionReview(sessionId);
  const [problem, setProblem] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const current = review.current;
  const index = review.frames.findIndex(
    (frame) => frame.id === review.selectedId,
  );
  const action = async (perform: () => Promise<unknown>) => {
    setProblem("");
    try {
      await perform();
      await review.refresh();
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Permintaan gagal");
    }
  };
  const downloadCsv = () => {
    if (!current) return;
    const raw = current.raw;
    const rate = raw.samplingRate!;
    const lines = ["Timestamp (s),Lead I (mV),Lead II (mV),Lead III (mV)"];
    raw.ch1.forEach((value, sample) =>
      lines.push(
        [
          current.startTime + sample / rate,
          value,
          raw.ch2[sample],
          raw.ch3[sample],
        ].join(","),
      ),
    );
    download(
      "ecg_" + sessionId + "_" + review.selectedId + ".csv",
      lines.join("\n"),
      "text/csv",
    );
  };
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [calibrate, setCalibrate] = useState(false);
  const [pixelsPerMm, setPixelsPerMm] = useState(() => {
    const stored = Number(localStorage.getItem("ecg_pixels_per_mm"));
    return stored > 0 && Number.isFinite(stored) ? stored : 3.7795;
  });
  const [downloadMenu, setDownloadMenu] = useState(false);
  const [preview, setPreview] = useState("");
  const timeline = review.frames.map((frame, position) => ({
    index: position,
    frameNumber: frame.frame_number,
    startTime: frame.start_time,
    timeStr: formatRecordingTime(frame.start_time),
    classResult: frame.label || "UNKNOWN",
    isAnomaly:
      !!frame.label &&
      frame.label.trim().toUpperCase() !== "UNKNOWN" &&
      !isNormalClassification(frame.label),
  }));
  const closePreview = () => {
    URL.revokeObjectURL(preview);
    setPreview("");
  };
  const showPaper = () =>
    action(async () => {
      const url = await privatePhotoUrl(review.session.ecg_paper);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(url);
    });
  const downloadSession = () =>
    action(async () => {
      const { fetchWithAuth } = await import("../../../config/api");
      const response = await fetchWithAuth(
        "/api/records/" + sessionId + "/download",
      );
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "ecg_" + sessionId + ".json";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  const currentEvent = { classResult: current?.classification || "UNKNOWN" };
  const currentSegment = current
    ? {
        ...current.payload,
        docClassification: current.payload.doc_classification,
        docNote: current.payload.doc_note,
      }
    : null;
  const createdAt = current?.payload.created_at || null;
  const formatTimeDetailed = (value: string | null) =>
    value ? new Date(value).toLocaleString("id-ID") : "Tidak tersedia";
  const aiMetrics = current?.payload.prediction || null;
  const aiProbabilities: Record<string, number> | null =
    aiMetrics?.probabilities
      ? Object.fromEntries(
          Object.entries(aiMetrics.probabilities).filter(
            (entry): entry is [string, number] =>
              typeof entry[1] === "number" && Number.isFinite(entry[1]),
          ),
        )
      : null;
  const system = current?.payload.system || null;
  const network = current?.payload.network || null;
  return (
    <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 relative z-10">
      {identity?.role !== "pasien" && (
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={toggleSidebar}
            title="Sembunyikan / Tampilkan Menu Utama"
            className="md:hidden p-2 rounded-full hover:bg-white"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              menu
            </span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Riwayat Klinis
            </h1>
            <p className="text-xs text-clinical-charcoal/60 mt-1">
              Tinjau rekaman dan hasil pemeriksaan ECG.
            </p>
          </div>
        </header>
      )}
      <h1 className="sr-only">Detail Rekaman ECG</h1>
      {(review.error || problem) && (
        <p
          role="alert"
          className="mb-5 rounded-2xl border border-red-100 bg-white p-4 text-sm text-red-700"
        >
          {problem || review.error?.message}
        </p>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <section className="lg:col-span-3 flex flex-col gap-6 min-w-0">
          <div className="bg-white border border-clinical-charcoal/5 rounded-[2rem] px-6 py-3 flex flex-wrap justify-between items-center shadow-[0px_20px_40px_rgba(0,0,0,0.04)] gap-4">
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              <div className="bg-clinical-blue/10 p-2.5 rounded-full text-clinical-blue">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined block text-[24px]"
                >
                  schedule
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-clinical-charcoal/60 uppercase tracking-widest">
                  Waktu Rekaman
                </p>
                <p className="text-sm font-bold mt-0.5">
                  {current
                    ? formatRecordingTime(current.startTime) +
                      " - " +
                      formatRecordingTime(current.endTime)
                    : "--"}
                </p>
                <p className="text-[10px] text-clinical-charcoal/50 break-all">
                  Sesi: {sessionId}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCalibrate(true)}
              aria-label="Kalibrasi layar dengan penggaris"
              title="Kalibrasi ukuran fisik layar"
              className="flex items-center gap-2 bg-clinical-surface hover:bg-clinical-charcoal/5 border border-clinical-charcoal/10 px-4 py-2 rounded-full font-bold text-xs transition-all"
            >
              <RulerIcon size={18} />
              Ruler
            </button>
          </div>
          {review.loading && (
            <p
              role="status"
              className="rounded-2xl bg-white p-6 text-clinical-charcoal/60 animate-pulse"
            >
              Memuat rekaman...
            </p>
          )}
          {!review.loading && !current && (
            <div className="rounded-[2rem] bg-white border border-clinical-charcoal/5 p-12 text-center text-sm text-clinical-charcoal/60">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-4xl block mb-3"
              >
                monitor_heart
              </span>
              Data rekaman belum tersedia.
            </div>
          )}
          {current && (
            <>
              <p className="text-[11px] text-clinical-charcoal/50">
                Waktu asli: {formatRecordingTime(current.startTime)} -{" "}
                {formatRecordingTime(current.endTime)};{" "}
                {current.raw.samplingRate} Hz
              </p>
              <div className="relative h-[620px] md:h-[700px] flex flex-col bg-white border border-clinical-blue/20 rounded-[2rem] overflow-hidden shadow-[0px_20px_40px_rgba(0,0,0,0.04)]">
                <EcgViewer
                  segment={current}
                  pixelsPerMm={pixelsPerMm}
                  timeOffset={current.startTime}
                  onFilterChange={review.setFilters}
                />
              </div>
              <TimelineBar
                events={timeline}
                currentIdx={index}
                onSegmentSelect={(position) => {
                  const frame = review.frames[position];
                  if (frame) review.setSelectedId(frame.id);
                }}
              />
              <nav
                aria-label="Frame rekaman"
                className="flex flex-wrap items-center justify-between gap-3 text-xs text-clinical-charcoal/60"
              >
                <button
                  disabled={review.page <= 1}
                  onClick={() => review.setPage(review.page - 1)}
                  className="px-4 py-2 bg-white rounded-full border border-clinical-charcoal/10 disabled:opacity-40"
                >
                  Frame sebelumnya
                </button>
                <span>Halaman {review.page}</span>
                <button
                  disabled={review.page * 50 >= review.total}
                  onClick={() => review.setPage(review.page + 1)}
                  className="px-4 py-2 bg-white rounded-full border border-clinical-charcoal/10 disabled:opacity-40"
                >
                  Frame berikutnya
                </button>
              </nav>
              <div className="flex flex-wrap justify-between gap-4 items-center">
                <button
                  onClick={() =>
                    navigate(
                      identity?.role === "pasien"
                        ? "/patient/history"
                        : identity?.role === "dokter"
                          ? "/doctor/analytics"
                          : "/admin/analytics",
                    )
                  }
                  className="flex items-center gap-2 px-5 py-3 rounded-full border border-clinical-charcoal/10 bg-white text-xs font-bold hover:bg-clinical-surface"
                >
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[18px]"
                  >
                    arrow_back
                  </span>
                  Kembali ke Riwayat
                </button>
                <div className="relative">
                  <button
                    aria-expanded={downloadMenu}
                    onClick={() => setDownloadMenu(!downloadMenu)}
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-clinical-blue text-white text-xs font-bold shadow-sm hover:brightness-110"
                  >
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[18px]"
                    >
                      download
                    </span>
                    Unduh Rekaman
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[16px]"
                    >
                      expand_more
                    </span>
                  </button>
                  {downloadMenu && (
                    <div className="absolute right-0 bottom-full mb-2 z-30 w-60 bg-white rounded-2xl border border-clinical-charcoal/10 shadow-xl p-2 text-xs">
                      <button
                        className="block w-full text-left p-3 rounded-xl hover:bg-clinical-surface"
                        onClick={downloadCsv}
                      >
                        Unduh CSV frame
                      </button>
                      <button
                        className="block w-full text-left p-3 rounded-xl hover:bg-clinical-surface"
                        onClick={() =>
                          download(
                            "ecg_" + review.selectedId + ".json",
                            JSON.stringify(current.payload, null, 2),
                            "application/json",
                          )
                        }
                      >
                        Unduh JSON frame
                      </button>
                      <button
                        className="block w-full text-left p-3 rounded-xl hover:bg-clinical-surface"
                        onClick={downloadSession}
                      >
                        Unduh seluruh sesi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
        <aside className="lg:col-span-1 flex flex-col gap-6 min-w-0">
          <VitalCard
            heartRate={current?.heartRate || "--"}
            clinicalStatus={current?.clinicalStatus || null}
          />
          {identity?.role !== "admin" && (
            <AiCard
              sessionId={sessionId}
              rawClassification={current?.classification || "UNKNOWN"}
              isDoctorReview={identity?.role === "dokter"}
              frameId={current?.dbId}
              timeInterval={
                current ? current.startTime + " - " + current.endTime : ""
              }
              initialDocNote={current?.payload.doc_note}
              initialConfirmation={current?.payload.confirmation}
              initialDocClassification={current?.payload.doc_classification}
              onValidationSuccess={() => {
                void review.refresh();
              }}
              isLastFrame={index === review.frames.length - 1}
              onGoToNext={() =>
                review.setSelectedId(
                  review.frames[index + 1]?.id || review.selectedId,
                )
              }
              onGoToList={() => navigate("/doctor/analytics")}
            />
          )}
          {identity?.role === "pasien" && (
            <div className="bg-white border border-clinical-charcoal/5 rounded-[2rem] p-6 shadow-[0px_20px_40px_rgba(0,0,0,0.04)] transition-all duration-700 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-4">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-clinical-blue text-[20px]"
                >
                  psychiatry
                </span>
                <h3 className="font-bold text-clinical-charcoal text-sm">
                  Kesimpulan Analisis
                </h3>
              </div>
              <div className="space-y-3">
                <p
                  className={
                    "text-sm leading-relaxed " +
                    (current?.clinicalStatus.isAnomaly
                      ? "text-clinical-red"
                      : "text-clinical-charcoal/60")
                  }
                >
                  {current?.clinicalStatus.fullExplanation ||
                    "Menunggu data pemeriksaan yang cukup."}
                </p>
                {current?.clinicalStatus.isAnomaly && (
                  <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    Konsultasikan hasil pemeriksaan dengan dokter Anda.
                  </p>
                )}
              </div>
            </div>
          )}
          {identity?.role === "admin" && (
            <>
              {/* Timestamp Card */}
              <div className="bg-white border border-outline-variant/60 rounded-xl p-4 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[14px]"
                    >
                      device_thermostat
                    </span>{" "}
                    Created At (IoT)
                  </span>
                  <span className="text-xs font-mono mt-1 text-charcoal font-bold">
                    {formatTimeDetailed(createdAt)}
                  </span>
                </div>
              </div>

              {/* Edge AI Performance (Prediction) */}
              <div className="bg-charcoal text-white rounded-xl p-5 shadow-xl flex flex-col gap-4">
                <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/20 pb-2">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[18px] text-brand-red"
                  >
                    psychology
                  </span>
                  Edge AI Prediction
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                    <p className="text-[9px] text-white/60 uppercase">
                      Validation
                    </p>
                    <p
                      className={`text-sm font-bold ${aiMetrics?.status === "PASS" ? "text-green-400" : "text-alert-red"}`}
                    >
                      {aiMetrics?.status || "--"}
                    </p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                    <p className="text-[9px] text-white/60 uppercase">
                      Confidence
                    </p>
                    <p
                      className={`text-sm font-bold ${aiMetrics?.confidence_percent != null ? (aiMetrics.confidence_percent >= 95 ? "text-green-400" : "text-white/80") : "text-white/50"}`}
                    >
                      {aiMetrics?.confidence_percent != null
                        ? `${aiMetrics.confidence_percent.toFixed(2)}%`
                        : "--"}
                    </p>
                  </div>
                  <div className="col-span-2 bg-white/10 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] text-white/60 uppercase">
                        Result Label
                      </p>
                      <p className="text-lg font-extrabold text-medical-teal">
                        {currentEvent?.classResult || "--"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-white/60 uppercase">
                        Latency
                      </p>
                      <p className="text-sm font-bold font-mono text-white">
                        {aiMetrics?.latency_ms
                          ? `${aiMetrics.latency_ms.toFixed(1)} ms`
                          : "--"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Probabilities */}
                {aiProbabilities && (
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5 mt-1 space-y-2">
                    <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-2">
                      <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest">
                        Probabilities
                      </p>
                    </div>
                    {Object.entries(aiProbabilities).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span className="text-[10px] text-white/80 font-medium">
                          {key}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${key === currentEvent?.classResult ? "bg-medical-teal" : "bg-white/30"}`}
                              style={{ width: `${val as number}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-mono w-8 text-right text-white/90">
                            {(val as number).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-[9px] text-white/40 text-center uppercase tracking-widest mt-1">
                  Runtime: {aiMetrics?.runtime || "UNKNOWN"}
                </div>
              </div>

              {/* Status Validasi Medis (Read-Only) */}
              <div className="bg-clinical-surface border border-clinical-blue/20 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-clinical-charcoal flex items-center gap-2 border-b border-clinical-blue/10 pb-2">
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined text-[18px] text-clinical-blue"
                  >
                    stethoscope
                  </span>
                  Status Validasi Medis
                </h3>

                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-outline-variant/30 shadow-sm">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Status Konfirmasi
                    </p>
                    <p className="text-sm font-bold mt-0.5">
                      {currentSegment?.confirmation === true ? (
                        <span className="text-signal-green">Benar</span>
                      ) : currentSegment?.confirmation === false ? (
                        <span className="text-alert-red">Salah</span>
                      ) : (
                        <span className="text-on-surface-variant">
                          Belum Divalidasi
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {currentSegment?.confirmation !== undefined &&
                  currentSegment?.confirmation !== null && (
                    <div className="bg-white p-3 rounded-lg border border-outline-variant/30 shadow-sm">
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                        Klasifikasi Akhir
                      </p>
                      <p className="text-lg font-extrabold text-clinical-blue mt-0.5">
                        {currentSegment?.docClassification || "--"}
                      </p>
                    </div>
                  )}

                <div className="bg-white p-3 rounded-lg border border-outline-variant/30 shadow-sm">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1.5">
                    Catatan Dokter
                  </p>
                  <p
                    className={`text-sm ${currentSegment?.docNote ? "text-charcoal italic" : "text-on-surface-variant/50"}`}
                  >
                    {currentSegment?.docNote
                      ? `"${currentSegment.docNote}"`
                      : "Tidak ada catatan."}
                  </p>
                </div>
              </div>

              {/* System Health */}
              {system && (
                <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-outline-variant/50 pb-2">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[18px] text-medical-teal"
                    >
                      memory
                    </span>
                    Hardware Health
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                        CPU Usage
                      </p>
                      <p className="text-sm font-mono font-semibold text-charcoal">
                        {system.cpu_usage_percent?.toFixed(1) || "--"}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                        Memory
                      </p>
                      <p className="text-sm font-mono font-semibold text-charcoal">
                        {system.memory_usage_mb
                          ? `${system.memory_usage_mb} MB`
                          : "--"}{" "}
                        <span className="text-xs text-on-surface-variant font-normal">
                          ({system.memory_usage_percent?.toFixed(1) || "--"}%)
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                        Temperature
                      </p>
                      <p className="text-sm font-mono font-semibold text-charcoal">
                        {system.cpu_temperature_c?.toFixed(1) || "--"} Â°C
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                        Uptime
                      </p>
                      <p className="text-sm font-mono font-semibold text-charcoal">
                        {system.uptime_s ? `${system.uptime_s} s` : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Network Metrics */}
              {network && (
                <div className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-outline-variant/50 pb-2">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[18px] text-medical-teal"
                    >
                      cell_tower
                    </span>
                    Network Metrics
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-on-surface-variant font-medium">
                      WiFi RSSI
                    </p>
                    <p className="text-sm font-mono font-semibold text-charcoal">
                      {network.wifi_rssi_dbm || "--"} dBm
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-on-surface-variant font-medium">
                      MQTT Latency
                    </p>
                    <p className="text-sm font-mono font-semibold text-charcoal">
                      {network.mqtt_publish_latency_ms
                        ? `${network.mqtt_publish_latency_ms.toFixed(1)} ms`
                        : "--"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          {identity?.role !== "pasien" && (
            <DeviceCard
              deviceId={review.session?.device_id || "Belum tersedia"}
              isLive={false}
            />
          )}
          {review.session?.ecg_paper && (
            <button
              onClick={showPaper}
              className="bg-white rounded-[2rem] border border-clinical-charcoal/5 p-6 shadow-sm flex items-center gap-3 text-sm font-bold text-clinical-blue"
            >
              <span aria-hidden="true" className="material-symbols-outlined">
                image
              </span>
              Lihat foto ECG
            </button>
          )}
          {identity?.role === "admin" && current && (
            <div className="bg-white rounded-[2rem] border border-clinical-charcoal/5 p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-sm">Administrasi rekaman</h2>
              <button
                className="w-full rounded-xl bg-clinical-surface px-4 py-3 text-xs font-bold"
                onClick={() =>
                  action(() =>
                    apiJson("/api/frames/" + current.dbId, {
                      method: "PUT",
                      body: JSON.stringify({ hidden: !current.payload.hidden }),
                    }),
                  )
                }
              >
                {current.payload.hidden
                  ? "Tampilkan frame"
                  : "Sembunyikan frame"}
              </button>
              <button
                className="w-full rounded-xl bg-red-50 text-red-700 px-4 py-3 text-xs font-bold"
                onClick={() => {
                  if (confirm("Hapus frame ini secara permanen?"))
                    void action(() =>
                      apiJson("/api/frames/" + current.dbId, {
                        method: "DELETE",
                      }),
                    );
                }}
              >
                Hapus frame
              </button>
              <label className="block text-xs font-bold text-clinical-charcoal/60">
                Catatan sesi
                <textarea
                  className="mt-2 block w-full rounded-xl border-clinical-charcoal/10 bg-clinical-surface text-sm"
                  maxLength={4000}
                  value={note ?? review.session?.dev_note ?? ""}
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
              <button
                className="w-full rounded-full bg-clinical-blue text-white px-4 py-3 text-xs font-bold"
                onClick={() =>
                  action(() =>
                    apiJson("/api/sessions/" + sessionId, {
                      method: "PUT",
                      body: JSON.stringify({
                        dev_note: note ?? review.session?.dev_note ?? "",
                      }),
                    }),
                  )
                }
              >
                Simpan catatan
              </button>
            </div>
          )}
        </aside>
      </div>
      <ScreenCalibrationModal
        isOpen={calibrate}
        onClose={() => setCalibrate(false)}
        onSave={setPixelsPerMm}
      />
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ECG"
          onClick={closePreview}
          className="fixed inset-0 z-[100] bg-clinical-charcoal/80 backdrop-blur-sm p-4 flex flex-col items-center justify-center"
        >
          <div className="flex gap-3 mb-4">
            <a
              href={preview}
              download="ecg-paper"
              onClick={(event) => event.stopPropagation()}
              className="rounded-full bg-white px-5 py-2 text-sm font-bold"
            >
              Unduh Foto
            </a>
            <button
              onClick={closePreview}
              className="rounded-full bg-white px-5 py-2 text-sm font-bold"
            >
              Tutup
            </button>
          </div>
          <img
            src={preview}
            alt="Foto hasil pemeriksaan ECG"
            className="max-h-[80vh] max-w-full rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
};
