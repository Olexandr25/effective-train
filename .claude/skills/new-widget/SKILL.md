---
name: new-widget
description: Scaffold a new Orbital Ops dashboard widget — typed API response, the shared fetch hook, pure domain logic with a unit test, and registration in the panel grid. Use when adding a new data panel to the dashboard.
allowed-tools: Read, Write, Edit, Bash(npx vitest:*)
---

# New Widget

Scaffolds one dashboard widget following this repo's conventions (see
`CLAUDE.md`): a typed API response, the shared fetch hook, pure domain
logic with a test, and a panel component registered in `src/App.tsx`.

Full annotated code for every step lives in
[`references/widget-template.md`](references/widget-template.md) — read it
before writing any code, then adapt the templates to the widget's fields.

## Steps

1. **Type the response.** Add a `<Name>Response` interface to
   `src/api/types.ts` matching the fixture under `public/api/`. No `any`
   crosses that boundary.
2. **Data fixture.** If `public/api/<resource>.json` doesn't exist yet,
   confirm its shape with the user before creating it — it's a locked
   path (see CLAUDE.md's deletion policy and the Exercise 2 PreToolUse
   hook, which blocks `Edit`/`Write` there by design).
3. **Domain logic.** Add pure computation (thresholds, derived values) to
   a new `src/domain/<name>.ts`, with a colocated `<name>.test.ts`. No
   React, no DOM — plain-data-in/plain-data-out, per CLAUDE.md.
4. **Component.** Add `src/components/<Name>Panel.tsx` using
   `useFetchResource<...>('<resource>')` and `PanelStatus` for the
   loading/error states, exactly like `CrewPanel.tsx`. Keep it under ~80
   lines and complexity under 10; decompose further if it grows past that.
5. **Register it.** Import the new component into `src/App.tsx` and add
   it to the `.grid` alongside the other panels.
6. **Verify.** Run `npx vitest run tests/ src/` for the new domain test,
   then `npm run validate` for the full gauntlet.

See `references/widget-template.md` for the full code for each step.
