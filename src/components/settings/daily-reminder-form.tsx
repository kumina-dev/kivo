import { useEffect, useState } from 'react'
import {
  StyleSheet,
  Switch,
  View,
} from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { TextField } from '@/components/ui/text-field'
import { colors, spacing } from '@/constants/theme'
import type {
  DailyReminderInput,
  NotificationSettings,
} from '@/types/notification-settings'

type DailyReminderFormProps = {
  settings: NotificationSettings
  saving: boolean
  onSubmit: (
    input: DailyReminderInput,
  ) => Promise<void>
}

export function DailyReminderForm({
  onSubmit,
  saving,
  settings,
}: DailyReminderFormProps) {
  const [enabled, setEnabled] = useState(
    settings.dailyReminderEnabled,
  )
  const [hour, setHour] = useState(
    String(settings.dailyReminderHour),
  )
  const [minute, setMinute] = useState(
    String(settings.dailyReminderMinute).padStart(2, '0'),
  )
  const [timeError, setTimeError] =
    useState<string>()

  useEffect(() => {
    setEnabled(settings.dailyReminderEnabled)
    setHour(String(settings.dailyReminderHour))
    setMinute(
      String(settings.dailyReminderMinute).padStart(
        2,
        '0',
      ),
    )
  }, [settings])

  async function handleSubmit(): Promise<void> {
    const parsedHour = Number(hour)
    const parsedMinute = Number(minute)

    if (
      !Number.isInteger(parsedHour) ||
      parsedHour < 0 ||
      parsedHour > 23 ||
      !Number.isInteger(parsedMinute) ||
      parsedMinute < 0 ||
      parsedMinute > 59
    ) {
      setTimeError(
        'Enter a valid 24-hour time between 00:00 and 23:59.',
      )

      return
    }

    setTimeError(undefined)

    await onSubmit({
      enabled,
      hour: parsedHour,
      minute: parsedMinute,
    })
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <AppText variant="heading">
            Daily reminder
          </AppText>

          <AppText variant="caption">
            Receive one notification each day to review
            available tasks.
          </AppText>
        </View>

        <Switch
          onValueChange={setEnabled}
          trackColor={{
            false: colors.surfaceRaised,
            true: colors.accent,
          }}
          value={enabled}
        />
      </View>

      <View style={styles.timeSection}>
        <AppText variant="caption">
          Reminder time
        </AppText>

        <View style={styles.timeFields}>
          <View style={styles.timeField}>
            <TextField
              editable={enabled && !saving}
              keyboardType="number-pad"
              label="Hour"
              maxLength={2}
              onChangeText={(value) => {
                setHour(value.replace(/[^0-9]/g, ''))
                setTimeError(undefined)
              }}
              placeholder="18"
              value={hour}
            />
          </View>

          <AppText style={styles.separator}>:</AppText>

          <View style={styles.timeField}>
            <TextField
              editable={enabled && !saving}
              keyboardType="number-pad"
              label="Minute"
              maxLength={2}
              onChangeText={(value) => {
                setMinute(
                  value.replace(/[^0-9]/g, ''),
                )
                setTimeError(undefined)
              }}
              placeholder="00"
              value={minute}
            />
          </View>
        </View>

        {timeError ? (
          <AppText style={styles.error}>
            {timeError}
          </AppText>
        ) : null}
      </View>

      <PrimaryButton
        disabled={saving}
        label={saving ? 'Saving…' : 'Save reminder'}
        onPress={() => {
          void handleSubmit()
        }}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
    gap: spacing.sm,
  },
  timeSection: {
    gap: spacing.sm,
  },
  timeFields: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeField: {
    flex: 1,
  },
  separator: {
    fontSize: 24,
    fontWeight: '700',
    paddingBottom: 13,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
})
