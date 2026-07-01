// Probe: verify readDurable is auto-imported from server/utils in server/api handlers
export default defineEventHandler(async () => {
  // Use a safe path for the probe
  const result = await readDurable('fixtures/sample-project/CURRENT_STATE.md', {} as never)
  return result
})
