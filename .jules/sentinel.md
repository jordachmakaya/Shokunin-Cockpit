## 2025-05-14 - Redacting Credentials in CLI Scripts

**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2025-05-15 - Hardening Filesystem Reads and Regex

**Vulnerability:** Path traversal risks in local cockpit and ReDoS in plan-sync scripts.
**Learning:** Utilities that accept absolute paths must be guarded by a strict validation layer, even in local-only apps. Overlapping quantifiers in regex patterns (e.g., `\s+(.+)$`) can lead to polynomial backtracking.
**Prevention:** Implement a `validatePath` utility to block `..` and sensitive files. Use `\s+(\S.*)$` to ensure the quantifier doesn't overlap with trailing spaces.
