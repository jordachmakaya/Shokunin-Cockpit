import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import matter from 'gray-matter'
import yaml from 'js-yaml'
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
  // Security: strict extension check
  if (extname(absPath) !== '.md') {
    return { status: 'invalid', error: 'security: only .md files are allowed' }
  }

  // Security: deny-list for sensitive patterns
  const filename = basename(absPath)
  const segments = absPath.split(/[\\/]/)
  if (
    filename.startsWith('.env')
    || segments.includes('.git')
    || segments.includes('node_modules')
  ) {
    return { status: 'invalid', error: 'security: access to this path is restricted' }
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
    parsed = matter(raw, {
      engines: {
        yaml: (s: string) => yaml.load(s) as object,
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
