import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

const FIXTURES = join(import.meta.dirname, '..', 'fixtures', 'sample-project')

describe('readDurable Security Features', () => {
  it('blocks path traversal outside root dir (e.g. using ..)', async () => {
    // Attempting to read package.json via relative path traversal
    const pathTraversal = join(FIXTURES, '..', '..', '..', 'package.json')
    const result = await readDurable(pathTraversal, currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Access denied or invalid path')
    }
  })

  it('blocks reading files with non-.md extensions (e.g. .json)', async () => {
    const jsonPath = join(import.meta.dirname, '..', 'package.json')
    const result = await readDurable(jsonPath, currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Access denied or invalid path')
    }
  })

  it('redacts absolute path from FileReadError messages', () => {
    const sensitivePath = '/usr/local/secret/my-config-file.md'
    const error = new FileReadError(sensitivePath)
    expect(error.message).not.toContain('/usr/local/secret')
    expect(error.message).toBe('Failed to read file: my-config-file.md')
  })
})
