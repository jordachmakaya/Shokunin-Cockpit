import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

const FIXTURES = join(import.meta.dirname, '..', 'fixtures', 'sample-project')

describe('readDurable security checks', () => {
  it('blocks path traversal outside process.cwd()', async () => {
    const traversalPath = join(import.meta.dirname, '../../../../etc/passwd')
    const result = await readDurable(traversalPath, currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid file path or extension')
    }
  })

  it('restricts file reads to .md extension', async () => {
    const jsonPath = join(FIXTURES, 'package.json')
    const result = await readDurable(jsonPath, currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid file path or extension')
    }
  })

  it('redacts absolute path in FileReadError', () => {
    const absPath = '/some/absolute/sensitive/path/to/file.md'
    const error = new FileReadError(absPath)
    expect(error.message).toBe('Failed to read file: file.md')
    expect(error.message).not.toContain('sensitive')
    expect(error.message).not.toContain('/some/absolute')
  })
})
