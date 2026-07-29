import { starterTemplates } from '@/constants/starter-templates'
import type {
  CombinedTemplate,
  StarterTemplate,
  TemplateId,
  TemplateReview,
  TemplateReward,
  TemplateTask,
} from '@/types/template'

export function getStarterTemplate(
  id: TemplateId,
): StarterTemplate | undefined {
  return starterTemplates.find(
    (template) => template.id === id,
  )
}

export function combineStarterTemplates(
  selectedIds: TemplateId[],
): CombinedTemplate {
  const selectedTemplates = selectedIds
    .map(getStarterTemplate)
    .filter(
      (
        template,
      ): template is StarterTemplate =>
        template !== undefined,
    )

  return {
    tasks: deduplicateTasks(
      selectedTemplates.flatMap((template) =>
        template.tasks.map((task) => ({
          ...task,
          templateId: template.id,
          templateVersion: template.version,
        })),
      ),
    ),
    rewards: deduplicateRewards(
      selectedTemplates.flatMap((template) =>
        template.rewards.map((reward) => ({
          ...reward,
          templateId: template.id,
          templateVersion: template.version,
        })),
      ),
    ),
  }
}

export function createTemplateReview(
  template: CombinedTemplate,
): TemplateReview {
  return {
    tasks: template.tasks.map((task) => ({
      ...task,
      enabled: true,
      id: [
        'task',
        task.templateId,
        task.templateItemKey,
      ].join(':'),
    })),
    rewards: template.rewards.map((reward) => ({
      ...reward,
      enabled: true,
      id: [
        'reward',
        reward.templateId,
        reward.templateItemKey,
      ].join(':'),
    })),
  }
}

export function getEnabledTemplateItems(
  review: TemplateReview,
): CombinedTemplate {
  return {
    tasks: review.tasks
      .filter((task) => task.enabled)
      .map(({ enabled: _enabled, id: _id, ...task }) => task),
    rewards: review.rewards
      .filter((reward) => reward.enabled)
      .map(
        ({
          enabled: _enabled,
          id: _id,
          ...reward
        }) => reward,
      ),
  }
}

function deduplicateTasks(
  tasks: TemplateTask[],
): TemplateTask[] {
  const seenTitles = new Set<string>()

  return tasks.filter((task) => {
    const normalizedTitle = normalizeTitle(task.title)

    if (seenTitles.has(normalizedTitle)) {
      return false
    }

    seenTitles.add(normalizedTitle)
    return true
  })
}

function deduplicateRewards(
  rewards: TemplateReward[],
): TemplateReward[] {
  const seenTitles = new Set<string>()

  return rewards.filter((reward) => {
    const normalizedTitle = normalizeTitle(reward.title)

    if (seenTitles.has(normalizedTitle)) {
      return false
    }

    seenTitles.add(normalizedTitle)
    return true
  })
}

function normalizeTitle(title: string): string {
  return title.trim().toLocaleLowerCase('en-US')
}
