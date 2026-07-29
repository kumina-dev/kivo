import { StyleSheet, View } from 'react-native'

import { AchievementProgress } from '@/components/achievements/achievement-progress'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import {
  colors,
  radius,
  spacing,
} from '@/constants/theme'
import type {
  Achievement,
  AchievementCategory,
} from '@/types/achievement'

type AchievementCardProps = {
  achievement: Achievement
}

const categoryLabels: Record<
  AchievementCategory,
  string
> = {
  tasks: 'Tasks',
  points: 'Points',
  rewards: 'Rewards',
  streaks: 'Streaks',
}

export function AchievementCard({
  achievement,
}: AchievementCardProps) {
  return (
    <Card
      style={[
        styles.card,
        achievement.unlocked && styles.unlockedCard,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <View style={styles.badges}>
            <View style={styles.categoryBadge}>
              <AppText style={styles.categoryLabel}>
                {categoryLabels[achievement.category]}
              </AppText>
            </View>

            {achievement.unlocked ? (
              <View style={styles.unlockedBadge}>
                <AppText style={styles.unlockedLabel}>
                  Unlocked
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText style={styles.title}>
            {achievement.title}
          </AppText>

          <AppText variant="caption">
            {achievement.description}
          </AppText>
        </View>
      </View>

      <View style={styles.progressArea}>
        <AchievementProgress
          progress={achievement.progress}
          unlocked={achievement.unlocked}
        />

        <View style={styles.progressLabels}>
          <AppText variant="caption">
            Progress
          </AppText>

          <AppText
            style={[
              styles.progressValue,
              achievement.unlocked &&
                styles.unlockedValue,
            ]}
          >
            {Math.min(
              achievement.currentValue,
              achievement.target,
            ).toLocaleString('en-US')}
            {' / '}
            {achievement.target.toLocaleString('en-US')}
          </AppText>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  unlockedCard: {
    borderColor: colors.success,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  titleArea: {
    flex: 1,
    gap: spacing.sm,
  },
  badges: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  categoryLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  unlockedBadge: {
    backgroundColor: 'rgba(111, 214, 157, 0.12)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  unlockedLabel: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressArea: {
    gap: spacing.sm,
  },
  progressLabels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressValue: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  unlockedValue: {
    color: colors.success,
  },
})
