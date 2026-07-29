import { router, useLocalSearchParams } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { OptionSelector } from '@/components/ui/option-selector'
import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { TextField } from '@/components/ui/text-field'
import { colors, spacing } from '@/constants/theme'
import {
  archiveTask,
  getTaskById,
  updateTask,
} from '@/db/tasks'
import type { RepeatRule } from '@/types/task'

const repeatOptions = [
  { label: 'One-off', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekdays', value: 'weekdays' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
] as const

export default function EditTaskScreen() {
  const db = useSQLiteContext()
  const params = useLocalSearchParams<{ id: string }>()

  const taskId = Number(params.id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState('')
  const [repeatRule, setRepeatRule] =
    useState<RepeatRule>('none')

  const [titleError, setTitleError] = useState<string>()
  const [pointsError, setPointsError] = useState<string>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    let active = true

    async function loadTask(): Promise<void> {
      if (!Number.isInteger(taskId) || taskId <= 0) {
        Alert.alert('Task not found')
        router.back()
        return
      }

      try {
        const task = await getTaskById(db, taskId)

        if (!task || task.archivedAt) {
          Alert.alert('Task not found')
          router.back()
          return
        }

        if (!active) {
          return
        }

        setTitle(task.title)
        setDescription(task.description ?? '')
        setPoints(String(task.points))
        setRepeatRule(task.repeatRule)
      } catch (error) {
        console.error(error)

        Alert.alert(
          'Could not load task',
          'Something went wrong while loading the task.',
        )

        router.back()
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadTask()

    return () => {
      active = false
    }
  }, [db, taskId])

  async function handleSave(): Promise<void> {
    const normalizedTitle = title.trim()
    const parsedPoints = Number(points)

    const nextTitleError = normalizedTitle
      ? undefined
      : 'Enter a task name.'

    const nextPointsError =
      Number.isInteger(parsedPoints) && parsedPoints > 0
        ? undefined
        : 'Points must be a positive whole number.'

    setTitleError(nextTitleError)
    setPointsError(nextPointsError)

    if (nextTitleError || nextPointsError) {
      return
    }

    try {
      setSaving(true)

      await updateTask(db, taskId, {
        title: normalizedTitle,
        description,
        points: parsedPoints,
        repeatRule,
      })

      router.back()
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not update task',
        'Something went wrong while saving the task.',
      )
    } finally {
      setSaving(false)
    }
  }

  function handleArchive(): void {
    Alert.alert(
      'Archive task?',
      'The task will no longer appear in your active tasks. Existing history and points will remain.',
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          style: 'destructive',
          text: 'Archive',
          onPress: () => {
            void confirmArchive()
          },
        },
      ],
    )
  }

  async function confirmArchive(): Promise<void> {
    try {
      setArchiving(true)
      await archiveTask(db, taskId)
      router.back()
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not archive task',
        'Something went wrong while archiving the task.',
      )
    } finally {
      setArchiving(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.fields}>
            <TextField
              autoCapitalize="sentences"
              error={titleError}
              label="Task name"
              maxLength={100}
              onChangeText={(value) => {
                setTitle(value)

                if (titleError) {
                  setTitleError(undefined)
                }
              }}
              placeholder="Clean the kitchen"
              value={title}
            />

            <TextField
              label="Description"
              maxLength={500}
              multiline
              onChangeText={setDescription}
              placeholder="Optional details"
              value={description}
            />

            <TextField
              error={pointsError}
              keyboardType="number-pad"
              label="Points"
              maxLength={6}
              onChangeText={(value) => {
                setPoints(value.replace(/[^0-9]/g, ''))

                if (pointsError) {
                  setPointsError(undefined)
                }
              }}
              placeholder="20"
              value={points}
            />

            <OptionSelector
              label="Repeat"
              onChange={setRepeatRule}
              options={repeatOptions}
              value={repeatRule}
            />
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              disabled={saving || archiving}
              label={saving ? 'Saving…' : 'Save changes'}
              onPress={() => {
                void handleSave()
              }}
            />

            <SecondaryButton
              destructive
              disabled={saving || archiving}
              label={archiving ? 'Archiving…' : 'Archive task'}
              onPress={handleArchive}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  fields: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  actions: {
    gap: spacing.md,
  },
})
