# TEST_PATTERNS.md — Shokunin Cockpit (project delta)

> **Scope.** Project-specific testing layer only. The generic method (behavior-first, test at
> the right level, mock only at the boundary, deterministic, assert exactly, no PASS on prose)
> is owned by the **`test-patterns`** skill — don't restate it here. This file records what
> _this_ project tests and how. Rewritten 2026-06-24 for the cockpit (was borrowed from the
> index-ai portfolio: book forms, Twenty CRM, PostHog, llms.txt — none of which exist here).

## What breaks if the code is wrong (the question every test answers)

> Does the cockpit read durable files correctly, degrade safely on missing/invalid files, and
> **never show a declared gate as verified**?

## Stack

`Vitest` (unit + server route logic) · `@nuxt/test-utils` (Nuxt-aware route/render) ·
`@vue/test-utils` + `happy-dom` (component smoke). No Playwright required in V1 (the S1/S3
screenshots can be manual). No DB, no network — there are **no external APIs to mock**.

## Hard rules (this project)

TypeScript strict · zero `any` in tests · deterministic fixtures · **no filesystem writes to
real project paths** (use `fixtures/`) · no network · no secrets · no order-dependent tests ·
no broad snapshots · restore mocks `afterEach`.

## 1. Schema + parser tests (S0 — the contract)

The core of V1. With the `fixtures/sample-project/` files:

- valid frontmatter ⇒ `readDurable` returns `{ status: 'ok', data }` with the **typed** shape
- malformed frontmatter ⇒ `{ status: 'invalid', error }` (no throw)
- absent file ⇒ `{ status: 'missing' }` (no throw)
- each Zod schema rejects the wrong shape at the **exact** field (`issues[].path`)

```ts
it('returns invalid (not a throw) when CURRENT_STATE frontmatter is malformed', async () => {
  const result = await readDurable(fixture('current-state.malformed.md'), currentStateSchema)
  expect(result.status).toBe('invalid')
})
```

## 2. Server route tests (S1 — the view model)

With `@nuxt/test-utils`, against the fixture project:

- `GET /api/projects` lists the configured projects with their status
- `GET /api/projects/[id]/summary` returns the aggregated view model answering the 6 questions
- a project with a **missing** durable file returns a controlled response (per-file `status`
  surfaced), **never a 500**
- an unknown project id returns a typed not-found, not a crash

## 3. The honesty rule (S2 — the non-negotiable, highest-value test)

This is the test the product exists for:

- a gate with `verified: true` **and** a resolvable `proof` path ⇒ `displayVerified === true`
- a gate with `verified: true` but a **missing/unresolvable** `proof` ⇒ `displayVerified === false`
  (renders DECLARED, never VERIFIED)
- a gate with `status: blocked` ⇒ rendered BLOCKED regardless of `verified`

```ts
it('never marks a gate verified when its proof file does not resolve', () => {
  const gate = { id: 'G1', status: 'pass', verified: true, proof: 'reports/missing.md' }
  expect(computeDisplayVerified(gate, { proofResolves: () => false })).toBe(false)
})
```

## 4. Component smoke (S1/S3)

`@vue/test-utils` + `happy-dom`, **behavior not classes**:

- `GateChip` renders the right semantic label for each state (VERIFIED/DECLARED/BLOCKED/TODO/
  IN-PROGRESS) and is distinguishable (role/aria/text), not by Tailwind class list
- `Button` disabled emits no `click`; the `variant` prop maps to the right semantic role/state
- a missing/invalid file shows the badge, not a blank crash

Do **not** assert exhaustive Tailwind classes, full-page snapshots, or private computed names.

## 5. What NOT to test

Tailwind styling details, Nuxt framework internals, third-party libs, the Markdown **body**
rendering pixel-for-pixel. Test the contract and the honesty rule; skip the noise.

## Pre-commit / sprint gate

```bash
pnpm typecheck
pnpm test        # vitest run
pnpm build
```

A sprint gets GO only with **pasted** command output + (for S1/S3) a screenshot. No GO on prose.
