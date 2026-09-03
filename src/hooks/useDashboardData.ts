import { useFetchResource } from './useFetchResource';
import type { Station, TelemetryResponse, CrewResponse, IncidentsResponse } from '../api/types';
import { POLL_INTERVAL_MS } from '../config';

/**
 * Fetches the four resources the dashboard needs and combines their
 * loading/error state into one shape, so the component doesn't have to.
 */
export function useDashboardData() {
  const stationRes = useFetchResource<Station>('station', { pollIntervalMs: POLL_INTERVAL_MS });
  const telemetryRes = useFetchResource<TelemetryResponse>('telemetry', { pollIntervalMs: POLL_INTERVAL_MS });
  const crewRes = useFetchResource<CrewResponse>('crew', { pollIntervalMs: POLL_INTERVAL_MS });
  const incidentsRes = useFetchResource<IncidentsResponse>('incidents', { pollIntervalMs: POLL_INTERVAL_MS });

  return {
    station: stationRes.data,
    telemetry: telemetryRes.data,
    crew: crewRes.data,
    incidents: incidentsRes.data,
    loading: stationRes.loading || telemetryRes.loading || crewRes.loading || incidentsRes.loading,
    error: stationRes.error || telemetryRes.error || crewRes.error || incidentsRes.error,
    retryAll: () => {
      stationRes.retry();
      telemetryRes.retry();
      crewRes.retry();
      incidentsRes.retry();
    },
  };
}
