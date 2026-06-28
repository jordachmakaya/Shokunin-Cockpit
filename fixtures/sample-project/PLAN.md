---
gates:
  - id: G0-schemas
    sprint: S0
    label: Zod schemas + parser + tests green
    status: pass
    verified: true
    proof: pnpm test output — 8 tests passed, 0 failed (2026-06-24)
  - id: G0-fixtures
    sprint: S0
    label: Fixtures created and readable by parser
    status: pass
    verified: true
    proof: readDurable(CURRENT_STATE.md) returns status ok in integration test
  - id: S1-gate
    sprint: S1
    label: Nuxt page reads and displays current state
    status: todo
    verified: false
roadmap:
  - id: S0
    title: Contract-first foundations
    state: done
  - id: S1
    title: Live dashboard read-only view
    state: in_progress
  - id: S2
    title: Gate verification engine
    state: todo
  - id: S3
    title: Multi-project support
    state: todo
---

Plan for Shokunin Cockpit V1. Gates drive sprint gating; roadmap items are display-only.
