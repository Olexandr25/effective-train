import { useFetchResource } from '../hooks/useFetchResource';
import PanelStatus from './PanelStatus';
import type { FuelResponse } from '../api/types';
import { computeFuelSummary } from '../domain/fuel';
import { FUEL_THRESHOLDS } from '../config';

// Fuel Reserves panel — scaffolded with .claude/skills/new-widget.

export default function FuelPanel() {
  const { data, loading, error, retry } = useFetchResource<FuelResponse>('fuel');

  if (loading || error) {
    return (
      <PanelStatus
        title="Fuel Reserves"
        loading={loading}
        error={error}
        loadingMessage="Loading fuel reserves…"
        onRetry={retry}
      />
    );
  }

  if (!data) {
    return null;
  }

  const summary = computeFuelSummary(data.tanks, data.dailyConsumptionKg, FUEL_THRESHOLDS);

  return (
    <section className="panel">
      <h2>Fuel Reserves</h2>
      <div className={'fuel-summary fuel-' + summary.level}>
        <span className="fuel-days">{summary.daysRemaining}d remaining</span>
        <span className="fuel-fill">
          {summary.fillPct}% of {summary.totalCapacityKg} kg · {data.dailyConsumptionKg} kg/day
        </span>
      </div>
      <ul className="fuel-list">
        {data.tanks.map((tank) => (
          <li key={tank.id} className="fuel-row">
            <div className="fuel-main">
              <span className="fuel-name">{tank.id}</span>
              <span className="fuel-type">{tank.type}</span>
            </div>
            <div className="fuel-bar">
              <div className="fuel-bar-fill" style={{ width: Math.round((tank.currentKg / tank.capacityKg) * 100) + '%' }} />
            </div>
            <span className="fuel-kg">
              {tank.currentKg}/{tank.capacityKg} kg
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
