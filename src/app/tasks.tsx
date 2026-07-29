import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { TaskCard } from '@/components/tasks/task-card'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Screen } from '@/components/ui/screen'
import { colors, spacing } from '@/constants/theme'
import {
  completeTask,
  getActiveTasks,
} from '@/db/tasks'
import type { Task } from '@/types/task'
import {
  getCompletionPeriod,
  isTaskAvailableToday,
} from '@/utils/date'

type ManagedTask = {
  task: Task
  available: boolean
}

export default function TasksScreen() {
  const db = useSQLiteContext()

  const [tasks, setTasks] = useState<ManagedTask[]>([])
  const [loading, setLoading] = useState(true)
  const [completingTaskId, setCompletingTaskId] =
    useState<number>()

  const loadTasks = useCallback(async (): Promise<void> => {
    const activeTasks = await getActiveTasks(db)
    const today = new Date()

    const managedTasks = await Promise.all(
      activeTasks.map(async (task): Promise<ManagedTask> => {
        if (!isTaskAvailableToday(task.repeatRule, today)) {
          return {
            task,
            available: false,
          }
        }

        const completionPeriod = getCompletionPeriod(
          task.repeatRule,
          today,
        )

        const completion = await db.getFirstAsync<{ id: number }>(
          `
            SELECT id
            FROM task_completions
            WHERE task_id = ?
              AND completion_period = ?
          `,
          task.id,
          completionPeriod,
        )

        return {
          task,
          available: completion === null,
        }
      }),
    )

    setTasks(managedTasks)
  }, [db])

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function load(): Promise<void> {
        try {
          const activeTasks = await getActiveTasks(db)
          const today = new Date()

          const managedTasks = await Promise.all(
            activeTasks.map(
              async (task): Promise<ManagedTask> => {
                if (
                  !isTaskAvailableToday(task.repeatRule, today)
                ) {
                  return {
                    task,
                    available: false,
                  }
                }

                const completionPeriod = getCompletionPeriod(
                  task.repeatRule,
                  today,
                )

                const completion = await db.getFirstAsync<{
                  id: number
                }>(
                  `
                    SELECT id
                    FROM task_completions
                    WHERE task_id = ?
                      AND completion_period = ?
                  `,
                  task.id,
                  completionPeriod,
                )

                return {
                  task,
                  available: completion === null,
                }
              },
            ),
          )

          if (active) {
            setTasks(managedTasks)
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
      await loadTasks()
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

  function handleEdit(task: Task): void {
    router.push({
      pathname: '/task/[id]',
      params: {
        id: String(task.id),
      },
    })
  }

  if (loading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <View style={styles.content}>
        <PrimaryButton
          label="Create task"
          onPress={() => router.push('/task-create')}
        />

        {tasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AppText variant="heading">No tasks yet</AppText>

            <AppText variant="caption">
              Create a task before constructing the rest of your
              imaginary economy.
            </AppText>
          </Card>
        ) : (
          <View style={styles.list}>
            <View style={styles.sectionHeader}>
              <AppText variant="heading">All tasks</AppText>

              <AppText variant="caption">
                {tasks.length}{' '}
                {tasks.length === 1 ? 'task' : 'tasks'}
              </AppText>
            </View>

            {tasks.map(({ task, available }) => (
              <View key={task.id} style={styles.task}>
                <TaskCard
                  completing={completingTaskId === task.id}
                  onComplete={
                    available ? handleComplete : undefined
                  }
                  onEdit={handleEdit}
                  task={task}
                />

                {!available ? (
                  <AppText
                    variant="caption"
                    style={styles.unavailableLabel}
                  >
                    Already completed or not scheduled for today
                  </AppText>
                ) : null}
              </View>
            ))}
          </View>
        )}
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
  emptyCard: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  task: {
    gap: spacing.sm,
  },
  unavailableLabel: {
    paddingHorizontal: spacing.sm,
  },
})
