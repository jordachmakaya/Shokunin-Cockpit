import { extname, isAbsolute, relative, resolve } from 'node:path'

/**
 * Validates that the given path is a safe path to read.
 * It prevents path traversal out of the repository root,
 * restricts reading to only files with a '.md' extension,
 * and blocks reading sensitive/internal system folders/files.
 */
export function validatePath(absPath: string, rootDir: string = process.cwd()): boolean {
  try {
    const resolvedPath = resolve(absPath)
    const resolvedRoot = resolve(rootDir)

    // Calculate relative path from root to the target path
    const rel = relative(resolvedRoot, resolvedPath)

    // Ensure target path is inside the root directory and not the root itself.
    // If it starts with '..' or is absolute (e.g. on different windows drives), it's outside root.
    if (rel.startsWith('..') || isAbsolute(rel) || resolve(resolvedPath) === resolvedRoot) {
      return false
    }

    // Only allow .md extension
    if (extname(resolvedPath).toLowerCase() !== '.md') {
      return false
    }

    // Block reading hidden/system files and common forbidden folders (defense in depth)
    const normalizedPath = resolvedPath.replace(/\\/g, '/')
    if (
      normalizedPath.includes('/.git/')
      || normalizedPath.includes('/node_modules/')
      || normalizedPath.includes('/.env')
    ) {
      return false
    }

    return true
  }
  catch {
    return false
  }
}
