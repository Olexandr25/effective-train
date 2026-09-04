import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import CrewPanel from './CrewPanel';

afterEach(() => {
  cleanup();
});

vi.mock('../api/client', () => ({
  getData: () =>
    Promise.resolve({
      updated: '2036-07-11T09:00:00Z',
      members: [
        { id: 'c1', name: 'Amara Chen', role: 'Commander', shift: 'alpha', onDuty: true, heartRate: 72, sleepHours: 7.5, missionDay: 900 },
        { id: 'c2', name: 'Boris Volkov', role: 'Engineer', shift: 'beta', onDuty: false, heartRate: 65, sleepHours: 6, missionDay: 900 }
      ]
    })
}));

describe('CrewPanel', () => {
  it('renders crew members sorted on-duty first', async () => {
    render(<CrewPanel />);
    const onDutyRow = (await screen.findByText('Amara Chen')).closest('li');
    const offDutyRow = screen.getByText('Boris Volkov').closest('li');
    expect(onDutyRow?.className).toContain('crew-on');
    expect(offDutyRow?.className).not.toContain('crew-on');
    expect(screen.getByText(/Commander · shift alpha/)).toBeTruthy();
  });
});
