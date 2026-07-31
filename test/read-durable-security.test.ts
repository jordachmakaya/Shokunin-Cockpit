import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

const FIXTURES = join(import.meta.dirname, '..', 'fixtures', 'sample-project')

describe('readDurable Security Hardening', () => {
  it('blocks path traversal outside the process.cwd() directory', async () => {
    // Attempting to read a file outside process.cwd() / fixtures
    const result = await readDurable(join(FIXTURES, '..', '..', '..', 'package.json'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toBe('Invalid path')
    }
  })

  it('restricts file reads to .md extension', async () => {
    const result = await readDurable(join(FIXTURES, '..', '..', 'package.json'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toBe('Invalid path')
    }
  })

  it('blocks sensitive path segments like node_modules', async () => {
    const result = await readDurable(join(process.cwd(), 'node_modules', 'some-dep', 'README.md'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toBe('Invalid path')
    }
  })

  it('blocks sensitive path segments like .git', async () => {
    const result = await readDurable(join(process.cwd(), '.git', 'config.md'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toBe('Invalid path')
    }
  })

  it('blocks sensitive files like .env', async () => {
    const result = await readDurable(join(process.cwd(), '.env.md'), currentStateSchema)
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') {
      expect(result.error).toBe('Invalid path')
    }
  })

  it('redacts absolute path details from FileReadError messages using basename', () => {
    const sensitivePath = '/usr/local/secrets/highly-confidential-path/config.md'
    const error = new FileReadError(sensitivePath)
    expect(error.message).not.toContain('usr')
    expect(error.message).not.toContain('secrets')
    expect(error.message).not.toContain('highly-confidential-path')
    expect(error.message).toBe('Failed to read file: config.md')
  })
})
