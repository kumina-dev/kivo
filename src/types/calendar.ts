export type CalendarDayActivity = {
  date: string
  taskCompletions: number
  pointsEarned: number
}

export type CalendarMonthActivity = {
  days: CalendarDayActivity[]
  taskCompletions: number
  pointsEarned: number
}
