import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { PrimaryButton } from '@/components/ui/primary-button'
import { Screen } from '@/components/ui/screen'
import { spacing } from '@/constants/theme'

export default function TasksScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Card style={styles.emptyCard}>
          <AppText variant="heading">No tasks yet</AppText>

          <AppText variant="caption">
            Tasks will appear here once task creation is implemented.
          </AppText>

          <PrimaryButton label="Create task" />
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
