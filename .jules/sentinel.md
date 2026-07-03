## 2026-06-25 - Path Traversal Protection in readDurable
**Vulnerability:** Filesystem reads via readDurable were not validated for path traversal or sensitive file types.
**Learning:** The readDurable utility allowed reading any file on the system if given an absolute path, posing a risk of sensitive data exposure (e.g., .env files).
**Prevention:** Implement strict path validation in filesystem utilities: block ".." (traversal), restrict to expected extensions (.md), and block known sensitive paths (.git, node_modules, .env).
