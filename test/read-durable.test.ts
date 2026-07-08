import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { currentStateSchema } from '../shared/schemas/current-state'
import { readDurable } from '../server/utils/read-durable'

const FIXTURES = join(import.meta.dirname, '..', 'fixtures', 'sample-project')

describe('readDurable', () => {
  it('returns ok for a valid CURRENT_STATE.md', async () => {
    const result = await readDurable(join(FIXTURES, 'CURRENT_STATE.md'), currentStateSchema)
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(result.data.projectId).toBe('sample-project')
      expect(result.data.status).toBe('in_progress')
      expect(result.body).toContain('S0 foundations are being laid')
    }
  })

  it('returns invalid (not throws) for CURRENT_STATE.invalid-schema.md', async () => {
    const result = await readDurable(
      join(FIXTURES, 'CURRENT_STATE.invalid-schema.md'),
      currentStateSchema,
    )
    expect(result.status).toBe('invalid')
  })

  it('returns invalid (not throws) for CURRENT_STATE.broken-yaml.md', async () => {
    const result = await readDurable(
      join(FIXTURES, 'CURRENT_STATE.broken-yaml.md'),
      currentStateSchema,
    )
    expect(result.status).toBe('invalid')
  })

  it('returns missing (not throws) for a non-existent path', async () => {
    const result = await readDurable(
      join(FIXTURES, 'DOES_NOT_EXIST.md'),
      currentStateSchema,
    )
    expect(result.status).toBe('missing')
  })

  it('blocks path traversal', async () => {
    const result = await readDurable(
      FIXTURES + '/../sample-project/CURRENT_STATE.md',
      currentStateSchema,
    )
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal attempt detected')
    }
  })

  it('blocks sensitive files', async () => {
    const result = await readDurable(
      '/app/.env.md', // Fake .md extension but contains .env
      currentStateSchema,
    )
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Access to sensitive path blocked')
    }
  })

  it('blocks non-markdown files', async () => {
    const result = await readDurable(
      join(FIXTURES, 'package.json'),
      currentStateSchema,
    )
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Only Markdown files (.md) can be read')
    }
  })
})
