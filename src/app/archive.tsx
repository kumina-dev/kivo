import * as Haptics from 'expo-haptics'
import { useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { ArchivedItemCard } from '@/components/archive/archived-item-card'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { OptionSelector } from '@/components/ui/option-selector'
import { Screen } from '@/components/ui/screen'
import { colors, spacing } from '@/constants/theme'
import {
  getArchivedRewards,
  restoreReward,
} from '@/db/rewards'
import {
  getArchivedTasks,
  restoreTask,
} from '@/db/tasks'
import type { Reward } from '@/types/reward'
import type { RepeatRule, Task } from '@/types/task'

type ArchiveSection = 'tasks' | 'rewards'

const sectionOptions = [
  {
    label: 'Tasks',
    value: 'tasks',
  },
  {
    label: 'Rewards',
    value: 'rewards',
  },
] as const

const repeatLabels: Record<RepeatRule, string> = {
  none: 'One-off',
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

export default function ArchiveScreen() {
  const db = useSQLiteContext()

  const [section, setSection] =
    useState<ArchiveSection>('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [restoringKey, setRestoringKey] =
    useState<string>()

  const loadArchive = useCallback(async (): Promise<void> => {
    const [nextTasks, nextRewards] = await Promise.all([
      getArchivedTasks(db),
      getArchivedRewards(db),
    ])

    setTasks(nextTasks)
    setRewards(nextRewards)
  }, [db])

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function load(): Promise<void> {
        try {
          const [nextTasks, nextRewards] =
            await Promise.all([
              getArchivedTasks(db),
              getArchivedRewards(db),
            ])

          if (active) {
            setTasks(nextTasks)
            setRewards(nextRewards)
          }
        } catch (error) {
          console.error(error)

          if (active) {
            Alert.alert(
              'Could not load archive',
              'Something went wrong while loading archived items.',
            )
          }
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

  async function handleRestoreTask(
    task: Task,
  ): Promise<void> {
    const key = `task-${task.id}`

    try {
      setRestoringKey(key)

      await restoreTask(db, task.id)
      await loadArchive()

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      )
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not restore task',
        'The task may already have been restored.',
      )
    } finally {
      setRestoringKey(undefined)
    }
  }

  async function handleRestoreReward(
    reward: Reward,
  ): Promise<void> {
    const key = `reward-${reward.id}`

    try {
      setRestoringKey(key)

      await restoreReward(db, reward.id)
      await loadArchive()

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      )
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not restore reward',
        'The reward may already have been restored.',
      )
    } finally {
      setRestoringKey(undefined)
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

  const visibleItems =
    section === 'tasks' ? tasks : rewards

  return (
    <Screen>
      <View style={styles.content}>
        <OptionSelector
          label="Archive type"
          onChange={setSection}
          options={sectionOptions}
          value={section}
        />

        {visibleItems.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AppText variant="heading">
              Nothing archived
            </AppText>

            <AppText variant="caption">
              Archived {section} will appear here and can be
              restored later.
            </AppText>
          </Card>
        ) : section === 'tasks' ? (
          <View style={styles.list}>
            <SectionHeader
              count={tasks.length}
              singular="task"
              title="Archived tasks"
            />

            {tasks.map((task) => (
              <ArchivedItemCard
                description={task.description}
                disabled={
                  restoringKey === `task-${task.id}`
                }
                key={task.id}
                metadata={`${repeatLabels[task.repeatRule]} · ${task.points.toLocaleString('en-US')} points`}
                onRestore={() => {
                  void handleRestoreTask(task)
                }}
                title={task.title}
              />
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            <SectionHeader
              count={rewards.length}
              singular="reward"
              title="Archived rewards"
            />

            {rewards.map((reward) => (
              <ArchivedItemCard
                description={reward.description}
                disabled={
                  restoringKey === `reward-${reward.id}`
                }
                key={reward.id}
                metadata={`${reward.cost.toLocaleString('en-US')} points`}
                onRestore={() => {
                  void handleRestoreReward(reward)
                }}
                title={reward.title}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  )
}

type SectionHeaderProps = {
  count: number
  singular: string
  title: string
}

function SectionHeader({
  count,
  singular,
  title,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="heading">{title}</AppText>

      <AppText variant="caption">
        {count} {count === 1 ? singular : `${singular}s`}
      </AppText>
    </View>
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
