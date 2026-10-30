import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FILTERS_ALL_OFF } from '../core/algorithms/ecgFrameProcessor';
const harness = vi.hoisted(() => ({
  client: null as any,
  refresh: vi.fn(),
  api: vi.fn(async (_url?: string): Promise<any> => []),
}));
vi.mock('../application/context/AuthContext', () => ({
  useAuth: () => ({ identity: { profile_id: 'pat_A' } }),
}));
vi.mock('../application/hooks/useRecordingStatus', () => ({
  useRecordingStatus: () => ({
    isRecording: true,
    session: { session_id: 'ses_A', device_id: 'dev_A', state: 'recording' },
    refresh: harness.refresh,
  }),
}));
vi.mock('../config/api', () => ({ apiJson: harness.api }));
vi.mock('../data/network/websocketClient', () => ({
  ECGWebSocketClient: class {
    onMessage: any;
    onError: any;
    onOpen: any;
    lastCommand: any;
    constructor() {
      harness.client = this;
    }
    connect() {}
    disconnect() {}
    isConnected() {
      return true;
    }
    sendCommand(command: any) {
      this.lastCommand = command;
    }
  },
}));
import { useECGStream } from '../application/hooks/useECGStream';
function packet(offset: number, count = 25) {
  return {
    type: 'live_data',
    session_id: 'ses_A',
    device_id: 'dev_A',
    measurement_id: 'fra_A',
    frame_number: 4,
    start_time: 0.6,
    sampling_rate_hz: 250,
    sample_count: 50,
    sample_offset: offset,
    data_payload: {
      raw: {
        ch1: Array(count).fill(1),
        ch2: Array(count).fill(2),
        ch3: Array(count).fill(1),
      },
      classification_result: 'UNKNOWN',
    },
  };
}
describe('scoped ECG stream', () => {
  beforeEach(() => harness.api.mockClear());
  it('accepts consecutive chunks and preserves original frame time', () => {
    const { result } = renderHook(() =>
      useECGStream('ws://test', 'pat_A', FILTERS_ALL_OFF),
    );
    act(() => harness.client.onMessage(packet(0)));
    expect(result.current.heartRate).toBe('--');
    act(() => harness.client.onMessage(packet(25)));
    expect(result.current.paths.I).toHaveLength(50);
    expect(result.current.timeline[0].index).toBe(3);
    expect(result.current.timeline[0].timeStr).toBe('00:00.6');
  });
  it('rejects unrelated sessions and devices', () => {
    const { result } = renderHook(() =>
      useECGStream('ws://test', 'pat_A', FILTERS_ALL_OFF),
    );
    act(() => harness.client.onMessage({ ...packet(0), session_id: 'ses_B' }));
    expect(result.current.paths.I).toHaveLength(0);
    act(() => harness.client.onMessage({ ...packet(0), device_id: 'dev_B' }));
    expect(result.current.error).toContain('Perangkat');
  });
  it('requests recovery on a gap and uses absolute segment numbers', async () => {
    const { result } = renderHook(() =>
      useECGStream('ws://test', 'pat_A', FILTERS_ALL_OFF),
    );
    await act(async () => harness.client.onMessage(packet(25)));
    expect(harness.api).toHaveBeenCalledWith('/api/records/ses_A?latest=true');
    act(() => result.current.fetchSegment(93));
    expect(harness.client.lastCommand).toEqual({
      command: 'get_segment',
      index: 93,
    });
  });
  it('replaces an incomplete live frame with committed recovery data', async () => {
    harness.api.mockImplementation(async (url?: string) =>
      url?.includes('/frames?')
        ? {
            data: [
              {
                id: 'fra_A',
                frame_number: 4,
                start_time: 0.6,
                label: 'UNKNOWN',
              },
            ],
          }
        : [
            {
              id: 'fra_A',
              frame_number: 4,
              start_time: 0.6,
              sampling_rate_hz: 250,
              sample_count: 50,
              ecg: { samples: Array.from({ length: 50 }, () => [1, 2, 1]) },
              label: 'UNKNOWN',
            },
          ],
    );
    const { result } = renderHook(() =>
      useECGStream('ws://test', 'pat_A', FILTERS_ALL_OFF),
    );
    act(() => harness.client.onMessage(packet(0)));
    expect(result.current.paths.I).toHaveLength(25);
    await act(async () => {
      harness.client.onMessage(packet(40, 10));
    });
    expect(result.current.paths.I).toHaveLength(50);
  });
});
