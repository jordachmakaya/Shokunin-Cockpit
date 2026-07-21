## 2025-05-14 - Redacting Credentials in CLI Scripts

**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Securing External Markdown Path Resolution & Parsing

**Vulnerability:** Potential path traversal outside of project root, raw absolute path disclosure in error logs, and compatibility/safety issues with deprecated yaml parser engines.
**Learning:** Utilities that read and parse durable markdown files from external directories are prone to path traversal and absolute internal filesystem disclosure. Standard frontmatter libraries can also crash or fallback to insecure loaders when major dependencies are overridden.
**Prevention:** Always validate resolved absolute file paths against a root directory using `path.relative` to ensure they do not start with `..`. Constrain allowed extensions (e.g., strictly `.md`) and sanitize exceptions using `path.basename` to redact internal directory paths. Configure YAML loaders with safe parser configurations explicitly.
