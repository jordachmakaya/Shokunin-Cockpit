import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('readDurable security', () => {
  it('throws for path traversal attempt (outside root)', async () => {
    await expect(readDurable('/etc/passwd', currentStateSchema))
      .rejects
      .toThrow('Access denied: path is outside project root')
  })

  it('throws for non-markdown file', async () => {
    const packageJson = join(process.cwd(), 'package.json')
    await expect(readDurable(packageJson, currentStateSchema))
      .rejects
      .toThrow('Access denied: only .md files are allowed')
  })

  it('fileReadError redacts absolute path', async () => {
    const fakeMdDir = join(process.cwd(), 'fake.md')
    const { mkdir, rmdir } = await import('node:fs/promises')
    await mkdir(fakeMdDir).catch(() => {})

    try {
      await readDurable(fakeMdDir, currentStateSchema)
    }
    catch (err: any) {
      expect(err.name).toBe('FileReadError')
      expect(err.message).toBe('Failed to read file: fake.md')
      expect(err.message).not.toContain(fakeMdDir)
    }
    finally {
      await rmdir(fakeMdDir).catch(() => {})
    }
  })
})
