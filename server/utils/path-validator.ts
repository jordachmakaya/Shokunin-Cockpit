import { normalize } from 'node:path'
import { ValidationError } from '../errors/validation-error'

/**
 * Validates a filesystem path to prevent traversal and access to sensitive files.
 * Confines reads to Markdown files and blocks .git, node_modules, .env, etc.
 */
export function validatePath(inputPath: string): void {
  // Normalize the path first to resolve any . or .. segments
  const normalizedPath = normalize(inputPath)

  // 1. Basic path traversal check (even if absolute, we don't want '..' in the path)
  if (inputPath.includes('..') || normalizedPath.includes('..')) {
    throw new ValidationError(`Path traversal attempt detected`)
  }

  // 2. Block sensitive folders and files (based on DO_NOT_READ.md)
  const blockedPatterns = [
    '/.git/',
    '/node_modules/',
    '/.env',
    '/.nuxt/',
    '/.output/',
    '/.data/',
  ]

  if (blockedPatterns.some(pattern => normalizedPath.includes(pattern) || normalizedPath.endsWith(pattern.replace(/\/$/, '')))) {
    throw new ValidationError(`Access to sensitive path blocked`)
  }

  // 3. Enforce .md extension for readDurable
  if (!normalizedPath.toLowerCase().endsWith('.md')) {
    throw new ValidationError(`Only Markdown files (.md) can be read`)
  }
}
