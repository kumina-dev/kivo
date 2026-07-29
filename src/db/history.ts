import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  HistoryEntry,
  HistoryEntryType,
} from '@/types/history'

type HistoryEntryRow = {
  id: number
  type: HistoryEntryType
  amount: number
  title: string | null
  created_at: string
}

function mapHistoryEntry(row: HistoryEntryRow): HistoryEntry {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    title:
      row.title ??
      (row.type === 'task_completion'
        ? 'Deleted task'
        : 'Deleted reward'),
    createdAt: row.created_at,
  }
}

export async function getHistoryEntries(
  db: SQLiteDatabase,
): Promise<HistoryEntry[]> {
  const rows = await db.getAllAsync<HistoryEntryRow>(`
    SELECT
      point_transactions.id,
      point_transactions.type,
      point_transactions.amount,
      point_transactions.created_at,
      CASE
        WHEN point_transactions.type = 'task_completion'
          THEN tasks.title
        WHEN point_transactions.type = 'reward_redemption'
          THEN rewards.title
        ELSE NULL
      END AS title
    FROM point_transactions
    LEFT JOIN tasks
      ON tasks.id = point_transactions.task_id
    LEFT JOIN rewards
      ON rewards.id = point_transactions.reward_id
    ORDER BY point_transactions.created_at DESC
  `)

  return rows.map(mapHistoryEntry)
}
