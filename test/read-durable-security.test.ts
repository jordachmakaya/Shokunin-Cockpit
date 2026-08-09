import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { validatePath } from '../server/utils/path-validator'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('readDurable Security & Validation', () => {
  it('blocks path traversal outside project root', async () => {
    const result = await readDurable('/etc/passwd', currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal detected')
    }
  })

  it('blocks relative path traversal outside project root', async () => {
    const result = await readDurable('../../../../etc/passwd.md', currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal detected')
    }
  })

  it('blocks sibling directory traversal', async () => {
    const projectRoot = process.cwd()
    // Append a sibling name like -sibling
    const siblingPath = join(`${projectRoot}-sibling`, 'test.md')
    const result = await readDurable(siblingPath, currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal detected')
    }
  })

  it('restricts reading to .md files only', async () => {
    const result = await readDurable(join(process.cwd(), 'package.json'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('only .md files are allowed')
    }
  })

  it('fileReadError redacts absolute paths to basename only', () => {
    const absolutePath = '/secret/path/to/somefile.md'
    const error = new FileReadError(absolutePath)
    expect(error.message).toBe('Failed to read file: somefile.md')
    expect(error.message).not.toContain('secret')
  })

  it('validatePath returns the resolved path for valid files inside root', () => {
    const validPath = join(process.cwd(), 'fixtures/sample-project/CURRENT_STATE.md')
    const resolved = validatePath(validPath)
    expect(resolved).toBe(join(process.cwd(), 'fixtures/sample-project/CURRENT_STATE.md'))
  })
})
