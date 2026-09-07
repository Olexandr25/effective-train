# Exercise 1 — Refactoring Plan

## Context

Orbital Ops works but is deliberately smelly (see `ASSIGNMENT.md` Exercise 1).
`npm run validate` currently fails lint with 29 errors — mostly
`no-explicit-any`, `max-lines-per-function`, `complexity`, and unused vars —
concentrated in `Dashboard.tsx`, `TelemetryChart.tsx`, `IncidentFeed.tsx`,
`CrewPanel.tsx`, and `api/client.ts`. Exercise 0's exploration (recorded in
`CLAUDE.md`) mapped six smell clusters plus a threshold inconsistency. This
plan is written and committed before any source edit, per the assignment's
iron rule, and covers targets, order, risks, and verification.

Research performed before writing this plan: read every file in `src/`,
`src/api/types.ts`, `package.json`, and the git history (single "Initial
commit" on branch `work`, clean tree). Confirmed `OldDashboard.tsx` is not
imported by `App.tsx`, and that `utils.ts`'s `computeStationStatus` is not
called anywhere in the current app — it's dead code, not just a duplicate.

## Threshold decision

The O2 critical floor is defined three inconsistent ways in the codebase:

- `utils.ts` `computeStationStatus` (dead code, unused): 19.0 / 19.8, citing "ops handbook rev. C"
- `Dashboard.tsx` (live) + `TelemetryChart.tsx` (live): 19.5 / 19.9, citing "mission control wall display"
- `OldDashboard.tsx` (dead code, being deleted anyway): 19.0 / 20.0

**Decision: the canonical floor is 19.5% CRITICAL / 19.9% DEGRADED**,
matching what the live app actually shows today. This is a zero-behavior-change
choice: the 19.0 value never actually took effect anywhere reachable, so
preserving current behavior means keeping 19.5. The 19.0 value and its dead
carrier code (`computeStationStatus`, `OldDashboard.tsx`) are retired
together in the dead-code commit below, not silently dropped.

## Targets → commits

One smell-cluster per commit, `npm run validate` run after each.

1. **`src/config.ts`** — centralize constants at their current live values:
   poll interval (5000ms), O2 19.5/19.9, power floor 50 / budget 55%/75%,
   hull temp ±40/-30, hull integrity 98/99, resupply 7/14 days, sleep 6/7h,
   and the status/severity color palette. Pure addition, no behavior change —
   lowest risk, done first so later commits can import from it.

2. **Type the API end-to-end** — add `TelemetryResponse`, `CrewResponse`,
   `CrewMember`, `IncidentsResponse`, `Incident` to `src/api/types.ts`
   (shapes are visible in `public/api/*.json`); make `getData` generic
   (`getData<T>(path): Promise<T>`) in `src/api/client.ts`; remove the `any`
   returns there. Satisfies `E1.6` (zero `any` in `src/api/`). Component-side
   `any` usages get cleaned up naturally in commits 3–4 as they adopt these
   types.

3. **`src/domain/` + unit tests** — extract pure logic: `stationStatus.ts`
   (one canonical status calc, replacing both `utils.ts`'s and Dashboard's
   inline version, using `config.ts` thresholds), `telemetry.ts`
   (`downsampleTelemetry` moved from `utils.ts`, dedupes TelemetryChart's
   inline copy; O2/power trend-arrow calc), `formatting.ts` (one timestamp
   formatter, replacing `formatTimestamp` and Dashboard's diverging
   `fmtDate`, plus `severityColor`). Each module gets focused unit tests
   covering boundaries (status thresholds, downsample with fewer points
   than buckets, empty series) — not snapshot spam, per `RUBRIC.md` §6.

4. **Shared fetch hook** — `src/hooks/useFetchResource.ts`: owns
   loading/error/retry/cancellation, generic over the typed client from
   commit 2. Migrate `CrewPanel`, `IncidentFeed`, `TelemetryChart` to it
   directly (one resource each); `Dashboard` calls it four times (station,
   telemetry, crew, incidents) instead of its manual `Promise.all`. This is
   also where two real bugs get fixed as a side effect of consistency:
   `IncidentFeed` stops silently swallowing errors after retries exhaust,
   and `TelemetryChart` gets the cancellation guard it currently lacks —
   called out explicitly in that commit's message as an intentional
   behavior change, not a regression.

5. **Decompose `Dashboard.tsx`** — with config/types/domain/hook already in
   place, this commit is mostly wiring, not new logic. Split into a thin
   composition: a header/status subcomponent, the alert banner, and the
   tile grid rewritten as one reusable `StatTile` component fed by an array
   built from the domain functions (collapses eight near-identical tile
   JSX blocks). Delete the commented-out v1 polling block and the unused
   `POLL_INTERVAL` (superseded by `config.ts`). Target: `Dashboard.tsx` <
   150 non-empty lines (`E1.2`).

6. **Delete the dead** — `OldDashboard.tsx` and everything only it uses
   (`legacyStatusLabel`, `OLD_SEVERITY_MAP`, `renderStatusBadge` in
   `utils.ts`), plus the now-unused `computeStationStatus`. Once
   domain/config own all logic, `utils.ts` should be empty or removable —
   confirm with a reference search before deleting each symbol. Satisfies
   `E1.3`.

## Risks

- Dashboard decomposition (commit 5) is the largest diff — sequencing it
  after config/types/domain/hook exist turns it into wiring rather than new
  logic, which is why it isn't commit 1.
- The `IncidentFeed`/`TelemetryChart` behavior fixes in commit 4 are
  intentional; flagged in that commit's message so they don't read as scope
  creep.
- `npm run dupcheck` (jscpd) is the real acceptance test for the fetch-hook
  and domain extraction — run it after commits 3 and 4 specifically, not
  just at the end.
- Coverage (`test:coverage`) must stay green — domain modules need real
  edge-case tests, added in the same commit as the code they cover.
- Locked files stay untouched throughout: `vite.config.ts`,
  `eslint.config.js`, `tsconfig.strict.json`, `.jscpd.json`,
  `scripts/validate.ts`, `public/api/`, `.github/`, `RUBRIC.md`.

## Verification

After every commit: `npm run validate` (lint, typecheck, coverage, dupcheck,
structure) plus a manual `npm run dev` glance to confirm the dashboard still
renders and the status pill/tiles look unchanged where no behavior change
was intended. Final acceptance: full `npm run validate` green, all
`E1.1`–`E1.7` structural checks satisfied, and the two intentional behavior
fixes visible in the incident and telemetry panels.

## Checks

Mirrors `ASSIGNMENT.md` Exercise 1's checklist, tracked here and checked off
as each commit lands. All must be true, plus lint/typecheck/coverage/dupcheck
green, before Exercise 1 is considered done.

- [x] `E1.1` docs/refactor-plan.md committed, ≥ 20 lines — this file, committed before any refactor edit.
- [ ] `E1.2` Dashboard.tsx < 150 non-empty lines — commit 5.
- [ ] `E1.3` OldDashboard.tsx deleted — commit 6.
- [ ] `E1.4` src/hooks/ has a shared hook — commit 4.
- [ ] `E1.5` src/domain/ has extracted pure logic — commit 3.
- [ ] `E1.6` zero `any` in src/api/ — commit 2.
- [ ] `E1.7` src/config.ts exists — commit 1.
- [ ] plus: lint, typecheck, coverage, and duplication all green — verified after every commit, final check before moving to Exercise 2.
