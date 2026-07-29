import type { RepeatRule } from '@/types/task'

export type TemplateId =
  | 'programming'
  | 'adhd'
  | 'chores'
  | 'household'
  | 'fitness'

export type TemplateTask = {
  title: string
  description?: string
  points: number
  repeatRule: RepeatRule
}

export type TemplateReward = {
  title: string
  description?: string
  cost: number
}

export type StarterTemplate = {
  id: TemplateId
  name: string
  description: string
  tasks: TemplateTask[]
  rewards: TemplateReward[]
}

export type CombinedTemplate = {
  tasks: TemplateTask[]
  rewards: TemplateReward[]
}

export type TemplateImportSummary = {
  tasksAdded: number
  tasksSkipped: number
  rewardsAdded: number
  rewardsSkipped: number
}
