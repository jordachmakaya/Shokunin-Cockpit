## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Securing Filesystem Reads and Error Path Disclosure
**Vulnerability:** Path traversal, insecure file extension reads, and absolute filesystem path disclosure in error logging.
**Learning:** Directly reading filesystem paths without validation permits sibling directory traversal or access to non-markdown files. Also, exposing absolute file paths in `FileReadError` logs leaks sensitive system folder structures.
**Prevention:** Always sanitize paths against `process.cwd()` and restrict file extensions. Redact absolute paths using `basename` before embedding them in error messages.
