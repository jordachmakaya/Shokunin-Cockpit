## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-07-26 - Securing Durable File Reads & Dependency YAML Crashes
**Vulnerability:** Path traversal outside project root, sensitive information leakage in file read error stack traces, and application crash due to transitive dependency `gray-matter` using removed `safeLoad` API of `js-yaml` 4.x.
**Learning:** Overriding global dependency versions (e.g., forcing `js-yaml` to `4.x`) can break internal APIs of other libraries (like `gray-matter` calling `safeLoad`). This requires configuring a custom parse engine explicitly returning `yaml.load(s)`. Also, absolute file paths are easily leaked in standard filesystem errors, and durable file loaders must always strictly validate target paths using relative paths rooted at `process.cwd()`.
**Prevention:** Always sanitize/redact filesystem errors using `basename()` before exposing them, implement relative path anchor validation, and pass explicit engine parsers when overriding sub-dependencies.
