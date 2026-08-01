import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('readDurable Security', () => {
  it('blocks path traversal outside root', async () => {
    const result = await readDurable(resolve('/etc/passwd'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid path')
    }
  })

  it('blocks reading files with non-md extensions', async () => {
    const result = await readDurable(join(process.cwd(), 'package.json'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid path')
    }
  })

  it('redacts absolute path in FileReadError', () => {
    const error = new FileReadError('/secret/path/to/file.md')
    expect(error.message).not.toContain('/secret/path/to/')
    expect(error.message).toContain('file.md')
  })
})
