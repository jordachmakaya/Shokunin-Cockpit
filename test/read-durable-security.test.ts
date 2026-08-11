import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

const FIXTURES = join(import.meta.dirname, '..', 'fixtures', 'sample-project')

describe('readDurable Security & Validation', () => {
  it('blocks path traversal outside the project root directory', async () => {
    // Attempting to read a file outside process.cwd()
    const result = await readDurable('/etc/passwd', currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid or restricted file path')
    }

    const relativeTraversal = await readDurable('../../../some-file.md', currentStateSchema)
    expect(relativeTraversal.status).toBe('invalid')
  })

  it('restricts file extensions strictly to .md', async () => {
    // Valid path inside root but invalid file extension (.json or .ts)
    const result = await readDurable(join(import.meta.dirname, '..', 'package.json'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid or restricted file path')
    }
  })

  it('redacts absolute path information in FileReadError', () => {
    const error = new FileReadError('/private/var/absolute/path/to/secret-project.md')
    expect(error.message).toContain('secret-project.md')
    expect(error.message).not.toContain('/private/var/absolute/path/to')
  })

  it('successfully reads and parses a valid file inside the project root', async () => {
    const result = await readDurable(join(FIXTURES, 'CURRENT_STATE.md'), currentStateSchema)
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(result.data.projectId).toBe('sample-project')
    }
  })
})
