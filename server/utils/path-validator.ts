import { resolve, sep } from 'node:path'

export function validatePath(filePath: string): string {
  const resolved = resolve(filePath)
  const root = resolve(process.cwd())
  const rootWithSlash = root.endsWith(sep) ? root : root + sep

  if (!resolved.startsWith(rootWithSlash)) {
    throw new Error('Path traversal detected: path is outside project root')
  }

  if (!resolved.endsWith('.md')) {
    throw new Error('Invalid file extension: only .md files are allowed')
  }

  return resolved
}
