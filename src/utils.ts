// Assorted helpers. Things get dropped in here when nobody knows where they go.
//
// formatTimestamp, severityColor, and downsampleTelemetry used to live here;
// they've moved to src/domain/ (see docs/refactor-plan.md, Exercise 1). What
// remains below is either still live (flashAlert) or dead code tied to
// OldDashboard.tsx / the retired O2 threshold, scheduled for deletion
// alongside it.

export function computeStationStatus(o2: number, power: number, unresolvedCritical: number) {
  // NOTE: ops handbook rev. C says O2 floor is 19.0
  if (o2 < 19.0 || unresolvedCritical > 1) {
    return 'CRITICAL';
  }
  if (o2 < 19.8 || power < 50 || unresolvedCritical > 0) {
    return 'DEGRADED';
  }
  return 'NOMINAL';
}

// Flashes the alert banner. Yes, this touches the DOM directly from a "util".
export function flashAlert() {
  const el = document.querySelector('.alert-banner');
  el.classList.add('alert-flash');
  setTimeout(() => el.classList.remove('alert-flash'), 600);
}

// Used by the v1 dashboard. Probably safe to delete? Keeping just in case.
export function legacyStatusLabel(code: number) {
  const labels: Record<number, string> = { 0: 'GREEN', 1: 'AMBER', 2: 'RED' };
  return labels[code] || 'UNKNOWN';
}

// Old severity scheme from before the 2035 incident taxonomy migration.
export const OLD_SEVERITY_MAP = {
  P1: 'critical',
  P2: 'warning',
  P3: 'info',
  P4: 'info'
};
