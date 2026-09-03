import { classifyLowerBound, type TileLevel } from './threshold';

export interface ResupplyStatus {
  daysLeft: number;
  hoursLeft: number;
  level: TileLevel;
  label: string;
}

/** Time remaining until the next resupply, graded against the config thresholds. */
export function computeResupply(
  nextResupplyIso: string,
  nowIso: string,
  thresholds: { badBelowDays: number; warnBelowDays: number }
): ResupplyStatus {
  const msLeft = new Date(nextResupplyIso).getTime() - new Date(nowIso).getTime();
  const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const level = classifyLowerBound(daysLeft, thresholds.badBelowDays, thresholds.warnBelowDays);
  const label = daysLeft + 'd ' + hoursLeft + 'h' + (level === 'bad' ? ' ⚠' : '');
  return { daysLeft, hoursLeft, level, label };
}
