import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

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

  it('redacts absolute path in FileReadError message', () => {
    const err = new FileReadError('/secret/user/directory/sensitive.md')
    expect(err.message).toBe('Failed to read file: sensitive.md')
    expect(err.message).not.toContain('/secret/user/directory')
  })
})
