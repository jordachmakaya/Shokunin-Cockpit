import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

const FIXTURES = join(import.meta.dirname, '..', 'fixtures', 'sample-project')

describe('readDurable security bounds', () => {
  it('rejects path traversal attempts outside project root', async () => {
    const pathOutside = join(import.meta.dirname, '../../../../etc/passwd')
    const result = await readDurable(pathOutside, currentStateSchema)

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toBe('Invalid file path')
    }
  })

  it('rejects files without .md extension', async () => {
    const nonMdPath = join(FIXTURES, '../package.json')
    const result = await readDurable(nonMdPath, currentStateSchema)

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toBe('Invalid file path')
    }
  })

  it('redacts absolute file path in FileReadError', () => {
    const error = new FileReadError('/secret/absolute/path/to/some-file.md')
    expect(error.message).not.toContain('/secret/absolute/path')
    expect(error.message).toContain('Failed to read file: some-file.md')
  })
})
