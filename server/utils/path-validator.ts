import { relative, resolve } from 'node:path'

/**
 * Validates a filesystem path to prevent path traversal and ensure safety.
 * - Restricts extension to `.md`.
 * - Anchors path relative to process.cwd() (the project root).
 * - Rejects path traversal outside the project root.
 */
export function validatePath(absPath: string): boolean {
  if (!absPath.endsWith('.md')) {
    return false
  }

  const root = resolve(process.cwd())
  const resolvedPath = resolve(absPath)
  const rel = relative(root, resolvedPath)

  if (rel.startsWith('..') || resolvedPath === root) {
    return false
  }

  return true
}
