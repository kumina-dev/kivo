export type AchievementCategory =
  | 'tasks'
  | 'points'
  | 'rewards'
  | 'streaks'

export type AchievementMetric =
  | 'task_completions'
  | 'task_points_earned'
  | 'reward_redemptions'
  | 'longest_streak'

export type AchievementDefinition = {
  id: string
  category: AchievementCategory
  description: string
  metric: AchievementMetric
  target: number
  title: string
}

export type Achievement = AchievementDefinition & {
  currentValue: number
  progress: number
  unlocked: boolean
}

export type AchievementSummary = {
  achievements: Achievement[]
  total: number
  unlocked: number
}
