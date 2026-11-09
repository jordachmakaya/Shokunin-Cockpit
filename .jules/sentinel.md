## 2026-06-28 - Disabling JavaScript Frontmatter Execution in gray-matter
**Vulnerability:** Arbitrary JavaScript execution (RCE) via `gray-matter` default engine configuration parsing untrusted external Markdown files.
**Learning:** `gray-matter` by default supports a `---js` frontmatter delimiter that evaluates arbitrary JavaScript code using `eval`. Additionally, its default YAML parser relies on `js-yaml.safeLoad`, which throws an error in `js-yaml` 4.x.
**Prevention:** Always explicitly define custom parser engines when using `gray-matter`. Use `yaml.load` for safe YAML parsing and explicitly disable the `javascript` engine by throwing an error or disallowing it.

## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.
