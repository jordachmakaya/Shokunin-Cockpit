## 2025-05-14 - Hardening Regex and YAML Parsing
**Vulnerability:** ReDoS vulnerabilities in CLI scripts and potential unsafe YAML parsing in the durable reader.
**Learning:** Overlapping quantifiers in regex (e.g., `\s+(.+)$`) can lead to polynomial backtracking. `gray-matter` by default might use unsafe YAML loading if not explicitly configured for `js-yaml` 4+.
**Prevention:** Tighten regex patterns to use more specific character classes (e.g., `\s+(\S.*)$`). Always explicitly configure `gray-matter` to use the safe `load` engine from `js-yaml`.
