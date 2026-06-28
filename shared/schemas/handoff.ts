import { z } from 'zod'

export const handoffSchema = z.object({
  lastHandoffAt: z.string().min(1),
  resumeFile: z.string(),
  doNotRead: z.array(z.string()).default([]),
  openFirst: z.string().optional(),
  nextAction: z.string().optional(),
})

export type Handoff = z.infer<typeof handoffSchema>
