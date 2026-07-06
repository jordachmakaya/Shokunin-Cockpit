## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-07-06 - [Safe Markdown Parsing & Path Validation]
**Vulnerability:** Unsafe YAML parsing in `gray-matter` and potential path traversal in file reading utilities.
**Learning:** Default `gray-matter` may use unsafe YAML engines if not explicitly configured. In a "cockpit" app that reads external files, path traversal is a high-risk vector.
**Prevention:** Always use `js-yaml` v4's `load` engine with `gray-matter`. Implement a standalone `path-validator` to enforce strict allow-lists (e.g., only `.md` files) and block forbidden patterns like `..`, `.git`, and `node_modules`.
