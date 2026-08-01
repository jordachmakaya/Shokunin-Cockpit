import { resolve, sep } from 'node:path'

export function validatePath(absPath: string): boolean {
  const root = resolve(process.cwd())
  const resolvedPath = resolve(absPath)

  // Ensure target path is strictly inside process.cwd()
  const rootWithSep = root.endsWith(sep) ? root : root + sep
  if (!resolvedPath.startsWith(rootWithSep)) {
    return false
  }

  // Restrict extensions to .md
  if (!resolvedPath.endsWith('.md')) {
    return false
  }

  return true
}
