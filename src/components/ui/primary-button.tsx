import type { ComponentProps } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, radius, spacing } from '@/constants/theme'

type PrimaryButtonProps = Omit<
  ComponentProps<typeof Pressable>,
  'children' | 'style'
> & {
  label: string
}

export function PrimaryButton({
  disabled,
  label,
  ...props
}: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...props}
    >
      <AppText style={styles.label}>{label}</AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.accentPressed,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
