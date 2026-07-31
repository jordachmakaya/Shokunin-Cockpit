## 2025-05-14 - Redacting Credentials in CLI Scripts
**Vulnerability:** Potential leakage of Git credentials (tokens/passwords) in error messages when parsing repository remotes.
**Learning:** CLI scripts that execute `git remote get-url` may capture sensitive strings. If these scripts fail and log the raw output to stdout/stderr, credentials can be leaked to CI logs or terminal history.
**Prevention:** Always sanitize Git remote URLs using regex (e.g., `url.replace(/:[^@/]+@/, ':***@')`) before including them in error messages or logs.

## 2026-06-25 - Securing External Markdown Reads and Yaml Engine Parse
**Vulnerability:** Arbitrary path traversal and arbitrary code execution through frontmatter deserialization via outdated js-yaml and lack of path filtering.
**Learning:** Overriding `js-yaml` version to 4.x broke `gray-matter` parsing because `safeLoad` was deprecated/removed. Additionally, reading external files without strict path filtering allowed potential path traversal or directory leaking.
**Prevention:** Filter all file path parameters through `validatePath` to enforce `.md` extension, repository boundaries, and exclude sensitive folders/files. Redact absolute paths in error messages and configure `gray-matter` with an explicit engine mapping to `js-yaml.load` for safe modern YAML loading.
