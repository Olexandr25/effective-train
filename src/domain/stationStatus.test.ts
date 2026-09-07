import { describe, expect, test } from 'vitest';
import { computeStationStatus } from './stationStatus';
import { O2_THRESHOLDS, POWER_THRESHOLDS, STATUS_COLORS } from '../config';

describe('computeStationStatus', () => {
  test('is NOMINAL when everything is healthy', () => {
    expect(computeStationStatus(20.9, 85, 0)).toEqual({ status: 'NOMINAL', color: STATUS_COLORS.ok });
  });

  test('is CRITICAL when O2 drops below the critical floor', () => {
    const justBelow = O2_THRESHOLDS.criticalBelow - 0.1;
    expect(computeStationStatus(justBelow, 85, 0)).toEqual({ status: 'CRITICAL', color: STATUS_COLORS.bad });
  });

  test('O2 exactly at the critical floor is not yet CRITICAL', () => {
    const result = computeStationStatus(O2_THRESHOLDS.criticalBelow, 85, 0);
    expect(result.status).not.toBe('CRITICAL');
  });

  test('is CRITICAL when more than one unresolved critical incident exists', () => {
    expect(computeStationStatus(20.9, 85, 2)).toEqual({ status: 'CRITICAL', color: STATUS_COLORS.bad });
  });

  test('exactly one unresolved critical incident is DEGRADED, not CRITICAL', () => {
    expect(computeStationStatus(20.9, 85, 1)).toEqual({ status: 'DEGRADED', color: STATUS_COLORS.warn });
  });

  test('is DEGRADED when O2 is between the degraded and critical floors', () => {
    const between = (O2_THRESHOLDS.criticalBelow + O2_THRESHOLDS.degradedBelow) / 2;
    expect(computeStationStatus(between, 85, 0)).toEqual({ status: 'DEGRADED', color: STATUS_COLORS.warn });
  });

  test('is DEGRADED when power drops below its floor', () => {
    const justBelow = POWER_THRESHOLDS.degradedBelowKw - 1;
    expect(computeStationStatus(20.9, justBelow, 0)).toEqual({ status: 'DEGRADED', color: STATUS_COLORS.warn });
  });

  test('power exactly at its floor is not yet DEGRADED from power alone', () => {
    const result = computeStationStatus(20.9, POWER_THRESHOLDS.degradedBelowKw, 0);
    expect(result.status).toBe('NOMINAL');
  });
});
