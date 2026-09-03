// Everything that used to live here (formatTimestamp, severityColor,
// downsampleTelemetry, computeStationStatus) has moved to src/domain/ or
// been deleted as dead code tied to OldDashboard.tsx (see
// docs/refactor-plan.md, Exercise 1). This is what's left: the one helper
// that's still live and still a genuine DOM side-effect, not domain logic.

export function flashAlert() {
  const el = document.querySelector('.alert-banner');
  el.classList.add('alert-flash');
  setTimeout(() => el.classList.remove('alert-flash'), 600);
}
