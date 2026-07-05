/**
 * Validates that a path is safe for reading durable files.
 * Rejects path traversal, sensitive directories, and non-markdown files.
 */
export function isPathSafe(path: string): boolean {
  // 1. Normalize separators for cross-platform consistency
  const normalized = path.replace(/\\/g, '/')

  // 2. Block path traversal
  if (normalized.includes('..')) {
    return false
  }

  // 3. Block sensitive directories and environment files
  const forbidden = ['.git', 'node_modules', '.env']
  if (forbidden.some(pattern => normalized.includes(pattern))) {
    return false
  }

  // 4. Enforce markdown extension
  if (!normalized.endsWith('.md')) {
    return false
  }

  return true
}
