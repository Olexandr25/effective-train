import { describe, expect, it } from 'vitest';
import { computeFuelSummary } from './fuel';
import type { FuelTank } from '../api/types';

const thresholds = { badBelowDays: 30, warnBelowDays: 60 };

function tank(overrides: Partial<FuelTank>): FuelTank {
  return { id: 'tank-1', type: 'hydrazine', capacityKg: 1000, currentKg: 500, ...overrides };
}

describe('computeFuelSummary', () => {
  it('sums capacity and current across tanks and computes fill percentage', () => {
    const summary = computeFuelSummary(
      [tank({ capacityKg: 1200, currentKg: 830 }), tank({ capacityKg: 300, currentKg: 211 })],
      14.2,
      thresholds
    );
    expect(summary.totalCapacityKg).toBe(1500);
    expect(summary.totalCurrentKg).toBe(1041);
    expect(summary.fillPct).toBe(69);
  });

  it('matches the Exercise 4 fixture: 1805kg over 14.2kg/day is 127 days', () => {
    const summary = computeFuelSummary(
      [
        tank({ id: 'main-a', capacityKg: 1200, currentKg: 830 }),
        tank({ id: 'main-b', capacityKg: 1200, currentKg: 764 }),
        tank({ id: 'rcs', type: 'cold-gas', capacityKg: 300, currentKg: 211 }),
      ],
      14.2,
      thresholds
    );
    expect(summary.totalCurrentKg).toBe(1805);
    expect(summary.daysRemaining).toBe(127);
    expect(summary.level).toBe('ok');
  });

  it('classifies bad and warn below the configured day thresholds', () => {
    const bad = computeFuelSummary([tank({ currentKg: 200 })], 10, thresholds);
    expect(bad.daysRemaining).toBe(20);
    expect(bad.level).toBe('bad');

    const warn = computeFuelSummary([tank({ currentKg: 500 })], 10, thresholds);
    expect(warn.daysRemaining).toBe(50);
    expect(warn.level).toBe('warn');
  });

  it('treats zero daily consumption as no drain instead of dividing by zero', () => {
    const summary = computeFuelSummary([tank({ currentKg: 500 })], 0, thresholds);
    expect(summary.daysRemaining).toBe(Infinity);
    expect(summary.level).toBe('ok');
  });

  it('handles an empty tank list without producing NaN', () => {
    const summary = computeFuelSummary([], 14.2, thresholds);
    expect(summary.totalCapacityKg).toBe(0);
    expect(summary.totalCurrentKg).toBe(0);
    expect(summary.fillPct).toBe(0);
    expect(summary.daysRemaining).toBe(0);
    expect(summary.level).toBe('bad');
  });
});
