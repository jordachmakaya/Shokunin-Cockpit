import { extname, isAbsolute, relative, resolve } from 'node:path'

/**
 * Validates that a file path is safe:
 * - Must resolve within process.cwd() (the project root) to block path traversal
 * - Must restrict extensions strictly to '.md'
 */
export function validatePath(absPath: string): boolean {
  if (!absPath) {
    return false
  }

  // Restrict extensions to .md
  if (extname(absPath) !== '.md') {
    return false
  }

  const resolvedRoot = resolve(process.cwd())
  const resolvedPath = resolve(absPath)

  // Use path.relative and check for '..' prefixes to prevent sibling/parent directory traversal
  const rel = relative(resolvedRoot, resolvedPath)

  if (rel.startsWith('..') || isAbsolute(rel)) {
    return false
  }

  return true
}
