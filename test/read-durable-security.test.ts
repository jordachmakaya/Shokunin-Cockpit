import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { validatePath } from '../server/utils/path-validator'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('readDurable Security & Validation', () => {
  it('blocks path traversal outside process.cwd()', async () => {
    const traversePath = resolve(process.cwd(), '..', 'some-file.md')
    expect(validatePath(traversePath)).toBe(false)

    const result = await readDurable(traversePath, currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid file path')
    }
  })

  it('restricts files to .md extensions', async () => {
    const jsonPath = resolve(process.cwd(), 'package.json')
    expect(validatePath(jsonPath)).toBe(false)

    const result = await readDurable(jsonPath, currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid file path')
    }
  })

  it('redacts absolute path in FileReadError to prevent information leakage', () => {
    const absPath = '/foo/bar/secret-dir/target.md'
    const error = new FileReadError(absPath)
    expect(error.message).toBe('Failed to read file: target.md')
    expect(error.message).not.toContain('secret-dir')
    expect(error.message).not.toContain('/foo/bar')
  })
})
