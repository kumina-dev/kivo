import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { colors, radius, spacing } from '@/constants/theme'
import type { Reward } from '@/types/reward'

type RewardCardProps = {
  balance: number
  onEdit?: (reward: Reward) => void
  onRedeem?: (reward: Reward) => void
  redeeming?: boolean
  reward: Reward
}

export function RewardCard({
  balance,
  onEdit,
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

      {onEdit || onRedeem ? (
        <View style={styles.actions}>
          {onEdit ? (
            <Pressable
              disabled={redeeming}
              onPress={() => onEdit(reward)}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
                redeeming && styles.disabled,
              ]}
            >
              <AppText style={styles.editButtonText}>
                Edit
              </AppText>
            </Pressable>
          ) : null}

          {onRedeem ? (
            <Pressable
              disabled={!affordable || redeeming}
              onPress={() => onRedeem(reward)}
              style={({ pressed }) => [
                styles.redeemButton,
                affordable
                  ? styles.redeemButtonAvailable
                  : styles.redeemButtonUnavailable,
                pressed &&
                  affordable &&
                  styles.redeemButtonPressed,
                redeeming && styles.disabled,
              ]}
            >
              <AppText
                style={[
                  styles.redeemButtonText,
                  !affordable && styles.unavailableText,
                ]}
              >
                {redeeming
                  ? 'Redeeming…'
                  : affordable
                    ? 'Redeem'
                    : `${missingPoints.toLocaleString('en-US')} needed`}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  editButtonPressed: {
    opacity: 0.75,
  },
  editButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  redeemButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  redeemButtonAvailable: {
    backgroundColor: colors.accent,
  },
  redeemButtonUnavailable: {
    backgroundColor: colors.surfaceRaised,
  },
  redeemButtonPressed: {
    backgroundColor: colors.accentPressed,
  },
  redeemButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  unavailableText: {
    color: colors.textMuted,
  },
  disabled: {
    opacity: 0.5,
  },
})
