import { describe, expect, it } from 'vitest';
import { buildDashboardView } from './dashboardView';
import type { Station, TelemetryResponse, CrewResponse, IncidentsResponse } from '../api/types';

const station: Station = {
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

const telemetry: TelemetryResponse = {
  updated: '2036-07-11T09:00:00Z',
  intervalMinutes: 5,
  series: {
    o2: { label: 'O2 %', unit: '%', points: [20.5, 20.3, 20.1, 19.9, 19.7] },
    power: { label: 'Power', unit: 'kW', points: [70, 68, 66, 64, 62] },
    hullTemp: { label: 'Hull Temp', unit: '°C', points: [10, 12, 11, 9, 8] },
    hullIntegrity: { label: 'Hull Integrity', unit: '%', points: [99.5, 99.4, 99.3, 99.2, 99.1] }
  }
};

const crew: CrewResponse = {
  updated: '2036-07-11T09:00:00Z',
  members: [
    { id: 'c1', name: 'Amara Chen', role: 'Commander', shift: 'alpha', onDuty: true, heartRate: 72, sleepHours: 7, missionDay: 900 },
    { id: 'c2', name: 'Boris Volkov', role: 'Engineer', shift: 'beta', onDuty: false, heartRate: 65, sleepHours: 5, missionDay: 900 }
  ]
};

const incidents: IncidentsResponse = {
  updated: '2036-07-11T09:00:00Z',
  items: [
    { id: 'INC-1', severity: 'critical', system: 'life-support', title: 'O2 dip', timestamp: '2036-07-11T08:00:00Z', resolved: false, assignee: 'a' },
    { id: 'INC-2', severity: 'warning', system: 'power', title: 'Bus fluctuation', timestamp: '2036-07-11T07:00:00Z', resolved: false, assignee: 'b' },
    { id: 'INC-3', severity: 'info', system: 'comms', title: 'Latency spike', timestamp: '2036-07-11T06:00:00Z', resolved: true, assignee: 'c' }
  ]
};

describe('buildDashboardView', () => {
  it('computes DEGRADED status from the O2 reading and surfaces the top incident', () => {
    const view = buildDashboardView(station, telemetry, crew, incidents, '2036-07-11T09:00:00Z');
    expect(view.status).toBe('DEGRADED');
    expect(view.topIncident?.id).toBe('INC-1');
  });

  it('builds all 8 tiles with the expected O2 and resupply values', () => {
    const view = buildDashboardView(station, telemetry, crew, incidents, '2036-07-11T09:00:00Z');
    expect(view.tiles).toHaveLength(8);
    const o2Tile = view.tiles.find((t) => t.label === 'O2 Level');
    expect(o2Tile?.value).toBe('19.7');
    expect(o2Tile?.tileClass).toBe('tile-warn');
    const resupplyTile = view.tiles.find((t) => t.label === 'Next Resupply');
    expect(resupplyTile?.value).toBe('14d 0h');
  });

  it('reflects a crew average sleep below the warn threshold', () => {
    const view = buildDashboardView(station, telemetry, crew, incidents, '2036-07-11T09:00:00Z');
    const crewTile = view.tiles.find((t) => t.label === 'Crew Rest');
    expect(crewTile?.value).toBe(6);
    expect(crewTile?.tileClass).toBe('tile-warn');
  });
});
