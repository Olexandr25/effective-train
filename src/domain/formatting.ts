// Pure formatting/display helpers. One canonical timestamp format used
// everywhere in the app — this replaces the two diverging formatters that
// used to live in utils.ts and inline in Dashboard.tsx (see
// docs/refactor-plan.md).

import type { Severity } from '../api/types';
import { STATUS_COLORS } from '../config';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return (
    MONTHS[d.getUTCMonth()] +
    ' ' +
    d.getUTCDate() +
    ', ' +
    pad(d.getUTCHours()) +
    ':' +
    pad(d.getUTCMinutes()) +
    ' UTC'
  );
}

export function severityColor(severity: Severity | string): string {
  if (severity === 'critical') return STATUS_COLORS.bad;
  if (severity === 'warning') return STATUS_COLORS.warn;
  if (severity === 'info') return STATUS_COLORS.info;
  return STATUS_COLORS.neutral;
}
