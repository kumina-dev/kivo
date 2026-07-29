import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, radius, spacing } from '@/constants/theme'
import type { HistoryEntry } from '@/types/history'

type HistoryItemProps = {
  entry: HistoryEntry
}

export function HistoryItem({ entry }: HistoryItemProps) {
  const earned = entry.amount > 0

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(entry.createdAt))

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.icon,
          earned ? styles.earnedIcon : styles.spentIcon,
        ]}
      >
        <AppText
          style={[
            styles.iconText,
            earned ? styles.earnedText : styles.spentText,
          ]}
        >
          {earned ? '+' : '−'}
        </AppText>
      </View>

      <View style={styles.content}>
        <AppText style={styles.title}>{entry.title}</AppText>

        <AppText variant="caption">
          {earned ? 'Task completed' : 'Reward redeemed'} · {time}
        </AppText>
      </View>

      <AppText
        style={[
          styles.amount,
          earned ? styles.earnedText : styles.spentText,
        ]}
      >
        {earned ? '+' : ''}
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
  earnedIcon: {
    backgroundColor: 'rgba(111, 214, 157, 0.12)',
  },
  spentIcon: {
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
  earnedText: {
    color: colors.success,
  },
  spentText: {
    color: colors.danger,
  },
})
