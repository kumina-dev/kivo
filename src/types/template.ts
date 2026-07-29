import type { RepeatRule } from '@/types/task'

export type TemplateId =
  | 'programming'
  | 'adhd'
  | 'chores'
  | 'household'
  | 'fitness'

export type TemplateSource = {
  templateId: TemplateId
  templateVersion: number
  templateItemKey: string
}

export type TemplateTask = TemplateSource & {
  title: string
  description?: string
  points: number
  repeatRule: RepeatRule
}

export type TemplateReward = TemplateSource & {
  title: string
  description?: string
  cost: number
}

export type StarterTemplate = {
  id: TemplateId
  version: number
  name: string
  description: string
  tasks: Omit<
    TemplateTask,
    'templateId' | 'templateVersion'
  >[]
  rewards: Omit<
    TemplateReward,
    'templateId' | 'templateVersion'
  >[]
}

export type CombinedTemplate = {
  tasks: TemplateTask[]
  rewards: TemplateReward[]
}

export type TemplateReviewTask = TemplateTask & {
  id: string
  enabled: boolean
}

export type TemplateReviewReward = TemplateReward & {
  id: string
  enabled: boolean
}

export type TemplateReview = {
  tasks: TemplateReviewTask[]
  rewards: TemplateReviewReward[]
}

export type TemplateImportSummary = {
  tasksAdded: number
  tasksSkipped: number
  rewardsAdded: number
  rewardsSkipped: number
}
