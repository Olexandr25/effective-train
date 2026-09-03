// Shared data-fetching hook: owns loading/error/retry/cancellation so no
// component hand-rolls its own fetch useEffect (see CLAUDE.md
// "Conventions"). Replaces the diverged copies that used to live in
// CrewPanel, IncidentFeed, and TelemetryChart, and the manual Promise.all
// in Dashboard.

import { useEffect, useState } from 'react';
import { getData } from '../api/client';

export interface UseFetchResourceOptions {
  /** How many times to retry automatically before surfacing an error. */
  maxRetries?: number;
  /** Delay between automatic retries, in ms. */
  retryDelayMs?: number;
  /** If set, re-fetches on this interval (in ms) after the first success. */
  pollIntervalMs?: number;
}

export interface UseFetchResourceResult<T> {
  data: T | null;
  loading: boolean;
  error: string;
  /** Manually re-fetch (used by "Retry" buttons and by polling). */
  retry: () => void;
}

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

export function useFetchResource<T>(
  path: string,
  options: UseFetchResourceOptions = {}
): UseFetchResourceResult<T> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const pollIntervalMs = options.pollIntervalMs;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    function attempt(retryCount: number) {
      if (retryCount === 0) setLoading(true);
      getData<T>(path)
        .then((result) => {
          if (cancelled) return;
          setData(result);
          setError('');
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          if (retryCount < maxRetries) {
            retryTimer = setTimeout(() => attempt(retryCount + 1), retryDelayMs);
          } else {
            setError(String(err && err.message ? err.message : err));
            setLoading(false);
          }
        });
    }

    attempt(0);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [path, reloadToken, maxRetries, retryDelayMs]);

  useEffect(() => {
    if (!pollIntervalMs) return undefined;
    const id = setInterval(() => setReloadToken((t) => t + 1), pollIntervalMs);
    return () => clearInterval(id);
  }, [pollIntervalMs]);

  return { data, loading, error, retry: () => setReloadToken((t) => t + 1) };
}
