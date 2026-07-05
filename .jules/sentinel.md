## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2025-05-15 - Hardening Durable File Reads
**Vulnerability:** Potential path traversal and arbitrary code execution via unsafe YAML parsing when reading external Markdown files.
**Learning:** Using `gray-matter` with default settings might use unsafe YAML loading. Also, without strict path validation, an attacker could potentially read sensitive files like `.env`.
**Prevention:** Implement strict path validation (blocking `..`, sensitive folders, and enforcing extensions) and explicitly use `js-yaml`'s `load` engine for safe parsing.
