import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  CombinedTemplate,
  TemplateImportSummary,
} from '@/types/template'

type ExistingTitleRow = {
  title: string
}

export async function importStarterTemplate(
  db: SQLiteDatabase,
  template: CombinedTemplate,
): Promise<TemplateImportSummary> {
  const [existingTaskRows, existingRewardRows] =
    await Promise.all([
      db.getAllAsync<ExistingTitleRow>(`
        SELECT title
        FROM tasks
      `),
      db.getAllAsync<ExistingTitleRow>(`
        SELECT title
        FROM rewards
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

  const tasksToAdd = template.tasks.filter(
    (task) =>
      !existingTaskTitles.has(
        normalizeTitle(task.title),
      ),
  )

  const rewardsToAdd = template.rewards.filter(
    (reward) =>
      !existingRewardTitles.has(
        normalizeTitle(reward.title),
      ),
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
            archived_at
          )
          VALUES (?, ?, ?, ?, ?, NULL)
        `,
        task.title,
        task.description ?? null,
        task.points,
        task.repeatRule,
        createdAt,
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
            archived_at
          )
          VALUES (?, ?, ?, ?, NULL)
        `,
        reward.title,
        reward.description ?? null,
        reward.cost,
        createdAt,
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

function normalizeTitle(title: string): string {
  return title.trim().toLocaleLowerCase('en-US')
}
