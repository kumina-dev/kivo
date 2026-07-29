import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, spacing } from '@/constants/theme'
import type { DailyPointActivity } from '@/types/statistics'

type ActivityRowProps = {
  activity: DailyPointActivity
}

function formatDate(dateValue: string): string {
  const date = new Date(`${dateValue}T12:00:00`)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function ActivityRow({
  activity,
}: ActivityRowProps) {
  const hasActivity =
    activity.earned > 0 || activity.spent > 0

  return (
    <View style={styles.row}>
      <AppText style={styles.date}>
        {formatDate(activity.date)}
      </AppText>

      <View style={styles.amounts}>
        {hasActivity ? (
          <>
            <AppText style={styles.earned}>
              +{activity.earned.toLocaleString('en-US')}
            </AppText>

            <AppText style={styles.spent}>
              −{activity.spent.toLocaleString('en-US')}
            </AppText>
          </>
        ) : (
          <AppText variant="caption">
            No activity
          </AppText>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  date: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  amounts: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  earned: {
    color: colors.success,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 48,
    textAlign: 'right',
  },
  spent: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
    minWidth: 48,
    textAlign: 'right',
  },
})
