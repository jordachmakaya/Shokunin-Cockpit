import matter from 'gray-matter'
import yaml from 'js-yaml'
import { readFile } from 'node:fs/promises'
import type { ZodType } from 'zod'

import { validatePath } from './path-validator'

export type DurableResult<T>
  = | { status: 'ok', data: T, body: string }
    | { status: 'missing' }
    | { status: 'invalid', error: string }

export async function readDurable<T>(
  absPath: string,
  schema: ZodType<T>,
): Promise<DurableResult<T>> {
  let raw: string
  try {
    if (!validatePath(absPath)) {
      return { status: 'invalid', error: 'Invalid file path' }
    }
    raw = await readFile(absPath, 'utf8')
  }
  catch (err) {
    if (isEnoent(err))
      return { status: 'missing' }
    return { status: 'invalid', error: `Failed to read file: ${err instanceof Error ? err.message : String(err)}` }
  }

  let parsed
  try {
    parsed = matter(raw, {
      engines: {
        yaml: {
          parse: (s: string) => yaml.load(s) as object,
          stringify: (obj: object) => yaml.dump(obj),
        },
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
