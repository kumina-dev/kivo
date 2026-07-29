import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  BackupNotificationSettings,
  BackupPointTransactionRow,
  BackupRewardRow,
  BackupSummary,
  BackupTaskCompletionRow,
  BackupTaskRow,
  KivoBackup,
} from '@/types/backup'

export async function createBackup(
  db: SQLiteDatabase,
): Promise<KivoBackup> {
  const [
    tasks,
    taskCompletions,
    rewards,
    pointTransactions,
    notificationSettings,
  ] = await Promise.all([
    db.getAllAsync<BackupTaskRow>(`
      SELECT
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
      FROM tasks
      ORDER BY id ASC
    `),

    db.getAllAsync<BackupTaskCompletionRow>(`
      SELECT
        id,
        task_id,
        completion_period,
        completed_at
      FROM task_completions
      ORDER BY id ASC
    `),

    db.getAllAsync<BackupRewardRow>(`
      SELECT
        id,
        title,
        description,
        cost,
        created_at,
        archived_at,
        source_template_id,
        source_template_version,
        source_template_item_key
      FROM rewards
      ORDER BY id ASC
    `),

    db.getAllAsync<BackupPointTransactionRow>(`
      SELECT
        id,
        type,
        amount,
        task_id,
        reward_id,
        note,
        created_at
      FROM point_transactions
      ORDER BY id ASC
    `),

    db.getFirstAsync<BackupNotificationSettings>(`
      SELECT
        daily_reminder_enabled,
        daily_reminder_hour,
        daily_reminder_minute
      FROM notification_settings
      WHERE id = 1
    `),
  ])

  return {
    application: 'kivo',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    data: {
      tasks,
      taskCompletions,
      rewards,
      pointTransactions,
      notificationSettings:
        notificationSettings ?? null,
    },
  }
}

export function getBackupSummary(
  backup: KivoBackup,
): BackupSummary {
  return {
    tasks: backup.data.tasks.length,
    taskCompletions:
      backup.data.taskCompletions.length,
    rewards: backup.data.rewards.length,
    pointTransactions:
      backup.data.pointTransactions.length,
  }
}
