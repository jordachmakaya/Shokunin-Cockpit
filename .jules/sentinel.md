## 2025-05-14 - Redacting Credentials in CLI Scripts

**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2025-05-15 - Explicit YAML Engine for gray-matter

**Vulnerability:** gray-matter failing to parse frontmatter when js-yaml v4 is forced via overrides, leading to application-wide "invalid" states.
**Learning:** js-yaml v4 removed `safeLoad` in favor of `load` (which is now safe by default). gray-matter defaults to `safeLoad` if not explicitly configured.
**Prevention:** Always explicitly configure the `engines` option in `matter()` when using modern js-yaml versions to ensure compatibility and predictable parsing behavior.

## 2025-05-15 - Regular Expression Denial of Service (ReDoS) in CLI Scripts

**Vulnerability:** Regex patterns with overlapping quantifiers (e.g., `[ \t]+` followed by `.+`) in Plan parsing logic.
**Learning:** Patterns like `^##[ \t]+(S\d+)[ \t]+[—-][ \t]+(.+)$` can cause polynomial backtracking when matching long strings that almost match but fail late.
**Prevention:** Avoid overlapping quantifiers. Use more specific character classes (like `[^\r\n]+`) and ensure they don't overlap with preceding optional or repeating whitespace patterns. Use ESLint with `eslint-plugin-regexp` to detect these patterns early.
