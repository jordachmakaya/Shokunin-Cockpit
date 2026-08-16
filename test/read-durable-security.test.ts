import { describe, expect, it } from 'vitest'

import { FileReadError } from '../server/errors/file-read-error'
import { readDurable } from '../server/utils/read-durable'
import { currentStateSchema } from '../shared/schemas/current-state'

describe('fileReadError path redaction', () => {
  it('redacts absolute system path to basename in error message', () => {
    const error = new FileReadError('/secret/user/system/path/to/CURRENT_STATE.md')
    expect(error.message).toBe('Failed to read file: CURRENT_STATE.md')
    expect(error.message).not.toContain('/secret/user/system/path/to/')
  })
})

describe('readDurable security & compatibility', () => {
  it('parses frontmatter correctly with js-yaml 4.x load engine without throwing safeLoad error', async () => {
    const fixturePath = new URL('../fixtures/sample-project/CURRENT_STATE.md', import.meta.url).pathname
    const result = await readDurable(fixturePath, currentStateSchema)
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(result.data.projectId).toBe('sample-project')
    }
  })
})
