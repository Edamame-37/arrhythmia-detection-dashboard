import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ECGCanvas } from '../presentation/components/canvas/ECGCanvas';
import {
  renderFrameFromRaw,
  FILTERS_ALL_OFF,
  parsePathPoint,
} from '../core/algorithms/ecgFrameProcessor';
const { paths } = renderFrameFromRaw(
  { ch1: [0, 1, 0], ch2: [0, 2, 0], ch3: [0, 1, 0] },
  FILTERS_ALL_OFF,
);
describe('ECG physical calibration', () => {
  it.each([5, 10, 20])('1 mV uses the selected %i mm/mV gain', (gain) => {
    render(<ECGCanvas paths={paths} rPeaks={[]} gain={gain} pixelsPerMm={4} />);
    expect(screen.getByTestId('ecg-svg')).toHaveAttribute(
      'data-calibration-pulse-height-logical',
      String(gain * 8),
    );
    expect(screen.getByTestId('ecg-transform-I')).toHaveAttribute(
      'transform',
      expect.stringContaining('scale(1,' + gain / 10 + ')'),
    );
    expect(screen.queryByTestId('ecg-path-V1')).toBeNull();
  });
  it.each([12.5, 25, 50])(
    'applies %i mm/s once to waveform and marker',
    (paperSpeed) => {
      render(
        <ECGCanvas
          paths={paths}
          rPeaks={[{ x: 100, y: 160, yII: 160 }]}
          paperSpeed={paperSpeed}
        />,
      );
      expect(screen.getByTestId('ecg-transform-II')).toHaveAttribute(
        'transform',
        expect.stringContaining('scale(' + paperSpeed / 25 + ',1)'),
      );
      expect(screen.getByTestId('ecg-marker-II').parentElement).toBe(
        screen.getByTestId('ecg-path-II').parentElement,
      );
      expect(screen.getByTestId('ecg-svg')).toHaveAttribute(
        'data-calibration-pulse-width-logical',
        String(paperSpeed * 0.4 * 8),
      );
    },
  );
  it('preserves negative aVR polarity without a second inversion', () => {
    render(<ECGCanvas paths={paths} rPeaks={[]} />);
    expect(parsePathPoint(paths.aVR[1]).y).toBe(360);
    expect(
      screen.getByTestId('ecg-transform-aVR').getAttribute('transform'),
    ).toContain('scale(1,1)');
  });
});
