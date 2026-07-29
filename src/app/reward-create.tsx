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

import { PrimaryButton } from '@/components/ui/primary-button'
import { TextField } from '@/components/ui/text-field'
import { colors, spacing } from '@/constants/theme'
import { createReward } from '@/db/rewards'

export default function CreateRewardScreen() {
  const db = useSQLiteContext()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('100')
  const [titleError, setTitleError] = useState<string>()
  const [costError, setCostError] = useState<string>()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(): Promise<void> {
    const normalizedTitle = title.trim()
    const parsedCost = Number(cost)

    const nextTitleError = normalizedTitle
      ? undefined
      : 'Enter a reward name.'

    const nextCostError =
      Number.isInteger(parsedCost) && parsedCost > 0
        ? undefined
        : 'Cost must be a positive whole number.'

    setTitleError(nextTitleError)
    setCostError(nextCostError)

    if (nextTitleError || nextCostError) {
      return
    }

    try {
      setSaving(true)

      await createReward(db, {
        title: normalizedTitle,
        description,
        cost: parsedCost,
      })

      router.back()
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not create reward',
        'Something went wrong while saving the reward.',
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
              label="Reward name"
              maxLength={100}
              onChangeText={(value) => {
                setTitle(value)

                if (titleError) {
                  setTitleError(undefined)
                }
              }}
              placeholder="Movie night"
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
              error={costError}
              keyboardType="number-pad"
              label="Point cost"
              maxLength={9}
              onChangeText={(value) => {
                setCost(value.replace(/[^0-9]/g, ''))

                if (costError) {
                  setCostError(undefined)
                }
              }}
              placeholder="100"
              value={cost}
            />
          </View>

          <PrimaryButton
            disabled={saving}
            label={saving ? 'Creating…' : 'Create reward'}
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
