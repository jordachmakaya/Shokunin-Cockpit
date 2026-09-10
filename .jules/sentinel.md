## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Explicit YAML Engine Configuration in gray-matter
**Vulnerability:** `gray-matter` default YAML engine invokes `js-yaml.safeLoad`, which was removed in `js-yaml` 4.x, causing runtime exceptions when parsing frontmatter or fallback to unsafe `yaml.load` in older versions.
**Learning:** When using `gray-matter` with `js-yaml` 4.x+, passing an explicit custom engine configuration using `yaml.load` prevents breaking changes and ensures safe YAML parsing.
**Prevention:** Explicitly pass `{ engines: { yaml: { parse: (s) => yaml.load(s) } } }` to `matter()` calls.
