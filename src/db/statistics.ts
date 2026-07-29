import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  AppStatistics,
  DailyPointActivity,
} from '@/types/statistics'

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

type CompletionDateRow = {
  completion_date: string
}

type DailyActivityRow = {
  activity_date: string
  earned: number
  spent: number
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(date: Date, amount: number): Date {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)

  return nextDate
}

function calculateStreaks(
  completionDates: string[],
  today = new Date(),
): {
  currentStreak: number
  longestStreak: number
} {
  const uniqueDates = Array.from(
    new Set(completionDates),
  ).sort()

  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    }
  }

  let longestStreak = 1
  let runningStreak = 1

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previousDate = new Date(
      `${uniqueDates[index - 1]}T12:00:00`,
    )
    const currentDate = new Date(
      `${uniqueDates[index]}T12:00:00`,
    )

    const expectedDate = addDays(previousDate, 1)

    if (
      getLocalDateKey(expectedDate) ===
      getLocalDateKey(currentDate)
    ) {
      runningStreak += 1
      longestStreak = Math.max(
        longestStreak,
        runningStreak,
      )
    } else {
      runningStreak = 1
    }
  }

  const completionDateSet = new Set(uniqueDates)
  const todayKey = getLocalDateKey(today)
  const yesterdayKey = getLocalDateKey(addDays(today, -1))

  let cursor: Date

  if (completionDateSet.has(todayKey)) {
    cursor = today
  } else if (completionDateSet.has(yesterdayKey)) {
    cursor = addDays(today, -1)
  } else {
    return {
      currentStreak: 0,
      longestStreak,
    }
  }

  let currentStreak = 0

  while (
    completionDateSet.has(getLocalDateKey(cursor))
  ) {
    currentStreak += 1
    cursor = addDays(cursor, -1)
  }

  return {
    currentStreak,
    longestStreak,
  }
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
    completionDateRows,
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

    db.getAllAsync<CompletionDateRow>(`
      SELECT DISTINCT
        date(completed_at, 'localtime') AS completion_date
      FROM task_completions
      ORDER BY completion_date ASC
    `),

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

  const streaks = calculateStreaks(
    completionDateRows.map(
      (row) => row.completion_date,
    ),
  )

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
    longestStreak: streaks.longestStreak,
    recentActivity: buildRecentActivity(activityRows),
  }
}
