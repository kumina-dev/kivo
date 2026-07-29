import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { NavigationCard } from '@/components/dashboard/navigation-card'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Screen } from '@/components/ui/screen'
import { colors, radius, spacing } from '@/constants/theme'

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant='caption'>Kivo</AppText>
        <AppText variant='title'>Good morning</AppText>
      </View>

      <Card style={styles.balanceCard}>
        <AppText variant="caption">Available points</AppText>

        <View style={styles.balanceRow}>
          <AppText style={styles.balance}>0</AppText>
          <View style={styles.pointBadge}>
            <AppText style={styles.pointBadgeText}>PTS</AppText>
          </View>
        </View>

        <AppText variant="caption">
          Complete tasks to earn points for your rewards.
        </AppText>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="heading">Today</AppText>
          <AppText variant="caption">0 tasks</AppText>
        </View>

        <Card style={styles.emptyCard}>
          <AppText style={styles.emptyTitle}>Nothing scheduled</AppText>
          <AppText variant="caption" style={styles.emptyDescription}>
            Add a task and give yourself something mildly productive to do.
          </AppText>

          <PrimaryButton
            label="Create task"
            onPress={() => router.push('/tasks')}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Manage</AppText>

        <View style={styles.navigationCards}>
          <NavigationCard
            description="Create, schedule and complete tasks"
            onPress={() => router.push('/tasks')}
            title="Tasks"
          />

          <NavigationCard
            description="Configure things worth spending points on"
            onPress={() => router.push('/rewards')}
            title="Rewards"
          />

          <NavigationCard
            description="Review earned and spent points"
            onPress={() => router.push('/history')}
            title="History"
          />

          <NavigationCard
            description="Appearance, data and preferences"
            onPress={() => router.push('/settings')}
            title="Settings"
          />
        </View>
      </View>
    </Screen>
  );
}const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.accentSoft,
    gap: spacing.md,
  },
  balanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  balance: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -2,
    lineHeight: 58,
  },
  pointBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pointBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  section: {
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyCard: {
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptyDescription: {
    marginBottom: spacing.xs,
  },
  navigationCards: {
    gap: spacing.md,
  },
})
