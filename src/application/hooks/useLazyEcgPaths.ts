import { useMemo } from 'react';
import {
  DEFAULT_FILTERS,
  type FilterStates,
} from '../../core/algorithms/ecgFilters';
import {
  renderFrameFromRaw,
  emptyPaths,
} from '../../core/algorithms/ecgFrameProcessor';
export const useLazyEcgPaths = (
  samples: number[] | number[][],
  ch2: number[],
  ch3: number[],
  _gain = 10,
  _paperSpeed = 25,
  isFilterOn = true,
  activeFilters: FilterStates = DEFAULT_FILTERS,
  samplingRate = 250,
) =>
  useMemo(() => {
    if (!samples?.length) return emptyPaths();
    const matrix = Array.isArray(samples[0]);
    const raw = {
      ch1: matrix
        ? (samples as number[][]).map((row) => row[0])
        : (samples as number[]),
      ch2: matrix ? (samples as number[][]).map((row) => row[1]) : ch2,
      ch3: matrix ? (samples as number[][]).map((row) => row[2]) : ch3,
      samplingRate,
    };
    return renderFrameFromRaw(raw, {
      baselineBlocker: isFilterOn && activeFilters.baseline,
      hfDenoise: isFilterOn && activeFilters.denoise,
      bandpass: isFilterOn && activeFilters.bandpass,
      zScoreNorm: isFilterOn && activeFilters.normalization,
    }).paths;
  }, [samples, ch2, ch3, isFilterOn, activeFilters, samplingRate]);
