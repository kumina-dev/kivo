import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  DailyReminderInput,
  NotificationSettings,
} from '@/types/notification-settings'

type NotificationSettingsRow = {
  daily_reminder_enabled: number
  daily_reminder_hour: number
  daily_reminder_minute: number
  daily_reminder_identifier: string | null
}

function mapNotificationSettings(
  row: NotificationSettingsRow,
): NotificationSettings {
  return {
    dailyReminderEnabled:
      row.daily_reminder_enabled === 1,
    dailyReminderHour: row.daily_reminder_hour,
    dailyReminderMinute: row.daily_reminder_minute,
    dailyReminderIdentifier:
      row.daily_reminder_identifier,
  }
}

export async function getNotificationSettings(
  db: SQLiteDatabase,
): Promise<NotificationSettings> {
  const row =
    await db.getFirstAsync<NotificationSettingsRow>(`
      SELECT
        daily_reminder_enabled,
        daily_reminder_hour,
        daily_reminder_minute,
        daily_reminder_identifier
      FROM notification_settings
      WHERE id = 1
    `)

  if (!row) {
    throw new Error('NOTIFICATION_SETTINGS_NOT_FOUND')
  }

  return mapNotificationSettings(row)
}

export async function updateNotificationSettings(
  db: SQLiteDatabase,
  input: DailyReminderInput,
  identifier: string | null,
): Promise<void> {
  if (
    !Number.isInteger(input.hour) ||
    input.hour < 0 ||
    input.hour > 23
  ) {
    throw new Error('INVALID_REMINDER_HOUR')
  }

  if (
    !Number.isInteger(input.minute) ||
    input.minute < 0 ||
    input.minute > 59
  ) {
    throw new Error('INVALID_REMINDER_MINUTE')
  }

  await db.runAsync(
    `
      UPDATE notification_settings
      SET
        daily_reminder_enabled = ?,
        daily_reminder_hour = ?,
        daily_reminder_minute = ?,
        daily_reminder_identifier = ?
      WHERE id = 1
    `,
    input.enabled ? 1 : 0,
    input.hour,
    input.minute,
    identifier,
  )
}
