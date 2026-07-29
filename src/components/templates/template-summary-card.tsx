import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { spacing } from '@/constants/theme'

type TemplateSummaryCardProps = {
  selectedCount: number
  taskCount: number
  rewardCount: number
}

export function TemplateSummaryCard({
  rewardCount,
  selectedCount,
  taskCount,
}: TemplateSummaryCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="heading">
          Combined setup
        </AppText>

        <AppText variant="caption">
          Exact duplicate titles are included only once.
        </AppText>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <AppText style={styles.value}>
            {selectedCount}
          </AppText>

          <AppText variant="caption">
            Templates
          </AppText>
        </View>

        <View style={styles.stat}>
          <AppText style={styles.value}>
            {taskCount}
          </AppText>

          <AppText variant="caption">
            Tasks
          </AppText>
        </View>

        <View style={styles.stat}>
          <AppText style={styles.value}>
            {rewardCount}
          </AppText>

          <AppText variant="caption">
            Rewards
          </AppText>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  stat: {
    flex: 1,
    gap: spacing.xs,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
  },
})
