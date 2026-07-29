export type BackupTaskRow = {
  id: number
  title: string
  description: string | null
  points: number
  repeat_rule: string
  created_at: string
  archived_at: string | null
}

export type BackupTaskCompletionRow = {
  id: number
  task_id: number
  completion_period: string
  completed_at: string
}

export type BackupRewardRow = {
  id: number
  title: string
  description: string | null
  cost: number
  created_at: string
  archived_at: string | null
}

export type BackupPointTransactionRow = {
  id: number
  type:
    | 'task_completion'
    | 'reward_redemption'
    | 'manual_adjustment'
  amount: number
  task_id: number | null
  reward_id: number | null
  note: string | null
  created_at: string
}

export type BackupNotificationSettings = {
  daily_reminder_enabled: number
  daily_reminder_hour: number
  daily_reminder_minute: number
}

export type KivoBackup = {
  application: 'kivo'
  formatVersion: 1
  exportedAt: string
  data: {
    tasks: BackupTaskRow[]
    taskCompletions: BackupTaskCompletionRow[]
    rewards: BackupRewardRow[]
    pointTransactions: BackupPointTransactionRow[]
    notificationSettings:
      | BackupNotificationSettings
      | null
  }
}

export type BackupSummary = {
  tasks: number
  taskCompletions: number
  rewards: number
  pointTransactions: number
}
