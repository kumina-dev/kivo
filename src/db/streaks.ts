import type { SQLiteDatabase } from 'expo-sqlite'

import { getLocalDateKey } from '@/utils/date'

type CompletionDateRow = {
  completion_date: string
}

export type StreakStats = {
  activeToday: boolean
  bestStreak: number
  currentStreak: number
  lastActiveDate: string | null
}

export async function getStreakStats(
  db: SQLiteDatabase,
  today = new Date(),
): Promise<StreakStats> {
  const rows = await db.getAllAsync<CompletionDateRow>(`
    SELECT DISTINCT
      date(completed_at, 'localtime') AS completion_date
    FROM task_completions
    ORDER BY completion_date ASC
  `)

  return calculateStreakStats(
    rows.map((row) => row.completion_date),
    today,
  )
}

export function calculateStreakStats(
  completionDates: string[],
  today = new Date(),
): StreakStats {
  const uniqueDates = Array.from(
    new Set(completionDates),
  ).sort()

  if (uniqueDates.length === 0) {
    return {
      activeToday: false,
      bestStreak: 0,
      currentStreak: 0,
      lastActiveDate: null,
    }
  }

  const bestStreak =
    calculateLongestStreak(uniqueDates)

  const todayKey = getLocalDateKey(today)
  const yesterdayKey = getLocalDateKey(
    addLocalDays(today, -1),
  )

  const lastActiveDate =
    uniqueDates[uniqueDates.length - 1]

  const activeToday = lastActiveDate === todayKey

  const streakStillActive =
    activeToday ||
    lastActiveDate === yesterdayKey

  return {
    activeToday,
    bestStreak,
    currentStreak: streakStillActive
      ? calculateCurrentStreak(uniqueDates)
      : 0,
    lastActiveDate,
  }
}

function calculateCurrentStreak(
  dateKeys: string[],
): number {
  let streak = 1

  for (
    let index = dateKeys.length - 1;
    index > 0;
    index -= 1
  ) {
    const previousDate = parseLocalDateKey(
      dateKeys[index - 1],
    )

    const expectedDateKey = getLocalDateKey(
      addLocalDays(previousDate, 1),
    )

    if (dateKeys[index] !== expectedDateKey) {
      break
    }

    streak += 1
  }

  return streak
}

function calculateLongestStreak(
  dateKeys: string[],
): number {
  let longestStreak = 1
  let currentStreak = 1

  for (
    let index = 1;
    index < dateKeys.length;
    index += 1
  ) {
    const previousDate = parseLocalDateKey(
      dateKeys[index - 1],
    )

    const expectedDateKey = getLocalDateKey(
      addLocalDays(previousDate, 1),
    )

    if (dateKeys[index] === expectedDateKey) {
      currentStreak += 1
      longestStreak = Math.max(
        longestStreak,
        currentStreak,
      )
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}

function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey
    .split('-')
    .map(Number)

  return new Date(year, month - 1, day)
}

function addLocalDays(
  date: Date,
  days: number,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
  )
}
