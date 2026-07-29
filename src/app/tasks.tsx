import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { TaskCard } from '@/components/tasks/task-card'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Screen } from '@/components/ui/screen'
import { colors, spacing } from '@/constants/theme'
import { getActiveTasks } from '@/db/tasks'
import type { Task } from '@/types/task'

export default function TasksScreen() {
  const db = useSQLiteContext()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function loadTasks() {
        try {
          const result = await getActiveTasks(db)

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

      void loadTasks()

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
              Create a task, assign some points, then eventually
              pretend productivity has become a functioning economy.
            </AppText>
          </Card>
        ) : (
          <View style={styles.list}>
            <View style={styles.sectionHeader}>
              <AppText variant="heading">All tasks</AppText>

              <AppText variant="caption">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </AppText>
            </View>

            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
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
