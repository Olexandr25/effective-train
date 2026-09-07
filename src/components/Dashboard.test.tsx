import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Dashboard from './Dashboard';

afterEach(() => {
  cleanup();
  FIXTURES.telemetry = TELEMETRY;
});

const STATION = {
  id: 'k60',
  name: 'ISS Kruger-60',
  orbit: 'LEO',
  inclinationDeg: 51.6,
  velocityKms: 7.66,
  crewCapacity: 6,
  crewOnboard: 4,
  commissioned: '2034-01-01',
  nextResupply: '2036-07-25T09:00:00Z',
  daysInService: 900
};

const TELEMETRY = {
  updated: '2036-07-11T09:00:00Z',
  intervalMinutes: 5,
  series: {
    o2: { label: 'O2 %', unit: '%', points: [20.5, 20.3, 20.1, 19.9, 19.7] },
    power: { label: 'Power', unit: 'kW', points: [70, 68, 66, 64, 62] },
    hullTemp: { label: 'Hull Temp', unit: '°C', points: [10, 12, 11, 9, 8] },
    hullIntegrity: { label: 'Hull Integrity', unit: '%', points: [99.5, 99.4, 99.3, 99.2, 99.1] }
  }
};

const CREW = {
  updated: '2036-07-11T09:00:00Z',
  members: [
    { id: 'c1', name: 'Amara Chen', role: 'Commander', shift: 'alpha', onDuty: true, heartRate: 72, sleepHours: 7, missionDay: 900 },
    { id: 'c2', name: 'Boris Volkov', role: 'Engineer', shift: 'beta', onDuty: false, heartRate: 65, sleepHours: 7, missionDay: 900 }
  ]
};

const INCIDENTS = {
  updated: '2036-07-11T09:00:00Z',
  items: [
    { id: 'INC-1', severity: 'critical', system: 'life-support', title: 'O2 dip', timestamp: '2036-07-11T08:00:00Z', resolved: false, assignee: 'a' },
    { id: 'INC-2', severity: 'warning', system: 'power', title: 'Bus fluctuation', timestamp: '2036-07-11T07:00:00Z', resolved: false, assignee: 'b' },
    { id: 'INC-3', severity: 'info', system: 'comms', title: 'Latency spike', timestamp: '2036-07-11T06:00:00Z', resolved: true, assignee: 'c' }
  ]
};

const FIXTURES: Record<string, unknown> = { station: STATION, telemetry: TELEMETRY, crew: CREW, incidents: INCIDENTS };

vi.mock('../api/client', () => ({
  getData: (path: string) => Promise.resolve(FIXTURES[path])
}));

describe('Dashboard', () => {
  it('renders the station header and computed tiles once all resources load', async () => {
    render(<Dashboard />);
    expect(await screen.findByText('ISS Kruger-60')).toBeTruthy();
    expect(screen.getByText('14d 0h')).toBeTruthy();
    expect(screen.getByText(/α 1 · β 1 · γ 0/)).toBeTruthy();
  });

  it('surfaces the top unresolved incident in the alert banner', async () => {
    render(<Dashboard />);
    await screen.findByText('ISS Kruger-60');
    expect(screen.getByText(/O2 dip/)).toBeTruthy();
  });

  it('flashes the critical alert when the latest O2 reading drops below the critical floor', async () => {
    FIXTURES.telemetry = {
      ...TELEMETRY,
      series: { ...TELEMETRY.series, o2: { ...TELEMETRY.series.o2, points: [20.5, 20.3, 20.1, 19.7, 19.0] } }
    };
    render(<Dashboard />);
    expect(await screen.findByText('CRITICAL ALERT')).toBeTruthy();
  });
});
