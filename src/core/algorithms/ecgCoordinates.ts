export const REFERENCE_PIXELS_PER_MM = 8;
export const REFERENCE_PAPER_SPEED = 25;
export const REFERENCE_GAIN = 10;
export const CANVAS_CENTER_Y = 240;
export const LEAD_HEIGHT = 480;
export const CALIBRATION_DURATION = 0.4;
export const SUPPORTED_LEADS = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF'] as const;
export const timeToX = (seconds: number) =>
  seconds * REFERENCE_PAPER_SPEED * REFERENCE_PIXELS_PER_MM;
export const millivoltToY = (millivolt: number) =>
  CANVAS_CENTER_Y - millivolt * REFERENCE_GAIN * REFERENCE_PIXELS_PER_MM;
export const formatRecordingTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  return minutes + ':' + (seconds % 60).toFixed(1).padStart(4, '0');
};
