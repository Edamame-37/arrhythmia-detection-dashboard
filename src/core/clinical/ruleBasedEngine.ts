export interface ClinicalExplanation {
  isAnomaly: boolean;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'INSUFFICIENT';
  fullExplanation: string;
}
export interface RuleBasedResult {
  valid: boolean;
  hr: number;
  rrAvgMs: number;
  rmssdMs: number;
  qtcMs: null;
  events: string[];
  isIrregular: boolean;
}
export const isNormalClassification = (label: string | null | undefined) =>
  ['NORMAL', 'NORM', 'NSR', 'NON ARRHYTHMIA'].includes(
    (label || '').toUpperCase(),
  );
export function evaluateIrregularity(intervals: number[]): RuleBasedResult {
  const validIntervals = intervals.filter(
    (interval) => Number.isFinite(interval) && interval > 0,
  );
  if (validIntervals.length < 2 || validIntervals.length !== intervals.length) {
    return {
      valid: false,
      hr: 0,
      rrAvgMs: 0,
      rmssdMs: 0,
      qtcMs: null,
      events: ['Menganalisis...'],
      isIrregular: false,
    };
  }
  const milliseconds = validIntervals.map((interval) => interval * 1000);
  const average =
    milliseconds.reduce((sum, value) => sum + value, 0) / milliseconds.length;
  const differences = milliseconds
    .slice(1)
    .map((value, index) => value - milliseconds[index]);
  const rmssd = Math.sqrt(
    differences.reduce((sum, value) => sum + value * value, 0) /
      differences.length,
  );
  const deviation = Math.sqrt(
    milliseconds.reduce((sum, value) => sum + (value - average) ** 2, 0) /
      milliseconds.length,
  );
  const hr = 60000 / average;
  const events: string[] = [];
  if (hr > 100) events.push('Tachycardia');
  else if (hr < 60) events.push('Bradycardia');
  if (deviation > 100) events.push('Irregular Rhythm');
  if (events.length === 0) events.push('Non Arrhythmia');
  return {
    valid: true,
    hr: Math.round(hr),
    rrAvgMs: Math.round(average),
    rmssdMs: Math.round(rmssd),
    qtcMs: null,
    events,
    isIrregular: deviation > 100,
  };
}
export function generateClinicalExplanation(
  aiClass: string,
  aiAnomaly: boolean,
  result: RuleBasedResult,
): ClinicalExplanation {
  const unknown =
    !aiClass ||
    ['UNKNOWN', 'UNAVAILABLE', 'UNCLASSIFIED'].includes(aiClass.toUpperCase());
  const ruleAnomaly =
    result.valid && (result.isIrregular || result.hr > 100 || result.hr < 60);
  const isAnomaly = (!unknown && aiAnomaly) || ruleAnomaly;
  if (isAnomaly) {
    return {
      isAnomaly: true,
      severity: 'CRITICAL',
      fullExplanation:
        'PERINGATAN KLINIS: ' +
        (!unknown ? 'AI [' + aiClass + ']. ' : 'Prediksi AI belum tersedia. ') +
        (result.valid
          ? 'Aturan: ' +
            result.events.join(', ') +
            '. RMSSD: ' +
            result.rmssdMs +
            ' ms.'
          : 'Data RR belum cukup.'),
    };
  }
  if (!result.valid)
    return {
      isAnomaly: false,
      severity: 'INSUFFICIENT',
      fullExplanation: 'Data RR belum cukup untuk evaluasi irama.',
    };
  if (unknown)
    return {
      isAnomaly: false,
      severity: 'WARNING',
      fullExplanation:
        'Prediksi AI belum tersedia. Hasil aturan: ' +
        result.events.join(', ') +
        '.',
    };
  return {
    isAnomaly: false,
    severity: 'NORMAL',
    fullExplanation:
      'Non Arrhythmia. AI [' +
      aiClass +
      '], RMSSD: ' +
      result.rmssdMs +
      ' ms. QTc tidak diukur.',
  };
}
