import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEcgProcessing } from '../application/hooks/useEcgProcessing';
import { FILTERS_ALL_OFF } from '../core/algorithms/ecgFrameProcessor';
import { processEcgFrame } from '../core/algorithms/processEcgFrame';
afterEach(() => vi.unstubAllGlobals());
describe('bounded ECG worker', () => {
  it('keeps one running job and replaces pending chunks with the newest', () => {
    let instance: any;
    class FakeWorker {
      onmessage: any;
      onerror: any;
      messages: any[] = [];
      terminate = vi.fn();
      constructor() {
        // oxlint-disable-next-line typescript/no-this-alias -- The test harness delivers worker messages in a controlled order.
        instance = this;
      }
      postMessage(job: any) {
        this.messages.push(job);
      }
    }
    vi.stubGlobal('Worker', FakeWorker);
    const raw = (value: number) => ({
      ch1: [value],
      ch2: [value],
      ch3: [0],
      samplingRate: 250,
    });
    const first = raw(1),
      second = raw(2),
      third = raw(3);
    const { result, rerender, unmount } = renderHook(
      ({ samples }) => useEcgProcessing(samples, FILTERS_ALL_OFF),
      { initialProps: { samples: first } },
    );
    rerender({ samples: second });
    rerender({ samples: third });
    expect(instance.messages).toHaveLength(1);
    act(() =>
      instance.onmessage({
        data: {
          id: instance.messages[0].id,
          output: processEcgFrame(first, FILTERS_ALL_OFF),
        },
      }),
    );
    expect(instance.messages).toHaveLength(2);
    expect(instance.messages[1].raw).toBe(third);
    expect(result.current.processed.paths.I).toHaveLength(0);
    act(() =>
      instance.onmessage({
        data: {
          id: instance.messages[1].id,
          output: processEcgFrame(third, FILTERS_ALL_OFF),
        },
      }),
    );
    expect(result.current.processed.paths.I).toHaveLength(1);
    unmount();
    expect(instance.terminate).toHaveBeenCalledOnce();
  });
});
