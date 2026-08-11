import { resolve, sep } from 'node:path'

/**
 * Validates that a file path is safe to read.
 * - Resolves the absolute path to prevent traversal.
 * - Confines the path to the project root (process.cwd() + separator).
 * - Restricts the file extension strictly to `.md`.
 */
export function validatePath(absPath: string): boolean {
  try {
    const resolvedPath = resolve(absPath)

    // Ensure the file extension is strictly .md
    if (!resolvedPath.endsWith('.md')) {
      return false
    }

    const rootDir = process.cwd()
    // Append the directory separator to rootDir to ensure we don't match sibling directories
    // starting with the same prefix (e.g., /app-sibling vs /app)
    const rootDirWithSeparator = rootDir.endsWith(sep) ? rootDir : `${rootDir}${sep}`

    return resolvedPath.startsWith(rootDirWithSeparator)
  }
  catch {
    return false
  }
}
