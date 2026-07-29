import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { Card } from '@/components/ui/card'
import { colors, radius, spacing } from '@/constants/theme'

type ArchivedItemCardProps = {
  description?: string | null
  disabled?: boolean
  metadata: string
  onRestore: () => void
  title: string
}

export function ArchivedItemCard({
  description,
  disabled = false,
  metadata,
  onRestore,
  title,
}: ArchivedItemCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <AppText style={styles.title}>{title}</AppText>

        <AppText variant="caption">{metadata}</AppText>

        {description ? (
          <AppText variant="caption">{description}</AppText>
        ) : null}
      </View>

      <Pressable
        disabled={disabled}
        onPress={onRestore}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
      >
        <AppText style={styles.buttonLabel}>
          {disabled ? 'Restoring…' : 'Restore'}
        </AppText>
      </Pressable>
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
  button: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
})
