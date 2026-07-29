import type { SQLiteDatabase } from 'expo-sqlite'

export type ManualPointAdjustmentInput = {
  amount: number
  note?: string
}

export async function getPointBalance(
  db: SQLiteDatabase,
): Promise<number> {
  const result = await db.getFirstAsync<{ balance: number }>(`
    SELECT COALESCE(SUM(amount), 0) AS balance
    FROM point_transactions
  `)

  return result?.balance ?? 0
}

export async function createManualPointAdjustment(
  db: SQLiteDatabase,
  input: ManualPointAdjustmentInput,
): Promise<void> {
  if (!Number.isInteger(input.amount) || input.amount === 0) {
    throw new Error('INVALID_ADJUSTMENT_AMOUNT')
  }

  await db.runAsync(
    `
      INSERT INTO point_transactions (
        type,
        amount,
        note,
        created_at
      )
      VALUES ('manual_adjustment', ?, ?, ?)
    `,
    input.amount,
    input.note?.trim() || null,
    new Date().toISOString(),
  )
}
