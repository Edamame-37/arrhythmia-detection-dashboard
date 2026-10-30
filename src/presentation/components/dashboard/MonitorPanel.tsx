import React, { useEffect, useState } from "react";
import { useAuth } from "../../../application/context/AuthContext";
import { useCachedFetch } from "../../../application/hooks/useCachedFetch";
import { useECGStream } from "../../../application/hooks/useECGStream";
import { useDeviceCommands } from "../../../application/hooks/useDeviceCommands";
import { FILTERS_CLINICAL_DEFAULT } from "../../../core/algorithms/ecgFrameProcessor";
import { WS_URL } from "../../../config/env";
import { EcgViewer } from "./EcgViewer";
import { TimelineBar } from "../shared/TimelineBar";
import { VitalCard } from "./VitalCard";
import { AiCard } from "./AiCard";
import { DeviceCard } from "./DeviceCard";
import { RulerIcon } from "../shared/RulerIcon";
import { ScreenCalibrationModal } from "../shared/ScreenCalibrationModal";
import { useSearchParams } from "react-router-dom";
export const MonitorPanel: React.FC<{ patientId?: string }> = ({
  patientId: initialPatient,
}) => {
  const { identity } = useAuth();
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const [query] = useSearchParams();
  const [selected, setSelected] = useState(
    initialPatient || query.get("patient_id") || query.get("patientId") || "",
  );
  const patientId =
    identity?.role === "pasien" ? identity.profile_id : selected;
  const patientsEndpoint =
    identity?.role === "admin"
      ? "/api/patients?limit=100"
      : identity?.role === "dokter"
        ? "/api/doctors/" + identity.profile_id + "/patients?limit=100"
        : null;
  const { data: patients } = useCachedFetch(patientsEndpoint);
  const { data: profile } = useCachedFetch(
    patientId ? "/api/patients/" + patientId : null,
  );
  const [filters, setFilters] = useState(FILTERS_CLINICAL_DEFAULT);
  const stream = useECGStream(WS_URL, patientId, filters);
  const command = useDeviceCommands();
  const [pixelsPerMm, setPixelsPerMm] = useState(() => {
    const value = Number(localStorage.getItem("ecg_pixels_per_mm"));
    return Number.isFinite(value) && value > 0 ? value : 3.7795;
  });
  const [calibrate, setCalibrate] = useState(false);
  const waiting =
    stream.session?.state === "requested" ||
    stream.session?.state === "stopping";
  const deviceId = stream.deviceId || profile?.patient?.device_id || "";
  const toggleRecording = async () => {
    if (!deviceId || !patientId) return;
    if (stream.isRecording && !confirm("Akhiri perekaman perangkat?")) return;
    try {
      await command.sendCommand(
        deviceId,
        stream.isRecording ? "STOP" : "START",
        patientId,
        stream.sessionId,
      );
      stream.fetchSummary();
    } catch {
      /* The command hook displays the server error below. */
    }
  };
  return (
    <main className="w-full max-w-container-max pt-8 pb-16 mx-auto px-margin-mobile md:px-margin-desktop flex flex-col gap-8 flex-1 relative z-10">
      <section className="w-full flex flex-col gap-5 flex-1">
        <div className="bg-white rounded-[2rem] px-6 py-4 flex flex-wrap justify-between items-center shadow-[0px_20px_40px_rgba(0,0,0,0.04)] border border-clinical-charcoal/5 gap-4 transition-all duration-700">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <h1 className="text-lg font-bold font-display text-clinical-charcoal">
              Monitor ECG
            </h1>
            {identity?.role !== "pasien" && (
              <label className="flex items-center gap-2 text-xs font-bold text-clinical-charcoal/60">
                Pasien
                <select
                  aria-label="Pasien"
                  value={selected}
                  onChange={(event) => setSelected(event.target.value)}
                  className="rounded-full border-clinical-charcoal/10 bg-clinical-surface py-2 text-sm max-w-full"
                >
                  <option value="">Pilih pasien</option>
                  {patients?.data?.map((patient: any) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto">
            <button
              onClick={() => setCalibrate(true)}
              title="Kalibrasi layar"
              aria-label="Kalibrasi layar"
              className="flex items-center gap-2 bg-clinical-surface border border-clinical-charcoal/10 px-4 py-2 rounded-full font-bold text-xs hover:-translate-y-0.5 transition-all"
            >
              <RulerIcon size={18} /> Ruler
            </button>
            {stream.isViewingHistory && (
              <button
                onClick={stream.resumeRealTimeStream}
                className="bg-clinical-surface text-clinical-charcoal px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] flex items-center gap-2 border border-clinical-charcoal/10"
              >
                <span className="material-symbols-outlined text-[18px]">
                  stream
                </span>
                Kembali ke Live
              </button>
            )}
            <button
              disabled={!deviceId || !patientId || command.busy || waiting}
              onClick={toggleRecording}
              className={
                (stream.isRecording
                  ? "bg-clinical-red shadow-clinical-red/20"
                  : "bg-clinical-blue shadow-clinical-blue/20") +
                " text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-sm transition-all duration-500 flex items-center gap-2 hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              }
            >
              <span
                aria-hidden="true"
                className={
                  "material-symbols-outlined text-[18px] " +
                  (waiting || command.busy ? "animate-spin" : "")
                }
              >
                {waiting || command.busy
                  ? "sync"
                  : stream.isRecording
                    ? "stop_circle"
                    : "play_circle"}
              </span>
              {waiting
                ? "Menunggu konfirmasi perangkat..."
                : command.busy
                  ? "Mengirim..."
                  : stream.isRecording
                    ? "Akhiri Perekaman"
                    : "Mulai Perekaman"}
            </button>
          </div>
        </div>
        {(stream.error || command.error) && (
          <p
            role="alert"
            className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
          >
            {command.error || stream.error}
          </p>
        )}
        {stream.clinicalStatus?.isAnomaly && (
          <p
            role="alert"
            className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800"
          >
            {stream.clinicalStatus.fullExplanation}
          </p>
        )}
        {!deviceId && (
          <p className="rounded-2xl border border-clinical-charcoal/5 bg-white p-4 text-sm text-clinical-charcoal/60">
            Pasien belum memiliki perangkat yang ditautkan.
          </p>
        )}
        <div className="relative flex-1 h-[620px] md:h-[680px] min-h-[620px] md:min-h-[680px] group flex flex-col bg-white border border-clinical-charcoal/5 rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] transition-all duration-700 hover:shadow-[0px_30px_60px_rgba(0,0,0,0.08)] overflow-hidden">
          <EcgViewer
            segment={stream.segment}
            pixelsPerMm={pixelsPerMm}
            onFilterChange={setFilters}
          />
        </div>
        <TimelineBar
          events={stream.timeline}
          onSegmentSelect={stream.fetchSegment}
        />
      </section>
      <aside className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <VitalCard
          heartRate={stream.heartRate}
          clinicalStatus={stream.clinicalStatus}
        />
        <AiCard
          rawClassification={stream.rawClassification}
          sessionId={stream.sessionId}
        />
        <DeviceCard
          deviceId={deviceId || "Belum tersedia"}
          aiMetrics={stream.prediction}
          isLive={
            stream.isRecording &&
            !stream.error &&
            !!stream.receivedAt &&
            clock - Date.parse(stream.receivedAt) < 30000
          }
        />
      </aside>
      <ScreenCalibrationModal
        isOpen={calibrate}
        onClose={() => setCalibrate(false)}
        onSave={setPixelsPerMm}
      />
    </main>
  );
};
