## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2025-05-15 - Hardening GitHub Repo Slug Regex
**Vulnerability:** Regular Expression Denial of Service (ReDoS) in GitHub URL parsing logic.
**Learning:** Using loose quantifiers like `(.+?/.+?)` for capturing path-like structures can lead to super-linear backtracking when matched against long, crafted strings.
**Prevention:** Use more specific character classes like `([^/]+\/[^/]+?)` to anchor matches and prevent the engine from exploring overlapping paths. Ensure the regex remains functional for real-world cases (e.g., repository names containing dots).
