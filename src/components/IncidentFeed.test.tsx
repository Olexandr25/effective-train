import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import IncidentFeed from './IncidentFeed';
import { getData } from '../api/client';

afterEach(() => {
  cleanup();
});

vi.mock('../api/client', () => ({
  getData: vi.fn()
}));

function incident(overrides: Partial<Record<string, unknown>>) {
  return {
    id: 'INC-1',
    severity: 'critical',
    system: 'life-support',
    title: 'O2 dip',
    timestamp: '2036-07-11T08:00:00Z',
    resolved: false,
    assignee: 'a',
    ...overrides
  };
}

describe('IncidentFeed', () => {
  it('shows unresolved incidents by default and hides resolved ones', async () => {
    vi.mocked(getData).mockResolvedValueOnce({
      updated: '2036-07-11T09:00:00Z',
      items: [
        incident({}),
        incident({ id: 'INC-2', severity: 'info', system: 'comms', title: 'Latency spike', timestamp: '2036-07-10T08:00:00Z', resolved: true, assignee: 'b' })
      ]
    });
    render(<IncidentFeed />);
    expect(await screen.findByText(/O2 dip/)).toBeTruthy();
    expect(screen.queryByText(/Latency spike/)).toBeNull();
  });

  it('reveals resolved incidents once "show resolved" is checked', async () => {
    vi.mocked(getData).mockResolvedValueOnce({
      updated: '2036-07-11T09:00:00Z',
      items: [
        incident({}),
        incident({ id: 'INC-2', severity: 'info', system: 'comms', title: 'Latency spike', timestamp: '2036-07-10T08:00:00Z', resolved: true, assignee: 'b' })
      ]
    });
    render(<IncidentFeed />);
    await screen.findByText(/O2 dip/);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(await screen.findByText(/Latency spike/)).toBeTruthy();
  });

  it('breaks a same-severity tie by timestamp (later item second in the raw data)', async () => {
    vi.mocked(getData).mockResolvedValueOnce({
      updated: '2036-07-11T09:00:00Z',
      items: [
        incident({ id: 'EARLIER', timestamp: '2036-07-11T08:00:00Z' }),
        incident({ id: 'LATER', timestamp: '2036-07-11T10:00:00Z' })
      ]
    });
    render(<IncidentFeed />);
    const titles = (await screen.findAllByText(/·/, { selector: '.incident-title' })).map((el) => el.textContent);
    expect(titles?.[0]).toContain('LATER');
  });

  it('breaks a same-severity tie by timestamp (later item first in the raw data)', async () => {
    vi.mocked(getData).mockResolvedValueOnce({
      updated: '2036-07-11T09:00:00Z',
      items: [
        incident({ id: 'LATER', timestamp: '2036-07-11T10:00:00Z' }),
        incident({ id: 'EARLIER', timestamp: '2036-07-11T08:00:00Z' })
      ]
    });
    render(<IncidentFeed />);
    const titles = (await screen.findAllByText(/·/, { selector: '.incident-title' })).map((el) => el.textContent);
    expect(titles?.[0]).toContain('LATER');
  });
});
