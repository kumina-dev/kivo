import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, radius, spacing } from '@/constants/theme'
import type { HistoryEntry } from '@/types/history'

type HistoryItemProps = {
  entry: HistoryEntry
}

function getEntryDescription(entry: HistoryEntry): string {
  switch (entry.type) {
    case 'task_completion':
      return 'Task completed'

    case 'reward_redemption':
      return 'Reward redeemed'

    case 'manual_adjustment':
      return entry.amount > 0
        ? 'Points added manually'
        : 'Points removed manually'
  }
}

export function HistoryItem({
  entry,
}: HistoryItemProps) {
  const positive = entry.amount > 0

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(entry.createdAt))

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.icon,
          positive ? styles.positiveIcon : styles.negativeIcon,
        ]}
      >
        <AppText
          style={[
            styles.iconText,
            positive
              ? styles.positiveText
              : styles.negativeText,
          ]}
        >
          {positive ? '+' : '−'}
        </AppText>
      </View>

      <View style={styles.content}>
        <AppText style={styles.title}>
          {entry.title}
        </AppText>

        <AppText variant="caption">
          {getEntryDescription(entry)} · {time}
        </AppText>
      </View>

      <AppText
        style={[
          styles.amount,
          positive
            ? styles.positiveText
            : styles.negativeText,
        ]}
      >
        {positive ? '+' : ''}
        {entry.amount.toLocaleString('en-US')}
      </AppText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  positiveIcon: {
    backgroundColor: 'rgba(111, 214, 157, 0.12)',
  },
  negativeIcon: {
    backgroundColor: 'rgba(239, 123, 131, 0.12)',
  },
  iconText: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.danger,
  },
})
