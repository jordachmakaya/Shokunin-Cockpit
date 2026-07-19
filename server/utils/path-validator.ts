import { extname, relative } from 'node:path'

/**
 * Validates that an absolute path is within the current project root
 * and has a permitted extension (.md).
 *
 * @throws Error if validation fails
 */
export function validatePath(absPath: string): void {
  const root = process.cwd()
  const rel = relative(root, absPath)

  if (rel.startsWith('..') || rel.startsWith('/')) {
    throw new Error('Access denied: path is outside project root')
  }

  if (extname(absPath).toLowerCase() !== '.md') {
    throw new Error('Access denied: only .md files are allowed')
  }
}
