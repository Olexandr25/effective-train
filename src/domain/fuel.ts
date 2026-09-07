import { classifyLowerBound, type TileLevel } from './threshold';
import type { FuelTank } from '../api/types';

export interface FuelSummary {
  totalCapacityKg: number;
  totalCurrentKg: number;
  fillPct: number;
  daysRemaining: number;
  level: TileLevel;
}

/**
 * Rolls up the tank list into totals and the days-of-fuel-remaining figure
 * the widget leads with, graded against the config thresholds.
 */
export function computeFuelSummary(
  tanks: FuelTank[],
  dailyConsumptionKg: number,
  thresholds: { badBelowDays: number; warnBelowDays: number }
): FuelSummary {
  const totalCapacityKg = tanks.reduce((sum, t) => sum + t.capacityKg, 0);
  const totalCurrentKg = tanks.reduce((sum, t) => sum + t.currentKg, 0);
  const fillPct = totalCapacityKg > 0 ? Math.round((totalCurrentKg / totalCapacityKg) * 100) : 0;
  const daysRemaining = dailyConsumptionKg > 0 ? Math.floor(totalCurrentKg / dailyConsumptionKg) : Infinity;
  const level = classifyLowerBound(daysRemaining, thresholds.badBelowDays, thresholds.warnBelowDays);

  return { totalCapacityKg, totalCurrentKg, fillPct, daysRemaining, level };
}
