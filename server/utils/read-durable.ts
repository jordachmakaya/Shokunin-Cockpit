import matter from 'gray-matter'
import yaml from 'js-yaml'
import { readFile } from 'node:fs/promises'
import type { ZodType } from 'zod'

import { FileReadError } from '../errors/file-read-error'

export type DurableResult<T>
  = | { body: string, data: T, status: 'ok' }
    | { status: 'missing' }
    | { error: string, status: 'invalid' }

export async function readDurable<T>(
  absPath: string,
  schema: ZodType<T>,
): Promise<DurableResult<T>> {
  // Security: only allow .md files
  if (!absPath.endsWith('.md')) {
    return { error: 'only .md files are allowed', status: 'invalid' }
  }

  // Security: reject sensitive paths
  const lowerPath = absPath.toLowerCase()
  if (
    lowerPath.includes('.git/')
    || lowerPath.includes('node_modules/')
    || absPath.split('/').some(segment => segment.startsWith('.env'))
  ) {
    return { error: 'access to sensitive path is denied', status: 'invalid' }
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
    parsed = matter(raw, {
      engines: {
        yaml: s => yaml.load(s),
      },
    })
  }
  catch (err) {
    return { error: `frontmatter parse error: ${String(err)}`, status: 'invalid' }
  }

  const result = schema.safeParse(parsed.data as unknown)
  if (!result.success) {
    const msg = result.error.issues
      .map(i => `${i.path.map(String).join('.')}: ${i.message}`)
      .join('; ')
    return { error: msg, status: 'invalid' }
  }

  return { body: parsed.content.trim(), data: result.data, status: 'ok' }
}

function isEnoent(err: unknown): boolean {
  return (
    typeof err === 'object'
    && err !== null
    && (err as { code?: unknown }).code === 'ENOENT'
  )
}
