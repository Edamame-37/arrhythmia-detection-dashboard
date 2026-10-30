import { processEcgFrame } from '../core/algorithms/processEcgFrame';
import type {
  FrameRawSamples,
  StreamFilterConfig,
} from '../core/algorithms/ecgFrameProcessor';
self.onmessage = (
  event: MessageEvent<{
    id: number;
    raw: FrameRawSamples;
    filters: StreamFilterConfig;
  }>,
) => {
  const { id, raw, filters } = event.data;
  try {
    self.postMessage({ id, output: processEcgFrame(raw, filters) });
  } catch (problem) {
    self.postMessage({
      id,
      error:
        problem instanceof Error ? problem.message : 'Pemrosesan ECG gagal',
    });
  }
};
