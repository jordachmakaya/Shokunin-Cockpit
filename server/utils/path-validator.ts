import { extname, isAbsolute, relative, resolve } from 'node:path'

export function validatePath(absPath: string): void {
  const resolvedPath = resolve(absPath)

  if (extname(resolvedPath) !== '.md') {
    throw new Error('Access denied: File must have a .md extension')
  }

  const root = resolve(process.cwd())
  const rel = relative(root, resolvedPath)

  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error('Access denied: Path traversal detected')
  }
}
