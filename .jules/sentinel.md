## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Secure Path Validation and Absolute Path Redaction
**Vulnerability:** Sibling directory traversal, arbitrary file reads outside of the repository, and absolute filesystem path disclosure in error messages.
**Learning:** External or project-relative Markdown reads can be exploited if the paths are not resolved and confined to the repository root. Standard error objects that include raw input file paths also leak sensitive host directory structures.
**Prevention:** Always resolve file paths relative to `process.cwd()` and verify that they start with the resolved root plus the directory separator. Sanitize error messages using `path.basename` to redact absolute directory details.
