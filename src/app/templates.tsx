import { useSQLiteContext } from 'expo-sqlite'
import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { TemplateCard } from '@/components/templates/template-card'
import { TemplateSummaryCard } from '@/components/templates/template-summary-card'
import { AppText } from '@/components/ui/app-text'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Screen } from '@/components/ui/screen'
import { starterTemplates } from '@/constants/starter-templates'
import { spacing } from '@/constants/theme'
import { importStarterTemplate } from '@/db/templates'
import { useDialog } from '@/hooks/use-dialog'
import { combineStarterTemplates } from '@/lib/templates'
import type { TemplateId } from '@/types/template'

export default function TemplatesScreen() {
  const db = useSQLiteContext()
  const { showDialog } = useDialog()

  const [selectedIds, setSelectedIds] = useState<
    TemplateId[]
  >([])

  const [importing, setImporting] = useState(false)

  const combinedTemplate = useMemo(
    () => combineStarterTemplates(selectedIds),
    [selectedIds],
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

  async function handleImport(): Promise<void> {
    if (selectedIds.length === 0) {
      return
    }

    try {
      setImporting(true)

      const summary = await importStarterTemplate(
        db,
        combinedTemplate,
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
      <View style={styles.content}>
        <View style={styles.introduction}>
          <AppText variant="heading">
            Choose starter templates
          </AppText>

          <AppText variant="caption">
            Select any combination. Kivo will merge their
            tasks and rewards into one starting setup
            without replacing your existing items.
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
          taskCount={combinedTemplate.tasks.length}
        />

        <PrimaryButton
          disabled={
            selectedIds.length === 0 || importing
          }
          label={
            importing
              ? 'Adding templates…'
              : selectedIds.length === 0
                ? 'Select templates'
                : `Add ${selectedIds.length} ${
                    selectedIds.length === 1
                      ? 'template'
                      : 'templates'
                  }`
          }
          onPress={() => {
            void handleImport()
          }}
        />
      </View>
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
})
