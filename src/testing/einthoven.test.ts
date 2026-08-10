import { describe, it, expect } from 'vitest';
import { calculateEinthovenPoint, calculateEinthovenArray } from '../core/algorithms/einthoven';

describe('Einthoven calculations', () => {
  it('should correctly calculate a single point (Lead III, aVR, aVL, aVF)', () => {
    // Test case: Lead I = 1.0mV, Lead II = 2.0mV
    const result = calculateEinthovenPoint(1.0, 2.0);
    
    // Formula verification:
    // Lead III = Lead II - Lead I = 2.0 - 1.0 = 1.0
    expect(result.leadIII).toBe(1.0);
    
    // aVR = -(Lead I + Lead II) / 2 = -(1.0 + 2.0) / 2 = -1.5
    expect(result.aVR).toBe(-1.5);
    
    // aVL = Lead I - Lead II / 2 = 1.0 - 1.0 = 0.0
    expect(result.aVL).toBe(0.0);
    
    // aVF = Lead II - Lead I / 2 = 2.0 - 0.5 = 1.5
    expect(result.aVF).toBe(1.5);
  });

  it('should correctly calculate batch arrays', () => {
    const arrI = [1.0, 0.5];
    const arrII = [2.0, 1.5];
    
    const result = calculateEinthovenArray(arrI, arrII);
    
    expect(result.leadIII).toEqual([1.0, 1.0]);
    expect(result.aVR).toEqual([-1.5, -1.0]);
    expect(result.aVL).toEqual([0.0, -0.25]);
    expect(result.aVF).toEqual([1.5, 1.25]);
  });
});
