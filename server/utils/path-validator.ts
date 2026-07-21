import { extname, relative, resolve } from 'node:path'

export function validatePath(absPath: string): void {
  const resolvedPath = resolve(absPath)
  const root = resolve(process.cwd())

  const rel = relative(root, resolvedPath)
  if (rel.startsWith('..') || rel === '..') {
    throw new Error('Path traversal detected')
  }

  if (extname(resolvedPath) !== '.md') {
    throw new Error('Invalid file extension')
  }
}
