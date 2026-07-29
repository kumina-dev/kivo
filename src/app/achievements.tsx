import { useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { AchievementCard } from '@/components/achievements/achievement-card'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { OptionSelector } from '@/components/ui/option-selector'
import { Screen } from '@/components/ui/screen'
import { colors, spacing } from '@/constants/theme'
import { getAchievementSummary } from '@/db/achievements'
import type {
  Achievement,
  AchievementCategory,
  AchievementSummary,
} from '@/types/achievement'

type AchievementFilter =
  | 'all'
  | AchievementCategory

const filterOptions = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Tasks',
    value: 'tasks',
  },
  {
    label: 'Points',
    value: 'points',
  },
  {
    label: 'Rewards',
    value: 'rewards',
  },
  {
    label: 'Streaks',
    value: 'streaks',
  },
] as const

export default function AchievementsScreen() {
  const db = useSQLiteContext()

  const [summary, setSummary] =
    useState<AchievementSummary>()
  const [filter, setFilter] =
    useState<AchievementFilter>('all')
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function loadAchievements(): Promise<void> {
        try {
          const nextSummary =
            await getAchievementSummary(db)

          if (active) {
            setSummary(nextSummary)
          }
        } catch (error) {
          console.error(error)

          if (active) {
            Alert.alert(
              'Could not load achievements',
              'Something went wrong while calculating achievement progress.',
            )
          }
        } finally {
          if (active) {
            setLoading(false)
          }
        }
      }

      void loadAchievements()

      return () => {
        active = false
      }
    }, [db]),
  )

  const visibleAchievements = useMemo(() => {
    if (!summary) {
      return []
    }

    const filtered =
      filter === 'all'
        ? summary.achievements
        : summary.achievements.filter(
            (achievement) =>
              achievement.category === filter,
          )

    return [...filtered].sort(
      (first, second) => {
        if (first.unlocked !== second.unlocked) {
          return first.unlocked ? -1 : 1
        }

        return (
          second.progress - first.progress ||
          first.target - second.target
        )
      },
    )
  }, [filter, summary])

  if (loading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    )
  }

  if (!summary) {
    return (
      <Screen>
        <Card style={styles.unavailableCard}>
          <AppText variant="heading">
            Achievements unavailable
          </AppText>

          <AppText variant="caption">
            Kivo could not calculate achievement progress.
          </AppText>
        </Card>
      </Screen>
    )
  }

  const completionPercentage =
    summary.total === 0
      ? 0
      : Math.round(
          (summary.unlocked / summary.total) * 100,
        )

  return (
    <Screen>
      <View style={styles.content}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryText}>
              <AppText variant="caption">
                Achievement progress
              </AppText>

              <AppText style={styles.summaryValue}>
                {summary.unlocked} / {summary.total}
              </AppText>
            </View>

            <AppText style={styles.percentage}>
              {completionPercentage}%
            </AppText>
          </View>

          <View style={styles.summaryTrack}>
            <View
              style={[
                styles.summaryFill,
                {
                  width: `${completionPercentage}%`,
                },
              ]}
            />
          </View>
        </Card>

        <OptionSelector
          label="Category"
          onChange={setFilter}
          options={filterOptions}
          value={filter}
        />

        <View style={styles.list}>
          <View style={styles.sectionHeader}>
            <AppText variant="heading">
              Achievements
            </AppText>

            <AppText variant="caption">
              {visibleAchievements.length}{' '}
              {visibleAchievements.length === 1
                ? 'achievement'
                : 'achievements'}
            </AppText>
          </View>

          {visibleAchievements.map(
            (achievement: Achievement) => (
              <AchievementCard
                achievement={achievement}
                key={achievement.id}
              />
            ),
          )}
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  unavailableCard: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  summaryCard: {
    gap: spacing.lg,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    gap: spacing.sm,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  percentage: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '700',
  },
  summaryTrack: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  summaryFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: '100%',
  },
  list: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
