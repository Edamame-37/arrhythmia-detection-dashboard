import { useEcgProcessing } from "../../../application/hooks/useEcgProcessing";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ECGCanvas } from "../canvas/ECGCanvas";
import {
  extractRawFromPayload,
  FILTERS_CLINICAL_DEFAULT,
  type StreamFilterConfig,
} from "../../../core/algorithms/ecgFrameProcessor";
import { useTranslation } from "../../../application/hooks/useTranslation";
import { SUPPORTED_LEADS } from "../../../core/algorithms/ecgCoordinates";
interface EcgViewerProps {
  segment: any;
  speed?: number;
  timeOffset?: number;
  classResult?: string;
  pixelsPerMm?: number;
  onFilterChange?: (config: StreamFilterConfig) => void;
}
export const EcgViewer: React.FC<EcgViewerProps> = ({
  segment,
  speed = 25,
  timeOffset,
  pixelsPerMm = 3.7795,
  onFilterChange,
}) => {
  const [gain, setGain] = useState(10);
  const [paperSpeed, setPaperSpeed] = useState(speed);
  const [filters, setFilters] = useState<StreamFilterConfig>(
    FILTERS_CLINICAL_DEFAULT,
  );
  const [filterEnabled, setFilterEnabled] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  useEffect(() => {
    onFilterChange?.(
      filterEnabled
        ? filters
        : {
            baselineBlocker: false,
            hfDenoise: false,
            bandpass: false,
            zScoreNorm: false,
          },
    );
  }, [onFilterChange, filters, filterEnabled]);
  const [visibleCount, setVisibleCount] = useState(0);
  const playhead = useRef(0);
  const raw = useMemo(() => extractRawFromPayload(segment), [segment]);
  const samplingRate = raw.samplingRate ?? 250;
  const sampleCount = raw.ch1.length;
  const duration =
    Number(segment?.payload?.duration_s) || sampleCount / samplingRate;
  const activeFilters = useMemo(
    () =>
      filterEnabled
        ? filters
        : {
            baselineBlocker: false,
            hfDenoise: false,
            bandpass: false,
            zScoreNorm: false,
          },
    [filterEnabled, filters],
  );
  const { processed, error: processingError } = useEcgProcessing(
    raw,
    activeFilters,
  );
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- External recording changes reset playback.
    setPlaying(false);
    setVisibleCount(sampleCount);
    playhead.current = sampleCount;
  }, [segment, sampleCount]);
  useEffect(() => {
    if (!playing) return;
    let animation = 0;
    const initialCount = playhead.current;
    const initialTime = performance.now();
    const animate = (now: number) => {
      const count = Math.min(
        sampleCount,
        Math.floor(
          initialCount +
            ((now - initialTime) / 1000) * samplingRate * playbackSpeed,
        ),
      );
      playhead.current = count;
      setVisibleCount(count);
      if (count < sampleCount) animation = requestAnimationFrame(animate);
      else setPlaying(false);
    };
    animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, [playing, playbackSpeed, sampleCount, samplingRate]);
  const paths = useMemo(() => {
    const output = { ...processed.paths };
    for (const lead of SUPPORTED_LEADS)
      output[lead] = processed.paths[lead].slice(0, visibleCount);
    return output;
  }, [processed.paths, visibleCount]);
  const peaks = processed.rPeaks.filter(
    (peak) => peak.x <= (visibleCount / samplingRate) * 200,
  );
  const startTime = timeOffset ?? raw.startTime ?? segment?.startTime ?? 0;
  const { t } = useTranslation();
  const samples = raw.ch1;
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const currentTimeStr =
    (startTime + visibleCount / samplingRate).toFixed(2) + " s";
  const totalTimeStr = (startTime + duration).toFixed(2) + " s";
  const progressPercentage = Math.round(
    (visibleCount / Math.max(sampleCount, 1)) * 100,
  );
  const toggleSubFilter = (key: keyof StreamFilterConfig, enabled: boolean) =>
    setFilters((previous) => ({ ...previous, [key]: enabled }));
  const changeSpeed = setPlaybackSpeed;
  const handlePlayPause = () => {
    if (!playing && playhead.current >= sampleCount) {
      playhead.current = 0;
      setVisibleCount(0);
    }
    setPlaying((previous) => !previous);
  };
  const handleReplay = () => {
    playhead.current = 0;
    setVisibleCount(0);
    setPlaying(true);
  };
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    playhead.current = Number(event.target.value);
    setVisibleCount(playhead.current);
    setPlaying(false);
  };
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      )
        setShowFilters(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  return (
    <>
      {processingError && (
        <p role="alert" className="text-red-700">
          {processingError}
        </p>
      )}
      {activeFilters.zScoreNorm && (
        <p className="text-xs text-amber-700">
          Normalisasi aktif: amplitudo relatif, gain bukan mm/mV.
        </p>
      )}

      <div className="relative flex flex-col flex-1 h-full w-full">
        {/* The main scrollable canvas wrapper */}
        <div className="flex-1 min-h-0 relative flex flex-col">
          <ECGCanvas
            paths={paths}
            rPeaks={peaks}
            paperSpeed={paperSpeed}
            gain={gain}
            pixelsPerMm={pixelsPerMm}
            showCalibrationPulse={!activeFilters.zScoreNorm}
            timeOffset={startTime}
            durationSeconds={duration || 10}
          />

          {/* Active Filters Overlay Badge (Medical Standard Visual) */}
          <div className="absolute top-3 right-3 z-30 pointer-events-none select-none flex flex-wrap gap-1.5 max-w-[70%] justify-end">
            {filterEnabled ? (
              <>
                <span className="bg-blue-50/90 backdrop-blur-xs border border-blue-100/50 text-clinical-blue text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                  Filter: ON
                </span>
                {filters.baselineBlocker && (
                  <span className="bg-emerald-50/90 backdrop-blur-xs border border-emerald-100/50 text-emerald-600 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Baseline
                  </span>
                )}
                {filters.hfDenoise && (
                  <span className="bg-emerald-50/90 backdrop-blur-xs border border-emerald-100/50 text-emerald-600 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Denoise
                  </span>
                )}
                {filters.bandpass && (
                  <span className="bg-emerald-50/90 backdrop-blur-xs border border-emerald-100/50 text-emerald-600 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Bandpass
                  </span>
                )}
                {filters.zScoreNorm && (
                  <span className="bg-purple-50/90 backdrop-blur-xs border border-purple-100/50 text-purple-600 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Normalized
                  </span>
                )}
              </>
            ) : (
              <span className="bg-amber-50/90 backdrop-blur-xs border border-amber-100/50 text-amber-600 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                Raw Data (No Filters)
              </span>
            )}
          </div>
        </div>

        {/* Playback Control Bar */}
        {
          <div className="flex-shrink-0 bg-white border-t border-clinical-charcoal/5 px-6 py-3.5 flex flex-col xl:flex-row items-center justify-between gap-4 z-20 select-none">
            {/* Left: Controls & Time Indicator */}
            <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="flex items-center justify-center bg-clinical-blue text-white rounded-full w-10 h-10 hover:bg-clinical-blue/90 active:scale-95 transition-all shadow-sm outline-none"
                  title={playing ? t("history.pause") : t("history.play")}
                >
                  <span className="material-symbols-outlined text-[22px] font-bold">
                    {playing ? "pause" : "play_arrow"}
                  </span>
                </button>

                <button
                  onClick={handleReplay}
                  className="flex items-center justify-center bg-clinical-surface border border-clinical-charcoal/10 text-clinical-charcoal hover:bg-clinical-surface/80 active:scale-95 transition-all rounded-full w-10 h-10 shadow-xs outline-none"
                  title={t("history.replay")}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    replay
                  </span>
                </button>
              </div>

              {/* Current/Total time */}
              <div className="ml-2 flex flex-col justify-center">
                <span className="text-[9px] font-bold text-clinical-charcoal/40 uppercase tracking-wider leading-none">
                  {t("history.recordingTime")}
                </span>
                <span className="font-mono-data text-xs font-bold text-clinical-charcoal mt-1">
                  {currentTimeStr} / {totalTimeStr}
                </span>
              </div>
            </div>

            {/* Center: Progress Slider */}
            <div className="flex-1 flex items-center gap-3 w-full px-2">
              <input
                type="range"
                min={0}
                aria-label="Posisi rekaman"
                max={samples.length}
                value={visibleCount}
                onChange={handleSliderChange}
                className="flex-1 h-1.5 bg-clinical-charcoal/10 rounded-full appearance-none cursor-pointer accent-clinical-blue focus:outline-none transition-all"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(visibleCount / (samples.length || 1)) * 100}%, rgba(0, 0, 0, 0.1) ${(visibleCount / (samples.length || 1)) * 100}%, rgba(0, 0, 0, 0.1) 100%)`,
                }}
              />
              <span className="text-xs font-bold text-clinical-charcoal/50 w-10 text-right font-mono-data">
                {progressPercentage}%
              </span>
            </div>

            {/* Right: Medical Configurations (Gain, Paper Speed, Filters, and Animation Speed) */}
            <div className="flex items-center gap-3 flex-wrap justify-end w-full xl:w-auto">
              {/* Interactive Filter Configuration Dropdown */}
              <div
                className="flex items-center gap-1 bg-clinical-surface p-1 rounded-full border border-clinical-charcoal/5 relative"
                ref={filterMenuRef}
              >
                <button
                  onClick={() => setFilterEnabled(!filterEnabled)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${filterEnabled ? "bg-white text-clinical-blue shadow-xs" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
                  title={
                    filterEnabled
                      ? "Matikan Semua Filter"
                      : "Aktifkan Semua Filter"
                  }
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {filterEnabled ? "filter_alt" : "filter_alt_off"}
                  </span>
                  Filter {filterEnabled ? "ON" : "OFF"}
                </button>

                {filterEnabled && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-1 hover:bg-clinical-charcoal/5 rounded-full transition-all flex items-center justify-center outline-none ${showFilters ? "text-clinical-blue" : "text-clinical-charcoal/55"}`}
                    title="Konfigurasi Filter Sinyal"
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">
                      settings
                    </span>
                  </button>
                )}

                {/* Dropdown Menu for Sub-Filters */}
                {filterEnabled && showFilters && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white border border-clinical-charcoal/10 rounded-[1.5rem] p-4 shadow-xl z-[200] min-w-[220px] flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <h4 className="text-[10px] font-bold text-clinical-charcoal/40 uppercase tracking-widest px-1">
                      Pilih Filter Aktif
                    </h4>

                    <label className="flex items-center gap-2 px-1 hover:bg-clinical-surface/50 py-1.5 rounded cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.baselineBlocker}
                        onChange={(e) =>
                          toggleSubFilter("baselineBlocker", e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded border-gray-300 text-clinical-blue focus:ring-clinical-blue"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-clinical-charcoal">
                          Baseline Blocker
                        </span>
                        <span className="text-[8px] text-clinical-charcoal/50 leading-none">
                          Menghapus baseline wander (drift)
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 px-1 hover:bg-clinical-surface/50 py-1.5 rounded cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.hfDenoise}
                        onChange={(e) =>
                          toggleSubFilter("hfDenoise", e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded border-gray-300 text-clinical-blue focus:ring-clinical-blue"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-clinical-charcoal">
                          HF Denoise
                        </span>
                        <span className="text-[8px] text-clinical-charcoal/50 leading-none">
                          Meredam noise otot (frekuensi tinggi)
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 px-1 hover:bg-clinical-surface/50 py-1.5 rounded cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.bandpass}
                        onChange={(e) =>
                          toggleSubFilter("bandpass", e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded border-gray-300 text-clinical-blue focus:ring-clinical-blue"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-clinical-charcoal">
                          Bandpass 0.5-40Hz
                        </span>
                        <span className="text-[8px] text-clinical-charcoal/50 leading-none">
                          Menjaga sinyal dalam batas klinis
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 px-1 hover:bg-clinical-surface/50 py-1.5 rounded cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.zScoreNorm}
                        onChange={(e) =>
                          toggleSubFilter("zScoreNorm", e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded border-gray-300 text-clinical-blue focus:ring-clinical-blue"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-clinical-charcoal">
                          Z-Score Norm
                        </span>
                        <span className="text-[8px] text-clinical-charcoal/50 leading-none">
                          Menyamakan skala amplitudo rata-rata
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Gain Config */}
              <div className="flex items-center gap-1.5 bg-clinical-surface p-1 rounded-full border border-clinical-charcoal/5">
                <span className="text-[9px] font-bold text-clinical-charcoal/40 uppercase tracking-wider px-2 select-none">
                  Gain
                </span>
                <button
                  onClick={() => setGain(5)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${gain === 5 ? "bg-white text-clinical-blue shadow-xs" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
                  title="5 mm/mV (0.5x)"
                >
                  5
                </button>
                <button
                  onClick={() => setGain(10)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${gain === 10 ? "bg-white text-clinical-blue shadow-xs" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
                  title="10 mm/mV (1x)"
                >
                  10
                </button>
                <button
                  onClick={() => setGain(20)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${gain === 20 ? "bg-white text-clinical-blue shadow-xs" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
                  title="20 mm/mV (2x)"
                >
                  20
                </button>
              </div>

              {/* Paper Speed Config */}
              <div className="flex items-center gap-1.5 bg-clinical-surface p-1 rounded-full border border-clinical-charcoal/5">
                <span className="text-[9px] font-bold text-clinical-charcoal/40 uppercase tracking-wider px-2 select-none">
                  Speed
                </span>
                <button
                  onClick={() => setPaperSpeed(12.5)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${paperSpeed === 12.5 ? "bg-white text-clinical-blue shadow-xs" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
                  title="12.5 mm/s"
                >
                  12.5
                </button>
                <button
                  onClick={() => setPaperSpeed(25)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${paperSpeed === 25 ? "bg-white text-clinical-blue shadow-xs" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
                  title="25 mm/s (1x)"
                >
                  25
                </button>
                <button
                  onClick={() => setPaperSpeed(50)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${paperSpeed === 50 ? "bg-white text-clinical-blue shadow-xs" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
                  title="50 mm/s (2x)"
                >
                  50
                </button>
              </div>

              {/* Playback Speed Multiplier */}
              <div className="flex items-center gap-1 bg-clinical-surface p-1 rounded-full border border-clinical-charcoal/5">
                <span className="text-[9px] font-bold text-clinical-charcoal/40 uppercase tracking-wider px-2 select-none">
                  Playback
                </span>
                <button
                  onClick={() => changeSpeed(1)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${playbackSpeed === 1 ? "bg-white text-clinical-blue shadow-xs" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
                  title="1x Speed"
                >
                  1x
                </button>
                <button
                  onClick={() => changeSpeed(2)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${playbackSpeed === 2 ? "bg-white text-clinical-blue shadow-xs" : "text-clinical-charcoal/60 hover:text-clinical-charcoal"}`}
                  title="2x Speed"
                >
                  2x
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </>
  );
};
