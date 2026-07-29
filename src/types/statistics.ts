export type DailyPointActivity = {
  date: string
  earned: number
  spent: number
}

export type AppStatistics = {
  currentBalance: number
  totalEarned: number
  totalSpent: number
  taskCompletions: number
  rewardRedemptions: number
  manualAdjustments: number
  activeTasks: number
  activeRewards: number
  currentStreak: number
  longestStreak: number
  recentActivity: DailyPointActivity[]
}
