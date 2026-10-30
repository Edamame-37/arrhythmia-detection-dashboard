import {
  renderFrameFromRaw,
  type FrameRawSamples,
  type StreamFilterConfig,
} from './ecgFrameProcessor';
import { calculateHeartRate } from './peakToPeak';
export function processEcgFrame(
  raw: FrameRawSamples,
  filters: StreamFilterConfig,
) {
  const rendered = renderFrameFromRaw(raw, filters);
  const rrIntervals = rendered.rPeaks
    .slice(1)
    .map((peak) => (peak.x - peak.prevX!) / 200);
  return { ...rendered, bpm: calculateHeartRate(rrIntervals), rrIntervals };
}
export type ProcessedEcgFrame = ReturnType<typeof processEcgFrame>;
