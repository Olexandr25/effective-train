import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import FuelPanel from './FuelPanel';

afterEach(() => {
  cleanup();
});

vi.mock('../api/client', () => ({
  getData: () =>
    Promise.resolve({
      updated: '2036-07-11T09:00:00Z',
      tanks: [
        { id: 'main-a', type: 'hydrazine', capacityKg: 1200, currentKg: 830 },
        { id: 'main-b', type: 'hydrazine', capacityKg: 1200, currentKg: 764 },
        { id: 'rcs', type: 'cold-gas', capacityKg: 300, currentKg: 211 }
      ],
      dailyConsumptionKg: 14.2
    })
}));

describe('FuelPanel', () => {
  it('renders total days remaining and each tank row', async () => {
    render(<FuelPanel />);
    expect(await screen.findByText('127d remaining')).toBeTruthy();
    expect(screen.getByText('main-a')).toBeTruthy();
    expect(screen.getByText('830/1200 kg')).toBeTruthy();
  });
});
