import { useMemo, useState } from 'react';
import { useCachedFetch } from './useCachedFetch';
import {
  calculateFrameHeartRate,
  extractRawFromPayload,
  FILTERS_CLINICAL_DEFAULT,
  type StreamFilterConfig,
} from '../../core/algorithms/ecgFrameProcessor';
import {
  generateClinicalExplanation,
  evaluateIrregularity,
  isNormalClassification,
} from '../../core/clinical/ruleBasedEngine';
export function useSessionReview(sessionId: string) {
  const [requestedId, setSelectedId] = useState('');
  const [filters, setFilters] = useState<StreamFilterConfig>(
    FILTERS_CLINICAL_DEFAULT,
  );
  const [page, setPage] = useState(1);
  const metadata = useCachedFetch<{
    data: any[];
    pagination: { total: number };
  }>(
    sessionId
      ? '/api/sessions/' + sessionId + '/frames?page=' + page + '&limit=50'
      : null,
  );
  const session = useCachedFetch<any>(
    sessionId ? '/api/sessions/' + sessionId : null,
  );
  const frames = useMemo(() => metadata.data?.data || [], [metadata.data]);
  const selectedId = frames.some((frame) => frame.id === requestedId)
    ? requestedId
    : frames[0]?.id || '';
  const recording = useCachedFetch<any[]>(
    sessionId && selectedId
      ? '/api/records/' +
          sessionId +
          '?frame_id=' +
          encodeURIComponent(selectedId)
      : null,
  );
  const current = useMemo(() => {
    const payload = recording.data?.find((frame) => frame.id === selectedId);
    if (!payload) return null;
    const raw = extractRawFromPayload(payload);
    const metrics = calculateFrameHeartRate(raw, filters);
    const classification =
      payload.label || payload.prediction?.label || 'UNKNOWN';
    return {
      payload,
      raw,
      rPeaks: [],
      heartRate: metrics.bpm || '--',
      dbId: payload.id,
      startTime: payload.start_time,
      endTime: payload.end_time,
      isAnomaly:
        !isNormalClassification(classification) && classification !== 'UNKNOWN',
      classification,
      clinicalStatus: generateClinicalExplanation(
        classification,
        !isNormalClassification(classification),
        evaluateIrregularity(metrics.rrIntervals),
      ),
    };
  }, [recording.data, selectedId, filters]);
  const refresh = async () => {
    await Promise.all([
      metadata.mutate(),
      recording.mutate(),
      session.mutate(),
    ]);
  };
  return {
    frames,
    page,
    setPage,
    total: metadata.data?.pagination.total || 0,
    selectedId,
    setSelectedId,
    current,
    session: session.data,
    setFilters,
    refresh,
    loading: metadata.isLoading || recording.isLoading,
    error: metadata.error || recording.error || session.error,
  };
}
