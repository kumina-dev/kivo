import type { PropsWithChildren } from 'react'
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { colors, radius, spacing } from '@/constants/theme'

type CardProps = PropsWithChildren<{
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}>

export function Card({ children, onPress, style }: CardProps) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.pressed : undefined,
        style,
      ]}
    >
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.surfaceRaised,
    transform: [{ scale: 0.99 }],
  },
})
