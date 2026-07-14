## 2025-05-14 - Redacting Credentials in CLI Scripts

**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2025-05-15 - Hardening Filesystem Operations
**Vulnerability:** Path traversal, information leakage in error messages, and potential unsafe frontmatter parsing.
**Learning:** 1) `path.relative` against `process.cwd()` is a robust way to anchor file reads and prevent sibling directory traversal. 2) Redacting absolute paths in error classes (using `path.basename`) prevents leaking internal directory structures. 3) `gray-matter` may use deprecated/unsafe methods if not explicitly configured with `js-yaml` 4.x's `load` engine.
**Prevention:** Centralize filesystem access in a utility that enforces root anchoring and strict extension checks. Always redact paths in public error messages. Explicitly configure YAML engines for frontmatter parsing.
