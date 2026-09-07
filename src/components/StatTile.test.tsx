import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import StatTile from './StatTile';

afterEach(() => {
  cleanup();
});

describe('StatTile', () => {
  it('renders the label, sub text, and children', () => {
    render(
      <StatTile label="O2 Level" tileClass="tile-warn" sub="cabin nominal 20.9">
        19.7
      </StatTile>
    );
    expect(screen.getByText('O2 Level')).toBeTruthy();
    expect(screen.getByText('cabin nominal 20.9')).toBeTruthy();
    expect(screen.getByText('19.7')).toBeTruthy();
  });

  it('applies a custom value font size when provided', () => {
    const { container } = render(
      <StatTile label="Next Resupply" tileClass="tile-ok" sub="—" valueFontSize={24}>
        14d 0h
      </StatTile>
    );
    const value = container.querySelector('.tile-value') as HTMLElement;
    expect(value.style.fontSize).toBe('24px');
  });
});
