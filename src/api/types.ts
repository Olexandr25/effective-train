// Data models for the station API.
// Every payload getData() can return has a named interface here — no `any`
// crosses this boundary. Shapes match the fixtures in public/api/*.json.

export interface Station {
  id: string;
  name: string;
  orbit: string;
  inclinationDeg: number;
  velocityKms: number;
  crewCapacity: number;
  crewOnboard: number;
  commissioned: string;
  nextResupply: string;
  daysInService: number;
}

export type Severity = 'critical' | 'warning' | 'info';

export interface TelemetrySeries {
  label: string;
  unit: string;
  points: number[];
}

export type TelemetrySeriesKey = 'o2' | 'power' | 'hullTemp' | 'hullIntegrity';

export interface TelemetryResponse {
  updated: string;
  intervalMinutes: number;
  series: Record<TelemetrySeriesKey, TelemetrySeries>;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  onDuty: boolean;
  heartRate: number;
  sleepHours: number;
  missionDay: number;
}

export interface CrewResponse {
  updated: string;
  members: CrewMember[];
}

export interface Incident {
  id: string;
  severity: Severity;
  system: string;
  title: string;
  timestamp: string;
  resolved: boolean;
  assignee: string;
}

export interface IncidentsResponse {
  updated: string;
  items: Incident[];
}

export interface FuelTank {
  id: string;
  type: string;
  capacityKg: number;
  currentKg: number;
}

export interface FuelResponse {
  updated: string;
  tanks: FuelTank[];
  dailyConsumptionKg: number;
}
