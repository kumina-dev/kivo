import { Pressable, StyleSheet, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import {
  colors,
  radius,
  spacing,
} from '@/constants/theme'

type TemplateReviewSectionHeaderProps = {
  enabledCount: number
  itemCount: number
  title: string
  onDisableAll: () => void
  onEnableAll: () => void
}

export function TemplateReviewSectionHeader({
  enabledCount,
  itemCount,
  onDisableAll,
  onEnableAll,
  title,
}: TemplateReviewSectionHeaderProps) {
  const allEnabled =
    itemCount > 0 && enabledCount === itemCount

  const noneEnabled = enabledCount === 0

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <AppText variant="heading">
          {title}
        </AppText>

        <AppText variant="caption">
          {enabledCount} of {itemCount} enabled
        </AppText>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={allEnabled}
          onPress={onEnableAll}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.pressed,
            allEnabled && styles.disabled,
          ]}
        >
          <AppText style={styles.actionLabel}>
            Enable all
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={noneEnabled}
          onPress={onDisableAll}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.pressed,
            noneEnabled && styles.disabled,
          ]}
        >
          <AppText style={styles.actionLabel}>
            Disable all
          </AppText>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  heading: {
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  action: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.4,
  },
})
