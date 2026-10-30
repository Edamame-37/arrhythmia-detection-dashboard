import { MovingAverageFilter, IIRFilter } from './ecgFilters';
import { applyZScoreAndClip } from './zScore';
import { PanTompkins } from './panTompkins';
import {
  calculateBatchRRIntervals,
  calculateHeartRate,
  calculateRRMetrics,
  calculateSingleRRInterval,
} from './peakToPeak';
import { calculateEinthovenPoint } from './einthoven';
import { timeToX, millivoltToY } from './ecgCoordinates';
import type { ECGPaths, RPeakMarker } from '../types/ecgTypes';
export interface StreamFilterConfig {
  baselineBlocker: boolean;
  hfDenoise: boolean;
  bandpass: boolean;
  zScoreNorm: boolean;
}
export const FILTERS_ALL_OFF: StreamFilterConfig = {
  baselineBlocker: false,
  hfDenoise: false,
  bandpass: false,
  zScoreNorm: false,
};
export const FILTERS_CLINICAL_DEFAULT: StreamFilterConfig = {
  baselineBlocker: true,
  hfDenoise: true,
  bandpass: true,
  zScoreNorm: false,
};
export const TOTAL_FRAME_SAMPLES = 2500;
export const REFERENCE_PAPER_SPEED = 25;
export const CANVAS_CENTER_Y = 240;
export const MV_TO_PX = 80;
export const CALIBRATION_POINT_COUNT = 0;
export type FrameRawSamples = {
  ch1: number[];
  ch2: number[];
  ch3: number[];
  samplingRate?: number;
  startTime?: number;
};
export const emptyFrameRawSamples = (): FrameRawSamples => ({
  ch1: [],
  ch2: [],
  ch3: [],
});
export const isFilterPipelineActive = (config: StreamFilterConfig) =>
  Object.values(config).some(Boolean);
export const mapMillivoltToCanvasY = millivoltToY;
export const canvasXStep = (totalPoints = TOTAL_FRAME_SAMPLES) =>
  2000 / totalPoints;
export const parsePathPoint = (point: string) => {
  const [x, y] = point.split(',').map(Number);
  return { x, y };
};
export const emptyPaths = (): ECGPaths => ({
  I: [],
  II: [],
  III: [],
  aVR: [],
  aVL: [],
  aVF: [],
  V1: [],
});
export function extractRawFromPayload(payload: any): FrameRawSamples {
  const source = payload?.payload || payload || {};
  const raw = source.raw;
  const samples = source.ecg?.samples;
  const samplingRate = Number(
    source.sampling_rate_hz ?? payload?.sampling_rate_hz ?? 250,
  );
  if (
    !Number.isFinite(samplingRate) ||
    samplingRate < 100 ||
    samplingRate > 1000
  )
    throw new Error('Invalid sampling rate');
  let ch1: number[], ch2: number[], ch3: number[];
  if (Array.isArray(raw?.ch1)) {
    ch1 = raw.ch1;
    ch2 = raw.ch2;
    ch3 = raw.ch3;
  } else if (Array.isArray(samples)) {
    ch1 = samples.map((row) => row[0]);
    ch2 = samples.map((row) => row[1]);
    ch3 = samples.map((row) => row[2]);
  } else return { ...emptyFrameRawSamples(), samplingRate };
  if (
    ![ch1, ch2, ch3].every(
      (channel) =>
        Array.isArray(channel) &&
        channel.length === ch1.length &&
        channel.every(Number.isFinite),
    )
  )
    throw new Error('Invalid ECG channels');
  return {
    ch1: [...ch1],
    ch2: [...ch2],
    ch3: [...ch3],
    samplingRate,
    startTime: Number(source.start_time ?? payload?.start_time ?? 0),
  };
}
export function applyConfiguredFiltersToFrame(
  raw: FrameRawSamples,
  config: StreamFilterConfig,
) {
  const samplingRate = raw.samplingRate ?? 250;
  const channels = [raw.ch1, raw.ch2, raw.ch3];
  const filtered = channels.map((channel) => [...channel]);
  const baseline = [0, 0, 0];
  const baselineAlpha = 1 - Math.exp(-1 / (samplingRate * 0.8));
  const averages = channels.map(
    () =>
      new MovingAverageFilter(Math.max(1, Math.round(samplingRate * 0.024))),
  );
  const bandpasses = channels.map(() => new IIRFilter(samplingRate));
  for (let index = 0; index < raw.ch1.length; index++) {
    let values = [
      raw.ch1[index],
      raw.ch2[index] ?? raw.ch1[index],
      raw.ch3[index] ?? raw.ch2[index] - raw.ch1[index],
    ];
    if (config.baselineBlocker)
      values = values.map((value, channel) => {
        baseline[channel] += baselineAlpha * (value - baseline[channel]);
        return value - baseline[channel];
      });
    values.forEach((value, channel) => {
      if (config.hfDenoise) value = averages[channel].process(value);
      if (config.bandpass) value = bandpasses[channel].process(value);
      filtered[channel][index] = value;
    });
  }
  const [I, II, III] = config.zScoreNorm
    ? filtered.map((channel) => applyZScoreAndClip(channel))
    : filtered;
  return { I, II, III };
}
export function buildCanvasPathsFromLeads(
  leads: { I: number[]; II: number[]; III: number[] },
  _totalPoints = TOTAL_FRAME_SAMPLES,
  samplingRate = 250,
): ECGPaths {
  const paths = emptyPaths();
  leads.I.forEach((value, index) => {
    const augmented = calculateEinthovenPoint(value, leads.II[index]);
    const values = {
      I: value,
      II: leads.II[index],
      III: leads.III[index],
      aVR: augmented.aVR,
      aVL: augmented.aVL,
      aVF: augmented.aVF,
    };
    for (const key of Object.keys(values) as (keyof typeof values)[])
      paths[key].push(
        timeToX(index / samplingRate).toFixed(3) +
          ',' +
          millivoltToY(values[key]).toFixed(3),
      );
  });
  return paths;
}
export function detectPeakIndices(
  leadII: number[],
  samplingRate = 250,
): number[] {
  const detector = new PanTompkins(samplingRate);
  const peaks: number[] = [];
  const radius = Math.round(samplingRate * 0.04);
  leadII.forEach((value, index) => {
    if (!detector.detectRealTime(value, index)) return;
    let peak = index;
    for (
      let candidate = Math.max(0, index - radius);
      candidate <= Math.min(leadII.length - 1, index + radius);
      candidate++
    ) {
      if (Math.abs(leadII[candidate]) > Math.abs(leadII[peak]))
        peak = candidate;
    }
    if (
      peaks.length === 0 ||
      peak - peaks[peaks.length - 1] > samplingRate * 0.3
    )
      peaks.push(peak);
  });
  return peaks;
}
export function buildRPeakMarkersFromLeads(
  leads: { I: number[]; II: number[]; III: number[] },
  samplingRate = 250,
  _totalPoints = TOTAL_FRAME_SAMPLES,
): RPeakMarker[] {
  const peaks = detectPeakIndices(leads.II, samplingRate);
  return peaks.map((index, position) => {
    const derived = calculateEinthovenPoint(leads.I[index], leads.II[index]);
    const marker: RPeakMarker = {
      x: timeToX(index / samplingRate),
      y: millivoltToY(leads.II[index]),
      yI: millivoltToY(leads.I[index]),
      yII: millivoltToY(leads.II[index]),
      yIII: millivoltToY(leads.III[index]),
      yaVR: millivoltToY(derived.aVR),
      yaVL: millivoltToY(derived.aVL),
      yaVF: millivoltToY(derived.aVF),
    };
    if (position > 0) {
      const interval = calculateSingleRRInterval(
        peaks[position - 1],
        index,
        samplingRate,
      );
      Object.assign(marker, calculateRRMetrics(interval), {
        rrText: interval + 's',
        prevX: timeToX(peaks[position - 1] / samplingRate),
      });
    }
    return marker;
  });
}
export function calculateFrameHeartRate(
  raw: FrameRawSamples,
  config: StreamFilterConfig,
  samplingRate = raw.samplingRate ?? 250,
) {
  if (!raw.ch1.length || !raw.ch2.length)
    return { bpm: 0, rrIntervals: [] as number[] };
  const filtered = applyConfiguredFiltersToFrame(
    { ...raw, samplingRate },
    config,
  );
  const rrIntervals = calculateBatchRRIntervals(
    detectPeakIndices(filtered.II, samplingRate),
    samplingRate,
  );
  return { bpm: calculateHeartRate(rrIntervals), rrIntervals };
}
export function renderFrameFromRaw(
  raw: FrameRawSamples,
  config: StreamFilterConfig,
  totalPoints = TOTAL_FRAME_SAMPLES,
) {
  const rate = raw.samplingRate ?? 250;
  const leads = applyConfiguredFiltersToFrame(raw, config);
  return {
    leads,
    paths: buildCanvasPathsFromLeads(leads, totalPoints, rate),
    rPeaks: buildRPeakMarkersFromLeads(leads, rate, totalPoints),
  };
}
