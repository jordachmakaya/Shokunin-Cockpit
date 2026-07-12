import { normalize, resolve } from 'node:path'

import { ValidationError } from '../errors/validation-error'

/**
 * Validates that a path is safe to read:
 * 1. Blocks path traversal (must not contain '..')
 * 2. Restricts to .md extension
 * 3. Confines to the current working directory as the root
 */
export function validatePath(path: string): void {
  const cwd = process.cwd()

  // 1. Block path traversal
  const normalized = normalize(path)
  if (path.includes('..') || normalized.includes('..')) {
    throw new ValidationError('Path traversal detected')
  }

  // 2. Restrict extension
  if (!path.endsWith('.md')) {
    throw new ValidationError('Only .md files are allowed')
  }

  // 3. Anchor to root (CWD)
  const absolutePath = resolve(path)
  if (!absolutePath.startsWith(cwd)) {
    throw new ValidationError('Path is outside of allowed project root')
  }
}
