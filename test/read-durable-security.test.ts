import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { validatePath } from '../server/utils/path-validator'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('readDurable Security & Validation', () => {
  describe('validatePath', () => {
    it('allows valid .md paths within project root', () => {
      const validPath = join(process.cwd(), 'fixtures/sample-project/CURRENT_STATE.md')
      expect(validatePath(validPath)).toBe(true)
    })

    it('rejects paths with non-md extensions', () => {
      const invalidExt = join(process.cwd(), 'package.json')
      expect(validatePath(invalidExt)).toBe(false)
    })

    it('rejects path traversal outside project root', () => {
      const traversalPath = resolve(process.cwd(), '../some-external-file.md')
      expect(validatePath(traversalPath)).toBe(false)
    })
  })

  describe('readDurable Security', () => {
    it('fails gracefully on invalid path traversal', async () => {
      const traversalPath = resolve(process.cwd(), '../some-external-file.md')
      const result = await readDurable(traversalPath, currentStateSchema)
      expect(result.status).toBe('invalid')
      if (result.status === 'invalid') {
        expect(result.error).toContain('Invalid file path')
      }
    })

    it('fails gracefully on invalid extension', async () => {
      const invalidPath = join(process.cwd(), 'package.json')
      const result = await readDurable(invalidPath, currentStateSchema)
      expect(result.status).toBe('invalid')
      if (result.status === 'invalid') {
        expect(result.error).toContain('Invalid file path')
      }
    })
  })

  describe('fileReadError Path Redaction', () => {
    it('redacts absolute path to basename', () => {
      const absPath = '/etc/secret/confidential.md'
      const error = new FileReadError(absPath)
      expect(error.message).not.toContain('/etc/secret')
      expect(error.message).toContain('confidential.md')
    })
  })
})
