// Centralized constants for Orbital Ops.
//
// Every poll interval, alert threshold, and status color used across the
// dashboard lives here — see CLAUDE.md "Conventions" for the rule this file
// exists to satisfy (no hardcoded thresholds/colors inside components).
//
// Values match the app's current live behavior exactly; this commit only
// centralizes them. Components still using their own local copies get
// migrated to import from here as each one is touched in later commits
// (see docs/refactor-plan.md for the commit order).
//
// The O2 thresholds below are the canonical values per the decision
// documented in docs/refactor-plan.md (19.5% CRITICAL / 19.9% DEGRADED,
// matching Dashboard.tsx and TelemetryChart.tsx as they exist today).

export const POLL_INTERVAL_MS = 5000;

export const MAX_SPARKLINE_POINTS = 12;

export const O2_THRESHOLDS = {
  criticalBelow: 19.5,
  degradedBelow: 19.9,
  cabinNominal: 20.9,
} as const;

export const POWER_THRESHOLDS = {
  degradedBelowKw: 50,
  budgetCapacityKw: 90,
  budgetBadBelowPct: 55,
  budgetWarnBelowPct: 75,
} as const;

export const HULL_TEMP_THRESHOLDS = {
  warnAboveC: 40,
  warnBelowC: -30,
} as const;

export const HULL_INTEGRITY_THRESHOLDS = {
  badBelowPct: 98,
  warnBelowPct: 99,
  mmodRatedPct: 97.0,
} as const;

export const RESUPPLY_THRESHOLDS = {
  badBelowDays: 7,
  warnBelowDays: 14,
} as const;

export const SLEEP_THRESHOLDS = {
  badBelowHours: 6,
  warnBelowHours: 7,
} as const;

export const FUEL_THRESHOLDS = {
  badBelowDays: 30,
  warnBelowDays: 60,
} as const;

export const TREND_EPSILON = {
  o2: 0.15,
  power: 2,
} as const;

export const STATUS_COLORS = {
  ok: '#3ddc84',
  warn: '#ffb020',
  bad: '#ff4d4d',
  info: '#4da3ff',
  neutral: '#8892a6',
} as const;
