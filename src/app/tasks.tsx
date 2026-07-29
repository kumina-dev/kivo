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
  getAvailableTasks,
} from '@/db/tasks'
import type { Task } from '@/types/task'

export default function TasksScreen() {
  const db = useSQLiteContext()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [completingTaskId, setCompletingTaskId] =
    useState<number>()

  const loadTasks = useCallback(async (): Promise<void> => {
    const result = await getAvailableTasks(db)
    setTasks(result)
  }, [db])

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function load(): Promise<void> {
        try {
          const result = await getAvailableTasks(db)

          if (active) {
            setTasks(result)
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
            <AppText variant="heading">Nothing available</AppText>

            <AppText variant="caption">
              You have completed everything currently available.
              Civilization may continue for another day.
            </AppText>
          </Card>
        ) : (
          <View style={styles.list}>
            <View style={styles.sectionHeader}>
              <AppText variant="heading">Available</AppText>

              <AppText variant="caption">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </AppText>
            </View>

            {tasks.map((task) => (
              <TaskCard
                completing={completingTaskId === task.id}
                key={task.id}
                onComplete={handleComplete}
                task={task}
              />
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
})
