export type HistoryEntryType =
  | 'task_completion'
  | 'reward_redemption'

export type HistoryEntry = {
  id: number
  type: HistoryEntryType
  amount: number
  title: string
  createdAt: string
}
