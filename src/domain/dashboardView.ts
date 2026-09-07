import type { CrewResponse, Incident, IncidentsResponse, Station, TelemetryResponse } from '../api/types';
import { computeStationStatus, type StationStatus } from './stationStatus';
import { computeTrend } from './telemetry';
import { classifyLowerBound, classifyRange } from './threshold';
import { computeIncidentStats } from './incidentStats';
import { computeResupply } from './resupply';
import { computeCrewStats } from './crewStats';
import { formatTimestamp } from './formatting';
import { O2_THRESHOLDS, POWER_THRESHOLDS, HULL_TEMP_THRESHOLDS, HULL_INTEGRITY_THRESHOLDS, RESUPPLY_THRESHOLDS, SLEEP_THRESHOLDS, TREND_EPSILON } from '../config';

export interface TileViewModel {
  label: string;
  tileClass: string;
  sub: string;
  value: string | number;
  unit?: string;
  trend?: string;
  valueFontSize?: number;
}

export interface DashboardView {
  status: StationStatus;
  statusColor: string;
  topIncident: Incident | null;
  tiles: TileViewModel[];
}

/**
 * Turns the four raw API payloads into everything the dashboard renders:
 * station status, the top incident for the alert banner, and the tile grid.
 * All the "what does this number mean" logic lives here, not in the component.
 */
export function buildDashboardView(
  station: Station,
  telemetry: TelemetryResponse,
  crew: CrewResponse,
  incidents: IncidentsResponse,
  nowIso: string
): DashboardView {
  const o2Points = telemetry.series.o2.points;
  const powerPoints = telemetry.series.power.points;
  const latestO2 = o2Points[o2Points.length - 1];
  const latestPower = powerPoints[powerPoints.length - 1];
  const latestHullTemp = telemetry.series.hullTemp.points.at(-1)!;
  const latestIntegrity = telemetry.series.hullIntegrity.points.at(-1)!;

  const { unresolvedCritical, unresolvedWarning, resolvedToday, topIncident } = computeIncidentStats(
    incidents.items,
    nowIso.slice(0, 10)
  );
  const { status, color: statusColor } = computeStationStatus(latestO2, latestPower, unresolvedCritical);

  const o2Trend = computeTrend(latestO2, o2Points[o2Points.length - 4], TREND_EPSILON.o2);
  const powerTrend = computeTrend(latestPower, powerPoints[powerPoints.length - 4], TREND_EPSILON.power);
  const powerAvg = powerPoints.reduce((sum, p) => sum + p, 0) / powerPoints.length;
  const powerBudgetPct = Math.round((latestPower / POWER_THRESHOLDS.budgetCapacityKw) * 100);
  const powerClass = 'tile-' + classifyLowerBound(powerBudgetPct, POWER_THRESHOLDS.budgetBadBelowPct, POWER_THRESHOLDS.budgetWarnBelowPct);

  const { level: resupplyLevel, label: resupplyLabel } = computeResupply(station.nextResupply, nowIso, RESUPPLY_THRESHOLDS);
  const { onDutyCount, offDutyCount, shifts, avgSleep, sleepClass } = computeCrewStats(crew.members, SLEEP_THRESHOLDS);

  const o2Class = 'tile-' + classifyLowerBound(latestO2, O2_THRESHOLDS.criticalBelow, O2_THRESHOLDS.degradedBelow);
  const hullTempClass = 'tile-' + classifyRange(latestHullTemp, HULL_TEMP_THRESHOLDS.warnBelowC, HULL_TEMP_THRESHOLDS.warnAboveC);
  const hullIntegrityClass = 'tile-' + classifyLowerBound(latestIntegrity, HULL_INTEGRITY_THRESHOLDS.badBelowPct, HULL_INTEGRITY_THRESHOLDS.warnBelowPct);
  const incidentsClass = 'tile-' + (unresolvedCritical > 0 ? 'bad' : unresolvedWarning > 0 ? 'warn' : 'ok');

  const tiles: TileViewModel[] = [
    { label: 'O2 Level', tileClass: o2Class, sub: `floor ${O2_THRESHOLDS.criticalBelow} · cabin nominal ${O2_THRESHOLDS.cabinNominal}`, value: latestO2.toFixed(1), unit: '%', trend: o2Trend },
    { label: 'Power Output', tileClass: powerClass, sub: `avg ${powerAvg.toFixed(0)} kW · budget ${powerBudgetPct}%`, value: latestPower, unit: 'kW', trend: powerTrend },
    { label: 'Hull Temp', tileClass: hullTempClass, sub: 'day/night swing normal', value: latestHullTemp, unit: '°C' },
    { label: 'Hull Integrity', tileClass: hullIntegrityClass, sub: 'MMOD shielding rated to 97.0', value: latestIntegrity.toFixed(1), unit: '%' },
    { label: 'Open Incidents', tileClass: incidentsClass, sub: `${unresolvedCritical} critical · ${unresolvedWarning} warning · ${resolvedToday} resolved today`, value: unresolvedCritical + unresolvedWarning, unit: 'open' },
    { label: 'Next Resupply', tileClass: 'tile-' + resupplyLevel, sub: formatTimestamp(station.nextResupply), value: resupplyLabel, valueFontSize: 24 },
    { label: 'Crew Rest', tileClass: 'tile-' + sleepClass, sub: `${onDutyCount} on duty · ${offDutyCount} off duty`, value: avgSleep, unit: 'h avg' },
    { label: 'Shift Board', tileClass: 'tile-ok', sub: `commissioned ${formatTimestamp(station.commissioned + 'T00:00:00Z')}`, value: `α ${shifts['alpha'] || 0} · β ${shifts['beta'] || 0} · γ ${shifts['gamma'] || 0}`, valueFontSize: 20 },
  ];

  return { status, statusColor, topIncident, tiles };
}
