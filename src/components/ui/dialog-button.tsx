import { Pressable, StyleSheet } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import {
  colors,
  radius,
  spacing,
} from '@/constants/theme'
import type {
  DialogActionVariant,
} from '@/types/dialog'

type DialogButtonProps = {
  label: string
  variant: DialogActionVariant
  onPress: () => void
}

export function DialogButton({
  label,
  onPress,
  variant,
}: DialogButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'destructive' &&
          styles.destructive,
        pressed &&
          variant === 'primary' &&
          styles.primaryPressed,
        pressed &&
          variant === 'secondary' &&
          styles.secondaryPressed,
        pressed &&
          variant === 'destructive' &&
          styles.destructivePressed,
      ]}
    >
      <AppText
        style={[
          styles.label,
          variant === 'secondary' &&
            styles.secondaryLabel,
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  primaryPressed: {
    backgroundColor: colors.accentPressed,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
  },
  secondaryPressed: {
    opacity: 0.75,
  },
  destructive: {
    backgroundColor: colors.danger,
  },
  destructivePressed: {
    backgroundColor: colors.dangerPressed,
  },
  label: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryLabel: {
    color: colors.text,
  },
})
