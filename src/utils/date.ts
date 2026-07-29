import type { RepeatRule } from '@/types/task'

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

export function getLocalDateKey(date = new Date()): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-')
}

export function getLocalMonthKey(date = new Date()): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
  ].join('-')
}

export function getLocalWeekKey(date = new Date()): string {
  const normalized = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )

  const weekday = normalized.getDay() || 7

  normalized.setDate(normalized.getDate() + 4 - weekday)

  const yearStart = new Date(normalized.getFullYear(), 0, 1)
  const weekNumber = Math.ceil(
    ((normalized.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  )

  return `${normalized.getFullYear()}-W${pad(weekNumber)}`
}

export function getCompletionPeriod(
  repeatRule: RepeatRule,
  date = new Date(),
): string {
  switch (repeatRule) {
    case 'none':
      return 'once'

    case 'daily':
    case 'weekdays':
      return getLocalDateKey(date)

    case 'weekly':
      return getLocalWeekKey(date)

    case 'monthly':
      return getLocalMonthKey(date)
  }
}

export function isTaskAvailableToday(
  repeatRule: RepeatRule,
  date = new Date(),
): boolean {
  if (repeatRule !== 'weekdays') {
    return true
  }

  const weekday = date.getDay()

  return weekday !== 0 && weekday !== 6
}
