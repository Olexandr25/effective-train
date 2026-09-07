import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PanelStatus from './PanelStatus';

afterEach(() => {
  cleanup();
});

describe('PanelStatus', () => {
  it('renders the loading message while loading', () => {
    render(<PanelStatus title="Crew" loading={true} error="" loadingMessage="Loading crew…" onRetry={() => {}} />);
    expect(screen.getByText('Loading crew…')).toBeTruthy();
  });

  it('renders the error and calls onRetry when the button is clicked', () => {
    const onRetry = vi.fn();
    render(<PanelStatus title="Crew" loading={false} error="uplink down" loadingMessage="" onRetry={onRetry} />);
    expect(screen.getByText(/uplink down/)).toBeTruthy();
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
