import { z } from 'zod'

export const currentStateSchema = z.object({
  projectId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'blocked', 'done']),
  lastUpdated: z.string().min(1),
  blocked: z.boolean(),
  activeSprint: z.string().optional(),
  activeGate: z.string().optional(),
  summary: z.string().optional(),
})

export type CurrentState = z.infer<typeof currentStateSchema>
