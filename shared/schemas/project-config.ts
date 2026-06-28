import { z } from 'zod'

export const projectConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rootPath: z.string().min(1),
  currentStatePath: z.string().optional(),
  nextActionPath: z.string().optional(),
  handoffPath: z.string().optional(),
  planPath: z.string().optional(),
})

export const projectsConfigSchema = z.object({
  projects: z.array(projectConfigSchema),
})

export type ProjectConfig = z.infer<typeof projectConfigSchema>
export type ProjectsConfig = z.infer<typeof projectsConfigSchema>
