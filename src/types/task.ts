export const repeatOptions = [
  'none',
  'daily',
  'weekdays',
  'weekly',
  'monthly',
] as const

export type RepeatRule = (typeof repeatOptions)[number]

export type Task = {
  id: number
  title: string
  description: string | null
  points: number
  repeatRule: RepeatRule
  createdAt: string
  archivedAt: string | null
}

export type CreateTaskInput = {
  title: string
  description?: string
  points: number
  repeatRule: RepeatRule
}
