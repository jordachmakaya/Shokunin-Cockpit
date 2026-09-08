import { resolve } from 'node:path'

export function validatePath(filePath: string, allowedRoot: string = process.cwd()): boolean {
  if (!filePath.endsWith('.md')) {
    return false
  }

  const resolvedPath = resolve(filePath)
  const resolvedRoot = resolve(allowedRoot)

  return resolvedPath === resolvedRoot || resolvedPath.startsWith(`${resolvedRoot}/`)
}
