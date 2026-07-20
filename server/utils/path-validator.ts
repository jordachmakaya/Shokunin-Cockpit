import { isAbsolute, relative, resolve } from 'node:path'

/**
 * Validates that a file path is safe to read:
 * - Must resolve within the project root (process.cwd()) to prevent path traversal.
 * - Must have a strictly .md extension.
 */
export function validatePath(absPath: string): boolean {
  if (!absPath.endsWith('.md')) {
    return false
  }

  const resolvedPath = resolve(absPath)
  const root = resolve(process.cwd())

  const rel = relative(root, resolvedPath)

  // Block path traversal outside process.cwd()
  if (rel.startsWith('..') || isAbsolute(rel)) {
    return false
  }

  return true
}
