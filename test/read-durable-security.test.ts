import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('readDurable Security & Path Validation', () => {
  it('blocks path traversal outside process.cwd()', async () => {
    const result = await readDurable('/etc/passwd', currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Access denied')
    }
  })

  it('blocks path traversal via relative navigation', async () => {
    const result = await readDurable('../../../etc/passwd', currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Access denied')
    }
  })

  it('restricts file extensions to .md', async () => {
    const result = await readDurable(join(process.cwd(), 'package.json'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('.md extension')
    }
  })

  it('fileReadError redacts absolute paths in error messages', () => {
    const error = new FileReadError('/secret/path/to/some-file.md')
    expect(error.message).not.toContain('/secret/path/to/')
    expect(error.message).toContain('some-file.md')
  })
})
