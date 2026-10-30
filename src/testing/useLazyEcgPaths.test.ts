import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLazyEcgPaths } from '../application/hooks/useLazyEcgPaths';
describe('history reference coordinates', () => {
  it('does not prepend calibration points or rescale samples before the canvas', () => {
    const { result, rerender } = renderHook(
      ({ gain, speed }) =>
        useLazyEcgPaths([0, 1], [0, 2], [0, 1], gain, speed, false),
      { initialProps: { gain: 10, speed: 25 } },
    );
    const original = result.current;
    expect(original.I).toHaveLength(2);
    expect(original.I[1]).toBe('0.800,160.000');
    rerender({ gain: 20, speed: 50 });
    expect(result.current).toEqual(original);
    expect(original.V1).toEqual([]);
  });
  it('supports empty frames', () => {
    const { result } = renderHook(() => useLazyEcgPaths([], [], []));
    expect(result.current.I).toEqual([]);
  });
});
