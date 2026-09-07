import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import CrewPanel from './CrewPanel';
import { getData } from '../api/client';

afterEach(() => {
  cleanup();
});

vi.mock('../api/client', () => ({
  getData: vi.fn()
}));

function member(overrides: Partial<Record<string, unknown>>) {
  return {
    id: 'c1',
    name: 'Amara Chen',
    role: 'Commander',
    shift: 'alpha',
    onDuty: true,
    heartRate: 72,
    sleepHours: 7,
    missionDay: 900,
    ...overrides
  };
}

describe('CrewPanel', () => {
  it('renders crew members sorted on-duty first', async () => {
    vi.mocked(getData).mockResolvedValueOnce({
      updated: '2036-07-11T09:00:00Z',
      members: [
        member({ id: 'c1', name: 'Amara Chen', onDuty: true }),
        member({ id: 'c2', name: 'Boris Volkov', role: 'Engineer', shift: 'beta', onDuty: false, heartRate: 65, sleepHours: 6 })
      ]
    });
    render(<CrewPanel />);
    const onDutyRow = (await screen.findByText('Amara Chen')).closest('li');
    const offDutyRow = screen.getByText('Boris Volkov').closest('li');
    expect(onDutyRow?.className).toContain('crew-on');
    expect(offDutyRow?.className).not.toContain('crew-on');
    expect(screen.getByText(/Commander · shift alpha/)).toBeTruthy();
  });

  it('breaks a same-duty-status tie alphabetically (Zora before Amara in the raw data)', async () => {
    vi.mocked(getData).mockResolvedValueOnce({
      updated: '2036-07-11T09:00:00Z',
      members: [member({ id: 'c1', name: 'Zora Ito' }), member({ id: 'c2', name: 'Amara Chen' })]
    });
    render(<CrewPanel />);
    const names = (await screen.findAllByText(/./, { selector: '.crew-name' })).map((el) => el.textContent);
    expect(names).toEqual(['Amara Chen', 'Zora Ito']);
  });

  it('breaks a same-duty-status tie alphabetically (Amara before Zora in the raw data)', async () => {
    vi.mocked(getData).mockResolvedValueOnce({
      updated: '2036-07-11T09:00:00Z',
      members: [member({ id: 'c1', name: 'Amara Chen' }), member({ id: 'c2', name: 'Zora Ito' })]
    });
    render(<CrewPanel />);
    const names = (await screen.findAllByText(/./, { selector: '.crew-name' })).map((el) => el.textContent);
    expect(names).toEqual(['Amara Chen', 'Zora Ito']);
  });
});
