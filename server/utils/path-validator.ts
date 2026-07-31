import { extname, isAbsolute, relative, resolve } from 'node:path'

/**
 * Validates a file path to prevent traversal, restrict file extensions to .md,
 * and block access to sensitive directories or configuration files.
 *
 * @param filePath The absolute or relative file path to validate.
 * @param rootDir The trusted root directory to anchor reads (defaults to process.cwd()).
 * @returns true if the path is safe to read; false otherwise.
 */
export function validatePath(filePath: string, rootDir: string = process.cwd()): boolean {
  const resolvedPath = resolve(filePath)
  const resolvedRoot = resolve(rootDir)

  // Anchor target path: prevent traversing above the root directory
  const rel = relative(resolvedRoot, resolvedPath)
  if (rel.startsWith('..') || isAbsolute(rel)) {
    return false
  }

  // Enforce .md file extension restriction
  if (extname(resolvedPath) !== '.md') {
    return false
  }

  // Block access to sensitive directories or files
  const parts = rel.split(/[\\/]/)
  if (
    parts.includes('node_modules')
    || parts.includes('.git')
    || parts.some(part => part.startsWith('.env'))
  ) {
    return false
  }

  return true
}
