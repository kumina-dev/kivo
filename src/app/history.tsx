import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { spacing } from '@/constants/theme'

export default function HistoryScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Card style={styles.emptyCard}>
          <AppText variant="heading">No activity yet</AppText>

          <AppText variant="caption">
            Completed tasks and redeemed rewards will appear here.
          </AppText>
        </Card>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
  },
  emptyCard: {
    gap: spacing.md,
  },
})
