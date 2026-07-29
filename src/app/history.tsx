import { useFocusEffect } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native'

import { HistoryItem } from '@/components/history/history-item'
import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { colors, spacing } from '@/constants/theme'
import { getHistoryEntries } from '@/db/history'
import {
  groupHistoryEntries,
  type HistoryGroup,
} from '@/utils/history'

export default function HistoryScreen() {
  const db = useSQLiteContext()

  const [groups, setGroups] = useState<HistoryGroup[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function loadHistory(): Promise<void> {
        try {
          const entries = await getHistoryEntries(db)

          if (active) {
            setGroups(groupHistoryEntries(entries))
          }
        } catch (error) {
          console.error(error)
        } finally {
          if (active) {
            setLoading(false)
          }
        }
      }

      void loadHistory()

      return () => {
        active = false
      }
    }, [db]),
  )

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
        {groups.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AppText variant="heading">No activity yet</AppText>

            <AppText variant="caption">
              Completed tasks and redeemed rewards will appear here.
              The economy currently consists entirely of optimism.
            </AppText>
          </Card>
        ) : (
          groups.map((group) => (
            <HistorySection
              group={group}
              key={group.key}
            />
          ))
        )}
      </View>
    </Screen>
  )
}

type HistorySectionProps = {
  group: HistoryGroup
}

function HistorySection({ group }: HistorySectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="heading">{group.title}</AppText>

      <Card style={styles.historyCard}>
        {group.entries.map((entry, index) => (
          <View key={entry.id}>
            <HistoryItem entry={entry} />

            {index < group.entries.length - 1 ? (
              <View style={styles.separator} />
            ) : null}
          </View>
        ))}
      </Card>
    </View>
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
  emptyCard: {
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  historyCard: {
    gap: spacing.lg,
  },
  separator: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.lg,
    marginLeft: 52,
  },
})
