## 2025-05-14 - Redacting Credentials in CLI Scripts

**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Securing Local Filesystem Reads with Path Anchoring and Safe YAML Loading

**Vulnerability:** Unrestricted absolute path reads allowed path traversal outside the repository root, arbitrary extension reading, and frontmatter parsing crashes due to js-yaml 4.x breaking changes.
**Learning:** In a cockpit reading external user projects, all file inputs must be strictly bounded. `gray-matter` defaults can fallback to unsafe/deprecated js-yaml `safeLoad` which crashes with js-yaml 4.x or allows potential parsing vulnerabilities.
**Prevention:** Implement `validatePath` using `path.relative` to restrict reads within `process.cwd()`, enforce a `.md` extension restriction, and pass an explicit safe-loading yaml engine config to `gray-matter`.
