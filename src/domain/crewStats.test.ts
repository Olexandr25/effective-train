import { describe, expect, it } from 'vitest';
import { computeCrewStats } from './crewStats';
import type { CrewMember } from '../api/types';

function member(overrides: Partial<CrewMember>): CrewMember {
  return {
    id: 'C-1',
    name: 'Test Crew',
    role: 'engineer',
    shift: 'alpha',
    onDuty: true,
    heartRate: 70,
    sleepHours: 7,
    missionDay: 1,
    ...overrides,
  };
}

const thresholds = { badBelowHours: 6, warnBelowHours: 7 };

describe('computeCrewStats', () => {
  it('splits crew into on-duty and off-duty counts', () => {
    const stats = computeCrewStats([member({ onDuty: true }), member({ onDuty: false }), member({ onDuty: false })], thresholds);
    expect(stats.onDutyCount).toBe(1);
    expect(stats.offDutyCount).toBe(2);
  });

  it('tallies members per shift', () => {
    const stats = computeCrewStats([member({ shift: 'alpha' }), member({ shift: 'alpha' }), member({ shift: 'beta' })], thresholds);
    expect(stats.shifts).toEqual({ alpha: 2, beta: 1 });
  });

  it('averages sleep hours and classifies against the thresholds', () => {
    const stats = computeCrewStats([member({ sleepHours: 5 }), member({ sleepHours: 5 })], thresholds);
    expect(stats.avgSleep).toBe(5);
    expect(stats.sleepClass).toBe('bad');
  });

  it('classifies healthy average sleep as ok', () => {
    const stats = computeCrewStats([member({ sleepHours: 8 }), member({ sleepHours: 8 })], thresholds);
    expect(stats.sleepClass).toBe('ok');
  });
});
