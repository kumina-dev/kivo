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

import { PrimaryButton } from '@/components/ui/primary-button'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { TextField } from '@/components/ui/text-field'
import { colors, spacing } from '@/constants/theme'
import {
  archiveReward,
  getRewardById,
  updateReward,
} from '@/db/rewards'

export default function EditRewardScreen() {
  const db = useSQLiteContext()
  const params = useLocalSearchParams<{ id: string }>()

  const rewardId = Number(params.id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')

  const [titleError, setTitleError] = useState<string>()
  const [costError, setCostError] = useState<string>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    let active = true

    async function loadReward(): Promise<void> {
      if (!Number.isInteger(rewardId) || rewardId <= 0) {
        Alert.alert('Reward not found')
        router.back()
        return
      }

      try {
        const reward = await getRewardById(db, rewardId)

        if (!reward || reward.archivedAt) {
          Alert.alert('Reward not found')
          router.back()
          return
        }

        if (!active) {
          return
        }

        setTitle(reward.title)
        setDescription(reward.description ?? '')
        setCost(String(reward.cost))
      } catch (error) {
        console.error(error)

        Alert.alert(
          'Could not load reward',
          'Something went wrong while loading the reward.',
        )

        router.back()
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadReward()

    return () => {
      active = false
    }
  }, [db, rewardId])

  async function handleSave(): Promise<void> {
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

      await updateReward(db, rewardId, {
        title: normalizedTitle,
        description,
        cost: parsedCost,
      })

      router.back()
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not update reward',
        'Something went wrong while saving the reward.',
      )
    } finally {
      setSaving(false)
    }
  }

  function handleArchive(): void {
    Alert.alert(
      'Archive reward?',
      'The reward will no longer be available for redemption. Existing history and point transactions will remain.',
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

      await archiveReward(db, rewardId)
      router.back()
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not archive reward',
        'Something went wrong while archiving the reward.',
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
              label="Reward name"
              maxLength={100}
              onChangeText={(value) => {
                setTitle(value)

                if (titleError) {
                  setTitleError(undefined)
                }
              }}
              placeholder="Movie night"
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
              label={
                archiving
                  ? 'Archiving…'
                  : 'Archive reward'
              }
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
