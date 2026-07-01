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

  it('rejects non-markdown files', async () => {
    const result = await readDurable(
      join(FIXTURES, 'package.json'),
      currentStateSchema,
    )
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('only .md files allowed')
  })

  it('rejects sensitive paths (node_modules)', async () => {
    const result = await readDurable(
      'some/project/node_modules/config.md',
      currentStateSchema,
    )
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('sensitive paths blocked')
  })

  it('rejects sensitive paths (.git)', async () => {
    const result = await readDurable(
      'some/project/.git/config.md',
      currentStateSchema,
    )
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('sensitive paths blocked')
  })

  it('rejects sensitive paths (.env)', async () => {
    const result = await readDurable(
      'some/project/.env.local.md',
      currentStateSchema,
    )
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('sensitive paths blocked')
  })
})
