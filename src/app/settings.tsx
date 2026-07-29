import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  View
} from 'react-native'

import { BackupCard } from '@/components/settings/backup-card'
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
import { useDialog } from '@/hooks/use-dialog'
import { exportBackup } from '@/services/backup-export'
import {
  importSelectedBackup,
  selectBackupFile,
  type SelectedBackup,
} from '@/services/backup-import'
import {
  replaceDailyTaskReminder,
  requestNotificationPermission,
} from '@/services/notifications'
import type {
  DailyReminderInput,
  NotificationSettings,
} from '@/types/notification-settings'

export default function SettingsScreen() {
  const db = useSQLiteContext()
  const { showDialog } = useDialog()

  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>()
  const [savingReminder, setSavingReminder] =
    useState(false)
  const [exportingBackup, setExportingBackup] =
    useState(false)
  const [importingBackup, setImportingBackup] =
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

      showDialog({
        title: 'Could not update balance',
        message:
          'Something went wrong while saving the adjustment.',
      })

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
          showDialog({
            title: 'Notifications are disabled',
            message:
              'Allow notifications in your device settings before enabling the reminder.',
          })

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

      showDialog({
        title: input.enabled
          ? 'Reminder scheduled'
          : 'Reminder disabled',
        message: input.enabled
          ? `Kivo will remind you daily at ${String(
              input.hour,
            ).padStart(2, '0')}:${String(
              input.minute,
            ).padStart(2, '0')}.`
          : 'The daily task reminder has been removed.',
      })
    } catch (error) {
      console.error(error)

      showDialog({
        title: 'Could not save reminder',
        message:
          'Something went wrong while updating the notification schedule.',
      })
    } finally {
      setSavingReminder(false)
    }
  }

  async function handleExportBackup(): Promise<void> {
    try {
      setExportingBackup(true)

      const result = await exportBackup(db)

      showDialog({
        title: 'Backup created',
        message: [
          `${result.summary.tasks} tasks`,
          `${result.summary.taskCompletions} completions`,
          `${result.summary.rewards} rewards`,
          `${result.summary.pointTransactions} point transactions`,
        ].join('\n'),
      })
    } catch (error) {
      console.error(error)

      showDialog({
        title: 'Could not export backup',
        message:
          'Kivo could not create or share the backup file.',
      })
    } finally {
      setExportingBackup(false)
    }
  }

  async function handleImportBackup(): Promise<void> {
    try {
      const result = await selectBackupFile()

      if (result.canceled) {
        return
      }

      confirmBackupImport(result.selection)
    } catch (error) {
      console.error(error)

      showDialog({
        title: 'Invalid backup',
        message: getBackupImportErrorMessage(error),
      })
    }
  }

  function confirmBackupImport(
    selection: SelectedBackup,
  ): void {
    const { summary } = selection

    showDialog({
      dismissible: true,
      title: 'Replace current Kivo data?',
      message: [
        `File: ${selection.fileName}`,
        '',
        `${summary.tasks} tasks`,
        `${summary.taskCompletions} completions`,
        `${summary.rewards} rewards`,
        `${summary.pointTransactions} point transactions`,
        '',
        'The current data on this device will be replaced.',
      ].join('\n'),
      actions: [
        {
          label: 'Cancel',
          variant: 'secondary',
        },
        {
          label: 'Replace data',
          variant: 'destructive',
          onPress: async () => {
            await restoreBackup(selection)
          },
        },
      ],
    })
  }

  async function restoreBackup(
    selection: SelectedBackup,
  ): Promise<void> {
    try {
      setImportingBackup(true)

      if (
        notificationSettings?.dailyReminderIdentifier
      ) {
        await replaceDailyTaskReminder(
          notificationSettings.dailyReminderIdentifier,
          {
            enabled: false,
            hour: notificationSettings.dailyReminderHour,
            minute:
              notificationSettings.dailyReminderMinute,
          },
        )
      }

      await importSelectedBackup(db, selection)

      const importedSettings =
        await getNotificationSettings(db)

      let reminderIdentifier: string | null = null

      if (importedSettings.dailyReminderEnabled) {
        const permission =
          await requestNotificationPermission()

        if (permission === 'granted') {
          reminderIdentifier =
            await replaceDailyTaskReminder(null, {
              enabled: true,
              hour: importedSettings.dailyReminderHour,
              minute:
                importedSettings.dailyReminderMinute,
            })
        }
      }

      await updateNotificationSettings(
        db,
        {
          enabled:
            importedSettings.dailyReminderEnabled &&
            reminderIdentifier !== null,
          hour: importedSettings.dailyReminderHour,
          minute: importedSettings.dailyReminderMinute,
        },
        reminderIdentifier,
      )

      const [nextBalance, nextSettings] =
        await Promise.all([
          getPointBalance(db),
          getNotificationSettings(db),
        ])

      setBalance(nextBalance)
      setNotificationSettings(nextSettings)

      showDialog({
        title: 'Backup restored',
        message:
          'The selected Kivo backup has replaced the local data on this device.',
      })
    } catch (error) {
      console.error(error)

      showDialog({
        title: 'Could not restore backup',
        message:
          'Kivo could not replace the local data with this backup.',
      })
    } finally {
      setImportingBackup(false)
    }
  }

  function getBackupImportErrorMessage(
    error: unknown,
  ): string {
    if (!(error instanceof Error)) {
      return 'Kivo could not read the selected backup.'
    }

    switch (error.message) {
      case 'BACKUP_TOO_LARGE':
        return 'The selected backup is larger than 10 MB.'

      case 'INVALID_JSON':
        return 'The selected file does not contain valid JSON.'

      case 'INVALID_BACKUP':
        return 'The selected file is not a valid Kivo version 1 backup.'

      default:
        return 'Kivo could not read the selected backup.'
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

        <BackupCard
          exporting={exportingBackup}
          importing={importingBackup}
          onExport={() => {
            void handleExportBackup()
          }}
          onImport={() => {
            void handleImportBackup()
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
