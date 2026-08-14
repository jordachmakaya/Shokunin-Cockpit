import { resolve, sep } from 'node:path'

/**
 * Validates that a file path is safe to read.
 * - Resolves the absolute path.
 * - Checks that the path is within the project root directory (process.cwd()).
 * - Ensures the path ends with a .md extension.
 * - Prevents directory traversal (e.g. using .. or sibling directory traversal).
 */
export function validatePath(filePath: string): { valid: true, resolvedPath: string } | { valid: false, error: string } {
  try {
    const resolvedPath = resolve(filePath)
    const rootPath = resolve(process.cwd())

    // Ensure the resolved path starts with the root path + directory separator
    // to prevent sibling directory traversal (e.g. process.cwd() is '/app', resolved is '/app-sibling')
    const safePrefix = rootPath.endsWith(sep) ? rootPath : rootPath + sep
    if (!resolvedPath.startsWith(safePrefix) && resolvedPath !== rootPath) {
      return { valid: false, error: 'Path traversal detected: Path is outside the project root.' }
    }

    // Ensure the file extension is .md
    if (!resolvedPath.endsWith('.md')) {
      return { valid: false, error: 'Access denied: Only Markdown (.md) files are allowed.' }
    }

    return { valid: true, resolvedPath }
  }
  catch (err) {
    return { valid: false, error: `Invalid path: ${String(err)}` }
  }
}
