## 2025-05-14 - Redacting Credentials in CLI Scripts

**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Absolute Path Traversal & Sibling Directory Escape

**Vulnerability:** Absolute or relative path input could allow directory traversal, enabling unauthorized access to sensitive files outside the repository.
**Learning:** Checking `.startsWith(rootDir)` is insufficient on its own if sibling directories (e.g. `rootDir + "-sibling"`) are matched when no path separator is appended to the parent folder check.
**Prevention:** Always append `path.sep` to the target root directory when validating path inclusion (`resolvedPath.startsWith(rootDir + path.sep)`), restrict file extensions (e.g., `.md` only), and sanitize all error exceptions (using `path.basename`) to prevent physical path leakage.
