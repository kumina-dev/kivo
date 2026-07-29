import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { Screen } from '@/components/ui/screen'
import { spacing } from '@/constants/theme'

export default function SettingsScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Card style={styles.card}>
          <AppText variant="heading">Settings</AppText>

          <AppText variant="caption">
            Theme, backups and data controls will live here.
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
  card: {
    gap: spacing.md,
  },
})
