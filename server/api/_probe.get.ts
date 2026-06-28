// Probe: verify readDurable is auto-imported from server/utils in server/api handlers
export default defineEventHandler(async () => {
  const result = await readDurable('/dev/null', {} as never)
  return result
})
