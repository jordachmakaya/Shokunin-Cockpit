## 2026-06-28 - Explicit Safe YAML Loading with gray-matter
**Vulnerability:** YAML parsing crash or vulnerability due to incompatible `js-yaml` versions and dependency overrides.
**Learning:** Overriding `js-yaml` to `4.x` to resolve CVEs breaks `gray-matter`'s default parser since it relies on the deprecated `safeLoad` method. This crashes the application when reading files.
**Prevention:** Always explicitly configure the custom parser engine for `gray-matter` to map to `yaml.load(s) as object` using `js-yaml` 4.x.

## 2026-06-28 - Path Traversal Prevention and Path Redaction
**Vulnerability:** Path traversal outside project root or file extension spoofing; information leakage of absolute paths in error messages.
**Learning:** Resolving path with `path.resolve` and comparing it to `process.cwd()` prevents traversal. Restricting inputs to `.md` prevents loading arbitrary files (like `package.json`). Absolute filesystem paths must be redacted in custom error classes using `path.basename` to prevent path disclosure.
**Prevention:** Implement `validatePath` before all filesystem reads and sanitize error messages using `node:path`'s `basename`.

## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.
