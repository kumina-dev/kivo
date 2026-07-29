import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { PointAdjustmentForm } from '@/components/settings/point-adjustment-form'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { colors, spacing } from '@/constants/theme'
import {
  createManualPointAdjustment,
  getPointBalance,
} from '@/db/points'

export default function SettingsScreen() {
  const db = useSQLiteContext()

  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadBalance = useCallback(async (): Promise<void> => {
    const nextBalance = await getPointBalance(db)
    setBalance(nextBalance)
  }, [db])

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function load(): Promise<void> {
        try {
          const nextBalance = await getPointBalance(db)

          if (active) {
            setBalance(nextBalance)
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

  async function handleAdjustment(input: {
    amount: number
    note?: string
  }): Promise<void> {
    try {
      await createManualPointAdjustment(db, input)
      await loadBalance()
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not update balance',
        'Something went wrong while saving the adjustment.',
      )

      throw error
    }
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Card style={styles.balanceCard}>
          <AppText variant="caption">
            Current balance
          </AppText>

          {loading ? (
            <View style={styles.loadingBalance}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <AppText style={styles.balance}>
              {balance.toLocaleString('en-US')} PTS
            </AppText>
          )}

          {balance < 0 ? (
            <AppText
              variant="caption"
              style={styles.negativeBalance}
            >
              The balance is below zero.
            </AppText>
          ) : null}
        </Card>

        <PointAdjustmentForm
          onSubmit={handleAdjustment}
        />

        <Card style={styles.managementCard}>
          <View style={styles.cardHeader}>
            <AppText variant="heading">
              Calendar
            </AppText>

            <AppText variant="caption">
              Review task completions and earned points by day.
            </AppText>
          </View>

          <SecondaryButton
            label="View activity calendar"
            onPress={() => router.push('/calendar')}
          />
        </Card>

        <Card style={styles.managementCard}>
          <View style={styles.cardHeader}>
            <AppText variant="heading">
              Statistics
            </AppText>

            <AppText variant="caption">
              Review point totals, task activity and completion
              streaks.
            </AppText>
          </View>

          <SecondaryButton
            label="View statistics"
            onPress={() => router.push('/statistics')}
          />
        </Card>

        <Card style={styles.managementCard}>
          <View style={styles.cardHeader}>
            <AppText variant="heading">
              Archive
            </AppText>

            <AppText variant="caption">
              Restore tasks and rewards that were archived earlier.
            </AppText>
          </View>

          <SecondaryButton
            label="Manage archived items"
            onPress={() => router.push('/archive')}
          />
        </Card>

        <Card style={styles.infoCard}>
          <AppText variant="heading">
            Local data
          </AppText>

          <AppText variant="caption">
            Tasks, rewards and point history are stored only on this
            device. Cloud sync and account support are not enabled.
          </AppText>
        </Card>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  balanceCard: {
    gap: spacing.sm,
  },
  loadingBalance: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 44,
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  negativeBalance: {
    color: colors.danger,
  },
  managementCard: {
    gap: spacing.xl,
  },
  cardHeader: {
    gap: spacing.sm,
  },
  infoCard: {
    gap: spacing.md,
  },
})
