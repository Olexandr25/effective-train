import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, renderHook, waitFor, cleanup } from '@testing-library/react';
import { useFetchResource } from './useFetchResource';
import { getData } from '../api/client';

afterEach(() => {
  cleanup();
  vi.mocked(getData).mockReset();
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

  it('automatically retries after a delay before surfacing an error', async () => {
    vi.mocked(getData).mockRejectedValueOnce(new Error('first attempt down'));
    vi.mocked(getData).mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useFetchResource<{ ok: boolean }>('station', { retryDelayMs: 20 }));

    await waitFor(() => expect(result.current.data).toEqual({ ok: true }));
    expect(result.current.error).toBe('');
    expect(getData).toHaveBeenCalledTimes(2);
  });

  it('polls for fresh data on the configured interval', async () => {
    vi.mocked(getData).mockResolvedValue({ ok: true });
    renderHook(() => useFetchResource<{ ok: boolean }>('station', { pollIntervalMs: 20 }));

    await waitFor(() => expect(getData).toHaveBeenCalledTimes(1));
    const callsAfterInitialLoad = vi.mocked(getData).mock.calls.length;
    await waitFor(() => expect(vi.mocked(getData).mock.calls.length).toBeGreaterThan(callsAfterInitialLoad));
  });

  it('ignores a stale success once the component has unmounted', async () => {
    let resolveFetch: (value: { ok: boolean }) => void = () => {};
    vi.mocked(getData).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    const { result, unmount } = renderHook(() => useFetchResource<{ ok: boolean }>('station'));
    unmount();

    await act(async () => {
      resolveFetch({ ok: true });
      await Promise.resolve();
    });

    expect(result.current.data).toBeNull();
  });

  it('ignores a stale failure once the component has unmounted', async () => {
    let rejectFetch: (err: unknown) => void = () => {};
    vi.mocked(getData).mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectFetch = reject;
        })
    );
    const { result, unmount } = renderHook(() => useFetchResource<{ ok: boolean }>('station', { maxRetries: 0 }));
    unmount();

    await act(async () => {
      rejectFetch(new Error('uplink down'));
      await Promise.resolve();
    });

    expect(result.current.error).toBe('');
  });

  it('falls back to stringifying the raw error when it has no message', async () => {
    vi.mocked(getData).mockRejectedValueOnce('plain string failure');
    const { result } = renderHook(() => useFetchResource<{ ok: boolean }>('station', { maxRetries: 0 }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('plain string failure');
  });
});
