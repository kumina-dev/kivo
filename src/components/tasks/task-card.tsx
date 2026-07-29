import * as Haptics from 'expo-haptics'
import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { colors, radius, spacing } from '@/constants/theme'
import type { RepeatRule, Task } from '@/types/task'

type TaskCardProps = {
  completing?: boolean
  onComplete?: (task: Task) => Promise<void>
  onEdit?: (task: Task) => void
  task: Task
}

const repeatLabels: Record<RepeatRule, string> = {
  none: 'One-off',
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

export function TaskCard({
  completing = false,
  onComplete,
  onEdit,
  task,
}: TaskCardProps) {
  async function handleComplete(): Promise<void> {
    if (!onComplete || completing) {
      return
    }

    await onComplete(task)

    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    )
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AppText style={styles.title}>{task.title}</AppText>

          <AppText variant="caption">
            {repeatLabels[task.repeatRule]}
          </AppText>
        </View>

        <View style={styles.points}>
          <AppText style={styles.pointsText}>
            +{task.points}
          </AppText>
        </View>
      </View>

      {task.description ? (
        <AppText variant="caption">{task.description}</AppText>
      ) : null}

      {onComplete || onEdit ? (
        <View style={styles.actions}>
          {onEdit ? (
            <Pressable
              onPress={() => onEdit(task)}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
            >
              <AppText style={styles.editButtonText}>Edit</AppText>
            </Pressable>
          ) : null}

          {onComplete ? (
            <Pressable
              disabled={completing}
              onPress={() => {
                void handleComplete()
              }}
              style={({ pressed }) => [
                styles.completeButton,
                pressed && styles.completeButtonPressed,
                completing && styles.completeButtonDisabled,
              ]}
            >
              <AppText style={styles.completeButtonText}>
                {completing ? 'Completing…' : 'Complete'}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  points: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pointsText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  editButtonPressed: {
    opacity: 0.75,
  },
  editButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  completeButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  completeButtonPressed: {
    backgroundColor: colors.accentPressed,
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
})
