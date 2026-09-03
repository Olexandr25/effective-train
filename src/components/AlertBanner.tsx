import type { Incident } from '../api/types';
import type { StationStatus } from '../domain/stationStatus';
import { formatTimestamp } from '../domain/formatting';

interface AlertBannerProps {
  status: StationStatus;
  statusColor: string;
  topIncident: Incident | null;
}

export default function AlertBanner({ status, statusColor, topIncident }: AlertBannerProps) {
  if (status === 'NOMINAL' || !topIncident) return null;

  return (
    <div className="alert-banner" style={{ borderColor: statusColor }}>
      <strong style={{ color: statusColor }}>{status === 'CRITICAL' ? 'CRITICAL ALERT' : 'ATTENTION'}</strong>
      <span style={{ marginLeft: 10 }}>
        {topIncident.id}: {topIncident.title}
      </span>
      <span style={{ marginLeft: 'auto', color: '#8892a6', fontSize: 12 }}>{formatTimestamp(topIncident.timestamp)}</span>
    </div>
  );
}
