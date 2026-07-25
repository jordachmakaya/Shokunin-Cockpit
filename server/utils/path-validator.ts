import { extname, relative, resolve } from 'node:path'

/**
 * Validates that the path is absolute (or can be resolved to absolute),
 * restricted to a .md extension, and does not traverse outside the project root (process.cwd()).
 */
export function validatePath(absPath: string): boolean {
  // Restrict to .md extension
  if (extname(absPath) !== '.md') {
    return false
  }

  const root = process.cwd()
  const resolved = resolve(absPath)
  const rel = relative(root, resolved)

  // Block path traversal outside project root
  if (rel.startsWith('..') || resolved === root) {
    return false
  }

  return true
}
