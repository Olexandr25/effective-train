// Pure threshold-classification helpers, shared by every tile that grades
// a value as ok/warn/bad against config.ts thresholds. No React, no DOM.

export type TileLevel = 'ok' | 'warn' | 'bad';

/** Three-level classification where lower values are worse (e.g. O2, power budget, sleep hours). */
export function classifyLowerBound(value: number, badBelow: number, warnBelow: number): TileLevel {
  if (value < badBelow) return 'bad';
  if (value < warnBelow) return 'warn';
  return 'ok';
}

/** Two-level classification where only leaving a safe band matters (e.g. hull temperature). */
export function classifyRange(value: number, warnBelow: number, warnAbove: number): 'ok' | 'warn' {
  return value < warnBelow || value > warnAbove ? 'warn' : 'ok';
}
