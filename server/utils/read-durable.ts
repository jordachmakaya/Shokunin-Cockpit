import { readFile } from 'node:fs/promises'
import matter from 'gray-matter'
import * as yaml from 'js-yaml'
import type { ZodType } from 'zod'
import { FileReadError } from '../errors/file-read-error'

export type DurableResult<T> =
  | { status: 'ok', data: T, body: string }
  | { status: 'missing' }
  | { status: 'invalid', error: string }

export async function readDurable<T>(
  absPath: string,
  schema: ZodType<T>,
): Promise<DurableResult<T>> {
  // Security: strict path validation
  if (!absPath.endsWith('.md')) {
    return { status: 'invalid', error: 'Security: only .md files allowed' }
  }
  if (absPath.includes('.git') || absPath.includes('node_modules') || absPath.includes('.env')) {
    return { status: 'invalid', error: 'Security: access to sensitive paths blocked' }
  }

  let raw: string
  try {
    raw = await readFile(absPath, 'utf8')
  }
  catch (err) {
    if (isEnoent(err)) return { status: 'missing' }
    throw new FileReadError(absPath, { cause: err })
  }

  let parsed
  try {
    // gray-matter uses js-yaml v3 by default (safeLoad).
    // In js-yaml v4, safeLoad is removed and load is safe by default.
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
