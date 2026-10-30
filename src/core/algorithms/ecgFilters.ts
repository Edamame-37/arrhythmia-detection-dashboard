export class MovingAverageFilter {
  private buffer: number[] = [];
  private size: number;
  constructor(size = 5) {
    this.size = size;
  }
  process(value: number): number {
    this.buffer.push(value);
    if (this.buffer.length > this.size) this.buffer.shift();
    return (
      this.buffer.reduce((total, sample) => total + sample, 0) /
      this.buffer.length
    );
  }
  reset() {
    this.buffer = [];
  }
}
class Biquad {
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;
  private coefficients: [number, number, number, number, number];
  constructor(
    kind: 'highpass' | 'lowpass',
    cutoff: number,
    samplingRate: number,
  ) {
    const omega = (2 * Math.PI * cutoff) / samplingRate;
    const cosine = Math.cos(omega);
    const alpha = Math.sin(omega) / Math.SQRT2;
    const denominator = 1 + alpha;
    const numerator = kind === 'lowpass' ? (1 - cosine) / 2 : (1 + cosine) / 2;
    this.coefficients = [
      numerator / denominator,
      ((kind === 'lowpass' ? 2 : -2) * numerator) / denominator,
      numerator / denominator,
      (-2 * cosine) / denominator,
      (1 - alpha) / denominator,
    ];
  }
  process(value: number): number {
    const [b0, b1, b2, a1, a2] = this.coefficients;
    const output =
      b0 * value + b1 * this.x1 + b2 * this.x2 - a1 * this.y1 - a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = value;
    this.y2 = this.y1;
    this.y1 = output;
    return output;
  }
  reset() {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
  }
}
/** Causal second-order Butterworth high-pass and low-pass sections.
 * Each cutoff is approximately -3 dB. This filter is not zero-phase. */
export class IIRFilter {
  private highpass: Biquad;
  private lowpass: Biquad;
  constructor(samplingRate = 250) {
    if (!Number.isFinite(samplingRate) || samplingRate < 100)
      throw new Error('Bandpass requires sampling rate >= 100 Hz');
    this.highpass = new Biquad('highpass', 0.5, samplingRate);
    this.lowpass = new Biquad('lowpass', 40, samplingRate);
  }
  process(value: number) {
    return this.lowpass.process(this.highpass.process(value));
  }
  reset() {
    this.highpass.reset();
    this.lowpass.reset();
  }
}
export interface FilterStates {
  sanitize: boolean;
  baseline: boolean;
  denoise: boolean;
  bandpass: boolean;
  normalization: boolean;
}
export const DEFAULT_FILTERS: FilterStates = {
  sanitize: true,
  baseline: true,
  denoise: true,
  bandpass: false,
  normalization: false,
};
