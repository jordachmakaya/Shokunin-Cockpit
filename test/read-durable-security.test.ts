import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('readDurable security features', () => {
  it('blocks path traversal and returns status invalid', async () => {
    // Attempt to traverse outside the repository root
    const traversalPath = join(process.cwd(), '..', 'some-external-file.md')
    const result = await readDurable(traversalPath, currentStateSchema)

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal detected')
    }
  })

  it('restricts file reads to .md extension', async () => {
    const invalidExtensionPath = join(process.cwd(), 'fixtures', 'sample-project', 'CURRENT_STATE.json')
    const result = await readDurable(invalidExtensionPath, currentStateSchema)

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid file extension')
    }
  })

  it('redacts absolute path details in FileReadError', () => {
    const absolutePath = resolve('/var/log/secure_file.md')
    const error = new FileReadError(absolutePath)

    // Ensure absolute filesystem path is redacted (only secure_file.md should be visible)
    expect(error.message).toContain('Failed to read file: secure_file.md')
    expect(error.message).not.toContain('/var/log/')
  })
})
