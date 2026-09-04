import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import DashboardHeader from './DashboardHeader';
import type { Station } from '../api/types';

afterEach(() => {
  cleanup();
});

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

describe('DashboardHeader', () => {
  it('renders the station name, status pill, and last sync time', () => {
    render(<DashboardHeader station={station} status="DEGRADED" statusColor="#ffb020" lastSync="10:00:00" />);
    expect(screen.getByText('ISS Kruger-60')).toBeTruthy();
    expect(screen.getByText('DEGRADED')).toBeTruthy();
    expect(screen.getByText(/last sync 10:00:00/)).toBeTruthy();
  });
});
