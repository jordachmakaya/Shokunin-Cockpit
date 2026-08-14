import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

const PROJECT_ROOT = process.cwd()

describe('readDurable security boundaries', () => {
  it('prevents path traversal outside the project root', async () => {
    // Attempt sibling traversal / escape from project root
    const badPath = join(PROJECT_ROOT, '..', 'some-other-dir', 'file.md')
    const result = await readDurable(badPath, currentStateSchema)

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal detected')
    }
  })

  it('restricts file reads to .md extension', async () => {
    // Attempt reading package.json
    const packageJsonPath = join(PROJECT_ROOT, 'package.json')
    const result = await readDurable(packageJsonPath, currentStateSchema)

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Only Markdown (.md) files are allowed')
    }
  })

  it('redacts absolute path directories in FileReadError to prevent information leakage', () => {
    const absolutePath = '/secret/host/directory/to/workspace/file.md'
    const error = new FileReadError(absolutePath)

    expect(error.message).not.toContain('/secret/host/directory')
    expect(error.message).toBe('Failed to read file: file.md')
  })
})
