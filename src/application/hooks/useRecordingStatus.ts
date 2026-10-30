import { useCachedFetch } from './useCachedFetch';
import type { RecordingSession } from '../../core/types/apiTypes';
export function useRecordingStatus(patientId: string) {
  const response = useCachedFetch<{
    is_recording: boolean;
    session: RecordingSession | null;
  }>(patientId ? '/api/patients/' + patientId + '/recording-status' : null, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
  });
  return {
    isRecording: response.data?.is_recording ?? false,
    session: response.data?.session ?? null,
    isLoading: response.isLoading,
    error: response.error,
    refresh: response.mutate,
    setIsRecording: (_value: boolean) => {
      void response.mutate();
    },
  };
}
