import type { ComponentProps } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, radius, spacing } from '@/constants/theme'

type SecondaryButtonProps = Omit<
  ComponentProps<typeof Pressable>,
  'children' | 'style'
> & {
  destructive?: boolean
  label: string
}

export function SecondaryButton({
  destructive = false,
  disabled,
  label,
  ...props
}: SecondaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        destructive && styles.destructiveButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...props}
    >
      <AppText
        style={[
          styles.label,
          destructive && styles.destructiveLabel,
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
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  destructiveButton: {
    borderColor: colors.danger,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveLabel: {
    color: colors.danger,
  },
})
