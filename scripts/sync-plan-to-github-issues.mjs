#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PLAN_PATH = resolve(process.argv[2] ?? 'IMPLEMENTATION_PLAN.md')
const DRY_RUN = process.argv.includes('--dry-run')
const PROJECT_ARG_INDEX = process.argv.indexOf('--project')
const PROJECT_TITLE
  = PROJECT_ARG_INDEX >= 0 ? process.argv[PROJECT_ARG_INDEX + 1] : undefined

if (!existsSync(PLAN_PATH)) {
  fail(`Plan file not found: ${PLAN_PATH}`)
}

const markdown = readFileSync(PLAN_PATH, 'utf8')
const sprints = parsePlan(markdown)

if (sprints.length === 0) {
  fail('No sprint sections found. Expected headings like "## S0 — Contract & fixtures".')
}

const tasks = sprints.flatMap(sprint => sprint.tasks)

if (tasks.length === 0) {
  fail('No tasks found. Expected bullets like "- `T0.1` Scaffold Nuxt..." under each sprint.')
}

console.log(`Found ${sprints.length} sprint(s), ${tasks.length} task(s).`)

for (const task of tasks) {
  const marker = `<!-- shokunin-plan-id:${task.id} -->`

  if (issueExists(marker)) {
    console.log(`SKIP ${task.id} — issue already exists`)
    continue
  }

  const title = `${task.id} — ${task.title}`
  const body = buildIssueBody(task, marker)
  const labels = [
    `sprint:${task.sprintId}`,
    'source:implementation-plan',
    'shokunin',
  ]

  if (DRY_RUN) {
    console.log('\n--- DRY RUN ISSUE ---')
    console.log(`title: ${title}`)
    console.log(`labels: ${labels.join(', ')}`)
    if (PROJECT_TITLE) {
      console.log(`project: ${PROJECT_TITLE}`)
    }
    console.log(body)
    continue
  }

  const args = [
    'issue',
    'create',
    '--title',
    title,
    '--body',
    body,
    '--label',
    labels.join(','),
  ]

  if (PROJECT_TITLE) {
    args.push('--project', PROJECT_TITLE)
  }

  const output = runGh(args)
  console.log(`CREATED ${task.id} — ${output.trim()}`)
}

function parsePlan(content) {
  const sprintHeadingRegex = /^##\s+(S\d+)\s+[—-]\s+(.+)$/gm
  const sprintMatches = [...content.matchAll(sprintHeadingRegex)]

  return sprintMatches.map((match, index) => {
    const sprintId = requiredMatch(match[1], 'sprint id')
    const sprintTitle = cleanText(requiredMatch(match[2], 'sprint title'))
    const start = requiredIndex(match.index)
    const next = sprintMatches[index + 1]
    const end = next?.index ?? content.length
    const block = content.slice(start, end)

    return {
      id: sprintId,
      title: sprintTitle,
      tasks: parseTasks(block, sprintId, sprintTitle),
    }
  })
}

function parseTasks(sprintBlock, sprintId, sprintTitle) {
  const taskRegex = /^\s*-\s+`(T\d+\.\d+)`\s+(.+)(?:\n|$)/gm
  const matches = [...sprintBlock.matchAll(taskRegex)]

  const goal = extractField(sprintBlock, '- **Goal:**')
  const stopCheck = extractField(sprintBlock, '- **Stop-check (VERIFIED):**')
  const tests = extractField(sprintBlock, '- **Tests:**')

  return matches.map((match) => {
    const id = requiredMatch(match[1], 'task id')
    const rawTask = requiredMatch(match[2], 'task body')
    const title = cleanTaskTitle(rawTask)

    return {
      id,
      title,
      rawTask: cleanText(rawTask),
      sprintId,
      sprintTitle,
      goal,
      tests,
      stopCheck,
    }
  })
}

function extractField(block, label) {
  const start = block.indexOf(label)

  if (start < 0) {
    return undefined
  }

  const afterLabel = block.slice(start + label.length)
  const nextFieldMatch = afterLabel.match(/\n-\s+\*\*[A-Z][^:]+:\*\*/)
  const end = nextFieldMatch?.index ?? afterLabel.length

  return cleanText(afterLabel.slice(0, end))
}

function buildIssueBody(task, marker) {
  const lines = [
    marker,
    '',
    `## Source`,
    '',
    `- Plan: \`${PLAN_PATH}\``,
    `- Sprint: \`${task.sprintId}\` — ${task.sprintTitle}`,
    `- Task: \`${task.id}\``,
    '',
    `## Task`,
    '',
    task.rawTask,
    '',
  ]

  if (task.goal) {
    lines.push('## Sprint goal', '', task.goal, '')
  }

  if (task.tests) {
    lines.push('## Tests expected', '', task.tests, '')
  }

  if (task.stopCheck) {
    lines.push('## Stop-check', '', task.stopCheck, '')
  }

  lines.push(
    '## Done when',
    '',
    '- [ ] Implementation matches the task scope',
    '- [ ] `pnpm typecheck` is clean',
    '- [ ] `pnpm test` is green',
    '- [ ] Proof is pasted in the issue or linked in a report',
    '',
    '## Shokunin rule',
    '',
    'VERIFIED ≠ DECLARED. No PASS without reproducible proof.',
  )

  return lines.join('\n')
}

function issueExists(marker) {
  const query = `${marker} in:body repo:${getRepoSlug()}`
  const output = runGh([
    'issue',
    'list',
    '--search',
    query,
    '--json',
    'number',
    '--limit',
    '1',
  ])

  const parsed = JSON.parse(output)

  return Array.isArray(parsed) && parsed.length > 0
}

function getRepoSlug() {
  const output = runGit(['remote', 'get-url', 'origin']).trim()

  const sshMatch = output.match(/github(?:-[\w-]+)?:([^/]+\/[^.]+)(?:\.git)?$/)
  if (sshMatch?.[1]) {
    return sshMatch[1]
  }

  const httpsMatch = output.match(/github\.com[:/](.+?\/.+?)(?:\.git)?$/)
  if (httpsMatch?.[1]) {
    return httpsMatch[1]
  }

  fail(`Could not infer GitHub repo from origin remote: ${output}`)
}

function runGit(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function runGh(args) {
  try {
    return execFileSync('gh', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  }
  catch (error) {
    const stderr = error instanceof Error && 'stderr' in error
      ? String(error.stderr)
      : ''

    fail(`GitHub CLI command failed: gh ${args.join(' ')}\n${stderr}`)
  }
}

function cleanTaskTitle(rawTask) {
  return cleanText(rawTask)
    .replace(/\*\*/g, '')
    .replace(/\s*\(.*$/, '')
    .replace(/\.$/, '')
}

function cleanText(value) {
  return value
    .replace(/\s+/g, ' ')
    .trim()
}

function requiredMatch(value, label) {
  if (!value) {
    fail(`Missing ${label}`)
  }

  return value
}

function requiredIndex(value) {
  if (typeof value !== 'number') {
    fail('Missing match index')
  }

  return value
}

function fail(message) {
  console.error(`ERROR: ${message}`)
  process.exit(1)
}
