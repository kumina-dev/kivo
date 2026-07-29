import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  CreateRewardInput,
  Reward,
} from '@/types/reward'

type RewardRow = {
  id: number
  title: string
  description: string | null
  cost: number
  created_at: string
  archived_at: string | null
}

function mapReward(row: RewardRow): Reward {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    cost: row.cost,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  }
}

const rewardColumns = `
  id,
  title,
  description,
  cost,
  created_at,
  archived_at
`

export async function createReward(
  db: SQLiteDatabase,
  input: CreateRewardInput,
): Promise<number> {
  const result = await db.runAsync(
    `
      INSERT INTO rewards (
        title,
        description,
        cost,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `,
    input.title.trim(),
    input.description?.trim() || null,
    input.cost,
    new Date().toISOString(),
  )

  return result.lastInsertRowId
}

export async function getRewardById(
  db: SQLiteDatabase,
  rewardId: number,
): Promise<Reward | null> {
  const row = await db.getFirstAsync<RewardRow>(
    `
      SELECT ${rewardColumns}
      FROM rewards
      WHERE id = ?
    `,
    rewardId,
  )

  return row ? mapReward(row) : null
}

export async function getActiveRewards(
  db: SQLiteDatabase,
): Promise<Reward[]> {
  const rows = await db.getAllAsync<RewardRow>(`
    SELECT ${rewardColumns}
    FROM rewards
    WHERE archived_at IS NULL
    ORDER BY cost ASC, created_at DESC
  `)

  return rows.map(mapReward)
}

export async function getArchivedRewards(
  db: SQLiteDatabase,
): Promise<Reward[]> {
  const rows = await db.getAllAsync<RewardRow>(`
    SELECT ${rewardColumns}
    FROM rewards
    WHERE archived_at IS NOT NULL
    ORDER BY archived_at DESC, id DESC
  `)

  return rows.map(mapReward)
}

export async function updateReward(
  db: SQLiteDatabase,
  rewardId: number,
  input: CreateRewardInput,
): Promise<void> {
  await db.runAsync(
    `
      UPDATE rewards
      SET
        title = ?,
        description = ?,
        cost = ?
      WHERE id = ?
        AND archived_at IS NULL
    `,
    input.title.trim(),
    input.description?.trim() || null,
    input.cost,
    rewardId,
  )
}

export async function redeemReward(
  db: SQLiteDatabase,
  reward: Reward,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    const activeReward = await db.getFirstAsync<{
      id: number
      cost: number
    }>(
      `
        SELECT id, cost
        FROM rewards
        WHERE id = ?
          AND archived_at IS NULL
      `,
      reward.id,
    )

    if (!activeReward) {
      throw new Error('REWARD_NOT_AVAILABLE')
    }

    const balanceResult = await db.getFirstAsync<{
      balance: number
    }>(`
      SELECT COALESCE(SUM(amount), 0) AS balance
      FROM point_transactions
    `)

    const balance = balanceResult?.balance ?? 0

    if (balance < activeReward.cost) {
      throw new Error('INSUFFICIENT_POINTS')
    }

    await db.runAsync(
      `
        INSERT INTO point_transactions (
          type,
          amount,
          reward_id,
          created_at
        )
        VALUES ('reward_redemption', ?, ?, ?)
      `,
      -activeReward.cost,
      activeReward.id,
      new Date().toISOString(),
    )
  })
}

export async function archiveReward(
  db: SQLiteDatabase,
  rewardId: number,
): Promise<void> {
  await db.runAsync(
    `
      UPDATE rewards
      SET archived_at = ?
      WHERE id = ?
        AND archived_at IS NULL
    `,
    new Date().toISOString(),
    rewardId,
  )
}

export async function restoreReward(
  db: SQLiteDatabase,
  rewardId: number,
): Promise<void> {
  const result = await db.runAsync(
    `
      UPDATE rewards
      SET archived_at = NULL
      WHERE id = ?
        AND archived_at IS NOT NULL
    `,
    rewardId,
  )

  if (result.changes === 0) {
    throw new Error('REWARD_NOT_ARCHIVED')
  }
}

export async function deleteArchivedReward(
  db: SQLiteDatabase,
  rewardId: number,
): Promise<void> {
  const result = await db.runAsync(
    `
      DELETE FROM rewards
      WHERE id = ?
        AND archived_at IS NOT NULL
    `,
    rewardId,
  )

  if (result.changes === 0) {
    throw new Error('REWARD_NOT_ARCHIVED')
  }
}
