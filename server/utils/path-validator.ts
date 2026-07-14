import { relative, resolve } from 'node:path'

/**
 * Validates that a path is within the project root and is a markdown file.
 * This prevents path traversal attacks.
 */
export function validatePath(absPath: string): void {
  const root = process.cwd()
  const rel = relative(root, resolve(absPath))

  if (rel.startsWith('..') || rel.startsWith('/')) {
    throw new Error('Access denied: path is outside project root')
  }

  if (!rel.endsWith('.md')) {
    throw new Error('Access denied: only .md files are allowed')
  }
}
