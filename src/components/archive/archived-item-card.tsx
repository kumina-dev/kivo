import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import {
  colors,
  radius,
  spacing,
} from '@/constants/theme'

type ArchivedItemCardProps = {
  deleting?: boolean
  description?: string | null
  disabled?: boolean
  metadata: string
  restoring?: boolean
  onDelete: () => void
  onRestore: () => void
  title: string
}

export function ArchivedItemCard({
  deleting = false,
  description,
  disabled = false,
  metadata,
  onDelete,
  onRestore,
  restoring = false,
  title,
}: ArchivedItemCardProps) {
  const busy = disabled || deleting || restoring

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <AppText style={styles.title}>{title}</AppText>

        <AppText variant="caption">{metadata}</AppText>

        {description ? (
          <AppText variant="caption">
            {description}
          </AppText>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onRestore}
          style={({ pressed }) => [
            styles.button,
            styles.restoreButton,
            pressed && styles.buttonPressed,
            busy && styles.buttonDisabled,
          ]}
        >
          <AppText style={styles.restoreLabel}>
            {restoring ? 'Restoring…' : 'Restore'}
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onDelete}
          style={({ pressed }) => [
            styles.button,
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
            busy && styles.buttonDisabled,
          ]}
        >
          <AppText style={styles.deleteLabel}>
            {deleting ? 'Deleting…' : 'Delete permanently'}
          </AppText>
        </Pressable>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  content: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.sm,
  },
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  restoreButton: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  deleteButtonPressed: {
    backgroundColor: colors.dangerPressed,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  restoreLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  deleteLabel: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
})
