export type HistoryEntryType =
  | 'task_completion'
  | 'reward_redemption'
  | 'manual_adjustment'

export type HistoryEntry = {
  id: number
  type: HistoryEntryType
  amount: number
  title: string
  createdAt: string
}
