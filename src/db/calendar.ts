import type { SQLiteDatabase } from 'expo-sqlite'

import type {
  CalendarDayActivity,
  CalendarMonthActivity,
} from '@/types/calendar'
import { getMonthKey } from '@/utils/calendar'

type CalendarActivityRow = {
  activity_date: string
  task_completions: number
  points_earned: number
}

export async function getCalendarMonthActivity(
  db: SQLiteDatabase,
  month: Date,
): Promise<CalendarMonthActivity> {
  const monthKey = getMonthKey(month)

  const rows = await db.getAllAsync<CalendarActivityRow>(
    `
      SELECT
        date(
          point_transactions.created_at,
          'localtime'
        ) AS activity_date,

        COUNT(*) AS task_completions,

        COALESCE(
          SUM(point_transactions.amount),
          0
        ) AS points_earned
      FROM point_transactions
      WHERE point_transactions.type = 'task_completion'
        AND strftime(
          '%Y-%m',
          point_transactions.created_at,
          'localtime'
        ) = ?
      GROUP BY date(
        point_transactions.created_at,
        'localtime'
      )
      ORDER BY activity_date ASC
    `,
    monthKey,
  )

  const days: CalendarDayActivity[] = rows.map((row) => ({
    date: row.activity_date,
    taskCompletions: row.task_completions,
    pointsEarned: row.points_earned,
  }))

  return {
    days,
    taskCompletions: days.reduce(
      (total, day) => total + day.taskCompletions,
      0,
    ),
    pointsEarned: days.reduce(
      (total, day) => total + day.pointsEarned,
      0,
    ),
  }
}
