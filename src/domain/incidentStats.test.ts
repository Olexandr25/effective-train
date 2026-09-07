import { describe, expect, it } from 'vitest';
import { computeIncidentStats } from './incidentStats';
import type { Incident } from '../api/types';

function incident(overrides: Partial<Incident>): Incident {
  return {
    id: 'INC-1',
    severity: 'info',
    system: 'life-support',
    title: 'test incident',
    timestamp: '2036-07-11T00:00:00Z',
    resolved: false,
    assignee: 'unassigned',
    ...overrides,
  };
}

describe('computeIncidentStats', () => {
  it('counts unresolved critical and warning incidents separately', () => {
    const stats = computeIncidentStats(
      [incident({ severity: 'critical' }), incident({ severity: 'warning' }), incident({ severity: 'info' })],
      '2036-07-11'
    );
    expect(stats.unresolvedCritical).toBe(1);
    expect(stats.unresolvedWarning).toBe(1);
  });

  it('counts only incidents resolved on the given day', () => {
    const stats = computeIncidentStats(
      [
        incident({ resolved: true, timestamp: '2036-07-11T08:00:00Z' }),
        incident({ resolved: true, timestamp: '2036-07-10T08:00:00Z' }),
      ],
      '2036-07-11'
    );
    expect(stats.resolvedToday).toBe(1);
  });

  it('picks the most severe unresolved incident as top, most recent breaking ties', () => {
    const stats = computeIncidentStats(
      [
        incident({ id: 'A', severity: 'warning', timestamp: '2036-07-11T09:00:00Z' }),
        incident({ id: 'B', severity: 'critical', timestamp: '2036-07-11T08:00:00Z' }),
        incident({ id: 'C', severity: 'critical', timestamp: '2036-07-11T10:00:00Z' }),
      ],
      '2036-07-11'
    );
    expect(stats.topIncident?.id).toBe('C');
  });

  it('returns null topIncident when everything is resolved', () => {
    const stats = computeIncidentStats([incident({ resolved: true })], '2036-07-11');
    expect(stats.topIncident).toBeNull();
  });

  it('breaks a same-severity tie the other way when the later item comes first', () => {
    const stats = computeIncidentStats(
      [
        incident({ id: 'LATER', severity: 'critical', timestamp: '2036-07-11T10:00:00Z' }),
        incident({ id: 'EARLIER', severity: 'critical', timestamp: '2036-07-11T08:00:00Z' }),
      ],
      '2036-07-11'
    );
    expect(stats.topIncident?.id).toBe('LATER');
  });
});
