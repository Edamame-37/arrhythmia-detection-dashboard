import { describe, it, expect, beforeEach } from 'vitest';
import { PanTompkins } from '../core/algorithms/panTompkins';

describe('PanTompkins QRS Peak Detector', () => {
  let pt: PanTompkins;
  const fs = 250;

  beforeEach(() => {
    pt = new PanTompkins(fs);
  });

  it('should not detect peaks during warm-up phase (first fs samples)', () => {
    // Generate a massive peak during the first fs samples
    for (let i = 0; i < fs - 5; i++) {
      const val = i === 100 ? 5.0 : 0.0;
      const isPeak = pt.detectRealTime(val, i);
      expect(isPeak).toBe(false);
    }
  });

  it('should detect a clear QRS peak after the warm-up period', () => {
    // 1. Warm-up phase: Feed flat baseline to establish dynamic threshold
    for (let i = 0; i < fs; i++) {
      pt.detectRealTime(0.0, i);
    }

    // 2. Generate flat baseline
    let index = fs;
    for (let i = 0; i < 50; i++) {
      expect(pt.detectRealTime(0.0, index++)).toBe(false);
    }

    // 3. Generate a strong QRS-like pulse (sharp rise and fall)
    const isPeak1 = pt.detectRealTime(0.0, index++);
    const isPeak2 = pt.detectRealTime(1.0, index++);
    const isPeak3 = pt.detectRealTime(3.0, index++); // Sharp rise (large diff)
    const isPeak4 = pt.detectRealTime(0.0, index++); // Fall (large diff)
    
    expect(isPeak1 || isPeak2 || isPeak3 || isPeak4).toBe(true);

    // 4. Verify that immediate subsequent inputs are ignored due to the refractory period (0.3s * fs = 75 samples)
    for (let i = 0; i < 50; i++) {
      const isSecondaryPeak = pt.detectRealTime(3.0, index++);
      expect(isSecondaryPeak).toBe(false); // In refractory period
    }
  });
});
