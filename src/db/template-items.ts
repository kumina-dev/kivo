import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  CombinedTemplate,
  TemplateReward,
  TemplateTask,
} from '@/types/template'

type InstalledTemplateItemRow = {
  source_template_id: string
  source_template_item_key: string
}

type ExistingTitleRow = {
  title: string
}

export async function getMissingTemplateItems(
  db: SQLiteDatabase,
  template: CombinedTemplate,
): Promise<CombinedTemplate> {
  const [
    installedTasks,
    installedRewards,
    existingTaskTitles,
    existingRewardTitles,
  ] = await Promise.all([
    db.getAllAsync<InstalledTemplateItemRow>(`
      SELECT
        source_template_id,
        source_template_item_key
      FROM tasks
      WHERE
        source_template_id IS NOT NULL
        AND source_template_item_key IS NOT NULL
    `),

    db.getAllAsync<InstalledTemplateItemRow>(`
      SELECT
        source_template_id,
        source_template_item_key
      FROM rewards
      WHERE
        source_template_id IS NOT NULL
        AND source_template_item_key IS NOT NULL
    `),

    db.getAllAsync<ExistingTitleRow>(`
      SELECT title
      FROM tasks
    `),

    db.getAllAsync<ExistingTitleRow>(`
      SELECT title
      FROM rewards
    `),
  ])

  const installedTaskKeys = new Set(
    installedTasks.map((row) =>
      createSourceKey(
        row.source_template_id,
        row.source_template_item_key,
      ),
    ),
  )

  const installedRewardKeys = new Set(
    installedRewards.map((row) =>
      createSourceKey(
        row.source_template_id,
        row.source_template_item_key,
      ),
    ),
  )

  const taskTitles = new Set(
    existingTaskTitles.map((row) =>
      normalizeTitle(row.title),
    ),
  )

  const rewardTitles = new Set(
    existingRewardTitles.map((row) =>
      normalizeTitle(row.title),
    ),
  )

  return {
    tasks: template.tasks.filter((task) =>
      isMissingTask(
        task,
        installedTaskKeys,
        taskTitles,
      ),
    ),
    rewards: template.rewards.filter((reward) =>
      isMissingReward(
        reward,
        installedRewardKeys,
        rewardTitles,
      ),
    ),
  }
}

function isMissingTask(
  task: TemplateTask,
  installedKeys: Set<string>,
  existingTitles: Set<string>,
): boolean {
  const sourceKey = createSourceKey(
    task.templateId,
    task.templateItemKey,
  )

  return (
    !installedKeys.has(sourceKey) &&
    !existingTitles.has(normalizeTitle(task.title))
  )
}

function isMissingReward(
  reward: TemplateReward,
  installedKeys: Set<string>,
  existingTitles: Set<string>,
): boolean {
  const sourceKey = createSourceKey(
    reward.templateId,
    reward.templateItemKey,
  )

  return (
    !installedKeys.has(sourceKey) &&
    !existingTitles.has(normalizeTitle(reward.title))
  )
}

function createSourceKey(
  templateId: string,
  itemKey: string,
): string {
  return `${templateId}:${itemKey}`
}

function normalizeTitle(title: string): string {
  return title.trim().toLocaleLowerCase('en-US')
}
