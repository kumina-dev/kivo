import type { SQLiteDatabase } from 'expo-sqlite'

import { starterTemplates } from '@/constants/starter-templates'
import type {
  TemplateId,
  TemplateInstallationStatus,
} from '@/types/template'

type InstalledTemplateRow = {
  source_template_id: string
  source_template_item_key: string
  source_template_version: number
  item_type: 'task' | 'reward'
}

export async function getTemplateInstallationStatuses(
  db: SQLiteDatabase,
): Promise<TemplateInstallationStatus[]> {
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
