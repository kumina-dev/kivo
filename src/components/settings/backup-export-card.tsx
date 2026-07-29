import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { spacing } from '@/constants/theme'

type BackupExportCardProps = {
  exporting: boolean
  onExport: () => void
}

export function BackupExportCard({
  exporting,
  onExport,
}: BackupExportCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="heading">
          Data backup
        </AppText>

        <AppText variant="caption">
          Export tasks, rewards, completions and point
          history into a JSON backup file.
        </AppText>
      </View>

      <SecondaryButton
        disabled={exporting}
        label={
          exporting
            ? 'Creating backup…'
            : 'Export backup'
        }
        onPress={onExport}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
})
