## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Path Traversal in Durable File Reading
**Vulnerability:** The `readDurable` utility accepted absolute paths without validation, allowing traversal outside the intended project roots.
**Learning:** In an application designed to read files from external projects, the trust boundary for file paths must be explicitly enforced. Using `path.relative` against the project root and checking for `..` is a robust way to anchor these reads.
**Prevention:** Always validate absolute paths against allowed roots and restrict file extensions (e.g., to `.md`) before performing filesystem operations.
