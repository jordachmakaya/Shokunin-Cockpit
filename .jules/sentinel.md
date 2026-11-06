## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Frontmatter Engines and Safe YAML/JS Execution
**Vulnerability:** Potential RCE or arbitrary code execution via gray-matter frontmatter parsing when reading untrusted Markdown files, along with crash on js-yaml 4.x due to deprecated safeLoad.
**Learning:** `gray-matter` by default provides a `javascript` engine that can execute arbitrary code, and relies on `yaml.safeLoad` which throws in `js-yaml` 4.x. In an application treating external Markdown files as untrusted input, engines must be strictly configured.
**Prevention:** Explicitly define engines in `gray-matter` options: disable `javascript` by throwing an error and bind `yaml` to `yaml.load` ensuring only non-array objects are parsed.
