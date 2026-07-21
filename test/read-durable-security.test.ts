import { mkdirSync, rmdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

const FIXTURES = join(import.meta.dirname, '..', 'fixtures', 'sample-project')

describe('readDurable security', () => {
  it('blocks path traversal outside project root', async () => {
    const traversalPath = join(process.cwd(), '..', 'traversal-test.md')
    const result = await readDurable(traversalPath, currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Path traversal detected')
    }
  })

  it('restricts file extensions to .md', async () => {
    // A file inside the workspace/project root but not ending in .md
    const invalidExtPath = join(import.meta.dirname, '..', 'package.json')
    const result = await readDurable(invalidExtPath, currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toContain('Invalid file extension')
    }
  })

  it('redacts absolute filesystem paths on file read error', async () => {
    const dirPath = join(FIXTURES, 'error-trigger.md')
    mkdirSync(dirPath, { recursive: true })
    try {
      const result = await readDurable(dirPath, currentStateSchema)
      expect(result.status).toBe('invalid')
      if (result.status === 'invalid') {
        expect(result.error).toContain('Failed to read file: error-trigger.md')
        expect(result.error).not.toContain(dirPath)
      }
    }
    finally {
      rmdirSync(dirPath)
    }
  })
})
