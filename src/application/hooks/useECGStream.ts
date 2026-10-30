import { useEcgProcessing } from './useEcgProcessing';
import { useState, useRef, useCallback, useEffect } from 'react';
import { ECGWebSocketClient } from '../../data/network/websocketClient';
import { apiJson } from '../../config/api';
import { useRecordingStatus } from './useRecordingStatus';
import { useAuth } from '../context/AuthContext';
import {
  extractRawFromPayload,
  emptyPaths,
  FILTERS_CLINICAL_DEFAULT,
  type FrameRawSamples,
  type StreamFilterConfig,
} from '../../core/algorithms/ecgFrameProcessor';
import {
  evaluateIrregularity,
  generateClinicalExplanation,
  isNormalClassification,
  type ClinicalExplanation,
} from '../../core/clinical/ruleBasedEngine';
import { formatRecordingTime } from '../../core/algorithms/ecgCoordinates';
import type {
  ECGPaths,
  RPeakMarker,
  TimelineEvent,
  ServerMessage,
  DevicePrediction,
  DeviceSystem,
  DeviceNetwork,
  DeviceStressTest,
} from '../../core/types/ecgTypes';
export type { StreamFilterConfig };
interface Snapshot {
  raw: FrameRawSamples;
  metadata: any;
  paths: ECGPaths;
  rPeaks: RPeakMarker[];
  heartRate: number | string;
  clinicalStatus: ClinicalExplanation | null;
}
const initialSnapshot = (): Snapshot => ({
  raw: { ch1: [], ch2: [], ch3: [] },
  metadata: {},
  paths: emptyPaths(),
  rPeaks: [],
  heartRate: '--',
  clinicalStatus: null,
});
export interface UseECGStreamReturn {
  isRecording: boolean;
  paths: ECGPaths;
  rPeaks: RPeakMarker[];
  heartRate: number | string;
  clinicalStatus: ClinicalExplanation | null;
  timeline: TimelineEvent[];
  startStream: () => void;
  stopStream: () => void;
  fetchSummary: () => void;
  fetchSegment: (index: number) => void;
  system: DeviceSystem | null;
  network: DeviceNetwork | null;
  prediction: DevicePrediction | null;
  stressTest: DeviceStressTest | null;
  createdAt: string | null;
  receivedAt: string | null;
  deviceId: string;
  sessionId: string;
  rawClassification: string | null;
  isViewingHistory: boolean;
  resumeRealTimeStream: () => void;
  segment: any;
  session: ReturnType<typeof useRecordingStatus>['session'];
  error: string | null;
}
export const useECGStream = (
  endpoint: string,
  patientIdOrFilter: string | StreamFilterConfig,
  filterConfigArg: StreamFilterConfig = FILTERS_CLINICAL_DEFAULT,
): UseECGStreamReturn => {
  const { identity } = useAuth();
  const patientId =
    typeof patientIdOrFilter === 'string'
      ? patientIdOrFilter
      : identity?.profile_id || '';
  const filterConfig =
    typeof patientIdOrFilter === 'string' ? filterConfigArg : patientIdOrFilter;
  const status = useRecordingStatus(patientId);
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isViewingHistory, setViewingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const live = useRef<Snapshot>(initialSnapshot());
  const reviewing = useRef(false);
  const socket = useRef<ECGWebSocketClient | null>(null);
  const activeSessionId = status.session?.session_id || '';
  const [lastSession, setLastSession] = useState('');
  const refreshStatus = status.refresh;
  const activeDevice = status.session?.device_id;
  const makeSnapshot = useCallback(
    (raw: FrameRawSamples, metadata: any, complete: boolean): Snapshot => {
      return {
        raw,
        metadata: { ...metadata, complete },
        paths: emptyPaths(),
        rPeaks: [],
        heartRate: '--',
        clinicalStatus: null,
      };
    },
    [],
  );
  const viewHistorical = useCallback(
    (payload: any) => {
      const raw = extractRawFromPayload(payload);
      reviewing.current = true;
      setViewingHistory(true);
      setSnapshot(makeSnapshot(raw, payload, true));
    },
    [makeSnapshot],
  );
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Patient changes discard the previous patient's waveform.
    setSnapshot(initialSnapshot());
    setTimeline([]);
    setLastSession('');
    setViewingHistory(false);
    setError(null);
    live.current = initialSnapshot();
    reviewing.current = false;
  }, [patientId]);
  useEffect(() => {
    if (!activeSessionId) {
      socket.current?.disconnect();
      return;
    }
    // oxlint-disable-next-line react/set-state-in-effect -- Server session changes reset the external socket subscription.
    setLastSession(activeSessionId);
    const client = new ECGWebSocketClient(endpoint, activeSessionId);
    socket.current = client;
    live.current = initialSnapshot();
    setSnapshot(initialSnapshot());
    setTimeline([]);
    reviewing.current = false;
    setViewingHistory(false);
    setError(null);
    let disposed = false;
    const recover = async () => {
      try {
        const [records, metadata] = await Promise.all([
          apiJson<any[]>('/api/records/' + activeSessionId + '?latest=true'),
          apiJson<{ data: any[] }>(
            '/api/sessions/' +
              activeSessionId +
              '/frames?latest=true&limit=100',
          ),
        ]);
        if (disposed) return;
        const events = (metadata.data || records).map((record) => ({
          index: Number(record.frame_number) - 1,
          timeStr: formatRecordingTime(record.start_time),
          isAnomaly:
            record.label !== 'UNKNOWN' && !isNormalClassification(record.label),
          classResult: record.label || 'UNKNOWN',
        }));
        setTimeline((previous) =>
          [
            ...new Map(
              [...previous, ...events].map((event) => [event.index, event]),
            ).values(),
          ]
            .sort((left, right) => left.index - right.index)
            .slice(-300),
        );
        const latest = records.at(-1);
        if (
          latest &&
          (!live.current.raw.ch1.length ||
            Number(latest.frame_number) >=
              Number(live.current.metadata.frame_number || 0))
        ) {
          live.current = makeSnapshot(
            extractRawFromPayload(latest),
            latest,
            true,
          );
          if (!reviewing.current) setSnapshot(live.current);
          setError(null);
        }
      } catch (problem) {
        if (!disposed)
          setError(
            problem instanceof Error
              ? problem.message
              : 'Pemulihan rekaman gagal',
          );
      }
    };
    client.onOpen = () => {
      setError(null);
      void recover();
    };
    client.onError = (problem) =>
      setError(
        typeof problem === 'string' ? problem : 'Koneksi streaming terganggu',
      );
    client.onMessage = (message: ServerMessage) => {
      const packet = message as ServerMessage & {
        sample_offset?: number;
        sample_count?: number;
        sampling_rate_hz?: number;
        start_time?: number;
        duration_s?: number;
        frame_number?: number;
      };
      if (packet.session_id !== activeSessionId) return;
      if (
        activeDevice &&
        packet.device_id &&
        packet.device_id !== activeDevice
      ) {
        setError('Perangkat stream tidak sesuai');
        return;
      }
      if (packet.type === 'status') {
        void refreshStatus();
        return;
      }
      if (packet.type === 'segment_data' && packet.data_payload) {
        viewHistorical({
          ...packet.data_payload,
          sampling_rate_hz: packet.sampling_rate_hz,
          start_time: packet.start_time,
        });
        return;
      }
      if (packet.type !== 'live_data' || !packet.data_payload) return;
      if (
        Number(packet.frame_number) <
        Number(live.current.metadata.frame_number || 0)
      )
        return;
      try {
        const rate = packet.sampling_rate_hz;
        const total = packet.sample_count;
        const offset = packet.sample_offset;
        if (
          !rate ||
          rate < 100 ||
          rate > 1000 ||
          !Number.isInteger(total) ||
          !total ||
          total > 30000 ||
          !Number.isInteger(offset) ||
          offset! < 0 ||
          offset! >= total ||
          !Number.isInteger(packet.frame_number) ||
          !packet.measurement_id
        )
          throw new Error('Metadata frame tidak valid');
        const incoming = extractRawFromPayload({
          ...packet.data_payload,
          sampling_rate_hz: rate,
          start_time: packet.start_time,
        });
        if (!incoming.ch1.length || incoming.ch1.length > total - offset!)
          throw new Error('Ukuran chunk tidak sesuai frame');
        const sameFrame =
          live.current.metadata.measurement_id === packet.measurement_id ||
          live.current.metadata.id === packet.measurement_id;
        const existing = sameFrame
          ? live.current.raw
          : {
              ch1: [],
              ch2: [],
              ch3: [],
              samplingRate: rate,
              startTime: packet.start_time,
            };
        if (existing.samplingRate !== rate)
          throw new Error('Sampling rate berubah di dalam frame');
        if (offset! < existing.ch1.length) return;
        if (offset !== existing.ch1.length) {
          void recover();
          throw new Error('Ada sampel terlewat; memulihkan rekaman');
        }
        const raw = {
          ch1: [...existing.ch1, ...incoming.ch1],
          ch2: [...existing.ch2, ...incoming.ch2],
          ch3: [...existing.ch3, ...incoming.ch3],
          samplingRate: rate,
          startTime: packet.start_time,
        };
        const complete = raw.ch1.length === total;
        const metadata = {
          ...packet,
          ...packet.data_payload,
          received_at: new Date().toISOString(),
          raw: undefined,
          sample_count: total,
          sampling_rate_hz: rate,
          start_time: packet.start_time,
        };
        const next = makeSnapshot(raw, metadata, complete);
        live.current = next;
        if (!reviewing.current) setSnapshot(next);
        if (complete) {
          const index = (packet.frame_number || 1) - 1;
          const label =
            metadata.prediction_details?.label ||
            metadata.classification_result ||
            'UNKNOWN';
          setTimeline((previous) =>
            [
              ...previous.filter((event) => event.index !== index),
              {
                index,
                timeStr: formatRecordingTime(packet.start_time || 0),
                isAnomaly:
                  label !== 'UNKNOWN' && !isNormalClassification(label),
                classResult: label,
              },
            ].slice(-300),
          );
        }
      } catch (problem) {
        setError(problem instanceof Error ? problem.message : 'Frame ditolak');
      }
    };
    client.connect();
    return () => {
      disposed = true;
      client.disconnect();
      socket.current = null;
    };
  }, [
    activeSessionId,
    endpoint,
    activeDevice,
    refreshStatus,
    makeSnapshot,
    viewHistorical,
  ]);
  const resumeRealTimeStream = useCallback(() => {
    reviewing.current = false;
    setViewingHistory(false);
    setSnapshot(live.current);
  }, []);
  const fetchSegment = (index: number) => {
    if (socket.current?.isConnected())
      socket.current.sendCommand({ command: 'get_segment', index });
    else if (lastSession)
      void apiJson<any[]>(
        '/api/records/' + lastSession + '?frame_number=' + (index + 1),
      )
        .then((records) => {
          const frame = records.find(
            (record) => Number(record.frame_number) === index + 1,
          );
          if (frame) viewHistorical(frame);
          else throw new Error('Frame tidak tersedia');
        })
        .catch((problem) => setError(problem.message));
  };
  const metadata = snapshot.metadata;
  const { processed, error: processingError } = useEcgProcessing(
    snapshot.raw,
    filterConfig,
  );
  const clinicalStatus = metadata.complete
    ? generateClinicalExplanation(
        metadata.prediction_details?.label ||
          metadata.prediction?.label ||
          metadata.classification_result ||
          metadata.label ||
          'UNKNOWN',
        !isNormalClassification(
          metadata.prediction_details?.label ||
            metadata.prediction?.label ||
            metadata.classification_result ||
            metadata.label,
        ),
        evaluateIrregularity(processed.rrIntervals),
      )
    : null;
  return {
    isRecording: status.isRecording,
    paths: processed.paths,
    rPeaks: processed.rPeaks,
    heartRate: metadata.complete ? processed.bpm || '--' : '--',
    clinicalStatus,
    timeline,
    startStream: () => {
      void status.refresh();
    },
    stopStream: () => {
      void status.refresh();
    },
    fetchSummary: () => {
      void status.refresh();
    },
    fetchSegment,
    system: metadata.system || null,
    network: metadata.network || null,
    prediction: metadata.prediction_details || metadata.prediction || null,
    stressTest: metadata.stress_test || null,
    createdAt: metadata.timestamp || metadata.created_at || null,
    receivedAt: metadata.received_at || null,
    deviceId: status.session?.device_id || '',
    sessionId: activeSessionId || lastSession,
    rawClassification:
      metadata.classification_result ||
      metadata.prediction?.label ||
      metadata.label ||
      null,
    isViewingHistory,
    resumeRealTimeStream,
    segment: {
      payload: { ...metadata, raw: snapshot.raw },
      rPeaks: processed.rPeaks,
    },
    session: status.session,
    error: error || processingError || status.error?.message || null,
  };
};
