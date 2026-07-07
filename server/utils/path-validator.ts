import { ValidationError } from '../errors/validation-error'

const FORBIDDEN_PATTERNS = [
  '..',
  '.git',
  'node_modules',
  '.env',
]

/**
 * Validates a filesystem path for security.
 * Blocks traversal (..), sensitive directories/files, and enforces .md extension
 * (except for /dev/null which is used for probing).
 */
export function validatePath(absPath: string): void {
  if (absPath === '/dev/null')
    return

  if (!absPath.endsWith('.md')) {
    throw new ValidationError(`Forbidden file type: ${absPath}. Only .md files are allowed.`)
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (absPath.includes(pattern)) {
      throw new ValidationError(`Forbidden path pattern "${pattern}" detected in: ${absPath}`)
    }
  }
}
