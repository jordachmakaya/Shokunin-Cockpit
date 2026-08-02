import { resolve, sep } from 'node:path'

export function validatePath(filepath: string): string {
  if (!filepath.endsWith('.md')) {
    throw new Error('Only .md files are allowed')
  }

  const resolved = resolve(filepath)
  const root = resolve(process.cwd())
  const rootWithSep = root.endsWith(sep) ? root : root + sep

  if (!resolved.startsWith(rootWithSep)) {
    throw new Error('Path traversal detected')
  }

  return resolved
}
