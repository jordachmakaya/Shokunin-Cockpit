import { extname, normalize, relative, resolve } from 'node:path'

/**
 * Validates that a file path is safe to read.
 * - Must be within the project root.
 * - Must not contain path traversal sequences (..).
 * - Must have a .md extension.
 */
export function validatePath(absPath: string): boolean {
  const root = process.cwd()
  const resolvedPath = resolve(absPath)
  const normalizedPath = normalize(resolvedPath)

  // Ensure it stays within the project root using path.relative
  const rel = relative(root, normalizedPath)
  const isSafe = rel && !rel.startsWith('..') && !resolve(rel).startsWith('..')
  // Special case for root itself, which relative(root, root) returns ''
  if (normalizedPath === root)
    return false // We only want files, not the root dir

  if (!isSafe && normalizedPath !== root) {
    return false
  }

  // Explicitly check for traversal sequences in input too
  if (absPath.includes('..')) {
    return false
  }

  // Restrict to .md files
  if (extname(normalizedPath) !== '.md') {
    return false
  }

  return true
}
