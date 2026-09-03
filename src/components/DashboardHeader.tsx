import type { Station } from '../api/types';
import type { StationStatus } from '../domain/stationStatus';

interface DashboardHeaderProps {
  station: Station;
  status: StationStatus;
  statusColor: string;
  lastSync: string;
}

export default function DashboardHeader({ station, status, statusColor, lastSync }: DashboardHeaderProps) {
  return (
    <header className="dash-header" style={{ borderBottom: '1px solid #232a3b', paddingBottom: 14 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: 1 }}>
          {station.name}
          <span style={{ fontSize: 13, marginLeft: 12, color: '#8892a6', fontWeight: 400 }}>
            {station.orbit} · {station.velocityKms} km/s · inc {station.inclinationDeg}°
          </span>
        </h1>
        <p style={{ margin: '4px 0 0', color: '#8892a6', fontSize: 13 }}>
          Mission day {station.daysInService} · crew {station.crewOnboard}/{station.crewCapacity} · last sync {lastSync}
        </p>
      </div>
      <div className="status-pill" style={{ background: statusColor + '22', color: statusColor, border: '1px solid ' + statusColor }}>
        <span className="status-dot" style={{ background: statusColor }} />
        {status}
      </div>
    </header>
  );
}
