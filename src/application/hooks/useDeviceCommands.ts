import { useRef, useState } from 'react';
import { apiJson, ApiError } from '../../config/api';
export function useDeviceCommands() {
  const pendingKey = useRef<{ signature: string; key: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendCommand = async (
    deviceId: string,
    command: 'START' | 'STOP',
    patientId: string,
    sessionId?: string,
  ) => {
    const signature = JSON.stringify([deviceId, command, patientId, sessionId]);
    if (pendingKey.current?.signature !== signature)
      pendingKey.current = { signature, key: crypto.randomUUID() };
    setBusy(true);
    setError(null);
    try {
      const response = await apiJson<{
        success: boolean;
        session_id: string;
        state: string;
      }>('/api/devices/' + deviceId + '/command', {
        method: 'POST',
        headers: { 'Idempotency-Key': pendingKey.current.key },
        body: JSON.stringify({
          command,
          patient_id: patientId,
          session_id: sessionId || undefined,
        }),
      });
      pendingKey.current = null;
      return response;
    } catch (problem) {
      if (
        problem instanceof ApiError &&
        problem.status >= 400 &&
        problem.status < 500
      )
        pendingKey.current = null;
      setError(problem instanceof Error ? problem.message : 'Perintah gagal');
      throw problem;
    } finally {
      setBusy(false);
    }
  };
  return { sendCommand, busy, error };
}
