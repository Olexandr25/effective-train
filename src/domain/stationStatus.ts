// Pure station-status logic: given the latest readings, decide
// NOMINAL / DEGRADED / CRITICAL and the color to show for it.
// No React, no DOM — see CLAUDE.md "Conventions".

import { O2_THRESHOLDS, POWER_THRESHOLDS, STATUS_COLORS } from '../config';

export type StationStatus = 'NOMINAL' | 'DEGRADED' | 'CRITICAL';

export interface StationStatusResult {
  status: StationStatus;
  color: string;
}

export function computeStationStatus(
  latestO2: number,
  latestPower: number,
  unresolvedCritical: number
): StationStatusResult {
  if (latestO2 < O2_THRESHOLDS.criticalBelow || unresolvedCritical > 1) {
    return { status: 'CRITICAL', color: STATUS_COLORS.bad };
  }
  if (
    latestO2 < O2_THRESHOLDS.degradedBelow ||
    latestPower < POWER_THRESHOLDS.degradedBelowKw ||
    unresolvedCritical > 0
  ) {
    return { status: 'DEGRADED', color: STATUS_COLORS.warn };
  }
  return { status: 'NOMINAL', color: STATUS_COLORS.ok };
}
