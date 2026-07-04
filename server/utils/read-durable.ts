import matter from 'gray-matter'
import yaml from 'js-yaml'
import { readFile } from 'node:fs/promises'
import { normalize, sep } from 'node:path'
import type { ZodType } from 'zod'

export type DurableResult<T>
  = | { status: 'ok', data: T, body: string }
    | { status: 'missing' }
    | { status: 'invalid', error: string }

export async function readDurable<T>(
  absPath: string,
  schema: ZodType<T>,
): Promise<DurableResult<T>> {
  if (!validatePath(absPath)) {
    return { status: 'invalid', error: `path security violation or invalid extension: ${absPath}` }
  }

  let raw: string
  try {
    raw = await readFile(absPath, 'utf8')
  }
  catch (err) {
    if (isEnoent(err))
      return { status: 'missing' }
    // Never throw, degrade gracefully per RULES.md
    return { status: 'invalid', error: `file read error: ${String(err)}` }
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

function validatePath(path: string): boolean {
  // Enforce .md extension (case-insensitive)
  if (!path.toLowerCase().endsWith('.md'))
    return false

  const normalized = normalize(path).toLowerCase()

  // Block path traversal
  if (normalized.includes(`${sep}..${sep}`) || normalized.startsWith(`..${sep}`) || normalized.endsWith(`${sep}..`)) {
    return false
  }

  // Block sensitive directories/files
  const forbidden = [
    `${sep}.git${sep}`,
    `${sep}node_modules${sep}`,
    `${sep}.env`,
  ]

  if (forbidden.some(pattern => normalized.includes(pattern)))
    return false

  // Special cases for startsWith if they were not caught by sep-based patterns
  if (normalized.startsWith('.git') || normalized.startsWith('node_modules'))
    return false

  return true
}
