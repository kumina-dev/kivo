import type { SQLiteDatabase } from 'expo-sqlite'

import { getStreakStats } from '@/db/streaks'
import type {
  AppStatistics,
  DailyPointActivity,
} from '@/types/statistics'
import { getLocalDateKey } from '@/utils/date'

type SummaryRow = {
  current_balance: number
  total_earned: number
  total_spent: number
  task_completions: number
  reward_redemptions: number
  manual_adjustments: number
}

type CountRow = {
  count: number
}

type DailyActivityRow = {
  activity_date: string
  earned: number
  spent: number
}

function addDays(date: Date, amount: number): Date {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)

  return nextDate
}

function buildRecentActivity(
  rows: DailyActivityRow[],
  today = new Date(),
): DailyPointActivity[] {
  const activityByDate = new Map(
    rows.map((row) => [
      row.activity_date,
      {
        earned: row.earned,
        spent: row.spent,
      },
    ]),
  )

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6)
    const dateKey = getLocalDateKey(date)
    const activity = activityByDate.get(dateKey)

    return {
      date: dateKey,
      earned: activity?.earned ?? 0,
      spent: activity?.spent ?? 0,
    }
  })
}

export async function getAppStatistics(
  db: SQLiteDatabase,
): Promise<AppStatistics> {
  const [
    summary,
    activeTasksResult,
    activeRewardsResult,
    streaks,
    activityRows,
  ] = await Promise.all([
    db.getFirstAsync<SummaryRow>(`
      SELECT
        COALESCE(SUM(amount), 0) AS current_balance,

        COALESCE(
          SUM(
            CASE
              WHEN amount > 0 THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_earned,

        COALESCE(
          ABS(
            SUM(
              CASE
                WHEN amount < 0 THEN amount
                ELSE 0
              END
            )
          ),
          0
        ) AS total_spent,

        COUNT(
          CASE
            WHEN type = 'task_completion' THEN 1
          END
        ) AS task_completions,

        COUNT(
          CASE
            WHEN type = 'reward_redemption' THEN 1
          END
        ) AS reward_redemptions,

        COUNT(
          CASE
            WHEN type = 'manual_adjustment' THEN 1
          END
        ) AS manual_adjustments
      FROM point_transactions
    `),

    db.getFirstAsync<CountRow>(`
      SELECT COUNT(*) AS count
      FROM tasks
      WHERE archived_at IS NULL
    `),

    db.getFirstAsync<CountRow>(`
      SELECT COUNT(*) AS count
      FROM rewards
      WHERE archived_at IS NULL
    `),

    getStreakStats(db),

    db.getAllAsync<DailyActivityRow>(`
      SELECT
        date(created_at, 'localtime') AS activity_date,

        COALESCE(
          SUM(
            CASE
              WHEN amount > 0 THEN amount
              ELSE 0
            END
          ),
          0
        ) AS earned,

        COALESCE(
          ABS(
            SUM(
              CASE
                WHEN amount < 0 THEN amount
                ELSE 0
              END
            )
          ),
          0
        ) AS spent
      FROM point_transactions
      WHERE date(created_at, 'localtime')
        >= date('now', 'localtime', '-6 days')
      GROUP BY date(created_at, 'localtime')
      ORDER BY activity_date ASC
    `),
  ])

  return {
    currentBalance: summary?.current_balance ?? 0,
    totalEarned: summary?.total_earned ?? 0,
    totalSpent: summary?.total_spent ?? 0,
    taskCompletions: summary?.task_completions ?? 0,
    rewardRedemptions:
      summary?.reward_redemptions ?? 0,
    manualAdjustments:
      summary?.manual_adjustments ?? 0,
    activeTasks: activeTasksResult?.count ?? 0,
    activeRewards: activeRewardsResult?.count ?? 0,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.bestStreak,
    recentActivity: buildRecentActivity(activityRows),
  }
}
