import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import TelemetryChart from './TelemetryChart';

afterEach(() => {
  cleanup();
});

vi.mock('../api/client', () => ({
  getData: () =>
    Promise.resolve({
      updated: '2036-07-11T09:00:00Z',
      intervalMinutes: 5,
      series: {
        o2: { label: 'O2 %', unit: '%', points: [20.5, 20.3, 20.1, 19.9, 19.4] },
        power: { label: 'Power', unit: 'kW', points: [70, 68, 66, 64, 57] },
        hullTemp: { label: 'Hull Temp', unit: '°C', points: [10, 12, 11, 9, 8] },
        hullIntegrity: { label: 'Hull Integrity', unit: '%', points: [99.5, 99.4, 99.3, 99.2, 99.1] }
      }
    })
}));

describe('TelemetryChart', () => {
  it('renders the default O2 tab and flags a breach below the critical floor', async () => {
    render(<TelemetryChart />);
    expect(await screen.findByText(/below floor!/)).toBeTruthy();
    expect(screen.getByText('19.4')).toBeTruthy();
  });

  it('switches series and clears the breach flag when another tab is clicked', async () => {
    render(<TelemetryChart />);
    await screen.findByText(/below floor!/);
    fireEvent.click(screen.getByText('Power'));
    expect(await screen.findByText('57.0')).toBeTruthy();
    expect(screen.queryByText(/below floor!/)).toBeNull();
  });
});
