# Orbital Ops

React + TypeScript dashboard for the ISS Kruger-60 mission control.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (no typecheck by design, don't rely on it to catch type errors)
- `npm run test` — smoke test only
- `npm run validate` — full gauntlet (lint, typecheck, coverage, dupcheck, structure). Must pass before submitting.
- `npm run lint` / `npm run typecheck` / `npm run test:coverage` / `npm run dupcheck` / `npm run validate:structure` — individual checks, useful for isolating one failure at a time.

## Architecture

- `src/App.tsx` — composition root. Renders `Dashboard` plus the panel grid (`TelemetryChart`, `CrewPanel`, `IncidentFeed`).
- `src/components/` — presentational + data-fetching React components. One component per file, PascalCase filename matching the exported component.
- `src/api/client.ts` — the only place allowed to call `fetch`. `getData(path)` hits `/api/<path>.json`. Components never call `fetch` directly.
- `src/api/types.ts` — response/domain types for the mock API. Every payload returned by `getData` gets a named interface here; no `any` crosses this boundary.
- `src/hooks/` (create in Exercise 1) — shared React hooks, starting with the fetch/retry/loading/cancellation hook that replaces the copy-pasted version currently duplicated across CrewPanel, IncidentFeed, TelemetryChart, and Dashboard.
- `src/domain/` (create in Exercise 1) — pure, framework-free functions: station status computation, telemetry downsampling, timestamp formatting, threshold logic. If it doesn't touch React state or the DOM, it belongs here, not inline in a component.
- `src/config.ts` (create in Exercise 1) — single source of truth for constants: poll interval, every alert threshold (O2, power, hull temp/integrity, resupply, sleep), and status colors.
- `src/utils.ts` — being retired. It's a grab-bag; anything still useful moves into `src/domain/`, anything dead gets deleted per the policy below.
- `public/api/*.json` — static mock payloads standing in for the station API. Treat as fixtures, not a place for app logic.

## Conventions

- Naming: components are PascalCase (`CrewPanel.tsx`); hooks are camelCase prefixed with `use` (`useFetchResource.ts`); pure domain modules are camelCase (`stationStatus.ts`).
- No `any`, anywhere. Every function boundary (API responses, component props, domain functions) has an explicit type.
- One fetch abstraction. All data fetching goes through the shared hook from Exercise 1, which owns loading/error/retry/cancellation. No component hand-rolls its own fetch `useEffect`.
- Pure logic lives in `src/domain/`, is unit-tested, and is plain-data-in/plain-data-out — no React, no DOM access (that means `flashAlert`'s direct DOM query doesn't belong there either).
- Thresholds and magic numbers live only in `src/config.ts`. No hardcoded `19.5`, `5000`, `#ff4d4d`, etc. inside components — import from config.
- Keep components small: under ~80 lines, complexity under 10 (matches the lint config). A component that grows past that gets decomposed, not exempted.
- Error handling is consistent across panels: on final retry failure, show the panel's error state with a retry button. Never silently swallow an error (IncidentFeed currently does — that's a bug, not a pattern).

## Deletion policy

The agent MAY delete without asking, once it has confirmed nothing else references the code:
- `OldDashboard.tsx` and anything only it uses (`legacyStatusLabel`, `OLD_SEVERITY_MAP`, `renderStatusBadge`).
- Commented-out code blocks (e.g. the v1 polling block inside `Dashboard.tsx`) — git history is the backup, not a comment block.
- Unused local constants/variables flagged by lint (e.g. the unused `POLL_INTERVAL`, `REFRESH_MS`) once their value has been centralized in `src/config.ts`.

The agent MUST ask first before deleting:
- Anything under `public/api/*.json` — other panels depend on these as data contracts.
- Any exported function or type that might still be consumed somewhere not yet checked.
- Anything under `tests/`.

## Known issue to resolve in Exercise 1

The O2 alert floor is defined three different, disagreeing ways in the codebase:
- `utils.ts` `computeStationStatus`: CRITICAL below 19.0 (comment cites "ops handbook rev. C").
- `Dashboard.tsx` inline status calc and tile subtext: CRITICAL below 19.5 (comment cites "mission control wall display").
- `TelemetryChart.tsx`: breach flagged below 19.5, hardcoded separately.
- `OldDashboard.tsx`: CRITICAL below 19.0, DEGRADED below 20.0.

Pick one number for `src/config.ts` and document the decision and reasoning in `docs/refactor-plan.md`.
