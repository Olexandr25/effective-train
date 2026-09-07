import { useState } from 'react';
import { useFetchResource } from '../hooks/useFetchResource';
import { downsampleTelemetry } from '../domain/telemetry';
import { MAX_SPARKLINE_POINTS, O2_THRESHOLDS } from '../config';
import PanelStatus from './PanelStatus';
import type { TelemetryResponse, TelemetrySeriesKey } from '../api/types';

// Telemetry sparklines.
//
// This used to be missing the cancellation guard the other panels had
// (nobody noticed because the panel never unmounts) - the shared hook
// handles cancellation for every panel uniformly, so that's fixed too.

export default function TelemetryChart() {
  const { data, loading, error, retry } = useFetchResource<TelemetryResponse>('telemetry');
  const [selected, setSelected] = useState<TelemetrySeriesKey>('o2');

  if (loading || error) {
    return <PanelStatus title="Telemetry" loading={loading} error={error} loadingMessage="Loading telemetry…" onRetry={retry} />;
  }

  if (!data) {
    return null;
  }

  const series = data.series[selected];
  const points = downsampleTelemetry(series.points, MAX_SPARKLINE_POINTS);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 320;
  const h = 80;
  const step = w / (points.length - 1);
  const coords = points
    .map((p, i) => {
      const x = (i * step).toFixed(1);
      const y = (h - ((p - min) / range) * (h - 8) - 4).toFixed(1);
      return x + ',' + y;
    })
    .join(' ');

  const latest = points[points.length - 1];
  const breach = selected === 'o2' && latest < O2_THRESHOLDS.criticalBelow;

  return (
    <section className="panel">
      <h2>Telemetry</h2>
      <div className="chart-tabs">
        {(Object.keys(data.series) as TelemetrySeriesKey[]).map((key) => (
          <button
            key={key}
            className={key === selected ? 'chart-tab chart-tab-active' : 'chart-tab'}
            onClick={() => setSelected(key)}
          >
            {data.series[key].label}
          </button>
        ))}
      </div>
      <div className="chart-body">
        <svg viewBox={'0 0 ' + w + ' ' + h} className="sparkline" preserveAspectRatio="none">
          <polyline points={coords} fill="none" stroke={breach ? '#ff4d4d' : '#4da3ff'} strokeWidth="2" />
        </svg>
        <div className="chart-stats">
          <span>
            latest <strong>{latest.toFixed(1)}</strong> {series.unit}
          </span>
          <span>min {min.toFixed(1)}</span>
          <span>max {max.toFixed(1)}</span>
          {breach && <span className="chart-breach">below floor!</span>}
        </div>
      </div>
    </section>
  );
}
