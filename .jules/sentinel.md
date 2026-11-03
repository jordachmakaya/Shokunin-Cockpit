## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Disabling Gray-Matter JavaScript Frontmatter Execution (RCE)
**Vulnerability:** Arbitrary code execution (RCE) when parsing untrusted external Markdown files.
**Learning:** `gray-matter` by default evaluates JavaScript frontmatter delimiters (`---js`) via `eval()`. Because this cockpit reads durable Markdown files from external projects and untrusted sources, malicious or compromised files could trigger arbitrary code execution on the host machine. Additionally, `gray-matter` invokes the deprecated `yaml.safeLoad`, causing runtime crashes when using `js-yaml` 4.x.
**Prevention:** Always explicitly define custom engine handlers in `gray-matter` options: disable the `javascript` engine by throwing a security error, and configure the `yaml` engine to use `yaml.load` safely.
