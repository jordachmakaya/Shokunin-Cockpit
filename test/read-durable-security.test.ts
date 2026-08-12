import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('readDurable security checks', () => {
  it('prevents path traversal outside the project root directory', async () => {
    const result = await readDurable('/etc/passwd', currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal detected')
    }
  })

  it('prevents sibling directory path traversal', async () => {
    const result = await readDurable(join(process.cwd(), '..', 'some-other-dir', 'CURRENT_STATE.md'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal detected')
    }
  })

  it('restricts file extensions to .md', async () => {
    const result = await readDurable(join(process.cwd(), 'package.json'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('only Markdown (.md) files are allowed')
    }
  })

  it('redacts absolute path information in FileReadError', () => {
    const err = new FileReadError('/foo/bar/my-secret-file.md')
    expect(err.message).toBe('Failed to read file: my-secret-file.md')
    expect(err.message).not.toContain('/foo/bar')
  })
})
