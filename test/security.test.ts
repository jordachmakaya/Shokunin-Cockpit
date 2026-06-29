import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { readDurable } from '../server/utils/read-durable'

describe('readDurable security', () => {
  const schema = z.any()

  it('rejects non-markdown files', async () => {
    const result = await readDurable('/tmp/test.txt', schema)
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('security: only .md files are allowed')
  })

  it('rejects .env files', async () => {
    const result = await readDurable('/app/.env.production.md', schema)
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('security: access to this path is restricted')
  })

  it('rejects .git directory', async () => {
    const result = await readDurable('/app/.git/config.md', schema)
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('security: access to this path is restricted')
  })

  it('rejects node_modules directory', async () => {
    const result = await readDurable('/app/node_modules/pkg/README.md', schema)
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('security: access to this path is restricted')
  })
})
