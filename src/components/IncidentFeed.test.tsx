import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import IncidentFeed from './IncidentFeed';

afterEach(() => {
  cleanup();
});

vi.mock('../api/client', () => ({
  getData: () =>
    Promise.resolve({
      updated: '2036-07-11T09:00:00Z',
      items: [
        { id: 'INC-1', severity: 'critical', system: 'life-support', title: 'O2 dip', timestamp: '2036-07-11T08:00:00Z', resolved: false, assignee: 'a' },
        { id: 'INC-2', severity: 'info', system: 'comms', title: 'Latency spike', timestamp: '2036-07-10T08:00:00Z', resolved: true, assignee: 'b' }
      ]
    })
}));

describe('IncidentFeed', () => {
  it('shows unresolved incidents by default and hides resolved ones', async () => {
    render(<IncidentFeed />);
    expect(await screen.findByText(/O2 dip/)).toBeTruthy();
    expect(screen.queryByText(/Latency spike/)).toBeNull();
  });

  it('reveals resolved incidents once "show resolved" is checked', async () => {
    render(<IncidentFeed />);
    await screen.findByText(/O2 dip/);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(await screen.findByText(/Latency spike/)).toBeTruthy();
  });
});
