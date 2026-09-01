import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'

describe('fileReadError security path redaction', () => {
  it('redacts absolute path directory components to avoid path leakage', () => {
    const error = new FileReadError('/var/secret/user/home/config.md')
    expect(error.message).toBe('Failed to read file: config.md')
    expect(error.message).not.toContain('/var/secret/user/home')
  })
})
