## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Absolute Path Traversal and File Extension Restriction in Cockpit File Reader
**Vulnerability:** Potential path traversal vulnerability allowing the local, read-only cockpit to read arbitrary system files outside of the configured workspace, and potential information leakage from raw absolute paths in FileReadError.
**Learning:** Utilities that read external files on disk (like `readDurable`) must not trust absolute paths directly. If dynamic file paths are accepted or read without validation, path traversal is possible. Additionally, raw file reading errors that propagate full absolute system paths to users or UI elements leak directory structures.
**Prevention:** Always normalize and validate absolute paths using `path.relative` against `process.cwd()`, checking for `..` prefixes, and restricting files strictly to their expected extensions (e.g., `.md`). Use `path.basename` in custom Error messages to redact sensitive system paths.
