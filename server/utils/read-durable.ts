import matter from 'gray-matter'
import yaml from 'js-yaml'
import { readFile } from 'node:fs/promises'
import type { ZodType } from 'zod'

import { FileReadError } from '../errors/file-read-error'

export type DurableResult<T>
  = | { status: 'ok', data: T, body: string }
    | { status: 'missing' }
    | { status: 'invalid', error: string }

/**
 * Reads a Markdown file, parses its frontmatter with Zod validation,
 * and returns the typed data and body. Enforces strict security constraints
 * to prevent reading non-markdown or sensitive system files.
 */
export async function readDurable<T>(
  absPath: string,
  schema: ZodType<T>,
): Promise<DurableResult<T>> {
  // Security: only allow .md files
  if (!absPath.endsWith('.md')) {
    return { status: 'invalid', error: 'Security violation: only .md files are allowed' }
  }

  // Security: block access to sensitive paths
  const normalizedPath = absPath.toLowerCase()
  if (
    normalizedPath.includes('.git')
    || normalizedPath.includes('node_modules')
    || normalizedPath.includes('.env')
  ) {
    return { status: 'invalid', error: 'Security violation: access to sensitive path blocked' }
  }

  let raw: string
  try {
    raw = await readFile(absPath, 'utf8')
  }
  catch (err) {
    if (isEnoent(err))
      return { status: 'missing' }
    throw new FileReadError(absPath, { cause: err })
  }

  let parsed
  try {
    // Explicitly use js-yaml v4 'load' to fix compatibility with gray-matter
    // and benefit from the patched security version.
    parsed = matter(raw, {
      engines: {
        yaml: (s: string) => yaml.load(s),
      },
    })
  }
  catch (err) {
    return { status: 'invalid', error: `frontmatter parse error: ${String(err)}` }
  }

  const result = schema.safeParse(parsed.data as unknown)
  if (!result.success) {
    const msg = result.error.issues
      .map(i => `${i.path.map(String).join('.')}: ${i.message}`)
      .join('; ')
    return { status: 'invalid', error: msg }
  }

  return { status: 'ok', data: result.data, body: parsed.content.trim() }
}

function isEnoent(err: unknown): boolean {
  return (
    typeof err === 'object'
    && err !== null
    && (err as { code?: unknown }).code === 'ENOENT'
  )
}
