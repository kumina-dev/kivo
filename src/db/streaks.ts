import type { SQLiteDatabase } from 'expo-sqlite'

import { getLocalDateKey } from '@/utils/date'

type CompletionRow = {
  completed_at: string
}

export type StreakStats = {
  currentStreak: number
  bestStreak: number
  activeToday: boolean
  lastActiveDate: string | null
}

export async function getStreakStats(
  db: SQLiteDatabase,
  now = new Date(),
): Promise<StreakStats> {
  const rows = await db.getAllAsync<CompletionRow>(`
    SELECT completed_at
    FROM task_completions
    ORDER BY completed_at ASC
  `)

  const activeDateKeys = Array.from(
    new Set(
      rows.map((row) =>
        getLocalDateKey(new Date(row.completed_at)),
      ),
    ),
  ).sort()

  if (activeDateKeys.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      activeToday: false,
      lastActiveDate: null,
    }
  }

  const bestStreak =
    calculateLongestStreak(activeDateKeys)

  const todayKey = getLocalDateKey(now)
  const yesterdayKey = getLocalDateKey(
    addLocalDays(now, -1),
  )

  const lastActiveDate =
    activeDateKeys[activeDateKeys.length - 1]

  const streakStillActive =
    lastActiveDate === todayKey ||
    lastActiveDate === yesterdayKey

  return {
    currentStreak: streakStillActive
      ? calculateCurrentStreak(activeDateKeys)
      : 0,
    bestStreak,
    activeToday: lastActiveDate === todayKey,
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
    const currentDate = parseLocalDateKey(
      dateKeys[index],
    )

    const previousDate = parseLocalDateKey(
      dateKeys[index - 1],
    )

    if (
      getLocalDateKey(addLocalDays(previousDate, 1)) !==
      getLocalDateKey(currentDate)
    ) {
      break
    }

    streak += 1
  }

  return streak
}

function calculateLongestStreak(
  dateKeys: string[],
): number {
  if (dateKeys.length === 0) {
    return 0
  }

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
