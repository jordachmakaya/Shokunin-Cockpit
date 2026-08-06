import { extname, resolve, sep } from 'node:path'

/**
 * Validates a file path to prevent path traversal and restrict extensions.
 * Anchors the resolved path to be strictly within the repository/project root.
 *
 * @param filePath - The relative or absolute file path to validate.
 * @returns The fully resolved, safe absolute path.
 */
export function validatePath(filePath: string): string {
  const resolvedPath = resolve(filePath)
  const projectRoot = resolve(process.cwd())
  const prefix = projectRoot.endsWith(sep) ? projectRoot : `${projectRoot}${sep}`

  if (!resolvedPath.startsWith(prefix)) {
    throw new Error('Path traversal detected')
  }

  if (extname(resolvedPath).toLowerCase() !== '.md') {
    throw new Error('Invalid file extension')
  }

  return resolvedPath
}
