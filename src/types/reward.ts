export type Reward = {
  id: number
  title: string
  description: string | null
  cost: number
  createdAt: string
  archivedAt: string | null
}

export type CreateRewardInput = {
  title: string
  description?: string
  cost: number
}
