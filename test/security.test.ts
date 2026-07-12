import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { readDurable } from '../server/utils/read-durable'

describe('readDurable security', () => {
  const schema = z.any()

  it('blocks path traversal with ..', async () => {
    const result = await readDurable('some/path/../../etc/passwd.md', schema)
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('Path traversal detected')
  })

  it('blocks files without .md extension', async () => {
    const result = await readDurable('projects/config.json', schema)
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('Only .md files are allowed')
  })

  it('blocks absolute paths outside of project root', async () => {
    const result = await readDurable('/etc/passwd.md', schema)
    expect(result.status).toBe('invalid')
    expect(result.error).toContain('Path is outside of allowed project root')
  })

  it('allows valid local .md files', async () => {
    const result = await readDurable('fixtures/sample-project/CURRENT_STATE.md', schema)
    // We expect it to at least pass validation and try to read (it might fail elsewhere but validation should be ok)
    expect(result.status).not.toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).not.toContain('Path traversal')
      expect(result.error).not.toContain('allowed project root')
    }
  })
})
