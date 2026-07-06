import { describe, expect, it } from 'vitest'
import { validatePath } from '../server/utils/path-validator'
import { ValidationError } from '../server/errors/validation-error'

describe('validatePath', () => {
  it('allows valid markdown paths', () => {
    expect(() => validatePath('/abs/path/to/file.md')).not.toThrow()
  })

  it('throws for non-markdown files', () => {
    expect(() => validatePath('/abs/path/to/file.json')).toThrow(ValidationError)
    expect(() => validatePath('/abs/path/to/file.json')).toThrow('Invalid file extension')
  })

  it('throws for path traversal', () => {
    expect(() => validatePath('/abs/path/../to/file.md')).toThrow(ValidationError)
    expect(() => validatePath('/abs/path/../to/file.md')).toThrow('Forbidden path pattern')
  })

  it('throws for sensitive directories', () => {
    expect(() => validatePath('/abs/path/.git/config.md')).toThrow(ValidationError)
    expect(() => validatePath('/abs/path/node_modules/pkg/README.md')).toThrow(ValidationError)
    expect(() => validatePath('/abs/path/.env.md')).toThrow(ValidationError)
  })
})
