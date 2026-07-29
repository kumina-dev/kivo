import { useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { ActivityRow } from '@/components/statistics/activity-row'
import { StatCard } from '@/components/statistics/stat-card'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { colors, spacing } from '@/constants/theme'
import { getAppStatistics } from '@/db/statistics'
import type { AppStatistics } from '@/types/statistics'

export default function StatisticsScreen() {
  const db = useSQLiteContext()

  const [statistics, setStatistics] =
    useState<AppStatistics>()
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function loadStatistics(): Promise<void> {
        try {
          const nextStatistics =
            await getAppStatistics(db)

          if (active) {
            setStatistics(nextStatistics)
          }
        } catch (error) {
          console.error(error)

          if (active) {
            Alert.alert(
              'Could not load statistics',
              'Something went wrong while calculating your statistics.',
            )
          }
        } finally {
          if (active) {
            setLoading(false)
          }
        }
      }

      void loadStatistics()

      return () => {
        active = false
      }
    }, [db]),
  )

  if (loading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    )
  }

  if (!statistics) {
    return (
      <Screen>
        <Card style={styles.emptyCard}>
          <AppText variant="heading">
            Statistics unavailable
          </AppText>

          <AppText variant="caption">
            Kivo could not calculate the current statistics.
          </AppText>
        </Card>
      </Screen>
    )
  }

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.section}>
          <AppText variant="heading">
            Point economy
          </AppText>

          <View style={styles.grid}>
            <StatCard
              label="Current balance"
              value={`${statistics.currentBalance.toLocaleString('en-US')} PTS`}
            />

            <StatCard
              label="Total earned"
              value={statistics.totalEarned.toLocaleString(
                'en-US',
              )}
            />

            <StatCard
              label="Total spent"
              value={statistics.totalSpent.toLocaleString(
                'en-US',
              )}
            />

            <StatCard
              label="Manual adjustments"
              value={statistics.manualAdjustments.toLocaleString(
                'en-US',
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="heading">
            Activity
          </AppText>

          <View style={styles.grid}>
            <StatCard
              label="Tasks completed"
              value={statistics.taskCompletions.toLocaleString(
                'en-US',
              )}
            />

            <StatCard
              label="Rewards redeemed"
              value={statistics.rewardRedemptions.toLocaleString(
                'en-US',
              )}
            />

            <StatCard
              label="Active tasks"
              value={statistics.activeTasks.toLocaleString(
                'en-US',
              )}
            />

            <StatCard
              label="Active rewards"
              value={statistics.activeRewards.toLocaleString(
                'en-US',
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="heading">
            Completion streaks
          </AppText>

          <View style={styles.grid}>
            <StatCard
              description="Consecutive days with at least one completed task."
              label="Current streak"
              value={`${statistics.currentStreak} ${
                statistics.currentStreak === 1
                  ? 'day'
                  : 'days'
              }`}
            />

            <StatCard
              description="Your longest run of consecutive active days."
              label="Longest streak"
              value={`${statistics.longestStreak} ${
                statistics.longestStreak === 1
                  ? 'day'
                  : 'days'
              }`}
            />
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="heading">
            Last seven days
          </AppText>

          <Card style={styles.activityCard}>
            {statistics.recentActivity.map(
              (activity, index) => (
                <View key={activity.date}>
                  <ActivityRow activity={activity} />

                  {index <
                  statistics.recentActivity.length - 1 ? (
                    <View style={styles.separator} />
                  ) : null}
                </View>
              ),
            )}
          </Card>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xxl,
    paddingTop: spacing.lg,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyCard: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  activityCard: {
    gap: spacing.lg,
  },
  separator: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.lg,
  },
})
