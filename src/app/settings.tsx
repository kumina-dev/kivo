import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { DailyReminderForm } from '@/components/settings/daily-reminder-form'
import { PointAdjustmentForm } from '@/components/settings/point-adjustment-form'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { colors, spacing } from '@/constants/theme'
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/db/notification-settings'
import {
  createManualPointAdjustment,
  getPointBalance,
} from '@/db/points'
import {
  replaceDailyTaskReminder,
  requestNotificationPermission,
} from '@/services/notifications'
import type {
  DailyReminderInput,
  NotificationSettings,
} from '@/types/notification-settings'

import { BackupExportCard } from '@/components/settings/backup-export-card'
import { exportBackup } from '@/services/backup-export'

export default function SettingsScreen() {
  const db = useSQLiteContext()

  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>()
  const [savingReminder, setSavingReminder] =
    useState(false)
  const [exportingBackup, setExportingBackup] =
    useState(false)

  const loadBalance = useCallback(async (): Promise<void> => {
    const nextBalance = await getPointBalance(db)
    setBalance(nextBalance)
  }, [db])

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function load(): Promise<void> {
        try {
          const [
            nextBalance,
            nextNotificationSettings,
          ] = await Promise.all([
            getPointBalance(db),
            getNotificationSettings(db),
          ])

          if (active) {
            setBalance(nextBalance)
            setNotificationSettings(
              nextNotificationSettings,
            )
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

  async function handleReminderSubmit(
    input: DailyReminderInput,
  ): Promise<void> {
    if (!notificationSettings) {
      return
    }

    try {
      setSavingReminder(true)

      if (input.enabled) {
        const permission =
          await requestNotificationPermission()

        if (permission !== 'granted') {
          Alert.alert(
            'Notifications are disabled',
            'Allow notifications in your device settings before enabling the reminder.',
          )

          return
        }
      }

      const identifier =
        await replaceDailyTaskReminder(
          notificationSettings
            .dailyReminderIdentifier,
          input,
        )

      await updateNotificationSettings(
        db,
        input,
        identifier,
      )

      const nextSettings =
        await getNotificationSettings(db)

      setNotificationSettings(nextSettings)

      Alert.alert(
        input.enabled
          ? 'Reminder scheduled'
          : 'Reminder disabled',
        input.enabled
          ? `Kivo will remind you daily at ${String(
              input.hour,
            ).padStart(2, '0')}:${String(
              input.minute,
            ).padStart(2, '0')}.`
          : 'The daily task reminder has been removed.',
      )
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not save reminder',
        'Something went wrong while updating the notification schedule.',
      )
    } finally {
      setSavingReminder(false)
    }
  }

  async function handleExportBackup(): Promise<void> {
    try {
      setExportingBackup(true)

      const result = await exportBackup(db)

      Alert.alert(
        'Backup created',
        [
          `${result.summary.tasks} tasks`,
          `${result.summary.taskCompletions} completions`,
          `${result.summary.rewards} rewards`,
          `${result.summary.pointTransactions} point transactions`,
        ].join('\n'),
      )
    } catch (error) {
      console.error(error)

      Alert.alert(
        'Could not export backup',
        'Kivo could not create or share the backup file.',
      )
    } finally {
      setExportingBackup(false)
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

        {notificationSettings ? (
          <DailyReminderForm
            onSubmit={handleReminderSubmit}
            saving={savingReminder}
            settings={notificationSettings}
          />
        ) : null}

        <BackupExportCard
          exporting={exportingBackup}
          onExport={() => {
            void handleExportBackup()
          }}
        />

        <Card style={styles.managementCard}>
          <View style={styles.cardHeader}>
            <AppText variant="heading">
              Achievements
            </AppText>

            <AppText variant="caption">
              Review unlocked milestones and progress toward future goals.
            </AppText>
          </View>

          <SecondaryButton
            label="View achievements"
            onPress={() => router.push('/achievements')}
          />
        </Card>

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
