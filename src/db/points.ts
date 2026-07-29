import type { SQLiteDatabase } from 'expo-sqlite'

export async function getPointBalance(
  db: SQLiteDatabase,
): Promise<number> {
  const result = await db.getFirstAsync<{ balance: number }>(`
    SELECT COALESCE(SUM(amount), 0) AS balance
    FROM point_transactions
  `)

  return result?.balance ?? 0
}
