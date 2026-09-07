import { useFetchResource } from '../hooks/useFetchResource';
import PanelStatus from './PanelStatus';
import type { CrewResponse } from '../api/types';

// Crew roster panel.

export default function CrewPanel() {
  const { data, loading, error, retry } = useFetchResource<CrewResponse>('crew');

  if (loading || error) {
    return <PanelStatus title="Crew" loading={loading} error={error} loadingMessage="Loading crew roster…" onRetry={retry} />;
  }

  if (!data) {
    return null;
  }

  const sorted = [...data.members].sort((a, b) => {
    if (a.onDuty !== b.onDuty) return a.onDuty ? -1 : 1;
    return a.name < b.name ? -1 : 1;
  });

  return (
    <section className="panel">
      <h2>Crew</h2>
      <ul className="crew-list">
        {sorted.map((m) => (
          <li key={m.id} className={m.onDuty ? 'crew-row crew-on' : 'crew-row'}>
            <span className="crew-dot" style={{ background: m.onDuty ? '#3ddc84' : '#8892a6' }} />
            <div className="crew-main">
              <span className="crew-name">{m.name}</span>
              <span className="crew-role">{m.role} · shift {m.shift}</span>
            </div>
            <div className="crew-vitals">
              <span title="heart rate">♥ {m.heartRate}</span>
              <span title="sleep last night">☾ {m.sleepHours}h</span>
              <span title="mission day">d{m.missionDay}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
