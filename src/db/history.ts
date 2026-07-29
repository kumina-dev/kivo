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

function getFallbackTitle(
  type: HistoryEntryType,
): string {
  switch (type) {
    case 'task_completion':
      return 'Archived task'

    case 'reward_redemption':
      return 'Archived reward'

    case 'manual_adjustment':
      return 'Manual adjustment'
  }
}

function mapHistoryEntry(
  row: HistoryEntryRow,
): HistoryEntry {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    title: row.title ?? getFallbackTitle(row.type),
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
        WHEN point_transactions.type = 'manual_adjustment'
          THEN point_transactions.note
        ELSE NULL
      END AS title
    FROM point_transactions
    LEFT JOIN tasks
      ON tasks.id = point_transactions.task_id
    LEFT JOIN rewards
      ON rewards.id = point_transactions.reward_id
    ORDER BY
      point_transactions.created_at DESC,
      point_transactions.id DESC
  `)

  return rows.map(mapHistoryEntry)
}
