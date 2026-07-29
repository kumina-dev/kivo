import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { colors, radius, spacing } from '@/constants/theme'
import type { Reward } from '@/types/reward'

type RewardCardProps = {
  balance: number
  onRedeem: (reward: Reward) => void
  redeeming?: boolean
  reward: Reward
}

export function RewardCard({
  balance,
  onRedeem,
  redeeming = false,
  reward,
}: RewardCardProps) {
  const affordable = balance >= reward.cost
  const missingPoints = Math.max(reward.cost - balance, 0)

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AppText style={styles.title}>{reward.title}</AppText>

          {reward.description ? (
            <AppText variant="caption">
              {reward.description}
            </AppText>
          ) : null}
        </View>

        <View style={styles.costBadge}>
          <AppText style={styles.costText}>
            {reward.cost.toLocaleString('en-US')} PTS
          </AppText>
        </View>
      </View>

      <Pressable
        disabled={!affordable || redeeming}
        onPress={() => onRedeem(reward)}
        style={({ pressed }) => [
          styles.button,
          affordable
            ? styles.buttonAvailable
            : styles.buttonUnavailable,
          pressed && affordable && styles.buttonPressed,
          redeeming && styles.buttonDisabled,
        ]}
      >
        <AppText
          style={[
            styles.buttonText,
            !affordable && styles.unavailableText,
          ]}
        >
          {redeeming
            ? 'Redeeming…'
            : affordable
              ? 'Redeem reward'
              : `${missingPoints.toLocaleString('en-US')} points needed`}
        </AppText>
      </Pressable>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  costBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  costText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  buttonAvailable: {
    backgroundColor: colors.accent,
  },
  buttonUnavailable: {
    backgroundColor: colors.surfaceRaised,
  },
  buttonPressed: {
    backgroundColor: colors.accentPressed,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  unavailableText: {
    color: colors.textMuted,
  },
})
