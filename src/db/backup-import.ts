import type { SQLiteDatabase } from 'expo-sqlite'

import type { KivoBackup } from '@/types/backup'

export async function replaceDatabaseFromBackup(
  db: SQLiteDatabase,
  backup: KivoBackup,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM point_transactions;
      DELETE FROM task_completions;
      DELETE FROM rewards;
      DELETE FROM tasks;
    `)

    for (const task of backup.data.tasks) {
      await db.runAsync(
        `
          INSERT INTO tasks (
            id,
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
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        task.id,
        task.title,
        task.description,
        task.points,
        task.repeat_rule,
        task.created_at,
        task.archived_at,
        task.source_template_id,
        task.source_template_version,
        task.source_template_item_key,
      )
    }

    for (const reward of backup.data.rewards) {
      await db.runAsync(
        `
          INSERT INTO rewards (
            id,
            title,
            description,
            cost,
            created_at,
            archived_at,
            source_template_id,
            source_template_version,
            source_template_item_key
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        reward.id,
        reward.title,
        reward.description,
        reward.cost,
        reward.created_at,
        reward.archived_at,
        reward.source_template_id,
        reward.source_template_version,
        reward.source_template_item_key,
      )
    }

    for (const completion of backup.data.taskCompletions) {
      await db.runAsync(
        `
          INSERT INTO task_completions (
            id,
            task_id,
            completion_period,
            completed_at
          )
          VALUES (?, ?, ?, ?)
        `,
        completion.id,
        completion.task_id,
        completion.completion_period,
        completion.completed_at,
      )
    }

    for (const transaction of backup.data.pointTransactions) {
      await db.runAsync(
        `
          INSERT INTO point_transactions (
            id,
            type,
            amount,
            task_id,
            reward_id,
            note,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        transaction.id,
        transaction.type,
        transaction.amount,
        transaction.task_id,
        transaction.reward_id,
        transaction.note,
        transaction.created_at,
      )
    }

    const settings = backup.data.notificationSettings

    await db.runAsync(
      `
        UPDATE notification_settings
        SET
          daily_reminder_enabled = ?,
          daily_reminder_hour = ?,
          daily_reminder_minute = ?,
          daily_reminder_identifier = NULL
        WHERE id = 1
      `,
      settings?.daily_reminder_enabled ?? 0,
      settings?.daily_reminder_hour ?? 18,
      settings?.daily_reminder_minute ?? 0,
    )

    await resetAutoincrementSequence(db, 'tasks')
    await resetAutoincrementSequence(db, 'rewards')
    await resetAutoincrementSequence(
      db,
      'task_completions',
    )
    await resetAutoincrementSequence(
      db,
      'point_transactions',
    )
  })
}

async function resetAutoincrementSequence(
  db: SQLiteDatabase,
  table: string,
): Promise<void> {
  const allowedTables = new Set([
    'tasks',
    'rewards',
    'task_completions',
    'point_transactions',
  ])

  if (!allowedTables.has(table)) {
    throw new Error(`Unsupported table: ${table}`)
  }

  await db.runAsync(
    'DELETE FROM sqlite_sequence WHERE name = ?',
    table,
  )

  await db.execAsync(`
    INSERT INTO sqlite_sequence (name, seq)
    SELECT '${table}', COALESCE(MAX(id), 0)
    FROM ${table};
  `)
}
