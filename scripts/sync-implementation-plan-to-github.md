# Sync `IMPLEMENTATION_PLAN.md` to GitHub Issues

This document explains how to write a Shokunin `IMPLEMENTATION_PLAN.md`, sync it to GitHub Issues, update generated issue bodies, and pull/check the current GitHub Issue state back into a local status report.

The goal:

```txt
IMPLEMENTATION_PLAN.md
  → scripts/sync-plan-to-github-issues.mjs
  → GitHub Issues
  → optional GitHub Project
  → status report for Shokunin Cockpit / CTO review
```

The script creates, updates, or checks one GitHub Issue per task, for example:

```txt
T0.1 — Scaffold Nuxt + TypeScript strict
T0.2 — Zod schemas
T1.1 — Config loader
T2.2 — Gate honesty rule
```

Each generated issue receives:

- a stable hidden marker;
- sprint labels;
- source metadata;
- task body;
- sprint goal;
- expected tests;
- stop-check;
- Shokunin proof rules.

A GitHub Issue is not proof.

PASS still requires implementation, tests, typecheck/build when applicable, reproducible proof, and a report.

VERIFIED ≠ DECLARED.

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
    reports/
      github-issues-status.json
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

Only needed if you use project attachment.

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

## 3. Required GitHub labels

GitHub refuses to create an issue with labels that do not already exist.

Create the standard labels once per repo:

```bash
gh label create "source:implementation-plan" --description "Generated from IMPLEMENTATION_PLAN.md" --color "0366d6"
gh label create "shokunin" --description "Shokunin tracked task" --color "6f42c1"
```

Create the sprint labels used by the plan:

```bash
gh label create "sprint:S0" --description "Sprint S0" --color "ededed"
gh label create "sprint:S1" --description "Sprint S1" --color "ededed"
gh label create "sprint:S2" --description "Sprint S2" --color "ededed"
gh label create "sprint:S3" --description "Sprint S3" --color "ededed"
```

If you have more sprints, create matching labels:

```bash
gh label create "sprint:S4" --description "Sprint S4" --color "ededed"
gh label create "sprint:S5" --description "Sprint S5" --color "ededed"
```

If a label already exists, GitHub may return an error. That is safe to ignore.

---

## 4. `package.json` scripts

### 4.1 Plan outside the repo in `../CLAUDE/`

Use:

```json
{
  "scripts": {
    "github:plan:dry": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --dry-run",
    "github:plan:sync": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md",
    "github:plan:update:dry": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update --dry-run",
    "github:plan:update": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update",
    "github:plan:status": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --status",
    "github:plan:status:json": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --status --json-out ../CLAUDE/reports/github-issues-status.json",
    "github:plan:sync:project": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --project \"Shokunin Cockpit\"",
    "github:plan:update:project": "node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update --project \"Shokunin Cockpit\""
  }
}
```

### 4.2 Plan inside the repo root

Use:

```json
{
  "scripts": {
    "github:plan:dry": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --dry-run",
    "github:plan:sync": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md",
    "github:plan:update:dry": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --update --dry-run",
    "github:plan:update": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --update",
    "github:plan:status": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --status",
    "github:plan:status:json": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --status --json-out CLAUDE/reports/github-issues-status.json",
    "github:plan:sync:project": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --project \"Shokunin Cockpit\"",
    "github:plan:update:project": "node scripts/sync-plan-to-github-issues.mjs IMPLEMENTATION_PLAN.md --update --project \"Shokunin Cockpit\""
  }
}
```

The project scripts are optional.

Use them only if a GitHub Project with that name already exists and your token has the `project` scope.

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

The parser expects a stable Markdown structure.

Use this format:

```md
# IMPLEMENTATION PLAN — Project Name

> Produced by `sprint-planner`.
> Gate-driven: sprint N+1 does not start until sprint N's stop-check is VERIFIED.
> VERIFIED ≠ DECLARED.
> ID spine: plan task → GitHub issue → job file → job branch → commit → report → handoff.

---

## PRODUCT

- **What** — What the project builds.
- **Who** — Who uses it.
- **Success** — What success looks like.
- **Binding constraint** — Main non-negotiable constraint.
- **Out of scope** — What this version will not do.

---

## Locked decisions (do not relitigate)

| #   | Decision               | Rationale |
| --- | ---------------------- | --------- |
| Q1  | **Stack**: ...         | ...       |
| Q2  | **Data contract**: ... | ...       |

---

## S0 — Contract & fixtures

- **Goal:** One clear sprint goal.
- **Scope:** What is included in this sprint.
- **Tasks:**
  - `T0.1` First task title and details.
    _(budget: small, session-fit: yes)_
  - `T0.2` Second task title and details.
    _(budget: small, session-fit: yes)_
- **Tests:** What must be tested.
- **Stop-check (VERIFIED):** What proof must be pasted before PASS.
- **Handoff:** What the next session should pick up.

## S1 — Read-only project view

- **Goal:** One clear sprint goal.
- **Scope:** What is included in this sprint.
- **Tasks:**
  - `T1.1` First task title and details.
    _(budget: small, session-fit: yes)_
  - `T1.2` Second task title and details.
    _(budget: small, session-fit: yes)_
- **Tests:** What must be tested.
- **Stop-check (VERIFIED):** What proof must be pasted before PASS.
- **Handoff:** What the next session should pick up.
```

---

## 7. Parser rules

### 7.1 Sprint headings

Each sprint must use an H2 heading:

```md
## S0 — Contract & fixtures

## S1 — Read-only project view

## S2 — Health & honesty
```

Recommended separator:

```txt
—
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
  _(budget: ~7 files, session-fit: yes)_
- `T0.2` Zod schemas: `projectConfig`, `currentState`, `nextAction`, `handoff`, `plan`.
  _(budget: ~5 schema files, session-fit: yes)_
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

### 7.3 Multi-line tasks

The updated parser supports multi-line task bodies.

Example:

```md
- `T1.2` `server/api/projects/[id]/summary.get.ts`: aggregate currentState,
  nextAction, handoff, and plan gates into one typed view model.
  _(budget: ~2 files, session-fit: yes)_
```

The generated issue title still comes from the first task line.

The generated issue body includes the full task block.

### 7.4 Required sprint fields

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

## 8. CLI contract

Expected CLI:

```bash
node scripts/sync-plan-to-github-issues.mjs <PLAN_PATH> [options]
```

Modes:

```bash
# create missing issues, skip existing issues
node scripts/sync-plan-to-github-issues.mjs <PLAN_PATH>

# print create operations without writing
node scripts/sync-plan-to-github-issues.mjs <PLAN_PATH> --dry-run

# update generated issue body/title/labels for existing issues
node scripts/sync-plan-to-github-issues.mjs <PLAN_PATH> --update

# print update operations without writing
node scripts/sync-plan-to-github-issues.mjs <PLAN_PATH> --update --dry-run

# pull/check current GitHub issue state
node scripts/sync-plan-to-github-issues.mjs <PLAN_PATH> --status

# pull/check current GitHub issue state and write JSON
node scripts/sync-plan-to-github-issues.mjs <PLAN_PATH> --status --json-out <OUTPUT_PATH>
```

Optional:

```bash
--project "<PROJECT_NAME>"
--comment-on-update
--limit <number>
--help
```

---

## 9. First creation flow

Always run a dry-run first:

```bash
pnpm github:plan:dry
```

Expected output:

```txt
Found 4 sprint(s), 15 task(s).

--- DRY RUN CREATE ISSUE ---
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
- no secret appears in generated issue bodies;
- hidden markers are present.

After the dry-run is clean:

```bash
pnpm github:plan:sync
```

Expected:

```txt
Found 4 sprint(s), 15 task(s).
CREATED T0.1 — https://github.com/<owner>/<repo>/issues/1
CREATED T0.2 — https://github.com/<owner>/<repo>/issues/2
```

If rerun without update mode, expected:

```txt
SKIP T0.1 — issue #1 already exists (OPEN)
SKIP T0.2 — issue #2 already exists (OPEN)
```

---

## 10. Updating existing GitHub Issues

When `IMPLEMENTATION_PLAN.md` changes after the first sync, do not manually edit every GitHub Issue.

Use update mode.

Dry-run first:

```bash
pnpm github:plan:update:dry
```

Expected output:

```txt
--- DRY RUN UPDATE ISSUE ---
task: T1.2
issue: #12 (OPEN) https://github.com/<owner>/<repo>/issues/12
title: T1.2 — Render gate honesty state
changes:
- generated body differs from plan
```

Then run:

```bash
pnpm github:plan:update
```

Expected behavior:

```txt
If issue exists and generated body/title/labels differ:
  UPDATE title/body/labels

If issue exists and is already synced:
  SKIP

If issue does not exist:
  CREATE issue

If issue exists but is closed:
  keep it closed unless explicitly reopened manually
```

The update uses the hidden marker in each issue body:

```html
<!-- shokunin-plan-id:T0.1 -->
```

Recommended rule:

- use `github:plan:sync` for first creation;
- use `github:plan:update` after changing task wording, tests, stop-checks, or sprint goals;
- do not use update mode to overwrite human proof comments;
- proof should be added as comments or linked reports, not edited into the generated body.

---

## 11. Commenting on update

Optional.

If you want a short audit comment after each actual update:

```bash
node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update --comment-on-update
```

Recommended behavior:

```txt
UPDATED T1.2 — #12
COMMENTED T1.2 — #12
```

Use this sparingly.

Do not comment on every update unless you want an explicit audit trail.

Recommended ownership:

```txt
Generated body = plan state
Comments = execution proof / review / sync notes
```

---

## 12. Pull/check issue status

Use:

```bash
pnpm github:plan:status
```

This mode pulls/checks the current GitHub Issue state and compares it to `IMPLEMENTATION_PLAN.md`.

It checks:

- issue open / closed state;
- exact issue number;
- current labels;
- assignees;
- milestone;
- project status when exposed by GitHub CLI;
- comments summary;
- proof signal in comments;
- Shokunin state: `accepted`, `blocked`, `changes_requested`, or `unknown`;
- divergence between generated issue body and the plan;
- missing issues;
- orphan issues;
- duplicate issues;
- issues closed while still present in the plan.

Example output:

```txt
--- ISSUE STATUS SUMMARY ---
synced: 10
stale: 2
missing: 1
duplicates: 0
closed but in plan: 1
orphans: 1

--- PLAN TASKS ---
T0.1    #1    OPEN    synced              accepted           proof:1
T0.2    #2    CLOSED  closed_but_in_plan  accepted           proof:1
T1.1    —     missing missing_issue       unknown            proof:0
T1.2    #8    OPEN    stale               changes_requested  proof:0

--- ORPHAN ISSUES ---
T9.1    #20   OPEN    https://github.com/<owner>/<repo>/issues/20
```

### 12.1 Status JSON output

Use:

```bash
pnpm github:plan:status:json
```

Or directly:

```bash
node scripts/sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --status --json-out ../CLAUDE/reports/github-issues-status.json
```

The JSON report includes:

```json
{
  "generatedAt": "2026-06-26T00:00:00.000Z",
  "repo": "owner/repo",
  "planPath": "/absolute/path/to/IMPLEMENTATION_PLAN.md",
  "mode": "status",
  "summary": {
    "totalPlanTasks": 15,
    "synced": 10,
    "stale": 2,
    "missingIssues": 1,
    "duplicateIssues": 0,
    "closedButInPlan": 1,
    "orphanIssues": 1
  },
  "tasks": [],
  "orphanIssues": []
}
```

This is intended for Shokunin Cockpit or CTO review.

### 12.2 Divergence rules

An issue is `stale` when at least one generated field differs from the plan:

- title differs from plan;
- generated body differs from plan;
- required labels are missing.

An issue is `synced` when:

- title matches the plan;
- generated body matches the plan;
- required labels are present;
- issue is open.

An issue is `closed_but_in_plan` when:

- the issue is closed;
- the task still exists in `IMPLEMENTATION_PLAN.md`.

An issue is `missing_issue` when:

- the task exists in the plan;
- no issue with the matching hidden marker exists.

An issue is `duplicate_issues` when:

- more than one issue has the same hidden marker.

An orphan issue is an issue with a Shokunin marker whose task ID no longer exists in the plan.

### 12.3 Proof detection

The script detects proof comments heuristically.

A comment counts as proof when it includes one of these signals:

```txt
shokunin proof
proof:
pnpm typecheck
pnpm test
pnpm build
verified ≠ declared
verified != declared
```

This is not a PASS by itself.

It is a signal that proof may exist in comments.

The CTO must still verify the proof content.

### 12.4 Shokunin state detection

The script infers task state from labels first:

```txt
accepted
blocked
changes_requested
```

Recommended labels:

```txt
status:accepted
status:blocked
status:changes_requested
```

It can also infer state from comments containing an explicit line:

```txt
Shokunin status: accepted
Shokunin status: blocked
Shokunin status: changes_requested
```

If no explicit state is found:

```txt
unknown
```

Do not rely on natural-language comments for state.

Use labels or explicit `Shokunin status:` lines.

---

## 13. GitHub Project sync

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

To update existing generated issue bodies and attach newly created issues to the project:

```bash
pnpm github:plan:update:project
```

Project attachment is secondary.

If project sync fails but issues were created correctly, do not treat the whole sync as failed automatically.

Project status support depends on what GitHub CLI exposes through issue JSON fields in the current environment.

The script attempts to read project status when available and falls back safely when unavailable.

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

Cause:

The task first line is malformed, or the task ID does not follow the required format.

Fix:

Ensure task bullets start with:

```md
- `T1.2` Task title...
```

The parser supports continuation lines after the first task line.

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

### Status shows duplicate issues

Cause:

More than one issue contains the same marker.

Fix:

Inspect the duplicate issues manually.

Keep the correct one and close/archive the duplicate.

Do not run update mode until duplicates are resolved.

---

### Status shows closed issue still in plan

Cause:

The issue is closed but the task still exists in `IMPLEMENTATION_PLAN.md`.

Possible fixes:

- reopen the issue if the task is still active;
- remove/defer the task from the plan if the task is no longer part of scope;
- keep it closed only if the task is intentionally done and your process treats closed issues as completed tracking.

The script does not reopen closed issues.

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
4. Add the sync script.
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

12. Pull/check status:

```bash
pnpm github:plan:status
pnpm github:plan:status:json
```

13. After plan changes:

```bash
pnpm github:plan:update:dry
pnpm github:plan:update
pnpm github:plan:status
```

14. Work from GitHub Issues, but execute from Shokunin job files.

---

## 16. Recommended daily CTO check

Run:

```bash
pnpm github:plan:status
```

Look for:

- missing issues;
- stale generated bodies;
- closed issues still in plan;
- orphan issues;
- duplicate issues;
- tasks with no proof comments;
- tasks marked `changes_requested`;
- tasks marked `blocked`.

Then decide:

```txt
missing issue → sync/update plan
stale issue → update dry-run, then update
closed but in plan → reopen or update plan
orphan issue → close/archive or restore task
changes_requested → write follow-up job
blocked → resolve blocker or ask owner
```

---

## 17. Rule

A GitHub Issue created from the plan is not a PASS.

It is only a tracked work item.

PASS still requires:

- implementation;
- tests;
- typecheck;
- build when applicable;
- proof;
- report or pasted output;
- CTO verification.

VERIFIED ≠ DECLARED.
