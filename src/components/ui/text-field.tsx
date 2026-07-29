import type { ComponentProps } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

import { AppText } from '@/components/ui/app-text'
import { colors, radius, spacing } from '@/constants/theme'

type TextFieldProps = ComponentProps<typeof TextInput> & {
  error?: string
  label: string
}

export function TextField({
  error,
  label,
  style,
  ...props
}: TextFieldProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.label}>{label}</AppText>

      <TextInput
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        style={[
          styles.input,
          props.multiline && styles.multiline,
          error && styles.inputError,
          style,
        ]}
        {...props}
      />

      {error ? (
        <AppText style={styles.error}>{error}</AppText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  multiline: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
})
