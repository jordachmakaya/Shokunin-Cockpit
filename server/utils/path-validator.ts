import { ValidationError } from '../errors/validation-error'

const FORBIDDEN_PATTERNS = [
  /\.\./, // Traversal
  /\.git/,
  /node_modules/,
  /\.env/,
]

/**
 * Validates that a path is safe and points to a markdown file.
 */
export function validatePath(absPath: string): void {
  if (!absPath.endsWith('.md')) {
    throw new ValidationError(`Invalid file extension: ${absPath}`)
  }

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(absPath)) {
      throw new ValidationError(`Forbidden path pattern: ${absPath}`)
    }
  }
}
