import type { SQLiteDatabase } from 'expo-sqlite'

import { achievementDefinitions } from '@/constants/achievements'
import type {
  Achievement,
  AchievementMetric,
  AchievementSummary,
} from '@/types/achievement'

type AchievementMetricsRow = {
  reward_redemptions: number
  task_completions: number
  task_points_earned: number
}

type CompletionDateRow = {
  completion_date: string
}

type AchievementMetrics = Record<AchievementMetric, number>

function createLocalDate(dateValue: string): Date {
  return new Date(`${dateValue}T12:00:00`)
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

function calculateLongestStreak(
  completionDates: string[],
): number {
  const uniqueDates = Array.from(
    new Set(completionDates),
  ).sort()

  if (uniqueDates.length === 0) {
    return 0
  }

  let longestStreak = 1
  let runningStreak = 1

  for (
    let index = 1;
    index < uniqueDates.length;
    index += 1
  ) {
    const previousDate = createLocalDate(
      uniqueDates[index - 1],
    )
    const currentDate = createLocalDate(
      uniqueDates[index],
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

  return longestStreak
}

function createAchievement(
  definition: (typeof achievementDefinitions)[number],
  metrics: AchievementMetrics,
): Achievement {
  const currentValue = metrics[definition.metric]
  const unlocked = currentValue >= definition.target

  return {
    ...definition,
    currentValue,
    progress: Math.min(
      currentValue / definition.target,
      1,
    ),
    unlocked,
  }
}

export async function getAchievementSummary(
  db: SQLiteDatabase,
): Promise<AchievementSummary> {
  const [metricsRow, completionDateRows] =
    await Promise.all([
      db.getFirstAsync<AchievementMetricsRow>(`
        SELECT
          COUNT(
            CASE
              WHEN type = 'task_completion' THEN 1
            END
          ) AS task_completions,

          COALESCE(
            SUM(
              CASE
                WHEN type = 'task_completion'
                  THEN amount
                ELSE 0
              END
            ),
            0
          ) AS task_points_earned,

          COUNT(
            CASE
              WHEN type = 'reward_redemption' THEN 1
            END
          ) AS reward_redemptions
        FROM point_transactions
      `),

      db.getAllAsync<CompletionDateRow>(`
        SELECT DISTINCT
          date(completed_at, 'localtime')
            AS completion_date
        FROM task_completions
        ORDER BY completion_date ASC
      `),
    ])

  const metrics: AchievementMetrics = {
    task_completions:
      metricsRow?.task_completions ?? 0,
    task_points_earned:
      metricsRow?.task_points_earned ?? 0,
    reward_redemptions:
      metricsRow?.reward_redemptions ?? 0,
    longest_streak: calculateLongestStreak(
      completionDateRows.map(
        (row) => row.completion_date,
      ),
    ),
  }

  const achievements = achievementDefinitions.map(
    (definition) =>
      createAchievement(definition, metrics),
  )

  return {
    achievements,
    total: achievements.length,
    unlocked: achievements.filter(
      (achievement) => achievement.unlocked,
    ).length,
  }
}
