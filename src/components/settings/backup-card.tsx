import { StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { SecondaryButton } from '@/components/ui/secondary-button'
import { spacing } from '@/constants/theme'

type BackupCardProps = {
  exporting: boolean
  importing: boolean
  onExport: () => void
  onImport: () => void
}

export function BackupCard({
  exporting,
  importing,
  onExport,
  onImport,
}: BackupCardProps) {
  const busy = exporting || importing

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="heading">
          Data backup
        </AppText>

        <AppText variant="caption">
          Export all local Kivo data or restore an earlier
          JSON backup.
        </AppText>
      </View>

      <View style={styles.actions}>
        <SecondaryButton
          disabled={busy}
          label={
            exporting
              ? 'Creating backup…'
              : 'Export backup'
          }
          onPress={onExport}
        />

        <SecondaryButton
          disabled={busy}
          label={
            importing
              ? 'Restoring backup…'
              : 'Import backup'
          }
          onPress={onImport}
        />
      </View>

      <AppText variant="caption">
        Importing replaces the current tasks, rewards,
        history, points and reminder settings on this
        device.
      </AppText>
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
  actions: {
    gap: spacing.md,
  },
})
