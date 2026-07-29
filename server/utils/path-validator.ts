import { extname, relative, resolve } from 'node:path'

/**
 * Validates that the provided path is absolute, resides strictly within
 * process.cwd() (project root) to prevent path traversal, and ends in '.md'.
 */
export function validatePath(absPath: string): boolean {
  const resolved = resolve(absPath)
  const root = resolve(process.cwd())
  const rel = relative(root, resolved)

  // If the relative path starts with '..' or is absolute, it lies outside process.cwd().
  if (rel.startsWith('..') || rel.startsWith('/') || rel.includes(':\\') || rel.includes(':/')) {
    return false
  }

  // Double check that resolving the relative path anchors correctly back to process.cwd()
  if (resolve(root, rel) !== resolved) {
    return false
  }

  // Restricts extensions to '.md'
  if (extname(resolved) !== '.md') {
    return false
  }

  return true
}
