import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { NavigationCard } from '@/components/dashboard/navigation-card'
import { TaskCard } from '@/components/tasks/task-card'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Screen } from '@/components/ui/screen'
import { colors, radius, spacing } from '@/constants/theme'
import { getPointBalance } from '@/db/points'
import { getStreakStats, type StreakStats } from '@/db/streaks'
import {
  completeTask,
  getAvailableTasks,
} from '@/db/tasks'
import type { Task } from '@/types/task'

export default function HomeScreen() {
  const db = useSQLiteContext()

  const [balance, setBalance] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [completingTaskId, setCompletingTaskId] =
    useState<number>()

  const [streak, setStreak] = useState<StreakStats>({
    activeToday: false,
    bestStreak: 0,
    currentStreak: 0,
    lastActiveDate: null,
  })

  const loadDashboard = useCallback(async (): Promise<void> => {
    const [
      nextBalance,
      nextTasks,
      nextStreak,
    ] = await Promise.all([
      getPointBalance(db),
      getAvailableTasks(db),
      getStreakStats(db),
    ])

    setBalance(nextBalance)
    setTasks(nextTasks)
    setStreak(nextStreak)
  }, [db])

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function load(): Promise<void> {
        try {
          const [
            nextBalance,
            nextTasks,
            nextStreak,
          ] = await Promise.all([
            getPointBalance(db),
            getAvailableTasks(db),
            getStreakStats(db),
          ])

          if (active) {
            setBalance(nextBalance)
            setTasks(nextTasks)
            setStreak(nextStreak)
          }
        } catch (error) {
          console.error(error)
        } finally {
          if (active) {
            setLoading(false)
          }
        }
      }

      void load()

      return () => {
        active = false
      }
    }, [db]),
  )

  async function handleComplete(task: Task): Promise<void> {
    try {
      setCompletingTaskId(task.id)

      await completeTask(db, task)
      await loadDashboard()
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not complete task',
        'The task may already have been completed for this period.',
      )
    } finally {
      setCompletingTaskId(undefined)
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="caption">Kivo</AppText>
        <AppText variant="title">Your dashboard</AppText>
      </View>

      <Card style={styles.balanceCard}>
        <AppText variant="caption">Available points</AppText>

        <View style={styles.balanceRow}>
          {loading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <AppText style={styles.balance}>
              {balance.toLocaleString('en-US')}
            </AppText>
          )}

          <View style={styles.pointBadge}>
            <AppText style={styles.pointBadgeText}>PTS</AppText>
          </View>
        </View>

        <AppText variant="caption">
          Complete tasks and spend the points on configured rewards.
        </AppText>
      </Card>

      <Card style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <View style={styles.streakContent}>
            <AppText variant="caption">
              Daily streak
            </AppText>

            <AppText style={styles.streakValue}>
              {loading
                ? '–'
                : `${streak.currentStreak} ${
                    streak.currentStreak === 1
                      ? 'day'
                      : 'days'
                  }`}
            </AppText>
          </View>

          <View style={styles.streakBest}>
            <AppText variant="caption">
              Best
            </AppText>

            <AppText style={styles.streakBestValue}>
              {loading ? '–' : streak.bestStreak}
            </AppText>
          </View>
        </View>

        <AppText variant="caption">
          {loading
            ? 'Checking recent activity…'
            : streak.activeToday
              ? 'Today is already counted.'
              : streak.currentStreak > 0
                ? 'Complete a task today to continue the streak.'
                : 'Complete a task to start a new streak.'}
        </AppText>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="heading">Available now</AppText>

          <AppText variant="caption">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </AppText>
        </View>

        {loading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator color={colors.accent} />
          </Card>
        ) : tasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AppText style={styles.emptyTitle}>
              Nothing available
            </AppText>

            <AppText
              variant="caption"
              style={styles.emptyDescription}
            >
              Create a task or enjoy the suspicious absence of
              obligations.
            </AppText>

            <PrimaryButton
              label="Create task"
              onPress={() => router.push('/task-create')}
            />
          </Card>
        ) : (
          <View style={styles.taskList}>
            {tasks.slice(0, 3).map((task) => (
              <TaskCard
                completing={completingTaskId === task.id}
                key={task.id}
                onComplete={handleComplete}
                task={task}
              />
            ))}

            {tasks.length > 3 ? (
              <PrimaryButton
                label={`View all ${tasks.length} tasks`}
                onPress={() => router.push('/tasks')}
              />
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Manage</AppText>

        <View style={styles.navigationCards}>
          <NavigationCard
            description="Create, schedule and complete tasks"
            onPress={() => router.push('/tasks')}
            title="Tasks"
          />

          <NavigationCard
            description="Configure things worth spending points on"
            onPress={() => router.push('/rewards')}
            title="Rewards"
          />

          <NavigationCard
            description="Review earned and spent points"
            onPress={() => router.push('/history')}
            title="History"
          />

          <NavigationCard
            description="Appearance, data and preferences"
            onPress={() => router.push('/settings')}
            title="Settings"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.accentSoft,
    gap: spacing.md,
  },
  balanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
  },
  balance: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 58,
  },
  pointBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pointBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  streakCard: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  streakHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  streakContent: {
    flex: 1,
    gap: spacing.xs,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  streakBest: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  streakBestValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  section: {
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyCard: {
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptyDescription: {
    marginBottom: spacing.xs,
  },
  taskList: {
    gap: spacing.md,
  },
  navigationCards: {
    gap: spacing.md,
  },
})
