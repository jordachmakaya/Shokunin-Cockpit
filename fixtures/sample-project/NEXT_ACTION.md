---
title: Run pnpm typecheck && pnpm test to validate S0
ownerTrack: coder
commands:
  - pnpm typecheck
  - pnpm test
requiredProof:
  - pnpm typecheck exits 0
  - pnpm test all green (4 parser cases + schema cases)
startFrom: code_repository/
---

Execute both check commands from the repo root and paste the outputs into the S0 code report.
