import { join } from 'node:path'

// Probe: verify readDurable is auto-imported from server/utils in server/api handlers
export default defineEventHandler(async () => {
  const fixturePath = join(process.cwd(), 'fixtures/sample-project/CURRENT_STATE.md')
  const result = await readDurable(fixturePath, {} as never)
  return result
})
