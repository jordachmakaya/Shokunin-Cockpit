## 2025-05-14 - Redacting Credentials in CLI Scripts

**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-24 - Explicit YAML Loader Config for Gray-Matter with js-yaml v4

**Vulnerability:** Application crash when parsing Markdown frontmatter with updated js-yaml dependencies.
**Learning:** Gray-matter defaults to calling `js-yaml`'s deprecated `safeLoad` method under the hood, which has been completely removed in `js-yaml` 4.x. If dependencies are overridden or updated to 4.x, the default parser will trigger runtime errors.
**Prevention:** Always provide an explicit custom engine configuration for `gray-matter` using `js-yaml`'s `load` engine, returning an explicit object type: `(s) => yaml.load(s) as object`.
