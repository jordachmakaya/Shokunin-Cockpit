import matter from 'gray-matter'
import yaml from 'js-yaml'
import { readFile } from 'node:fs/promises'
import type { ZodType } from 'zod'

import { FileReadError } from '../errors/file-read-error'

export type DurableResult<T>
  = | { body: string, data: T, status: 'ok' }
    | { status: 'missing' }
    | { error: string, status: 'invalid' }

const matterOptions = {
  engines: {
    yaml: (s: string) => {
      const parsed = yaml.load(s)
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? parsed
        : {}
    },
  },
}

export async function readDurable<T>(
  absPath: string,
  schema: ZodType<T>,
): Promise<DurableResult<T>> {
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
    parsed = matter(raw, matterOptions)
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
