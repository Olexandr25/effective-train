import { useEffect, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { flashAlert } from '../utils';
import { buildDashboardView } from '../domain/dashboardView';
import { O2_THRESHOLDS } from '../config';
import DashboardHeader from './DashboardHeader';
import AlertBanner from './AlertBanner';
import StatTile from './StatTile';

// The main mission control view. Used to do everything itself; now it's a
// thin composition fed by useDashboardData, with all "what does this number
// mean" logic delegated to domain/dashboardView.ts.

export default function Dashboard() {
  const { station, telemetry, crew, incidents, loading, error, retryAll } = useDashboardData();

  const [lastSync, setLastSync] = useState('');
  useEffect(() => {
    if (!station || !telemetry || !crew || !incidents) return;
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    setLastSync(pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()));
  }, [station, telemetry, crew, incidents]);

  useEffect(() => {
    if (!telemetry) return;
    const latestO2 = telemetry.series.o2.points.at(-1)!;
    if (latestO2 < O2_THRESHOLDS.criticalBelow) {
      flashAlert();
    }
  }, [telemetry]);

  if (loading && !station) {
    return (
      <div className="dashboard dashboard-loading">
        <div className="spinner" />
        <p>Establishing uplink to ISS Kruger-60…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard dashboard-error">
        <h1>⚠ Uplink lost</h1>
        <p>{error}</p>
        <button onClick={retryAll}>Retry uplink</button>
      </div>
    );
  }

  if (!station || !telemetry || !crew || !incidents) {
    return null;
  }

  const { status, statusColor, topIncident, tiles } = buildDashboardView(station, telemetry, crew, incidents, '2036-07-11T09:00:00Z');

  return (
    <div className="dashboard">
      <DashboardHeader station={station} status={status} statusColor={statusColor} lastSync={lastSync} />
      <AlertBanner status={status} statusColor={statusColor} topIncident={topIncident} />

      <div className="tiles">
        {tiles.map((tile) => (
          <StatTile key={tile.label} label={tile.label} tileClass={tile.tileClass} sub={tile.sub} valueFontSize={tile.valueFontSize}>
            {tile.value}
            {tile.unit && <span className="tile-unit">{tile.unit}</span>}
            {tile.trend && <span className="tile-trend">{tile.trend}</span>}
          </StatTile>
        ))}
      </div>
    </div>
  );
}
