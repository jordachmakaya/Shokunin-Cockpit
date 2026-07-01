## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2025-05-15 - Explicit YAML Engine for Gray-Matter
**Vulnerability:** Potential unsafe deserialization or utility breakage when `pnpm.overrides` forces a major version jump of `js-yaml` (v3 to v4) used by `gray-matter`.
**Learning:** `gray-matter` defaults to `js-yaml` v3's `safeLoad`. In v4, `safeLoad` is removed (as `load` is now safe). If the environment forces v4, `gray-matter` may throw or behave unpredictably.
**Prevention:** Explicitly configure `gray-matter` engines to use `yaml.load` when `js-yaml` v4 is present, and include `js-yaml` as a direct dependency to guarantee the parser's availability and version.
