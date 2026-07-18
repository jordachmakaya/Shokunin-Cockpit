## 2025-05-14 - Redacting Credentials in CLI Scripts

**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Securing File Reads and Resolving Frontmatter Parser Compatibility

**Vulnerability:** Path traversal risks and sensitive directory structure leakage in server file-reading utilities, coupled with frontmatter parser engine incompatibility under js-yaml v4.
**Learning:** Gray-matter's default engine relies on the deprecated `safeLoad` method, which is removed in js-yaml v4. Additionally, reading files without validation allows traversal outside of the workspace, and throwing errors with raw paths leaks internal directory details.
**Prevention:** Explicitly configure gray-matter with the modern `yaml.load` engine. Ensure strict path verification via path relative checks against `process.cwd()` and restrict file extensions to `.md`. Always redact absolute paths using `path.basename` in exception messages.
