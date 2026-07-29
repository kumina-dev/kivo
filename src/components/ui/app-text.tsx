import type { ComponentProps } from 'react'
import { StyleSheet, Text } from 'react-native'

import { colors } from '@/constants/theme'

type TextVariant = 'body' | 'caption' | 'heading' | 'title'

type AppTextProps = ComponentProps<typeof Text> & {
  variant?: TextVariant
}

export function AppText({
  style,
  variant = 'body',
  ...props
}: AppTextProps) {
  return <Text style={[styles.base, styles[variant], style]} {...props} />
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 38,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 23,
  },
  caption: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
})
