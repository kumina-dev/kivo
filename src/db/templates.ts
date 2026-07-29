import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  CombinedTemplate,
  TemplateImportSummary,
} from '@/types/template'

type ExistingTitleRow = {
  title: string
}

type ExistingTemplateItemRow = {
  source_template_id: string
  source_template_item_key: string
}

export async function importStarterTemplate(
  db: SQLiteDatabase,
  template: CombinedTemplate,
): Promise<TemplateImportSummary> {
  const [
    existingTaskRows,
    existingRewardRows,
    existingTemplateTasks,
    existingTemplateRewards,
  ] = await Promise.all([
    db.getAllAsync<ExistingTitleRow>(`
      SELECT title
      FROM tasks
    `),

    db.getAllAsync<ExistingTitleRow>(`
      SELECT title
      FROM rewards
    `),

    db.getAllAsync<ExistingTemplateItemRow>(`
      SELECT
        source_template_id,
        source_template_item_key
      FROM tasks
      WHERE
        source_template_id IS NOT NULL
        AND source_template_item_key IS NOT NULL
    `),

    db.getAllAsync<ExistingTemplateItemRow>(`
      SELECT
        source_template_id,
        source_template_item_key
      FROM rewards
      WHERE
        source_template_id IS NOT NULL
        AND source_template_item_key IS NOT NULL
    `),
  ])

  const existingTaskTitles = new Set(
    existingTaskRows.map((row) =>
      normalizeTitle(row.title),
    ),
  )

  const existingRewardTitles = new Set(
    existingRewardRows.map((row) =>
      normalizeTitle(row.title),
    ),
  )

  const existingTaskSources = new Set(
    existingTemplateTasks.map((row) =>
      createSourceKey(
        row.source_template_id,
        row.source_template_item_key,
      ),
    ),
  )

  const existingRewardSources = new Set(
    existingTemplateRewards.map((row) =>
      createSourceKey(
        row.source_template_id,
        row.source_template_item_key,
      ),
    ),
  )

  const tasksToAdd = template.tasks.filter((task) => {
    const sourceKey = createSourceKey(
      task.templateId,
      task.templateItemKey,
    )

    return (
      !existingTaskSources.has(sourceKey) &&
      !existingTaskTitles.has(
        normalizeTitle(task.title),
      )
    )
  })

  const rewardsToAdd = template.rewards.filter(
    (reward) => {
      const sourceKey = createSourceKey(
        reward.templateId,
        reward.templateItemKey,
      )

      return (
        !existingRewardSources.has(sourceKey) &&
        !existingRewardTitles.has(
          normalizeTitle(reward.title),
        )
      )
    },
  )

  const createdAt = new Date().toISOString()

  await db.withTransactionAsync(async () => {
    for (const task of tasksToAdd) {
      await db.runAsync(
        `
          INSERT INTO tasks (
            title,
            description,
            points,
            repeat_rule,
            created_at,
            archived_at,
            source_template_id,
            source_template_version,
            source_template_item_key
          )
          VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)
        `,
        task.title.trim(),
        task.description ?? null,
        task.points,
        task.repeatRule,
        createdAt,
        task.templateId,
        task.templateVersion,
        task.templateItemKey,
      )
    }

    for (const reward of rewardsToAdd) {
      await db.runAsync(
        `
          INSERT INTO rewards (
            title,
            description,
            cost,
            created_at,
            archived_at,
            source_template_id,
            source_template_version,
            source_template_item_key
          )
          VALUES (?, ?, ?, ?, NULL, ?, ?, ?)
        `,
        reward.title.trim(),
        reward.description ?? null,
        reward.cost,
        createdAt,
        reward.templateId,
        reward.templateVersion,
        reward.templateItemKey,
      )
    }
  })

  return {
    tasksAdded: tasksToAdd.length,
    tasksSkipped:
      template.tasks.length - tasksToAdd.length,
    rewardsAdded: rewardsToAdd.length,
    rewardsSkipped:
      template.rewards.length - rewardsToAdd.length,
  }
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
