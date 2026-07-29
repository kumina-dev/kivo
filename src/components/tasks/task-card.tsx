import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { colors, radius, spacing } from '@/constants/theme'
import type { RepeatRule, Task } from '@/types/task'

type TaskCardProps = {
  task: Task
}

const repeatLabels: Record<RepeatRule, string> = {
  none: 'One-off',
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

export function TaskCard({ task }: TaskCardProps) {
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
})
