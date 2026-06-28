import { z } from 'zod'

export const gateSchema = z.object({
  id: z.string(),
  sprint: z.string(),
  label: z.string(),
  status: z.enum(['pass', 'blocked', 'todo']),
  verified: z.boolean(),
  proof: z.string().optional(),
})

export const roadmapItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  state: z.string(),
})

export const planSchema = z.object({
  gates: z.array(gateSchema).default([]),
  roadmap: z.array(roadmapItemSchema).default([]),
})

export type Gate = z.infer<typeof gateSchema>
export type RoadmapItem = z.infer<typeof roadmapItemSchema>
export type Plan = z.infer<typeof planSchema>
