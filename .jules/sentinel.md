## 2025-05-14 - Redacting Credentials in CLI Scripts

**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Absolute Path Traversal & Path Disclosure in readDurable
**Vulnerability:** Path traversal outside the project directory and disclosure of absolute server filesystem paths in read errors.
**Learning:** Utilities that read server-side files using user-influenced parameters (even in a local application) must strictly restrict and anchor paths. Leaving paths unvalidated allows reading unauthorized files (e.g. system files). Furthermore, raw path strings in error messages leak sensitive internal directory structures.
**Prevention:** Enforce path validation using path resolution against `process.cwd()` with a directory separator prefix check, limit permitted file extensions strictly to `.md`, and redact path names in error structures using `path.basename`.
