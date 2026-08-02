import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { validatePath } from '../server/utils/path-validator'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('security - Path Validation', () => {
  it('blocks traversal outside the project root directory', async () => {
    const relativePath = '../../../../etc/passwd.md'
    const result = await readDurable(relativePath, currentStateSchema)
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('Path traversal detected')
  })

  it('blocks reading non-.md files', async () => {
    const result = await readDurable('package.json', currentStateSchema)
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('Only .md files are allowed')
  })

  it('allows valid .md paths within project root', () => {
    const validPath = 'fixtures/sample-project/CURRENT_STATE.md'
    expect(() => validatePath(validPath)).not.toThrow()
    expect(validatePath(validPath)).toBe(resolve(validPath))
  })

  it('redacts absolute path in FileReadError', () => {
    const secretPath = '/var/secure/secret/my-project/CURRENT_STATE.md'
    const error = new FileReadError(secretPath)
    expect(error.message).toBe('Failed to read file: CURRENT_STATE.md')
    expect(error.message).not.toContain('/var/secure/secret')
  })
})
