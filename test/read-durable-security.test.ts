import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { validatePath } from '../server/utils/path-validator'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('security - FileReadError Path Redaction', () => {
  it('redacts absolute path to its basename to prevent info leakage', () => {
    const error = new FileReadError('/secret/highly/sensitive/directory/target-file.md')
    expect(error.message).toContain('target-file.md')
    expect(error.message).not.toContain('/secret/highly/sensitive/directory')
  })
})

describe('security - Path Validation', () => {
  it('blocks path traversal outside process.cwd()', () => {
    expect(validatePath('/etc/passwd')).toBe(false)
    expect(validatePath('../../etc/passwd')).toBe(false)
  })

  it('restricts file extensions to .md', () => {
    expect(validatePath(resolve(process.cwd(), 'package.json'))).toBe(false)
    expect(validatePath(resolve(process.cwd(), 'tsconfig.json'))).toBe(false)
  })

  it('allows valid paths within process.cwd() with .md extension', () => {
    const validPath = resolve(process.cwd(), 'fixtures/sample-project/CURRENT_STATE.md')
    expect(validatePath(validPath)).toBe(true)
  })
})

describe('security - readDurable Graceful Traversal and Validation Handling', () => {
  it('fails gracefully and returns status invalid for invalid path without throwing', async () => {
    const result = await readDurable('/etc/passwd', currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toBe('Invalid file path')
    }
  })

  it('fails gracefully and returns status invalid for invalid file extension', async () => {
    const result = await readDurable(resolve(process.cwd(), 'package.json'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toBe('Invalid file path')
    }
  })
})
