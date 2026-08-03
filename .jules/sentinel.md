## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Absolute Path Redaction and Traversal Checks
**Vulnerability:** Information disclosure via absolute paths in filesystem error messages and potential path traversal outside the project root.
**Learning:** Utilities that parse external project files must enforce strict path anchoring (validating that paths reside within process.cwd()) and restrict file extensions (e.g. to `.md`) to prevent information leakage and traversal. Furthermore, error wrappers should explicitly redact absolute paths (using `basename`) to avoid leaking system structures in stack traces or logs.
**Prevention:** Use a centralized `validatePath` helper that checks prefix constraints and enforces extension rules. Redact path arguments inside exception classes before calling `super()`.
