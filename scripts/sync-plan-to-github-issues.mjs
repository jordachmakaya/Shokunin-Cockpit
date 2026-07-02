#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'

const PLAN_INPUT = getPlanInput(process.argv)
const PLAN_PATH = resolve(PLAN_INPUT)
const OPTIONS = parseOptions(process.argv.slice(2))

if (OPTIONS.help) {
  printHelp()
  process.exit(0)
}

if (!existsSync(PLAN_PATH)) {
  fail(`Plan file not found: ${PLAN_PATH}`)
}

const markdown = readFileSync(PLAN_PATH, 'utf8')
const plan = buildPlan(markdown)

if (plan.sprints.length === 0) {
  fail('No sprint sections found. Expected headings like "## S0 — Contract & fixtures".')
}

if (plan.tasks.length === 0) {
  fail('No tasks found. Expected bullets like "- `T0.1` Scaffold Nuxt..." under each sprint.')
}

const repoSlug = getRepoSlug()
const issueIndex = fetchIssueIndex(repoSlug)
const context = {
  options: OPTIONS,
  plan,
  repoSlug,
  issueIndex,
}

printPlanSummary(plan)

if (OPTIONS.status) {
  runStatus(context)
}
else {
  runSync(context)
}

function getPlanInput(argv) {
  const candidate = argv[2]

  if (!candidate || candidate.startsWith('--')) {
    return 'IMPLEMENTATION_PLAN.md'
  }

  return candidate
}

function parseOptions(args) {
  return {
    dryRun: args.includes('--dry-run'),
    update: args.includes('--update'),
    status: args.includes('--status'),
    commentOnUpdate: args.includes('--comment-on-update'),
    help: args.includes('--help') || args.includes('-h'),
    projectTitle: getFlagValue(args, '--project'),
    jsonOut: getFlagValue(args, '--json-out'),
    limit: parsePositiveInt(getFlagValue(args, '--limit'), 300),
  }
}

function getFlagValue(args, flag) {
  const index = args.indexOf(flag)

  if (index < 0) {
    return undefined
  }

  const value = args[index + 1]

  if (!value || value.startsWith('--')) {
    fail(`Missing value for ${flag}`)
  }

  return value
}

function parsePositiveInt(value, fallback) {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    fail(`Expected a positive integer, got: ${value}`)
  }

  return parsed
}

function buildPlan(content) {
  const sprints = parsePlan(content)
  const tasks = sprints.flatMap(sprint => sprint.tasks)
  return { sprints, tasks }
}

function parsePlan(content) {
  const sprintHeadingRegex = /^##\s+(S\d+)\s+[—-]\s+(.+)$/gm
  const sprintMatches = [...content.matchAll(sprintHeadingRegex)]

  return sprintMatches.map((match, index) => {
    const sprintId = requiredMatch(match[1], 'sprint id')
    const sprintTitle = cleanText(requiredMatch(match[2], 'sprint title'))
    const block = getSprintBlock(content, sprintMatches, match, index)

    return {
      id: sprintId,
      title: sprintTitle,
      goal: extractField(block, '- **Goal:**'),
      scope: extractField(block, '- **Scope:**'),
      tests: extractField(block, '- **Tests:**'),
      stopCheck: extractField(block, '- **Stop-check (VERIFIED):**'),
      handoff: extractField(block, '- **Handoff:**'),
      tasks: parseTasks(block, sprintId, sprintTitle),
    }
  })
}

function getSprintBlock(content, sprintMatches, match, index) {
  const start = requiredIndex(match.index)
  const next = sprintMatches[index + 1]
  const end = next?.index ?? content.length
  return content.slice(start, end)
}

function parseTasks(sprintBlock, sprintId, sprintTitle) {
  const taskSection = extractTaskSection(sprintBlock)

  if (!taskSection) {
    return []
  }

  const goal = extractField(sprintBlock, '- **Goal:**')
  const stopCheck = extractField(sprintBlock, '- **Stop-check (VERIFIED):**')
  const tests = extractField(sprintBlock, '- **Tests:**')
  const taskBlocks = splitTaskBlocks(taskSection)

  return taskBlocks.map(taskBlock => buildTask(taskBlock, {
    sprintId,
    sprintTitle,
    goal,
    tests,
    stopCheck,
  }))
}

function extractTaskSection(block) {
  const label = '- **Tasks:**'
  const start = block.indexOf(label)

  if (start < 0) {
    return ''
  }

  const afterLabel = block.slice(start + label.length)
  const nextFieldMatch = afterLabel.match(/\n-\s+\*\*[A-Z][^:]+:\*\*/)
  const end = nextFieldMatch?.index ?? afterLabel.length

  return afterLabel.slice(0, end)
}

function splitTaskBlocks(taskSection) {
  const lines = taskSection.split('\n')
  const blocks = []
  let current = []

  for (const line of lines) {
    if (isTaskStart(line) && current.length > 0) {
      blocks.push(current.join('\n'))
      current = [line]
      continue
    }

    if (isTaskStart(line) || current.length > 0) {
      current.push(line)
    }
  }

  if (current.length > 0) {
    blocks.push(current.join('\n'))
  }

  return blocks
}

function isTaskStart(line) {
  return /^\s*-\s+`T\d+\.\d+`\s+/.test(line)
}

function buildTask(taskBlock, sprintContext) {
  const firstLine = requiredMatch(taskBlock.split('\n')[0], 'task first line')
  const match = firstLine.match(/^\s*-\s+`(T\d+\.\d+)`\s+(.+)$/)

  if (!match?.[1] || !match?.[2]) {
    fail(`Invalid task format: ${firstLine}`)
  }

  const id = match[1]
  const rawTask = cleanTaskBody(taskBlock)
  const title = cleanTaskTitle(match[2])

  return {
    id,
    title,
    rawTask,
    marker: buildMarker(id),
    expectedTitle: `${id} — ${title}`,
    expectedLabels: [
      `sprint:${sprintContext.sprintId}`,
      'source:implementation-plan',
      'shokunin',
    ],
    ...sprintContext,
  }
}

function cleanTaskBody(taskBlock) {
  const lines = taskBlock.split('\n')
  const normalized = lines.map((line, index) => {
    if (index === 0) {
      return line.replace(/^\s*-\s+/, '').trim()
    }

    return line.trim()
  })

  return normalized
    .filter(Boolean)
    .join('\n')
    .trim()
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
    '## Source',
    '',
    `- Plan: \`${PLAN_INPUT}\``,
    `- Sprint: \`${task.sprintId}\` — ${task.sprintTitle}`,
    `- Task: \`${task.id}\``,
    '',
    '## Task',
    '',
    task.rawTask,
    '',
  ]

  appendOptionalSection(lines, 'Sprint goal', task.goal)
  appendOptionalSection(lines, 'Tests expected', task.tests)
  appendOptionalSection(lines, 'Stop-check', task.stopCheck)

  lines.push(
    '## Done when',
    '',
    '- [ ] Implementation matches the task scope',
    '- [ ] `pnpm typecheck` is clean',
    '- [ ] `pnpm test` is green',
    '- [ ] Proof is pasted in the issue comments or linked in a report',
    '',
    '## Shokunin rule',
    '',
    'VERIFIED ≠ DECLARED. No PASS without reproducible proof.',
  )

  return lines.join('\n')
}

function appendOptionalSection(lines, title, value) {
  if (!value) {
    return
  }

  lines.push(`## ${title}`, '', value, '')
}

function runSync(context) {
  verifyLabels(context.plan.tasks, context.options.dryRun)

  for (const task of context.plan.tasks) {
    syncTask(task, context)
  }
}

function syncTask(task, context) {
  const existingIssues = context.issueIndex.byTaskId.get(task.id) ?? []
  const expectedBody = buildIssueBody(task, task.marker)

  if (existingIssues.length > 1) {
    printDuplicate(task, existingIssues)
    return
  }

  if (existingIssues.length === 0) {
    createIssue(task, expectedBody, context.options)
    return
  }

  syncExistingIssue(task, expectedBody, existingIssues[0], context.options)
}

function syncExistingIssue(task, expectedBody, issue, options) {
  const details = ensureIssueDetails(issue)
  const divergence = analyzeDivergence(task, details, expectedBody)

  if (!options.update) {
    console.log(`SKIP ${task.id} — issue #${details.number} already exists (${details.state})`)
    return
  }

  if (!divergence.hasDivergence) {
    console.log(`SKIP ${task.id} — issue #${details.number} already synced (${details.state})`)
    return
  }

  if (options.dryRun) {
    printUpdateDryRun(task, details, divergence)
    return
  }

  updateIssue(task, details, expectedBody)

  if (options.commentOnUpdate) {
    commentOnIssue(details.number, buildUpdateComment(task, divergence))
  }

  console.log(`UPDATED ${task.id} — #${details.number} (${details.url})`)
}

function createIssue(task, body, options) {
  if (options.dryRun) {
    printCreateDryRun(task, body, options)
    return
  }

  const args = [
    'issue',
    'create',
    '--title',
    task.expectedTitle,
    '--body',
    body,
    '--label',
    task.expectedLabels.join(','),
  ]

  if (options.projectTitle) {
    args.push('--project', options.projectTitle)
  }

  const output = runGh(args)
  console.log(`CREATED ${task.id} — ${output.trim()}`)
}

function updateIssue(task, issue, expectedBody) {
  const args = [
    'issue',
    'edit',
    String(issue.number),
    '--title',
    task.expectedTitle,
    '--body',
    expectedBody,
    '--add-label',
    task.expectedLabels.join(','),
  ]

  runGh(args)
}

function commentOnIssue(issueNumber, body) {
  runGh([
    'issue',
    'comment',
    String(issueNumber),
    '--body',
    body,
  ])
}

function buildUpdateComment(task, divergence) {
  const lines = [
    `Shokunin plan sync updated generated issue body for \`${task.id}\`.`,
    '',
    'Changed generated fields:',
  ]

  for (const item of divergence.items) {
    lines.push(`- ${item}`)
  }

  lines.push('', 'Execution proof remains owned by issue comments or linked reports.')

  return lines.join('\n')
}

function runStatus(context) {
  const report = buildStatusReport(context)

  printStatusReport(report)

  if (context.options.jsonOut) {
    writeJsonReport(context.options.jsonOut, report)
  }
}

function buildStatusReport(context) {
  const taskStatuses = context.plan.tasks.map((task) => {
    const issues = context.issueIndex.byTaskId.get(task.id) ?? []
    return buildTaskStatus(task, issues)
  })

  const orphanIssues = findOrphanIssues(context.plan.tasks, context.issueIndex.allIssues)
  const summary = summarizeStatus(taskStatuses, orphanIssues)

  return {
    generatedAt: new Date().toISOString(),
    repo: context.repoSlug,
    planPath: PLAN_PATH,
    mode: 'status',
    summary,
    tasks: taskStatuses,
    orphanIssues: orphanIssues.map(normalizeIssueForReport),
  }
}

function buildTaskStatus(task, issues) {
  if (issues.length === 0) {
    return buildMissingTaskStatus(task)
  }

  const detailedIssues = issues.map(ensureIssueDetails)

  if (detailedIssues.length > 1) {
    return buildDuplicateTaskStatus(task, detailedIssues)
  }

  return buildExistingTaskStatus(task, detailedIssues[0])
}

function buildMissingTaskStatus(task) {
  return {
    taskId: task.id,
    title: task.title,
    sprintId: task.sprintId,
    status: 'missing_issue',
    issue: undefined,
    divergence: ['missing issue'],
    proof: { hasProofComment: false, proofCommentCount: 0 },
    shokuninState: 'unknown',
  }
}

function buildDuplicateTaskStatus(task, issues) {
  return {
    taskId: task.id,
    title: task.title,
    sprintId: task.sprintId,
    status: 'duplicate_issues',
    issue: undefined,
    duplicates: issues.map(normalizeIssueForReport),
    divergence: ['duplicate issues'],
    proof: countProofComments(issues.flatMap(issue => issue.comments ?? [])),
    shokuninState: inferShokuninStateFromIssues(issues),
  }
}

function buildExistingTaskStatus(task, issue) {
  const expectedBody = buildIssueBody(task, task.marker)
  const divergence = analyzeDivergence(task, issue, expectedBody)
  const proof = countProofComments(issue.comments ?? [])
  const shokuninState = inferShokuninState(issue)

  return {
    taskId: task.id,
    title: task.title,
    sprintId: task.sprintId,
    status: buildIssueStatus(issue, divergence),
    issue: normalizeIssueForReport(issue),
    divergence: divergence.items,
    proof,
    shokuninState,
    closedButInPlan: issue.state === 'CLOSED',
  }
}

function buildIssueStatus(issue, divergence) {
  if (issue.state === 'CLOSED') {
    return 'closed_but_in_plan'
  }

  if (divergence.hasDivergence) {
    return 'stale'
  }

  return 'synced'
}

function findOrphanIssues(tasks, issues) {
  const taskIds = new Set(tasks.map(task => task.id))
  return issues
    .filter(issue => issue.planId && !taskIds.has(issue.planId))
    .map(ensureIssueDetails)
}

function summarizeStatus(taskStatuses, orphanIssues) {
  return {
    totalPlanTasks: taskStatuses.length,
    synced: countByStatus(taskStatuses, 'synced'),
    stale: countByStatus(taskStatuses, 'stale'),
    missingIssues: countByStatus(taskStatuses, 'missing_issue'),
    duplicateIssues: countByStatus(taskStatuses, 'duplicate_issues'),
    closedButInPlan: countByStatus(taskStatuses, 'closed_but_in_plan'),
    orphanIssues: orphanIssues.length,
  }
}

function countByStatus(items, status) {
  return items.filter(item => item.status === status).length
}

function analyzeDivergence(task, issue, expectedBody) {
  const items = []
  const issueLabels = getLabelNames(issue.labels)
  const missingLabels = task.expectedLabels.filter(label => !issueLabels.includes(label))

  if (issue.title !== task.expectedTitle) {
    items.push('title differs from plan')
  }

  if (missingLabels.length > 0) {
    items.push(`missing labels: ${missingLabels.join(', ')}`)
  }

  if (normalizeMarkdown(issue.body ?? '') !== normalizeMarkdown(expectedBody)) {
    items.push('generated body differs from plan')
  }

  return {
    hasDivergence: items.length > 0,
    items,
  }
}

function fetchIssueIndex(repoSlug) {
  const issues = fetchAllPlanIssues(repoSlug)
  const detailedByNumber = new Map()
  const byTaskId = new Map()

  for (const issue of issues) {
    const planId = extractPlanId(issue.body ?? '')

    if (!planId) {
      continue
    }

    issue.planId = planId

    const existing = byTaskId.get(planId) ?? []
    existing.push(issue)
    byTaskId.set(planId, existing)
    detailedByNumber.set(issue.number, issue)
  }

  return {
    allIssues: issues,
    byTaskId,
    detailedByNumber,
  }
}

function fetchAllPlanIssues(repoSlug) {
  const query = `shokunin-plan-id in:body repo:${repoSlug}`
  const output = runGh([
    'issue',
    'list',
    '--state',
    'all',
    '--search',
    query,
    '--json',
    'number,title,state,url,body,labels,assignees,milestone',
    '--limit',
    String(OPTIONS.limit),
  ])

  return JSON.parse(output)
}

function ensureIssueDetails(issue) {
  if (issue.comments && issue.projectItems !== undefined) {
    return issue
  }

  const detailed = fetchIssueDetails(issue.number)

  return {
    ...issue,
    ...detailed,
    planId: issue.planId ?? extractPlanId(detailed.body ?? ''),
  }
}

function fetchIssueDetails(issueNumber) {
  const fullFields = 'number,title,state,url,body,labels,assignees,milestone,comments,projectItems'
  const fallbackFields = 'number,title,state,url,body,labels,assignees,milestone,comments'

  try {
    const output = runGh([
      'issue',
      'view',
      String(issueNumber),
      '--json',
      fullFields,
    ])

    return JSON.parse(output)
  }
  catch {
    const output = runGh([
      'issue',
      'view',
      String(issueNumber),
      '--json',
      fallbackFields,
    ])

    return {
      ...JSON.parse(output),
      projectItems: [],
    }
  }
}

function verifyLabels(tasks, dryRun) {
  const requiredLabels = getRequiredLabels(tasks)
  const existingLabels = fetchLabelNames()
  const missingLabels = requiredLabels.filter(label => !existingLabels.has(label))

  if (missingLabels.length === 0) {
    return
  }

  const message = `Missing GitHub labels: ${missingLabels.join(', ')}`

  if (dryRun) {
    console.log(`WARNING: ${message}`)
    return
  }

  fail(`${message}\nCreate them before running the real sync.`)
}

function getRequiredLabels(tasks) {
  return [...new Set(tasks.flatMap(task => task.expectedLabels))]
}

function fetchLabelNames() {
  const output = runGh([
    'label',
    'list',
    '--json',
    'name',
    '--limit',
    '1000',
  ])

  const parsed = JSON.parse(output)
  return new Set(parsed.map(label => label.name))
}

function normalizeIssueForReport(issue) {
  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    url: issue.url,
    labels: getLabelNames(issue.labels),
    assignees: getAssigneeNames(issue.assignees),
    milestone: getMilestoneTitle(issue.milestone),
    projectStatus: extractProjectStatus(issue.projectItems ?? []),
    comments: summarizeComments(issue.comments ?? []),
    planId: issue.planId ?? extractPlanId(issue.body ?? ''),
  }
}

function getLabelNames(labels) {
  if (!Array.isArray(labels)) {
    return []
  }

  return labels
    .map(label => label.name)
    .filter(Boolean)
}

function getAssigneeNames(assignees) {
  if (!Array.isArray(assignees)) {
    return []
  }

  return assignees
    .map(assignee => assignee.login ?? assignee.name)
    .filter(Boolean)
}

function getMilestoneTitle(milestone) {
  if (!milestone) {
    return undefined
  }

  return milestone.title ?? milestone.name
}

function summarizeComments(comments) {
  return {
    count: comments.length,
    proof: countProofComments(comments),
    latest: getLatestCommentSummary(comments),
  }
}

function getLatestCommentSummary(comments) {
  const latest = comments.at(-1)

  if (!latest) {
    return undefined
  }

  return {
    author: latest.author?.login,
    createdAt: latest.createdAt,
    preview: cleanText(latest.body ?? '').slice(0, 160),
  }
}

function countProofComments(comments) {
  const proofComments = comments.filter(comment => hasProofSignal(comment.body ?? ''))

  return {
    hasProofComment: proofComments.length > 0,
    proofCommentCount: proofComments.length,
  }
}

function hasProofSignal(body) {
  return [
    'shokunin proof',
    'proof:',
    'pnpm typecheck',
    'pnpm test',
    'pnpm build',
    'verified ≠ declared',
    'verified != declared',
  ].some(signal => body.toLowerCase().includes(signal))
}

function inferShokuninState(issue) {
  const labelState = inferStateFromLabels(getLabelNames(issue.labels))

  if (labelState !== 'unknown') {
    return labelState
  }

  return inferStateFromComments(issue.comments ?? [])
}

function inferShokuninStateFromIssues(issues) {
  const states = issues.map(inferShokuninState).filter(state => state !== 'unknown')

  if (states.length === 0) {
    return 'unknown'
  }

  return states.at(-1)
}

function inferStateFromLabels(labels) {
  const normalized = labels.map(label => label.toLowerCase())

  if (normalized.some(label => label.includes('changes_requested') || label.includes('changes-requested'))) {
    return 'changes_requested'
  }

  if (normalized.some(label => label.includes('blocked'))) {
    return 'blocked'
  }

  if (normalized.some(label => label.includes('accepted'))) {
    return 'accepted'
  }

  return 'unknown'
}

function inferStateFromComments(comments) {
  const states = comments
    .map(comment => extractExplicitState(comment.body ?? ''))
    .filter(Boolean)

  return states.at(-1) ?? 'unknown'
}

function extractExplicitState(body) {
  const match = body.toLowerCase().match(/shokunin\s+status\s*:\s*(accepted|blocked|changes_requested|changes-requested)/)

  if (!match?.[1]) {
    return undefined
  }

  return match[1].replace('-', '_')
}

function extractProjectStatus(projectItems) {
  if (!Array.isArray(projectItems)) {
    return []
  }

  return projectItems.map(projectItem => ({
    project: projectItem.project?.title ?? projectItem.projectTitle ?? projectItem.title,
    status: findNestedStatus(projectItem),
  }))
}

function findNestedStatus(value) {
  const queue = [value]

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current || typeof current !== 'object') {
      continue
    }

    const status = extractDirectStatus(current)

    if (status) {
      return status
    }

    for (const child of Object.values(current)) {
      if (child && typeof child === 'object') {
        queue.push(child)
      }
    }
  }

  return undefined
}

function extractDirectStatus(value) {
  for (const [key, child] of Object.entries(value)) {
    if (key.toLowerCase() !== 'status') {
      continue
    }

    if (typeof child === 'string') {
      return child
    }

    if (child && typeof child === 'object') {
      return child.name ?? child.title ?? child.text ?? child.value
    }
  }

  return undefined
}

function printPlanSummary(plan) {
  console.log(`Found ${plan.sprints.length} sprint(s), ${plan.tasks.length} task(s).`)
}

function printCreateDryRun(task, body, options) {
  console.log('\n--- DRY RUN CREATE ISSUE ---')
  console.log(`title: ${task.expectedTitle}`)
  console.log(`labels: ${task.expectedLabels.join(', ')}`)

  if (options.projectTitle) {
    console.log(`project: ${options.projectTitle}`)
  }

  console.log(body)
}

function printUpdateDryRun(task, issue, divergence) {
  console.log('\n--- DRY RUN UPDATE ISSUE ---')
  console.log(`task: ${task.id}`)
  console.log(`issue: #${issue.number} (${issue.state}) ${issue.url}`)
  console.log(`title: ${task.expectedTitle}`)
  console.log('changes:')
  for (const item of divergence.items) {
    console.log(`- ${item}`)
  }
}

function printDuplicate(task, issues) {
  console.log(`DUPLICATE ${task.id} — ${issues.length} matching issues:`)

  for (const issue of issues) {
    console.log(`- #${issue.number} ${issue.state} ${issue.url}`)
  }
}

function printStatusReport(report) {
  printStatusSummary(report.summary)
  printTaskStatusRows(report.tasks)
  printOrphanRows(report.orphanIssues)
}

function printStatusSummary(summary) {
  console.log('\n--- ISSUE STATUS SUMMARY ---')
  console.log(`synced: ${summary.synced}`)
  console.log(`stale: ${summary.stale}`)
  console.log(`missing: ${summary.missingIssues}`)
  console.log(`duplicates: ${summary.duplicateIssues}`)
  console.log(`closed but in plan: ${summary.closedButInPlan}`)
  console.log(`orphans: ${summary.orphanIssues}`)
}

function printTaskStatusRows(tasks) {
  console.log('\n--- PLAN TASKS ---')

  for (const task of tasks) {
    const issue = task.issue ? `#${task.issue.number}` : '—'
    const state = task.issue?.state ?? 'missing'
    const proof = task.proof?.hasProofComment ? `proof:${task.proof.proofCommentCount}` : 'proof:0'
    console.log(`${task.taskId}\t${issue}\t${state}\t${task.status}\t${task.shokuninState}\t${proof}`)
  }
}

function printOrphanRows(orphans) {
  if (orphans.length === 0) {
    return
  }

  console.log('\n--- ORPHAN ISSUES ---')

  for (const issue of orphans) {
    console.log(`${issue.planId}\t#${issue.number}\t${issue.state}\t${issue.url}`)
  }
}

function writeJsonReport(outputPath, report) {
  const resolvedPath = resolve(outputPath)
  mkdirSync(dirname(resolvedPath), { recursive: true })
  writeFileSync(resolvedPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`\nWROTE ${resolvedPath}`)
}

function buildMarker(taskId) {
  return `<!-- shokunin-plan-id:${taskId} -->`
}

function extractPlanId(body) {
  const match = body.match(/<!--\s*shokunin-plan-id:(T\d+\.\d+)\s*-->/)
  return match?.[1]
}

function normalizeMarkdown(value) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim()
}

function cleanTaskTitle(rawTask) {
  return cleanText(rawTask)
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s*\(.*$/, '')
    .replace(/\.$/, '')
}

function cleanText(value) {
  return String(value)
    .replace(/\s+/g, ' ')
    .trim()
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

  // Sanitize the output to remove potential tokens or passwords before failing
  const sanitizedOutput = output.replace(/:[^@/]+@/, ':***@')
  fail(`Could not infer GitHub repo from origin remote: ${sanitizedOutput}`)
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

function printHelp() {
  console.log(`
Usage:
  node sync-plan-to-github-issues.mjs <PLAN_PATH> [options]

Modes:
  default                 Create missing issues, skip existing issues.
  --update                Update generated title/body/labels for existing issues.
  --status                Pull GitHub issue state and print a status report.

Safety:
  --dry-run               Print create/update operations without writing.
  --comment-on-update     Add a short sync comment after updating an issue.

Optional:
  --project "<name>"      Attach newly created issues to a GitHub Project when supported.
  --json-out <path>       Write --status report as JSON.
  --limit <number>        Max GitHub issues to scan for Shokunin markers. Default: 300.
  --help                  Print this help.

Examples:
  node sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --dry-run
  node sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md
  node sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update --dry-run
  node sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --update
  node sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --status
  node sync-plan-to-github-issues.mjs ../CLAUDE/IMPLEMENTATION_PLAN.md --status --json-out ../CLAUDE/reports/github-issues-status.json
`.trim())
}

function fail(message) {
  console.error(`ERROR: ${message}`)
  process.exit(1)
}
