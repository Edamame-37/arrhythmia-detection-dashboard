import { describe, it, expect } from 'vitest';
import { IIRFilter } from '../core/algorithms/ecgFilters';
import {
  renderFrameFromRaw,
  FILTERS_ALL_OFF,
  parsePathPoint,
  calculateFrameHeartRate,
} from '../core/algorithms/ecgFrameProcessor';
import {
  evaluateIrregularity,
  generateClinicalExplanation,
  isNormalClassification,
} from '../core/clinical/ruleBasedEngine';
import { readStored } from '../core/utils/storage';
describe('audit ECG regressions', () => {
  it.each(['Non Aritmia', ' non   aritmia ', 'Non Arrhythmia', 'NORMAL', 'norm', 'NSR'])(
    'recognizes historical normal label %s without rewriting the source label',
    (label) => {
      expect(isNormalClassification(label)).toBe(true);
      expect(
        generateClinicalExplanation(
          label,
          !isNormalClassification(label),
          evaluateIrregularity([0.8, 0.8, 0.8]),
        ).isAnomaly,
      ).toBe(false);
      expect(
        generateClinicalExplanation(
          label,
          !isNormalClassification(label),
          evaluateIrregularity([0.4, 0.4, 0.4]),
        ).isAnomaly,
      ).toBe(true);
    },
  );
  it.each(['AF', 'UNKNOWN', '', undefined])('does not invent a normal label for %s', (label) => {
    expect(isNormalClassification(label)).toBe(false);
  });
  it.each([125, 250, 500])(
    'preserves sampling rate %i and physical units',
    (samplingRate) => {
      const raw = {
        ch1: Array(samplingRate + 1).fill(1),
        ch2: Array(samplingRate + 1).fill(2),
        ch3: Array(samplingRate + 1).fill(1),
        samplingRate,
      };
      const { paths } = renderFrameFromRaw(raw, FILTERS_ALL_OFF);
      expect(parsePathPoint(paths.I[samplingRate]).x).toBe(200);
      expect(parsePathPoint(paths.I[0]).y).toBe(160);
      expect(calculateFrameHeartRate(raw, FILTERS_ALL_OFF).bpm).toBe(0);
    },
  );
  it.each([125, 250, 500])(
    'bandpass at %i Hz passes 10Hz and attenuates DC/80Hz',
    (rate) => {
      const rms = (hz: number) => {
        const filter = new IIRFilter(rate);
        let power = 0;
        for (let i = 0; i < rate * 12; i++) {
          const output = filter.process(
            Math.cos((2 * Math.PI * hz * i) / rate),
          );
          if (i >= rate * 8) power += output * output;
        }
        return Math.sqrt(power / (rate * 4));
      };
      expect(rms(10)).toBeGreaterThan(0.6);
      expect(rms(0)).toBeLessThan(0.01);
      if (rate >= 250) expect(rms(80)).toBeLessThan(0.17);
    },
  );
  it('keeps insufficient and unknown distinct and uses either alarm source', () => {
    expect(
      generateClinicalExplanation('NORM', false, evaluateIrregularity([]))
        .severity,
    ).toBe('INSUFFICIENT');
    expect(
      generateClinicalExplanation(
        'UNKNOWN',
        false,
        evaluateIrregularity([0.8, 0.8, 0.8]),
      ).severity,
    ).toBe('WARNING');
    expect(
      generateClinicalExplanation(
        'NORM',
        false,
        evaluateIrregularity([0.4, 0.4, 0.4]),
      ).isAnomaly,
    ).toBe(true);
    expect(
      generateClinicalExplanation(
        'AF',
        true,
        evaluateIrregularity([0.8, 0.8, 0.8]),
      ).isAnomaly,
    ).toBe(true);
    expect(evaluateIrregularity([0.8, 0.8]).qtcMs).toBeNull();
  });
  it('recovers from corrupt persistent JSON', () => {
    localStorage.setItem('bad', '{');
    expect(readStored(localStorage, 'bad', false)).toBe(false);
    expect(localStorage.getItem('bad')).toBeNull();
  });
});
