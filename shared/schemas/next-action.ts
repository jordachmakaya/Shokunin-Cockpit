import { z } from 'zod'

export const nextActionSchema = z.object({
  title: z.string(),
  ownerTrack: z.enum(['cto', 'coder']),
  commands: z.array(z.string()).default([]),
  requiredProof: z.array(z.string()).default([]),
  startFrom: z.string().optional(),
})

export type NextAction = z.infer<typeof nextActionSchema>
