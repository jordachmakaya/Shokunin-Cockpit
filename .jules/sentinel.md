## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-07-16 - Safe YAML Parsing and Incompatible Upgrades in gray-matter
**Vulnerability:** Insecure YAML parsing (prototype pollution) in bundled older `js-yaml` versions within `gray-matter`.
**Learning:** Forcing a secure version of `js-yaml` (`^4.2.0`) via `pnpm.overrides` broke `gray-matter` because `gray-matter` internally called `safeLoad`, which was removed in `js-yaml` v4. This resulted in unexpected functional breakage and parsing failures on all frontmatter files.
**Prevention:** When upgrading parser dependencies via lockfile overrides, explicitly configure the parsing library (`gray-matter`) with custom engines (e.g., `engines: { yaml: (s) => yaml.load(s) }`) to use the new safe APIs.
