## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2025-05-14 - File System Zero-Trust and Path Anchoring
**Vulnerability:** Path traversal (using `..`) and unanchored absolute paths allow reading sensitive files (e.g., `/etc/passwd`) if the application fails to restrict the read scope to its project root.
**Learning:** Simply blocking `..` is insufficient if absolute paths are permitted. `node:path`'s `resolve` and `startsWith(process.cwd())` provide a stronger guarantee by anchoring all reads to a known root.
**Prevention:** Always validate file paths against a whitelist of extensions (e.g., `.md`) and ensure the resolved path remains within the expected directory tree using a `startsWith` check on the absolute path.
