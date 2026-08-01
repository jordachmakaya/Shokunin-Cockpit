import { describe, expect, it } from 'vitest'

import { currentStateSchema } from '../shared/schemas/current-state'
import { handoffSchema } from '../shared/schemas/handoff'
import { nextActionSchema } from '../shared/schemas/next-action'
import { planSchema } from '../shared/schemas/plan'
import { projectConfigSchema, projectsConfigSchema } from '../shared/schemas/project-config'

describe('projectConfigSchema', () => {
  it('accepts a valid project config', () => {
    const result = projectConfigSchema.safeParse({
      id: 'p1',
      name: 'My Project',
      rootPath: '/projects/p1',
    })
    expect(result.success).toBe(true)
  })

  it('rejects when id is empty', () => {
    const result = projectConfigSchema.safeParse({
      id: '',
      name: 'My Project',
      rootPath: '/projects/p1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const idIssue = result.error.issues.find(i => i.path[0] === 'id')
      expect(idIssue).toBeDefined()
      expect(idIssue?.path).toStrictEqual(['id'])
    }
  })

  it('accepts optional path fields', () => {
    const result = projectConfigSchema.safeParse({
      id: 'p1',
      name: 'My Project',
      rootPath: '/projects/p1',
      currentStatePath: 'CURRENT_STATE.md',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a valid projects config', () => {
    const result = projectsConfigSchema.safeParse({ projects: [] })
    expect(result.success).toBe(true)
  })
})

describe('currentStateSchema', () => {
  it('accepts a valid current state', () => {
    const result = currentStateSchema.safeParse({
      projectId: 'p1',
      status: 'in_progress',
      lastUpdated: '2026-06-24',
      blocked: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status at path [status]', () => {
    const result = currentStateSchema.safeParse({
      projectId: 'p1',
      status: 'paused',
      lastUpdated: '2026-06-24',
      blocked: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path[0] === 'status')
      expect(issue).toBeDefined()
      expect(issue?.path).toStrictEqual(['status'])
    }
  })

  it('rejects empty lastUpdated at path [lastUpdated]', () => {
    const result = currentStateSchema.safeParse({
      projectId: 'p1',
      status: 'done',
      lastUpdated: '',
      blocked: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path[0] === 'lastUpdated')
      expect(issue?.path).toStrictEqual(['lastUpdated'])
    }
  })
})

describe('nextActionSchema', () => {
  it('accepts a valid next action', () => {
    const result = nextActionSchema.safeParse({
      title: 'Do the thing',
      ownerTrack: 'coder',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.commands).toStrictEqual([])
      expect(result.data.requiredProof).toStrictEqual([])
    }
  })

  it('rejects invalid ownerTrack at path [ownerTrack]', () => {
    const result = nextActionSchema.safeParse({
      title: 'Do the thing',
      ownerTrack: 'developer',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path[0] === 'ownerTrack')
      expect(issue?.path).toStrictEqual(['ownerTrack'])
    }
  })
})

describe('handoffSchema', () => {
  it('accepts a valid handoff', () => {
    const result = handoffSchema.safeParse({
      lastHandoffAt: '2026-06-24',
      resumeFile: 'HANDOFF_SESSION_001.md',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.doNotRead).toStrictEqual([])
    }
  })

  it('rejects empty lastHandoffAt at path [lastHandoffAt]', () => {
    const result = handoffSchema.safeParse({
      lastHandoffAt: '',
      resumeFile: 'HANDOFF_SESSION_001.md',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path[0] === 'lastHandoffAt')
      expect(issue?.path).toStrictEqual(['lastHandoffAt'])
    }
  })
})

describe('planSchema', () => {
  it('accepts a valid plan', () => {
    const result = planSchema.safeParse({
      gates: [
        {
          id: 'G0',
          sprint: 'S0',
          label: 'Schemas green',
          status: 'pass',
          verified: true,
          proof: 'pnpm test output 2026-06-24',
        },
        {
          id: 'G1',
          sprint: 'S1',
          label: 'Dashboard live',
          status: 'todo',
          verified: false,
        },
      ],
      roadmap: [{ id: 'S0', title: 'Foundations', state: 'done' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid gate status at path [gates, 0, status]', () => {
    const result = planSchema.safeParse({
      gates: [{ id: 'G0', sprint: 'S0', label: 'x', status: 'pending', verified: false }],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(
        i => i.path[0] === 'gates' && i.path[2] === 'status',
      )
      expect(issue).toBeDefined()
    }
  })

  it('defaults gates and roadmap to empty arrays', () => {
    const result = planSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.gates).toStrictEqual([])
      expect(result.data.roadmap).toStrictEqual([])
    }
  })
})
