import { describe, expect, it } from 'vitest';
import { computeResupply } from './resupply';

const thresholds = { badBelowDays: 7, warnBelowDays: 14 };

describe('computeResupply', () => {
  it('classifies as ok when comfortably above the warn threshold', () => {
    const result = computeResupply('2036-08-01T00:00:00Z', '2036-07-11T09:00:00Z', thresholds);
    expect(result.level).toBe('ok');
    expect(result.label).not.toContain('⚠');
  });

  it('classifies as warn inside the warn window', () => {
    const result = computeResupply('2036-07-20T09:00:00Z', '2036-07-11T09:00:00Z', thresholds);
    expect(result.level).toBe('warn');
  });

  it('classifies as bad and flags the label when under the bad threshold', () => {
    const result = computeResupply('2036-07-15T09:00:00Z', '2036-07-11T09:00:00Z', thresholds);
    expect(result.level).toBe('bad');
    expect(result.label).toContain('⚠');
  });

  it('splits the remaining time into days and leftover hours', () => {
    const result = computeResupply('2036-07-30T15:00:00Z', '2036-07-11T09:00:00Z', thresholds);
    expect(result.daysLeft).toBe(19);
    expect(result.hoursLeft).toBe(6);
  });
});
