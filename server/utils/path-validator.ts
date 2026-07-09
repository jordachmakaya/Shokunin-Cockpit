import { normalize, sep } from 'node:path'
import { ValidationError } from '../errors/validation-error'

const RESTRICTED_DIRS = [
  '.git',
  'node_modules',
  '.nuxt',
  'dist',
  'build',
  'target',
]

const RESTRICTED_FILES = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
]

/**
 * Validates a filesystem path for security.
 * - Blocks path traversal sequences (..).
 * - Enforces .md extension.
 * - Blocks access to sensitive/restricted directories and files.
 * - Sanitizes error messages to avoid leaking absolute paths.
 */
export function validatePath(path: string): void {
  // 1. Block path traversal
  const hasTraversal = (p: string) =>
    p.includes(`..${sep}`)
    || p.includes('../')
    || p.endsWith(`${sep}..`)
    || p.endsWith('/..')
    || p === '..'

  if (hasTraversal(path)) {
    throw new ValidationError('Invalid path: path traversal sequences are not allowed')
  }

  const normalized = normalize(path)

  if (hasTraversal(normalized)) {
    throw new ValidationError('Invalid path: path traversal sequences are not allowed')
  }

  // 2. Restrict to .md extension
  if (!normalized.endsWith('.md')) {
    throw new ValidationError('Invalid file type: only .md files are allowed')
  }

  // 3. Blacklist sensitive directories/files
  const parts = normalized.split(sep)
  for (const part of parts) {
    if (RESTRICTED_DIRS.includes(part)) {
      throw new ValidationError(`Access denied: restricted directory "${part}"`)
    }
    if (RESTRICTED_FILES.includes(part)) {
      throw new ValidationError(`Access denied: restricted file "${part}"`)
    }
    if (part.startsWith('.env')) {
      throw new ValidationError('Access denied: restricted environment file')
    }
  }
}
