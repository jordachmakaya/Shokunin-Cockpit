import { resolve, sep } from 'node:path'

export function validatePath(filepath: string): string {
  const resolved = resolve(filepath)
  const root = process.cwd()

  // Suffix root with a directory separator if not already present
  const rootPrefix = root.endsWith(sep) ? root : root + sep

  if (!resolved.startsWith(rootPrefix)) {
    throw new Error('Path traversal detected: path is outside the project root directory')
  }

  if (!resolved.endsWith('.md')) {
    throw new Error('Invalid file extension: only Markdown (.md) files are allowed')
  }

  return resolved
}
