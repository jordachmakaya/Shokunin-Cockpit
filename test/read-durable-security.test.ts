import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { validatePath } from '../server/utils/path-validator'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

const FIXTURES = join(import.meta.dirname, '..', 'fixtures', 'sample-project')

describe('readDurable security and path validation', () => {
  describe('validatePath', () => {
    it('allows valid markdown file inside process.cwd()', () => {
      const validPath = join(process.cwd(), 'fixtures', 'sample-project', 'CURRENT_STATE.md')
      expect(validatePath(validPath)).toBe(true)
    })

    it('rejects path traversal outside allowed root', () => {
      const traversalPath = resolve(process.cwd(), '../etc/passwd.md')
      expect(validatePath(traversalPath)).toBe(false)
    })

    it('rejects non-markdown extensions', () => {
      const txtPath = join(process.cwd(), 'fixtures', 'sample-project', 'config.json')
      expect(validatePath(txtPath)).toBe(false)
    })
  })

  describe('fileReadError', () => {
    it('redacts absolute path to filename only', () => {
      const secretPath = '/Users/secret/projects/private/secret.md'
      const err = new FileReadError(secretPath)
      expect(err.message).toBe('Failed to read file: secret.md')
      expect(err.message).not.toContain('/Users/secret/projects/private')
    })
  })

  describe('readDurable path safety', () => {
    it('returns invalid status for path traversal attempts', async () => {
      const badPath = resolve(process.cwd(), '../traversal.md')
      const result = await readDurable(badPath, currentStateSchema)
      expect(result.status).toBe('invalid')
      if (result.status === 'invalid') {
        expect(result.error).toContain('Invalid or disallowed file path')
      }
    })

    it('returns invalid status for non-markdown files', async () => {
      const nonMdPath = join(FIXTURES, 'package.json')
      const result = await readDurable(nonMdPath, currentStateSchema)
      expect(result.status).toBe('invalid')
    })
  })
})
