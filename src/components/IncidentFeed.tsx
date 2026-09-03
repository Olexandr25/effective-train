import { useState } from 'react';
import { useFetchResource } from '../hooks/useFetchResource';
import { formatTimestamp, severityColor } from '../domain/formatting';
import PanelStatus from './PanelStatus';
import type { IncidentsResponse } from '../api/types';

// Incident feed.
//
// This used to silently swallow errors after retries ran out (ops
// complained about it twice). The shared hook doesn't do that: a final
// failure now surfaces the same error + Retry UI as every other panel.

export default function IncidentFeed() {
  const { data, loading, error, retry } = useFetchResource<IncidentsResponse>('incidents', {
    maxRetries: 2,
    retryDelayMs: 1500
  });
  const [showResolved, setShowResolved] = useState(false);

  if (loading || error) {
    return <PanelStatus title="Incidents" loading={loading} error={error} loadingMessage="Loading incident feed…" onRetry={retry} />;
  }

  if (!data) {
    return null;
  }

  const items = data.items.filter((i) => showResolved || !i.resolved);
  const rank: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  items.sort((a, b) => {
    const ra = rank[a.severity] !== undefined ? rank[a.severity] : 3;
    const rb = rank[b.severity] !== undefined ? rank[b.severity] : 3;
    if (ra !== rb) return ra - rb;
    return a.timestamp < b.timestamp ? 1 : -1;
  });

  return (
    <section className="panel">
      <h2>
        Incidents
        <label className="toggle">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
          show resolved
        </label>
      </h2>
      <ul className="incident-list">
        {items.map((inc) => (
          <li key={inc.id} className={inc.resolved ? 'incident-row incident-resolved' : 'incident-row'}>
            <span className="incident-sev" style={{ background: severityColor(inc.severity) }}>
              {inc.severity}
            </span>
            <div className="incident-main">
              <span className="incident-title">
                {inc.id} · {inc.title}
              </span>
              <span className="incident-meta">
                {inc.system} · {formatTimestamp(inc.timestamp)} · {inc.resolved ? 'resolved' : 'open'}
              </span>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="incident-empty">No incidents to show.</li>}
      </ul>
    </section>
  );
}
