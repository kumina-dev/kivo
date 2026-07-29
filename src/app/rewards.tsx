import * as Haptics from 'expo-haptics'
import { router, useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native'

import { RewardCard } from '@/components/rewards/reward-card'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Screen } from '@/components/ui/screen'
import { colors, spacing } from '@/constants/theme'
import { getPointBalance } from '@/db/points'
import {
  getActiveRewards,
  redeemReward,
} from '@/db/rewards'
import type { Reward } from '@/types/reward'

export default function RewardsScreen() {
  const db = useSQLiteContext()

  const [rewards, setRewards] = useState<Reward[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [redeemingRewardId, setRedeemingRewardId] =
    useState<number>()

  const loadRewards = useCallback(async (): Promise<void> => {
    const [nextRewards, nextBalance] = await Promise.all([
      getActiveRewards(db),
      getPointBalance(db),
    ])

    setRewards(nextRewards)
    setBalance(nextBalance)
  }, [db])

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function load(): Promise<void> {
        try {
          const [nextRewards, nextBalance] = await Promise.all([
            getActiveRewards(db),
            getPointBalance(db),
          ])

          if (active) {
            setRewards(nextRewards)
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

  function handleRedeem(reward: Reward): void {
    Alert.alert(
      'Redeem reward?',
      `${reward.title} costs ${reward.cost.toLocaleString('en-US')} points.`,
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          text: 'Redeem',
          onPress: () => {
            void confirmRedemption(reward)
          },
        },
      ],
    )
  }


  async function confirmRedemption(
    reward: Reward,
  ): Promise<void> {
    try {
      setRedeemingRewardId(reward.id)

      await redeemReward(db, reward)
      await loadRewards()

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      )
    } catch (error) {
      console.error(error)

      if (
        error instanceof Error &&
        error.message === 'INSUFFICIENT_POINTS'
      ) {
        Alert.alert(
          'Not enough points',
          'Your balance is lower than this reward’s cost.',
        )

        return
      }

      Alert.alert(
        'Could not redeem reward',
        'Something went wrong while redeeming the reward.',
      )
    } finally {
      setRedeemingRewardId(undefined)
    }
  }

  if (loading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Card style={styles.balanceCard}>
          <AppText variant="caption">Available balance</AppText>

          <AppText style={styles.balance}>
            {balance.toLocaleString('en-US')} PTS
          </AppText>
        </Card>

        <PrimaryButton
          label="Create reward"
          onPress={() => router.push('/reward-create')}
        />

        {rewards.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AppText variant="heading">No rewards yet</AppText>

            <AppText variant="caption">
              Add something worth earning. Preferably not another
              productivity subscription.
            </AppText>
          </Card>
        ) : (
          <View style={styles.list}>
            <View style={styles.sectionHeader}>
              <AppText variant="heading">Rewards</AppText>

              <AppText variant="caption">
                {rewards.length}{' '}
                {rewards.length === 1 ? 'reward' : 'rewards'}
              </AppText>
            </View>

            {rewards.map((reward) => (
              <RewardCard
                balance={balance}
                key={reward.id}
                onRedeem={handleRedeem}
                redeeming={redeemingRewardId === reward.id}
                reward={reward}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  balanceCard: {
    gap: spacing.sm,
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  emptyCard: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
