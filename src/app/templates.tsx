import { useSQLiteContext } from 'expo-sqlite'
import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { TemplateCard } from '@/components/templates/template-card'
import { TemplateReviewItem } from '@/components/templates/template-review-item'
import { TemplateSummaryCard } from '@/components/templates/template-summary-card'
import { AppText } from '@/components/ui/app-text'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Screen } from '@/components/ui/screen'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { starterTemplates } from '@/constants/starter-templates'
import { spacing } from '@/constants/theme'
import { importStarterTemplate } from '@/db/templates'
import { useDialog } from '@/hooks/use-dialog'
import {
  combineStarterTemplates,
  createTemplateReview,
  getEnabledTemplateItems,
} from '@/lib/templates'
import type {
  TemplateId,
  TemplateReview,
} from '@/types/template'

type TemplatesStep = 'select' | 'review'

export default function TemplatesScreen() {
  const db = useSQLiteContext()
  const { showDialog } = useDialog()

  const [step, setStep] =
    useState<TemplatesStep>('select')

  const [selectedIds, setSelectedIds] = useState<
    TemplateId[]
  >([])

  const [review, setReview] =
    useState<TemplateReview>({
      tasks: [],
      rewards: [],
    })

  const [importing, setImporting] = useState(false)

  const combinedTemplate = useMemo(
    () => combineStarterTemplates(selectedIds),
    [selectedIds],
  )

  const enabledTemplate = useMemo(
    () => getEnabledTemplateItems(review),
    [review],
  )

  function toggleTemplate(id: TemplateId): void {
    setSelectedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter(
            (currentId) => currentId !== id,
          )
        : [...currentIds, id],
    )
  }

  function openReview(): void {
    if (selectedIds.length === 0) {
      return
    }

    setReview(
      createTemplateReview(combinedTemplate),
    )

    setStep('review')
  }

  function returnToSelection(): void {
    setStep('select')
  }

  function toggleTask(id: string): void {
    setReview((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              enabled: !task.enabled,
            }
          : task,
      ),
    }))
  }

  function updateTask(
    id: string,
    update: {
      title?: string
      points?: number
    },
  ): void {
    setReview((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...update,
            }
          : task,
      ),
    }))
  }

  function toggleReward(id: string): void {
    setReview((current) => ({
      ...current,
      rewards: current.rewards.map((reward) =>
        reward.id === id
          ? {
              ...reward,
              enabled: !reward.enabled,
            }
          : reward,
      ),
    }))
  }

  function updateReward(
    id: string,
    update: {
      title?: string
      cost?: number
    },
  ): void {
    setReview((current) => ({
      ...current,
      rewards: current.rewards.map((reward) =>
        reward.id === id
          ? {
              ...reward,
              ...update,
            }
          : reward,
      ),
    }))
  }

  function validateReview(): string | null {
    if (
      enabledTemplate.tasks.length === 0 &&
      enabledTemplate.rewards.length === 0
    ) {
      return 'Select at least one task or reward.'
    }

    const invalidTask = enabledTemplate.tasks.find(
      (task) =>
        task.title.trim().length === 0 ||
        task.points <= 0,
    )

    if (invalidTask) {
      return 'Every selected task needs a title and a point value greater than zero.'
    }

    const invalidReward =
      enabledTemplate.rewards.find(
        (reward) =>
          reward.title.trim().length === 0 ||
          reward.cost <= 0,
      )

    if (invalidReward) {
      return 'Every selected reward needs a title and a cost greater than zero.'
    }

    return null
  }

  async function handleImport(): Promise<void> {
    const validationMessage = validateReview()

    if (validationMessage) {
      showDialog({
        title: 'Check template items',
        message: validationMessage,
      })

      return
    }

    try {
      setImporting(true)

      const summary = await importStarterTemplate(
        db,
        enabledTemplate,
      )

      showDialog({
        title: 'Templates added',
        message: [
          `${summary.tasksAdded} tasks added`,
          `${summary.rewardsAdded} rewards added`,
          '',
          `${summary.tasksSkipped} existing tasks skipped`,
          `${summary.rewardsSkipped} existing rewards skipped`,
        ].join('\n'),
        actions: [
          {
            label: 'Done',
            variant: 'primary',
          },
        ],
      })

      setSelectedIds([])
      setReview({
        tasks: [],
        rewards: [],
      })
      setStep('select')
    } catch (error) {
      console.error(error)

      showDialog({
        title: 'Could not add templates',
        message:
          'Kivo could not add the selected starter templates.',
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Screen>
      {step === 'select' ? (
        <View style={styles.content}>
          <View style={styles.introduction}>
            <AppText variant="heading">
              Choose starter templates
            </AppText>

            <AppText variant="caption">
              Select any combination. You can review and
              edit every suggested item before anything is
              added.
            </AppText>
          </View>

          <View style={styles.templates}>
            {starterTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                onToggle={toggleTemplate}
                selected={selectedIds.includes(
                  template.id,
                )}
                template={template}
              />
            ))}
          </View>

          <TemplateSummaryCard
            rewardCount={
              combinedTemplate.rewards.length
            }
            selectedCount={selectedIds.length}
            taskCount={
              combinedTemplate.tasks.length
            }
          />

          <PrimaryButton
            disabled={selectedIds.length === 0}
            label={
              selectedIds.length === 0
                ? 'Select templates'
                : 'Review setup'
            }
            onPress={openReview}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.introduction}>
            <AppText variant="heading">
              Review setup
            </AppText>

            <AppText variant="caption">
              Disable anything you do not need and adjust
              titles or point values before importing.
            </AppText>
          </View>

          <TemplateSummaryCard
            rewardCount={
              enabledTemplate.rewards.length
            }
            selectedCount={selectedIds.length}
            taskCount={enabledTemplate.tasks.length}
          />

          <View style={styles.section}>
            <AppText variant="heading">
              Tasks
            </AppText>

            <View style={styles.items}>
              {review.tasks.map((task) => (
                <TemplateReviewItem
                  key={task.id}
                  enabled={task.enabled}
                  onChangeTitle={(title) =>
                    updateTask(task.id, { title })
                  }
                  onChangeValue={(points) =>
                    updateTask(task.id, { points })
                  }
                  onToggle={() =>
                    toggleTask(task.id)
                  }
                  title={task.title}
                  value={task.points}
                  valueLabel="Points"
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <AppText variant="heading">
              Rewards
            </AppText>

            <View style={styles.items}>
              {review.rewards.map((reward) => (
                <TemplateReviewItem
                  key={reward.id}
                  enabled={reward.enabled}
                  onChangeTitle={(title) =>
                    updateReward(reward.id, {
                      title,
                    })
                  }
                  onChangeValue={(cost) =>
                    updateReward(reward.id, {
                      cost,
                    })
                  }
                  onToggle={() =>
                    toggleReward(reward.id)
                  }
                  title={reward.title}
                  value={reward.cost}
                  valueLabel="Cost"
                />
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <SecondaryButton
              disabled={importing}
              label="Back to templates"
              onPress={returnToSelection}
            />

            <PrimaryButton
              disabled={
                importing ||
                (enabledTemplate.tasks.length === 0 &&
                  enabledTemplate.rewards.length === 0)
              }
              label={
                importing
                  ? 'Adding setup…'
                  : 'Add selected items'
              }
              onPress={() => {
                void handleImport()
              }}
            />
          </View>
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  introduction: {
    gap: spacing.sm,
  },
  templates: {
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  items: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
})
