import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('readDurable security checks', () => {
  it('blocks path traversal outside project root and returns invalid status gracefully', async () => {
    // Attempting path traversal outside project root
    const traversalPath = resolve(process.cwd(), '..', 'some-other-file.md')
    const result = await readDurable(traversalPath, currentStateSchema)

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal detected')
    }
  })

  it('restricts file extensions to .md and returns invalid status gracefully', async () => {
    // Attempting to read a non-md file inside the project root
    const nonMdPath = resolve(process.cwd(), 'package.json')
    const result = await readDurable(nonMdPath, currentStateSchema)

    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid file extension')
    }
  })

  it('redacts absolute paths inside FileReadError using basename', () => {
    const absolutePath = resolve(process.cwd(), 'fixtures/sample-project/CURRENT_STATE.md')
    const error = new FileReadError(absolutePath)

    expect(error.message).toBe('Failed to read file: CURRENT_STATE.md')
    expect(error.message).not.toContain('fixtures')
    expect(error.message).not.toContain('sample-project')
  })
})
