import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, renderHook, waitFor, cleanup } from '@testing-library/react';
import { useFetchResource } from './useFetchResource';
import { getData } from '../api/client';

afterEach(() => {
  cleanup();
});

vi.mock('../api/client', () => ({
  getData: vi.fn()
}));

describe('useFetchResource', () => {
  it('starts loading and resolves with data on success', async () => {
    vi.mocked(getData).mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useFetchResource<{ ok: boolean }>('station'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ ok: true });
    expect(result.current.error).toBe('');
  });

  it('surfaces an error once retries are exhausted', async () => {
    vi.mocked(getData).mockRejectedValueOnce(new Error('uplink down'));
    const { result } = renderHook(() => useFetchResource<{ ok: boolean }>('station', { maxRetries: 0 }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('uplink down');
    expect(result.current.data).toBeNull();
  });

  it('retry() re-fetches and clears a previous error', async () => {
    vi.mocked(getData).mockRejectedValueOnce(new Error('uplink down'));
    const { result } = renderHook(() => useFetchResource<{ ok: boolean }>('station', { maxRetries: 0 }));
    await waitFor(() => expect(result.current.error).toBe('uplink down'));

    vi.mocked(getData).mockResolvedValueOnce({ ok: true });
    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.data).toEqual({ ok: true }));
    expect(result.current.error).toBe('');
  });
});
