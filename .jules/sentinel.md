## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-07-09 - Hardening Filesystem Reads and YAML Parsing
**Vulnerability:** Path traversal risks and information leakage via absolute paths in error messages; unsafe YAML parsing in frontmatter.
**Learning:** Even if an application is intended to be local and read-only, it must still defend against malicious or malformed input files. Path traversal and information leakage (filesystem structure) are key risks. Additionally, libraries like `gray-matter` may default to unsafe YAML parsing if not explicitly configured.
**Prevention:** Implement strict path validation (normalization, traversal blocking, extension checks, and directory blacklisting) before any filesystem read. Redact absolute paths in error messages. Explicitly configure YAML engines to use safe loading methods (e.g., `js-yaml.load` in v4+).
