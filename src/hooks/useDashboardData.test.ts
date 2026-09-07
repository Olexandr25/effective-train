import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardData } from './useDashboardData';
import { useFetchResource, type UseFetchResourceResult } from './useFetchResource';

vi.mock('./useFetchResource', () => ({
  useFetchResource: vi.fn()
}));

describe('useDashboardData', () => {
  it('combines the four resources and fans retryAll out to each of them', () => {
    const retryStation = vi.fn();
    const retryTelemetry = vi.fn();
    const retryCrew = vi.fn();
    const retryIncidents = vi.fn();

    const results: UseFetchResourceResult<unknown>[] = [
      { data: { id: 'k60' }, loading: false, error: '', retry: retryStation },
      { data: { series: {} }, loading: false, error: '', retry: retryTelemetry },
      { data: { members: [] }, loading: false, error: '', retry: retryCrew },
      { data: { items: [] }, loading: false, error: '', retry: retryIncidents }
    ];
    let call = 0;
    vi.mocked(useFetchResource).mockImplementation(() => results[call++]);

    const { result } = renderHook(() => useDashboardData());

    expect(result.current.station).toEqual({ id: 'k60' });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');

    result.current.retryAll();
    expect(retryStation).toHaveBeenCalledTimes(1);
    expect(retryTelemetry).toHaveBeenCalledTimes(1);
    expect(retryCrew).toHaveBeenCalledTimes(1);
    expect(retryIncidents).toHaveBeenCalledTimes(1);
  });

  it('surfaces loading/error when any single resource is still loading or failed', () => {
    const pending: UseFetchResourceResult<unknown> = { data: null, loading: true, error: '', retry: vi.fn() };
    const failed: UseFetchResourceResult<unknown> = { data: null, loading: false, error: 'uplink down', retry: vi.fn() };
    const idle: UseFetchResourceResult<unknown> = { data: null, loading: false, error: '', retry: vi.fn() };
    const results = [pending, failed, idle, idle];
    let call = 0;
    vi.mocked(useFetchResource).mockImplementation(() => results[call++]);

    const { result } = renderHook(() => useDashboardData());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('uplink down');
  });
});
