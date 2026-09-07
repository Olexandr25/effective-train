# Widget Template

Full annotated code for each step in `../SKILL.md`. Replace `<Name>` /
`<name>` / `<resource>` with the widget's PascalCase name, camelCase name,
and API resource key (e.g. `Fuel` / `fuel` / `fuel`), and `<Title>` with the
panel's display heading.

## 1. Type — `src/api/types.ts`

```ts
export interface <Name>Response {
  updated: string;
  // ...remaining fields, matching the fixture shape exactly. No `any`.
}
```

## 2. Domain logic — `src/domain/<name>.ts`

```ts
// Pure logic only — no React, no DOM. See CLAUDE.md "Conventions".

export function compute<Name>Metric(/* plain-data inputs */): number {
  // e.g. daysRemaining = currentKg / dailyConsumptionKg
}
```

### `src/domain/<name>.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { compute<Name>Metric } from './<name>';

describe('compute<Name>Metric', () => {
  it('computes the expected value for a known input', () => {
    expect(compute<Name>Metric(/* ... */)).toBe(/* ... */);
  });

  it('handles the zero/edge-case input without throwing', () => {
    // e.g. zero consumption rate, empty list, etc.
  });
});
```

## 3. Component — `src/components/<Name>Panel.tsx`

```tsx
import { useFetchResource } from '../hooks/useFetchResource';
import PanelStatus from './PanelStatus';
import type { <Name>Response } from '../api/types';
import { compute<Name>Metric } from '../domain/<name>';

export default function <Name>Panel() {
  const { data, loading, error, retry } = useFetchResource<<Name>Response>('<resource>');

  if (loading || error) {
    return (
      <PanelStatus
        title="<Title>"
        loading={loading}
        error={error}
        loadingMessage="Loading <resource>…"
        onRetry={retry}
      />
    );
  }

  if (!data) return null;

  const metric = compute<Name>Metric(/* fields pulled from data */);

  return (
    <section className="panel">
      <h2><Title></h2>
      {/* render data + metric */}
    </section>
  );
}
```

## 4. Register — `src/App.tsx`

```tsx
import <Name>Panel from './components/<Name>Panel';
// ...
<div className="grid">
  <TelemetryChart />
  <CrewPanel />
  <IncidentFeed />
  <<Name>Panel />
</div>
```

## 5. Data fixture note

`public/api/<resource>.json` is a locked path once the Exercise 2
PreToolUse hook (`block-protected-paths.sh`) is active — it denies
`Edit`/`Write`/`MultiEdit` there. If the fixture doesn't exist yet, don't
silently work around the hook: ask the user how they want it handled (scope
the hook to allow this one path, or have them add the file themselves) and
note the decision in `docs/hooks-demo.md`.
