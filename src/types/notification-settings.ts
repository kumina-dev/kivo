export type NotificationPermissionState =
  | 'granted'
  | 'denied'
  | 'undetermined'

export type NotificationSettings = {
  dailyReminderEnabled: boolean
  dailyReminderHour: number
  dailyReminderMinute: number
  dailyReminderIdentifier: string | null
}

export type DailyReminderInput = {
  enabled: boolean
  hour: number
  minute: number
}
