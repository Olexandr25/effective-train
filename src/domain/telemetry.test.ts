import { describe, expect, test } from 'vitest';
import { computeTrend, downsampleTelemetry } from './telemetry';

describe('downsampleTelemetry', () => {
  test('returns the input unchanged when there are fewer points than buckets', () => {
    expect(downsampleTelemetry([5, 6], 12)).toEqual([5, 6]);
  });

  test('returns the input unchanged when points exactly match maxPoints', () => {
    expect(downsampleTelemetry([1, 2, 3], 3)).toEqual([1, 2, 3]);
  });

  test('does not crash on an empty series', () => {
    expect(downsampleTelemetry([], 12)).toEqual([]);
  });

  test('averages points into the requested number of buckets', () => {
    expect(downsampleTelemetry([1, 2, 3, 4], 2)).toEqual([1.5, 3.5]);
  });

  test('handles a bucket count that does not evenly divide the series', () => {
    // bucketSize = 5/2 = 2.5: bucket 0 covers indices 0-1 (avg of 1,2),
    // bucket 1 covers indices 2-4 (avg of 3,4,5)
    const result = downsampleTelemetry([1, 2, 3, 4, 5], 2);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeCloseTo(1.5, 5);
    expect(result[1]).toBeCloseTo(4, 5);
  });
});

describe('computeTrend', () => {
  test('is up when the increase exceeds epsilon', () => {
    expect(computeTrend(20.9, 20.5, 0.15)).toBe('↑');
  });

  test('is down when the decrease exceeds epsilon', () => {
    expect(computeTrend(20.3, 20.9, 0.15)).toBe('↓');
  });

  test('is flat when the change is within epsilon', () => {
    expect(computeTrend(20.5, 20.4, 0.15)).toBe('→');
  });

  test('a change exactly at epsilon is still flat (strictly-greater comparison)', () => {
    expect(computeTrend(20.65, 20.5, 0.15)).toBe('→');
  });
});
