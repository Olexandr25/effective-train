import type { CrewMember } from '../api/types';
import { classifyLowerBound, type TileLevel } from './threshold';

export interface CrewStats {
  onDutyCount: number;
  offDutyCount: number;
  shifts: Record<string, number>;
  avgSleep: number;
  sleepClass: TileLevel;
}

/** Duty/shift breakdown and average rest for the crew roster. */
export function computeCrewStats(
  members: CrewMember[],
  sleepThresholds: { badBelowHours: number; warnBelowHours: number }
): CrewStats {
  const shifts: Record<string, number> = {};
  let onDutyCount = 0;
  let sleepSum = 0;
  for (const m of members) {
    if (m.onDuty) onDutyCount++;
    shifts[m.shift] = (shifts[m.shift] || 0) + 1;
    sleepSum += m.sleepHours;
  }
  const avgSleep = Math.round((sleepSum / members.length) * 10) / 10;
  const sleepClass = classifyLowerBound(avgSleep, sleepThresholds.badBelowHours, sleepThresholds.warnBelowHours);
  return { onDutyCount, offDutyCount: members.length - onDutyCount, shifts, avgSleep, sleepClass };
}
