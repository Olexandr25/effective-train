import { describe, expect, it, vi, afterEach } from 'vitest';
import { flashAlert } from './utils';

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('flashAlert', () => {
  it('does nothing when no alert banner is in the document', () => {
    expect(() => flashAlert()).not.toThrow();
  });

  it('adds the flash class immediately and removes it after 600ms', () => {
    vi.useFakeTimers();
    const banner = document.createElement('div');
    banner.className = 'alert-banner';
    document.body.appendChild(banner);

    flashAlert();
    expect(banner.classList.contains('alert-flash')).toBe(true);

    vi.advanceTimersByTime(600);
    expect(banner.classList.contains('alert-flash')).toBe(false);
  });
});
