import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import AlertBanner from './AlertBanner';
import type { Incident } from '../api/types';

afterEach(() => {
  cleanup();
});

const incident: Incident = {
  id: 'INC-1',
  severity: 'critical',
  system: 'life-support',
  title: 'O2 dip',
  timestamp: '2036-07-11T08:00:00Z',
  resolved: false,
  assignee: 'a'
};

describe('AlertBanner', () => {
  it('renders nothing when the station is NOMINAL', () => {
    const { container } = render(<AlertBanner status="NOMINAL" statusColor="#3ddc84" topIncident={incident} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there is no top incident, even if the station is not NOMINAL', () => {
    const { container } = render(<AlertBanner status="DEGRADED" statusColor="#f5a623" topIncident={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the top incident when the station is not NOMINAL', () => {
    render(<AlertBanner status="CRITICAL" statusColor="#ff4d4d" topIncident={incident} />);
    expect(screen.getByText('CRITICAL ALERT')).toBeTruthy();
    expect(screen.getByText(/O2 dip/)).toBeTruthy();
  });

  it('labels a non-critical alert as ATTENTION rather than CRITICAL ALERT', () => {
    render(<AlertBanner status="DEGRADED" statusColor="#f5a623" topIncident={incident} />);
    expect(screen.getByText('ATTENTION')).toBeTruthy();
  });
});
