import { useEffect, useMemo, useRef, useState } from 'react';
import {
  processEcgFrame,
  type ProcessedEcgFrame,
} from '../../core/algorithms/processEcgFrame';
import type {
  FrameRawSamples,
  StreamFilterConfig,
} from '../../core/algorithms/ecgFrameProcessor';
type Job = { id: number; raw: FrameRawSamples; filters: StreamFilterConfig };
type Result = {
  job: Job;
  output: ProcessedEcgFrame | null;
  error: string | null;
};
const EMPTY = processEcgFrame(
  { ch1: [], ch2: [], ch3: [] },
  {
    baselineBlocker: false,
    hfDenoise: false,
    bandpass: false,
    zScoreNorm: false,
  },
);
export function useEcgProcessing(
  raw: FrameRawSamples,
  filters: StreamFilterConfig,
) {
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const worker = useRef<Worker | null>(null);
  const pending = useRef<Job | null>(null);
  const running = useRef<Job | null>(null);
  const latest = useRef(0);
  const fallback = useMemo(
    () =>
      typeof Worker === 'undefined' ? processEcgFrame(raw, filters) : null,
    [raw, filters],
  );
  useEffect(() => {
    if (typeof Worker === 'undefined') return;
    const instance = new Worker(
      new URL('../../workers/ecg.worker.ts', import.meta.url),
      { type: 'module' },
    );
    worker.current = instance;
    instance.onmessage = (event) => {
      const job = running.current;
      if (job && event.data.id === job.id && job.id === latest.current)
        setResult({
          job,
          output: event.data.output || null,
          error: event.data.error || null,
        });
      running.current = null;
      if (pending.current) {
        const next = pending.current;
        pending.current = null;
        running.current = next;
        instance.postMessage(next);
      }
    };
    instance.onerror = () => {
      setFatalError('Worker ECG gagal. Muat ulang halaman.');
      instance.terminate();
      worker.current = null;
      running.current = null;
      pending.current = null;
    };
    return () => {
      worker.current = null;
      pending.current = null;
      running.current = null;
      instance.terminate();
    };
  }, []);
  useEffect(() => {
    if (!worker.current) return;
    const job = { id: ++latest.current, raw, filters };
    // At most one running job and one replacement; stale chunks cannot build a queue.
    if (running.current) pending.current = job;
    else {
      running.current = job;
      worker.current.postMessage(job);
    }
  }, [raw, filters]);
  const current =
    result?.job.raw === raw && result.job.filters === filters ? result : null;
  return {
    processed: fallback || current?.output || EMPTY,
    error: fatalError || current?.error || null,
  };
}
