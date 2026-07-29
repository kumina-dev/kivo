import { router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useState } from 'react'
import {
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
import { TextField } from '@/components/ui/text-field'
import { colors, spacing } from '@/constants/theme'
import { createTask } from '@/db/tasks'
import type { RepeatRule } from '@/types/task'

const repeatOptions = [
  { label: 'One-off', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekdays', value: 'weekdays' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
] as const

export default function CreateTaskScreen() {
  const db = useSQLiteContext()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState('20')
  const [repeatRule, setRepeatRule] =
    useState<RepeatRule>('none')
  const [titleError, setTitleError] = useState<string>()
  const [pointsError, setPointsError] = useState<string>()
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
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

      await createTask(db, {
        title: normalizedTitle,
        description,
        points: parsedPoints,
        repeatRule,
      })

      router.back()
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not create task',
        'Something went wrong while saving the task.',
      )
    } finally {
      setSaving(false)
    }
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
              autoFocus
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
              returnKeyType="next"
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

          <PrimaryButton
            disabled={saving}
            label={saving ? 'Creating…' : 'Create task'}
            onPress={handleSubmit}
          />
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
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  fields: {
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
})
