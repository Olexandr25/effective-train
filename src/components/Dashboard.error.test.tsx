import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import { useDashboardData } from '../hooks/useDashboardData';

afterEach(() => {
  cleanup();
});

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: vi.fn()
}));

describe('Dashboard uplink error state', () => {
  it('shows the uplink-lost error UI and retries all resources on click', () => {
    const retryAll = vi.fn();
    vi.mocked(useDashboardData).mockReturnValue({
      station: null,
      telemetry: null,
      crew: null,
      incidents: null,
      loading: false,
      error: 'Request failed: 503',
      retryAll
    });

    render(<Dashboard />);
    expect(screen.getByText('⚠ Uplink lost')).toBeTruthy();
    expect(screen.getByText('Request failed: 503')).toBeTruthy();

    fireEvent.click(screen.getByText('Retry uplink'));
    expect(retryAll).toHaveBeenCalledTimes(1);
  });
});
