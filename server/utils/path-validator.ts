import { extname, resolve, sep } from 'node:path'

/**
 * Validates that a file path is safe to read.
 * Prevents sibling/parent directory traversal by ensuring the resolved path
 * starts with the project root directory path appended with the directory separator.
 * Restricts extensions to '.md' only.
 */
export function validatePath(filePath: string): string {
  const resolvedPath = resolve(filePath)
  const rootDir = resolve(process.cwd())

  // Append directory separator to prevent traversal to sibling folders
  // e.g. /app-sibling should not be matched by /app
  const prefix = rootDir + sep
  if (!resolvedPath.startsWith(prefix)) {
    throw new Error('Path traversal detected: path must reside within the project root')
  }

  // Restrict extensions to .md only
  if (extname(resolvedPath) !== '.md') {
    throw new Error('Access denied: only .md files are allowed')
  }

  return resolvedPath
}
