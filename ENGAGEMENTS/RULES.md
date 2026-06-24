# RULES.md — Shokunin Cockpit (project delta)

> **Scope.** This file is the **project-specific** engineering layer only. The generic
> doctrine (production-ready, strict types, deliberate errors, zero-trust input, no secrets,
> redacted logging) is owned by the **`engineering-rules`** skill; external-call resilience
> by **`api-resilience`**; testing by **`test-patterns`**. Do **not** restate them here —
> this file records only what is true for *this* project. If this file and a skill conflict,
> the skill's generic bar still applies; this file narrows it.
>
> Rewritten 2026-06-24 for the cockpit (was borrowed from the index-ai portfolio, which had
> CRM/forms/analytics this project does not have).

## What this project is (constrains every rule)

A **local, read-only** Nuxt cockpit (`pnpm run dev`) that reads durable Markdown files from
other agentic projects and renders their state. See `CLAUDE/INTENT.md` and
`CLAUDE/IMPLEMENTATION_PLAN.md`. V1 has **no database, no auth, no writes, no external API**.

## 1. Stack (locked — see plan Q1/Q2/Q3/Q10)

TypeScript **strict** · Nuxt (`server/api` for filesystem reads) · pnpm · **Zod** (validation)
· **gray-matter** (frontmatter parsing) · **Vitest** (tests) · **Tailwind v4** via
`@tailwindcss/vite` (CSS-first `@theme`; styling lands in S3). No NestJS, no Nuxt Content,
no DB driver in V1.

## 2. Types

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- **Zero `any`.** External/file input is `unknown` until a Zod schema parses it.
- No unsafe casts; narrow with `schema.parse()` / type guards, not `as`.

## 3. The data boundary (this project's real risk)

The durable files come from **outside this repo** — treat **all frontmatter as untrusted**:

- Read every durable file through the single parser util `readDurable<T>(absPath, schema)`,
  which returns `{ status: 'ok'; data } | { status: 'missing' } | { status: 'invalid'; error }`.
- **Never infer state from the Markdown body.** Structured state lives in frontmatter only.
- A missing or invalid file **degrades gracefully** (badge `missing`/`invalid`) — it must
  **never** throw a 500 or crash a page.
- Resolve project paths from `projects.local.json` (Zod-validated). **Never hardcode `CLAUDE/`.**

## 4. The honesty rule (the product's reason to exist — non-negotiable, see plan Q7)

A gate renders **VERIFIED** only if `verified === true` **and** its `proof` path resolves on
disk. Otherwise it renders **DECLARED / UNVERIFIED**. This decision is computed **server-side**
(not in the component) and is **unit-tested**. The cockpit must never show a *declared* status
as *verified*.

## 5. Nuxt server routes

Small handlers: validate input → call a small service/util → return a controlled, typed
response → map errors safely. No business logic sprawled in routes. Server-only code stays in
`server/`; browser code must not import server modules.

## 6. Errors & logging

- Custom error classes for expected categories (e.g. `ConfigError`, `FileReadError`,
  `SchemaValidationError`). Never `throw 'string'`; never swallow (`catch {}`).
- No `console.log` in committed code. If a server logger is added, log metadata, never file
  contents that could carry sensitive project data.

## 7. Filesystem safety (read-only V1)

- **Reads only.** No write/delete/move of user project files. No watchers in V1.
- Confine reads to the configured project roots; reject path traversal outside a project root.
- Don't read `.env*`, lockfiles, `node_modules/`, `.git/`, build output of target projects.
  (See `DO_NOT_READ.md`.)

## 8. Vue / components

Small, single-purpose, typed props (no `any` prop bags). Template logic stays thin (computed /
composable / child component). The S3 brand primitives (Button, Badge, Card, GateChip) are the
shared UI vocabulary — don't reinvent one-off variants.

## 9. Dependencies

Before adding one: is it necessary, maintained, and not already covered by Nuxt/Vue/std-lib?
V1's whole dependency surface is `zod`, `gray-matter`, `tailwindcss` + test tooling. Justify
anything beyond that.

## 10. Out of scope (do NOT build in V1 — see plan)

External API clients, circuit breaker / bulkhead / retry (no external deps → `api-resilience`
not triggered), DB, auth, forms, analytics/consent, AI-readable endpoints, file editing,
agent orchestration, packaging. If a task seems to need these, it's mis-scoped — stop and check
the plan.

## Pre-commit (this project)

```bash
pnpm typecheck   # strict, zero any
pnpm test        # vitest run
pnpm build       # must be green
```
