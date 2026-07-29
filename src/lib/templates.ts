import { starterTemplates } from '@/constants/starter-templates'
import type {
  CombinedTemplate,
  StarterTemplate,
  TemplateId,
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
      selectedTemplates.flatMap(
        (template) => template.tasks,
      ),
    ),
    rewards: deduplicateRewards(
      selectedTemplates.flatMap(
        (template) => template.rewards,
      ),
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
