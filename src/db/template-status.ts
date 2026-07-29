import type { SQLiteDatabase } from 'expo-sqlite'

import { starterTemplates } from '@/constants/starter-templates'
import type {
  StarterTemplate,
  TemplateId,
  TemplateInstallationStatus,
} from '@/types/template'

type InstalledTemplateRow = {
  source_template_id: string
  source_template_item_key: string
  source_template_version: number
  item_type: 'task' | 'reward'
}

type LegacyItemRow = {
  id: number
  title: string
}

export async function getTemplateInstallationStatuses(
  db: SQLiteDatabase,
): Promise<TemplateInstallationStatus[]> {
  await reconcileLegacyTemplateSources(db)

  const rows = await db.getAllAsync<InstalledTemplateRow>(`
    SELECT
      source_template_id,
      source_template_item_key,
      source_template_version,
      'task' AS item_type
    FROM tasks
    WHERE
      source_template_id IS NOT NULL
      AND source_template_item_key IS NOT NULL
      AND source_template_version IS NOT NULL

    UNION ALL

    SELECT
      source_template_id,
      source_template_item_key,
      source_template_version,
      'reward' AS item_type
    FROM rewards
    WHERE
      source_template_id IS NOT NULL
      AND source_template_item_key IS NOT NULL
      AND source_template_version IS NOT NULL
  `)

  return starterTemplates.map((template) => {
    const templateRows = rows.filter(
      (row) => row.source_template_id === template.id,
    )

    const installedTaskKeys = new Set(
      templateRows
        .filter((row) => row.item_type === 'task')
        .map((row) => row.source_template_item_key),
    )

    const installedRewardKeys = new Set(
      templateRows
        .filter((row) => row.item_type === 'reward')
        .map((row) => row.source_template_item_key),
    )

    const installedTasks = template.tasks.filter((task) =>
      installedTaskKeys.has(task.templateItemKey),
    ).length

    const installedRewards = template.rewards.filter(
      (reward) =>
        installedRewardKeys.has(
          reward.templateItemKey,
        ),
    ).length

    const installedVersions = templateRows.map(
      (row) => row.source_template_version,
    )

    const installedVersion =
      installedVersions.length === 0
        ? null
        : Math.min(...installedVersions)

    const installedItems =
      installedTasks + installedRewards

    const totalItems =
      template.tasks.length +
      template.rewards.length

    return {
      templateId: template.id,
      state: getInstallationState({
        installedItems,
        installedVersion,
        latestVersion: template.version,
        totalItems,
      }),
      installedVersion,
      latestVersion: template.version,
      installedTasks,
      totalTasks: template.tasks.length,
      installedRewards,
      totalRewards: template.rewards.length,
    }
  })
}

async function reconcileLegacyTemplateSources(
  db: SQLiteDatabase,
): Promise<void> {
  const [legacyTasks, legacyRewards] =
    await Promise.all([
      db.getAllAsync<LegacyItemRow>(`
        SELECT id, title
        FROM tasks
        WHERE
          source_template_id IS NULL
          AND source_template_item_key IS NULL
      `),

      db.getAllAsync<LegacyItemRow>(`
        SELECT id, title
        FROM rewards
        WHERE
          source_template_id IS NULL
          AND source_template_item_key IS NULL
      `),
    ])

  const taskByTitle = createLegacyItemMap(legacyTasks)
  const rewardByTitle =
    createLegacyItemMap(legacyRewards)

  await db.withTransactionAsync(async () => {
    for (const template of starterTemplates) {
      await reconcileTemplateTasks(
        db,
        template,
        taskByTitle,
      )

      await reconcileTemplateRewards(
        db,
        template,
        rewardByTitle,
      )
    }
  })
}

async function reconcileTemplateTasks(
  db: SQLiteDatabase,
  template: StarterTemplate,
  taskByTitle: Map<string, LegacyItemRow[]>,
): Promise<void> {
  for (const task of template.tasks) {
    const matchingRows = taskByTitle.get(
      normalizeTitle(task.title),
    )

    const matchingRow = matchingRows?.shift()

    if (!matchingRow) {
      continue
    }

    await db.runAsync(
      `
        UPDATE tasks
        SET
          source_template_id = ?,
          source_template_version = ?,
          source_template_item_key = ?
        WHERE
          id = ?
          AND source_template_id IS NULL
          AND source_template_item_key IS NULL
      `,
      template.id,
      template.version,
      task.templateItemKey,
      matchingRow.id,
    )
  }
}

async function reconcileTemplateRewards(
  db: SQLiteDatabase,
  template: StarterTemplate,
  rewardByTitle: Map<string, LegacyItemRow[]>,
): Promise<void> {
  for (const reward of template.rewards) {
    const matchingRows = rewardByTitle.get(
      normalizeTitle(reward.title),
    )

    const matchingRow = matchingRows?.shift()

    if (!matchingRow) {
      continue
    }

    await db.runAsync(
      `
        UPDATE rewards
        SET
          source_template_id = ?,
          source_template_version = ?,
          source_template_item_key = ?
        WHERE
          id = ?
          AND source_template_id IS NULL
          AND source_template_item_key IS NULL
      `,
      template.id,
      template.version,
      reward.templateItemKey,
      matchingRow.id,
    )
  }
}

function createLegacyItemMap(
  rows: LegacyItemRow[],
): Map<string, LegacyItemRow[]> {
  const result = new Map<string, LegacyItemRow[]>()

  for (const row of rows) {
    const normalizedTitle =
      normalizeTitle(row.title)

    const existingRows =
      result.get(normalizedTitle) ?? []

    existingRows.push(row)
    result.set(normalizedTitle, existingRows)
  }

  return result
}

function getInstallationState(input: {
  installedItems: number
  totalItems: number
  installedVersion: number | null
  latestVersion: number
}): TemplateInstallationStatus['state'] {
  if (input.installedItems === 0) {
    return 'not-installed'
  }

  if (
    input.installedVersion !== null &&
    input.installedVersion < input.latestVersion
  ) {
    return 'update-available'
  }

  if (input.installedItems < input.totalItems) {
    return 'partial'
  }

  return 'installed'
}

export function getTemplateStatus(
  statuses: TemplateInstallationStatus[],
  templateId: TemplateId,
): TemplateInstallationStatus | undefined {
  return statuses.find(
    (status) => status.templateId === templateId,
  )
}

function normalizeTitle(title: string): string {
  return title.trim().toLocaleLowerCase('en-US')
}
