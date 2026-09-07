import type { Incident } from '../api/types';

export interface IncidentStats {
  unresolvedCritical: number;
  unresolvedWarning: number;
  resolvedToday: number;
  topIncident: Incident | null;
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, warning: 1, info: 2 };

/**
 * Tallies open/resolved incidents and picks the top one to surface in the
 * alert banner (most severe first, then most recent).
 */
export function computeIncidentStats(items: Incident[], todayDatePrefix: string): IncidentStats {
  let unresolvedCritical = 0;
  let unresolvedWarning = 0;
  let resolvedToday = 0;
  for (const inc of items) {
    if (!inc.resolved && inc.severity === 'critical') {
      unresolvedCritical++;
    } else if (!inc.resolved && inc.severity === 'warning') {
      unresolvedWarning++;
    } else if (inc.resolved && inc.timestamp.indexOf(todayDatePrefix) === 0) {
      resolvedToday++;
    }
  }

  const unresolved = items
    .filter((i) => !i.resolved)
    .sort((a, b) => {
      const ra = SEVERITY_RANK[a.severity] ?? 3;
      const rb = SEVERITY_RANK[b.severity] ?? 3;
      if (ra !== rb) return ra - rb;
      return a.timestamp < b.timestamp ? 1 : -1;
    });

  return {
    unresolvedCritical,
    unresolvedWarning,
    resolvedToday,
    topIncident: unresolved.length > 0 ? unresolved[0] : null,
  };
}
