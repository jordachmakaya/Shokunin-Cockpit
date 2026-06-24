# Sync `IMPLEMENTATION_PLAN.md` to GitHub Issues

This document explains how to write an `IMPLEMENTATION_PLAN.md` that can be parsed by the Shokunin Cockpit sync script, then converted into GitHub Issues.

It also explains how to update existing GitHub Issues from the CLI when the implementation plan changes.

The goal:

```txt
IMPLEMENTATION_PLAN.md
  → scripts/sync-plan-to-github-issues.mjs
  → GitHub Issues
  → optional GitHub Project
```

The script creates or updates one GitHub Issue per task, for example:

```txt
T0.1 — Scaffold Nuxt + TypeScript strict
T0.2 — Zod schemas
T1.1 — Config loader
T2.2 — Gate honesty rule
```

Each issue receives:

- a stable hidden marker;
- sprint labels;
- source metadata;
- task body;
- sprint goal;
- expected tests;
- stop-check;
- Shokunin proof rules.

---

## 1. Required repository layout

Recommended layout:

```txt
my-project/
  code_repository/
    package.json
    scripts/
      sync-plan-to-github-issues.mjs

  CLAUDE/
    IMPLEMENTATION_PLAN.md
```

In this layout, the Git repository is `code_repository`, but the plan lives one level above, inside `CLAUDE`.

From inside `code_repository`, the plan path is:

```txt
../CLAUDE/IMPLEMENTATION_PLAN.md
```

If your plan lives directly inside the repo, use:

```txt
IMPLEMENTATION_PLAN.md
```

---

## 2. Prerequisites

### 2.1 Install GitHub CLI

The script uses the GitHub CLI command `gh`.

Verify installation:

```bash
gh --version
```

### 2.2 Authenticate GitHub CLI

Login:

```bash
gh auth login
```

Verify:

```bash
gh auth status
```

Expected result:

```txt
✓ Logged in to github.com account <your-account>
```

If `GH_TOKEN` or `GITHUB_TOKEN` is set and invalid, it can override the keyring login.

In Git Bash:

```bash
unset GH_TOKEN
unset GITHUB_TOKEN
gh auth status
```

If the token returns in every terminal, remove it from your shell profile or Windows environment variables.

PowerShell check:

```powershell
[Environment]::GetEnvironmentVariable("GH_TOKEN", "User")
[Environment]::GetEnvironmentVariable("GH_TOKEN", "Machine")
[Environment]::GetEnvironmentVariable("GITHUB_TOKEN", "User")
[Environment]::GetEnvironmentVariable("GITHUB_TOKEN", "Machine")
```

PowerShell remove user variables:

```powershell
[Environment]::SetEnvironmentVariable("GH_TOKEN", $null, "User")
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", $null, "User")
```

Close and reopen Git Bash after changing Windows environment variables.

### 2.3 Add GitHub Project scope if needed

Only needed if you use the `--project` option.

```bash
gh auth refresh -s project
gh auth status
```

Expected token scopes should include:

```txt
project
```

### 2.4 Verify repository remote

From the Git repo:

```bash
git remote -v
```

Expected SSH example:

```txt
origin  git@github-jordach:jordachmakaya/Shokunin-Cockpit.git (fetch)
origin  git@github-jordach:jordachmakaya/Shokunin-Cockpit.git (push)
```

Expected HTTPS example:

```txt
origin  https://github.com/<owner>/<repo>.git
```

The script infers the GitHub repository from `origin`.

---

## 3. Create required GitHub labels

GitHub refuses to create an issue with labels that do not already exist.

Create the standard labels once per repo:

```bash
gh label create "sprint:S0" --description "Sprint S0" --color "ededed"
gh label create "sprint:S1" --description "Sprint S1" --color "ededed"
gh label create "sprint:S2" --description "Sprint S2" --color "ededed"
gh label create "sprint:S3" --description "Sprint S3" --color "ededed"

gh label create "source:implementation-plan" --description "Generated from IMPLEMENTATION_PLAN.md" --color "0366d6"
gh label create "shokunin" --description "Shokunin tracked task" --color "6f42c1"
```

If you have more sprints, create the matching labels:

```bash
gh label create "sprint:S4" --description "Sprint S4" --color "ededed"
gh label create "sprint:S5" --description "Sprint S5" --color "ededed"
```

If a label already exists, GitHub may return an error. That is safe to ignore.

---

## 4. `package.json` scripts

If `IMPLEMENTATION_PLAN.md` is outside the repo in `../CLAUDE/`, use:

```json
{
  "scripts": {
    "github:plan:dry": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --dry-run",
    "github:plan:sync": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md",
    "github:plan:update:dry": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update --dry-run",
    "github:plan:update": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update",
    "github:plan:sync:project": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --project \"Shokunin Cockpit\"",
    "github:plan:update:project": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update --project \"Shokunin Cockpit\""
  }
}
```

If `IMPLEMENTATION_PLAN.md` is inside the repo root, use:

```json
{
  "scripts": {
    "github:plan:dry": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --dry-run",
    "github:plan:sync": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md",
    "github:plan:update:dry": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --update --dry-run",
    "github:plan:update": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --update",
    "github:plan:sync:project": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --project \"Shokunin Cockpit\"",
    "github:plan:update:project": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --update --project \"Shokunin Cockpit\""
  }
}
```

The `--project` scripts are optional.

Use them only if a GitHub Project with that name already exists and your `gh` token has the `project` scope.

---

## 5. Verify paths before syncing

From the Git repo root:

```bash
test -f ../CLAUDE/IMPLEMENTATION_PLAN.md && echo "PLAN OK" || echo "PLAN MISSING"
test -f scripts/sync-plan-to-github-issues.mjs && echo "SCRIPT OK" || echo "SCRIPT MISSING"
```

Expected:

```txt
PLAN OK
SCRIPT OK
```

If your plan is inside the repo:

```bash
test -f IMPLEMENTATION_PLAN.md && echo "PLAN OK" || echo "PLAN MISSING"
test -f scripts/sync-plan-to-github-issues.mjs && echo "SCRIPT OK" || echo "SCRIPT MISSING"
```

---

## 6. Required `IMPLEMENTATION_PLAN.md` format

The parser expects a specific Markdown structure.

Use this format:

```md
# IMPLEMENTATION PLAN — Project Name

> Produced by `sprint-planner`.
> Gate-driven: sprint N+1 does not start until sprint N's stop-check is VERIFIED.
> VERIFIED ≠ DECLARED.

---

## PRODUCT

- **What** — What the project builds.
- **Who** — Who uses it.
- **Success** — What success looks like.
- **Binding constraint** — Main non-negotiable constraint.
- **Out of scope** — What this V1 will not do.

---

## Locked decisions (do not relitigate)

| #  | Decision | Rationale |
|----|----------|-----------|
| Q1 | **Stack**: ... | ... |
| Q2 | **Data contract**: ... | ... |

---

## S0 — Contract & fixtures

- **Goal:** One clear sprint goal.
- **Scope:** What is included in this sprint.
- **Tasks:**
  - `T0.1` First task title and details.
    *(budget: small, session-fit: yes)*
  - `T0.2` Second task title and details.
    *(budget: small, session-fit: yes)*
- **Tests:** What must be tested.
- **Stop-check (VERIFIED):** What proof must be pasted before PASS.
- **Handoff:** What the next session should pick up.

## S1 — Read-only project view

- **Goal:** One clear sprint goal.
- **Scope:** What is included in this sprint.
- **Tasks:**
  - `T1.1` First task title and details.
    *(budget: small, session-fit: yes)*
  - `T1.2` Second task title and details.
    *(budget: small, session-fit: yes)*
- **Tests:** What must be tested.
- **Stop-check (VERIFIED):** What proof must be pasted before PASS.
- **Handoff:** What the next session should pick up.
```

---

## 7. Parser rules

The script relies on these rules.

### 7.1 Sprint headings

Each sprint must use an H2 heading:

```md
## S0 — Contract & fixtures
## S1 — Read-only project view
## S2 — Health & honesty
## S3 — Brand design system
```

Recommended separator:

```txt
—
```

Recommended:

```md
## S0 — Contract & fixtures
```

Avoid:

```md
### S0
# Sprint 0
## Sprint S0
```

### 7.2 Task bullets

Each task must be inside the `- **Tasks:**` section.

Each task must start with:

```md
- `T0.1` Task title...
```

Examples:

```md
- `T0.1` Scaffold Nuxt + TypeScript strict + pnpm.
  *(budget: ~7 files, session-fit: yes)*
- `T0.2` Zod schemas: `projectConfig`, `currentState`, `nextAction`, `handoff`, `plan`.
  *(budget: ~5 schema files, session-fit: yes)*
```

Valid task IDs:

```txt
T0.1
T0.2
T1.1
T2.3
T3.4
```

Avoid:

```md
- T0.1 Scaffold Nuxt
- **T0.1** Scaffold Nuxt
- `Task 0.1` Scaffold Nuxt
```

The backticks around the task ID are required.

### 7.3 Required sprint fields

Each sprint should include:

```md
- **Goal:** ...
- **Scope:** ...
- **Tasks:**
  - `T0.1` ...
- **Tests:** ...
- **Stop-check (VERIFIED):** ...
- **Handoff:** ...
```

The most important fields for issue generation are:

```md
- **Goal:**
- **Tasks:**
- **Tests:**
- **Stop-check (VERIFIED):**
```

---

## 8. Recommended implementation plan template

Copy this template for new projects.

```md
# IMPLEMENTATION PLAN — <Project Name>

> Produced by `sprint-planner` from `CLAUDE/INTENT.md`.
> Gate-driven: sprint N+1 does not start until sprint N's stop-check is VERIFIED.
> VERIFIED ≠ DECLARED.
> ID spine: plan block → GitHub issue → job file → report file → handoff.

---

## PRODUCT

- **What** — <What the project builds.>
- **Who** — <Who uses it.>
- **Success** — <What success looks like in practical terms.>
- **Binding constraint** — <Main constraint.>
- **Out of scope** — <What must not be built in this version.>

---

## Locked decisions (do not relitigate)

| #  | Decision | Rationale |
|----|----------|-----------|
| Q1 | **Stack**: <stack> | <why> |
| Q2 | **Data contract**: <contract> | <why> |
| Q3 | **Testing gate**: <gate> | <why> |

---

## S0 — Contract & foundation

- **Goal:** <Freeze the contract before building features.>
- **Scope:** <Schemas, fixtures, minimal utilities, setup.>
- **Tasks:**
  - `T0.1` <Task title and details.>
    *(budget: <small/medium>, session-fit: yes)*
  - `T0.2` <Task title and details.>
    *(budget: <small/medium>, session-fit: yes)*
- **Tests:** <Expected tests.>
- **Stop-check (VERIFIED):** <Exact proof required.>
- **Handoff:** <What the next session should open first.>

## S1 — First vertical slice

- **Goal:** <One usable end-to-end path.>
- **Scope:** <API, UI, model, or integration needed for the slice.>
- **Tasks:**
  - `T1.1` <Task title and details.>
    *(budget: <small/medium>, session-fit: yes)*
  - `T1.2` <Task title and details.>
    *(budget: <small/medium>, session-fit: yes)*
- **Tests:** <Expected tests.>
- **Stop-check (VERIFIED):** <Exact proof required.>
- **Handoff:** <What the next session should open first.>

## S2 — Risk / correctness gate

- **Goal:** <Prove the riskiest behavior.>
- **Scope:** <Validation, security, resilience, correctness, error handling.>
- **Tasks:**
  - `T2.1` <Task title and details.>
    *(budget: <small/medium>, session-fit: yes)*
  - `T2.2` <Task title and details.>
    *(budget: <small/medium>, session-fit: yes)*
- **Tests:** <Expected tests.>
- **Stop-check (VERIFIED):** <Exact proof required.>
- **Handoff:** <What the next session should open first.>

## S3 — Polish / packaging

- **Goal:** <Polish without changing proven behavior.>
- **Scope:** <UI polish, docs, packaging, accessibility, final checks.>
- **Tasks:**
  - `T3.1` <Task title and details.>
    *(budget: <small/medium>, session-fit: yes)*
  - `T3.2` <Task title and details.>
    *(budget: <small/medium>, session-fit: yes)*
- **Tests:** <Expected tests.>
- **Stop-check (VERIFIED):** <Exact proof required.>
- **Handoff:** <Final state or next version entry point.>

---

## Definition of Done

- `pnpm typecheck` clean.
- `pnpm test` green.
- `pnpm build` green when applicable.
- No `any`.
- No secrets exposed.
- Errors handled.
- Stop-check proof pasted.
- VERIFIED ≠ DECLARED.
```

---

## 9. Script contract

The sync script must live here:

```txt
scripts/sync-plan-to-github-issues.mjs
```

Expected CLI:

```bash
node scripts/sync-plan-to-github-issues.mjs <PLAN_PATH> [--dry-run] [--update] [--project "<PROJECT_NAME>"] [--comment-on-update]
```

Examples:

```bash
node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --dry-run
node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md
node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update --dry-run
node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update
node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --project "Shokunin Cockpit"
```

The script should:

1. read the plan file;
2. find sprint blocks like `## S0 — ...`;
3. find tasks like ``- `T0.1` ...``;
4. create one GitHub Issue per task;
5. update existing GitHub Issues when `--update` is passed;
6. add labels:
   - `sprint:S0`
   - `source:implementation-plan`
   - `shokunin`
7. add a hidden marker to each issue body:

```html
<!-- shokunin-plan-id:T0.1 -->
```

This marker makes the sync idempotent.

---

## 10. First creation flow

Always run a dry-run first:

```bash
pnpm github:plan:dry
```

Expected output:

```txt
Found 4 sprint(s), 15 task(s).

--- DRY RUN ISSUE ---
title: T0.1 — ...
labels: sprint:S0, source:implementation-plan, shokunin
...
```

Before real sync, verify:

- the number of sprints is correct;
- the number of tasks is correct;
- task titles are not cut;
- labels match existing GitHub labels;
- the plan path is correct;
- no secret appears in generated issue bodies.

After the dry-run is clean:

```bash
pnpm github:plan:sync
```

Expected:

```txt
Found 4 sprint(s), 15 task(s).
CREATED T0.1 — https://github.com/<owner>/<repo>/issues/1
CREATED T0.2 — https://github.com/<owner>/<repo>/issues/2
...
```

If you rerun the command without `--update`, expected:

```txt
SKIP T0.1 — issue already exists
SKIP T0.2 — issue already exists
...
```

---

## 11. Updating existing GitHub Issues

When `IMPLEMENTATION_PLAN.md` changes after the first sync, do not manually edit every GitHub Issue.

Use update mode.

Dry-run first:

```bash
pnpm github:plan:update:dry
```

Review the output carefully.

Then run:

```bash
pnpm github:plan:update
```

Update mode uses the hidden marker in each issue body:

```html
<!-- shokunin-plan-id:T0.1 -->
```

The marker lets the script find the existing issue for each task.

Expected behavior:

```txt
If issue exists:
  UPDATE title/body/labels

If issue does not exist:
  CREATE issue

If issue exists but is closed:
  keep it closed unless explicitly reopened manually
```

Recommended rule:

- use `github:plan:sync` for the first creation;
- use `github:plan:update` after changing task wording, tests, stop-checks, or sprint goals;
- do not use update mode to overwrite human proof comments;
- proof should be added as comments, not edited into the generated body.

The generated issue body is owned by `IMPLEMENTATION_PLAN.md`.

Human execution evidence is owned by comments or linked reports.

---

## 12. Commenting on update

Optional.

If the script supports `--comment-on-update`, it can add a short comment after updating an existing issue.

Example CLI:

```bash
node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update --comment-on-update
```

Recommended behavior:

```txt
UPDATED T0.1 — issue #1
COMMENTED T0.1 — issue #1
```

Use this sparingly.

Do not comment on every update unless you want an explicit audit trail.

Recommended rule:

```txt
Body = generated plan state
Comments = execution proof / review / sync notes
```

---

## 13. Sync to a GitHub Project

Optional.

First, confirm the project exists on GitHub.

Then ensure the `project` scope is active:

```bash
gh auth refresh -s project
gh auth status
```

Then run:

```bash
pnpm github:plan:sync:project
```

To update existing issues and attach them to the project:

```bash
pnpm github:plan:update:project
```

If the project does not exist or the token lacks the `project` scope, GitHub CLI will fail.

---

## 14. Common errors

### Error: label not found

Example:

```txt
could not add label: 'sprint:S0' not found
```

Cause:

The GitHub label does not exist yet.

Fix:

```bash
gh label create "sprint:S0" --description "Sprint S0" --color "ededed"
```

Repeat for all sprint labels.

---

### Error: invalid `GH_TOKEN`

Example:

```txt
X Failed to log in to github.com using token (GH_TOKEN)
The token in GH_TOKEN is invalid.
```

Cause:

`GH_TOKEN` is set and overrides the keyring login.

Fix in Git Bash:

```bash
unset GH_TOKEN
unset GITHUB_TOKEN
gh auth status
```

If the token returns in every terminal, remove it from your shell profile or Windows environment variables.

---

### Error: plan missing

Example:

```txt
ERROR: Plan file not found
```

Cause:

Wrong relative path.

Fix:

```bash
pwd
test -f ../CLAUDE/IMPLEMENTATION_PLAN.md && echo "PLAN OK" || echo "PLAN MISSING"
```

Then update the package script with the correct path.

---

### Error: script missing

Example:

```txt
Cannot find module scripts/sync-plan-to-github-issues.mjs
```

Cause:

Script does not exist in the repo or the path is wrong.

Fix:

```bash
test -f scripts/sync-plan-to-github-issues.mjs && echo "SCRIPT OK" || echo "SCRIPT MISSING"
```

---

### Dry-run task title is cut

Example:

```txt
T1.2 — server/api/projects/[id]/summary.get.ts: aggregate currentState + nextAction +
```

Cause:

The parser is only reading the first line of a multi-line task.

Fix:

Update the parser so it captures each task until the next task ID or the next sprint field.

Recommended task format:

```md
- `T1.2` `server/api/projects/[id]/summary.get.ts`: aggregate currentState, nextAction,
  handoff, and plan gates into one typed view model.
  *(budget: ~2 files, session-fit: yes)*
```

---

### Issue exists but script creates a duplicate

Cause:

The hidden marker is missing from the existing issue body.

Expected marker:

```html
<!-- shokunin-plan-id:T0.1 -->
```

Fix:

Add the marker manually to the issue body, or close the duplicate and rerun the update command.

---

### Issue was manually edited and update overwrote it

Cause:

The generated issue body is owned by `IMPLEMENTATION_PLAN.md`.

Fix:

Put human notes, execution proof, and review output in comments instead of the generated body.

Recommended rule:

```txt
Generated body = plan state
Comments = human / agent execution evidence
```

---

## 15. Recommended workflow for a new project

1. Create or confirm the GitHub repo.
2. Create `CLAUDE/IMPLEMENTATION_PLAN.md`.
3. Write the plan using the template above.
4. Add the sync script:

```txt
scripts/sync-plan-to-github-issues.mjs
```

5. Add `package.json` scripts.
6. Authenticate GitHub CLI:

```bash
gh auth status
```

7. If using GitHub Projects:

```bash
gh auth refresh -s project
```

8. Create labels:

```bash
gh label create "sprint:S0" --description "Sprint S0" --color "ededed"
gh label create "source:implementation-plan" --description "Generated from IMPLEMENTATION_PLAN.md" --color "0366d6"
gh label create "shokunin" --description "Shokunin tracked task" --color "6f42c1"
```

9. Verify paths:

```bash
test -f ../CLAUDE/IMPLEMENTATION_PLAN.md && echo "PLAN OK" || echo "PLAN MISSING"
test -f scripts/sync-plan-to-github-issues.mjs && echo "SCRIPT OK" || echo "SCRIPT MISSING"
```

10. Dry-run:

```bash
pnpm github:plan:dry
```

11. Real sync:

```bash
pnpm github:plan:sync
```

12. After plan changes:

```bash
pnpm github:plan:update:dry
pnpm github:plan:update
```

13. Work from GitHub Issues.

---

## 16. Rule

A GitHub Issue created from the plan is not a PASS.

It is only a tracked work item.

PASS still requires:

- implementation;
- tests;
- typecheck;
- proof;
- report or pasted output.

VERIFIED ≠ DECLARED.
